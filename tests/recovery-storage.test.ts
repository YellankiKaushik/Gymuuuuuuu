import { it, expect, vi } from "vitest";
import { IDBFactory, IDBKeyRange, IDBObjectStore } from "fake-indexeddb";
import { sleepFixture, routineFixture } from "./fixtures/recovery";
import {
  startSession,
  transitionSession,
} from "../src/features/recovery/domain";
import {
  openRecoveryDatabase,
  saveSleep,
  readRecoveryBackup,
  saveRoutine,
  saveSession,
  deleteRecoveryRecord,
  undoRecoveryDelete,
  restoreRecoveryBackup,
  readRecoveryView,
  readRawRecoveryData,
  purgeRecovery,
  saveRecoverySettings,
  defaultRecoverySettings,
} from "../src/features/recovery/storage";
it("preserves prior records after stale writes, invalid imports and transaction failures; supports undo and raw repair", async () => {
  vi.stubGlobal("window", {
    indexedDB: new IDBFactory(),
    dispatchEvent: () => true,
  });
  vi.stubGlobal("IDBKeyRange", IDBKeyRange);
  try {
    const entry = sleepFixture();
    await saveSleep(entry);
    await expect(saveSleep({ ...entry, notes: "stale" })).rejects.toThrow(
      "changed",
    );
    const routine = routineFixture();
    await saveRoutine(routine);
    await expect(saveRoutine(routine, routine.id)).rejects.toThrow("immutable");
    let session = startSession(routine, "UTC");
    await saveSession(session);
    const next = transitionSession(session, "complete_step");
    await saveSession(next, session.updatedAt);
    session = next;
    const newer = routineFixture(2);
    await saveRoutine(newer, routine.id);
    expect(
      (await readRecoveryBackup()).mobilitySessions[0]?.routineSnapshot
        .versionNumber,
    ).toBe(1);
    await deleteRecoveryRecord("sleepLogs", entry.id);
    let root = await readRecoveryBackup();
    expect(root.sleepLogs).toHaveLength(0);
    await undoRecoveryDelete(root.deletedRecords[0]!.id);
    root = await readRecoveryBackup();
    expect(root.sleepLogs).toHaveLength(1);
    await expect(
      restoreRecoveryBackup(root, "replace_local", false),
    ).rejects.toThrow("Confirm");
    const original = IDBObjectStore.prototype.put;
    const spy = vi
      .spyOn(IDBObjectStore.prototype, "put")
      .mockImplementation(function (
        this: IDBObjectStore,
        value: unknown,
        key?: IDBValidKey,
      ) {
        if (this.name === "phase12_custom_routine_versions")
          throw Error("Synthetic failure after queued clears");
        return original.call(this, value, key!);
      });
    await expect(
      restoreRecoveryBackup(root, "replace_local", true),
    ).rejects.toThrow("Synthetic failure");
    spy.mockRestore();
    expect((await readRecoveryBackup()).sleepLogs).toHaveLength(1);
    const db = await openRecoveryDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("phase12_sleep_logs", "readwrite");
      tx.objectStore("phase12_sleep_logs").put({
        ...entry,
        id: "corrupt_fixture",
        calculated: {},
      });
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(Error("fixture failed"));
    });
    db.close();
    expect((await readRecoveryView(90, "2026-08-05")).quarantined).toBe(1);
    expect((await readRawRecoveryData()).phase12_sleep_logs).toHaveLength(2);
    await expect(readRecoveryBackup()).rejects.toThrow();
    await restoreRecoveryBackup(root, "replace_local", true);
    expect((await readRecoveryBackup()).mobilitySessions[0]?.id).toBe(
      session.id,
    );
    await restoreRecoveryBackup(root, "import_copy", true);
    expect((await readRecoveryBackup()).customRoutineIdentities).toHaveLength(
      2,
    );
    await purgeRecovery("DELETE RECOVERY DATA");
    expect((await readRecoveryBackup()).sleepLogs).toHaveLength(0);
  } finally {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
it("upgrades a version 1 database without clearing records and rebuilds disposable summaries", async () => {
  vi.stubGlobal("window", {
    indexedDB: new IDBFactory(),
    dispatchEvent: () => true,
  });
  vi.stubGlobal("IDBKeyRange", IDBKeyRange);
  try {
    await new Promise<void>((resolve, reject) => {
      const req = window.indexedDB.open(
        "fitness-os-recovery-sleep-mobility",
        1,
      );
      req.onupgradeneeded = () =>
        req.result
          .createObjectStore("phase12_sleep_logs", { keyPath: "id" })
          .put(sleepFixture());
      req.onsuccess = () => {
        req.result.close();
        resolve();
      };
      req.onerror = () => reject(Error("Legacy fixture failed"));
    });
    const db = await openRecoveryDatabase();
    expect(db.version).toBe(2);
    expect(
      db
        .transaction("phase12_sleep_logs")
        .objectStore("phase12_sleep_logs")
        .indexNames.contains("startedAt"),
    ).toBe(true);
    db.close();
    expect((await readRecoveryBackup()).sleepLogs).toHaveLength(1);
    const root = await readRecoveryBackup();
    await restoreRecoveryBackup(root, "keep_existing", true);
    const raw = await readRawRecoveryData();
    expect(raw.phase12_derived_summaries).toHaveLength(1);
    const prefs = defaultRecoverySettings();
    prefs.value.trackingEnabled = false;
    await saveRecoverySettings(prefs);
    await expect(
      saveSleep(sleepFixture({ id: "sleep_fixture_new" })),
    ).rejects.toThrow("disabled");
    expect((await readRecoveryBackup()).sleepLogs).toHaveLength(1);
  } finally {
    vi.unstubAllGlobals();
  }
});
