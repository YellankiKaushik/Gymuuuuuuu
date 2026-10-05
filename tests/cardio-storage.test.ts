import { expect, it, vi } from "vitest";
import { IDBFactory, IDBKeyRange, IDBObjectStore } from "fake-indexeddb";
import {
  startCardioSession,
  makeSegment,
  transitionCardio,
} from "../src/features/cardio/domain";
import {
  openCardioDatabase,
  saveCardioSession,
  readCardioBackup,
  readCardioView,
  restoreCardio,
  deleteCardioEntity,
  undoCardioDelete,
  readRawCardioData,
  defaultCardioPreferences,
  saveCardioPreferences,
  clearCardioData,
} from "../src/features/cardio/storage";
it("preserves records after stale writes, conflicting owners, disabled tracking and failed restore; supports raw repair and undo", async () => {
  vi.stubGlobal("window", { indexedDB: new IDBFactory() });
  vi.stubGlobal("IDBKeyRange", IDBKeyRange);
  vi.stubGlobal("BroadcastChannel", undefined);
  try {
    const now = new Date().toISOString();
    let s = startCardioSession(
      {
        title: "Synthetic storage test",
        modalityId: "modality_walking_outdoor",
        sessionTypeId: "manual_other",
        timezone: "UTC",
        segments: [makeSegment("Manual activity")],
      },
      now,
      "owner-one",
    );
    await saveCardioSession(s, null, "owner-one");
    const paused = transitionCardio(s, "pause", now);
    await expect(
      saveCardioSession(paused, s.revision, "owner-two"),
    ).rejects.toThrow("Another tab");
    await saveCardioSession(paused, s.revision, "owner-one");
    await expect(
      saveCardioSession(paused, s.revision, "owner-one"),
    ).rejects.toThrow("changed");
    s = transitionCardio(paused, "finish", now);
    await saveCardioSession(s, paused.revision, "owner-one");
    let root = await readCardioBackup();
    expect(root.cardioSessions).toHaveLength(1);
    expect((await readCardioView()).sessions).toHaveLength(1);
    await expect(deleteCardioEntity("session", s.id, false)).rejects.toThrow(
      "Confirm",
    );
    await deleteCardioEntity("session", s.id, true);
    root = await readCardioBackup();
    expect(root.cardioSessions).toHaveLength(0);
    await undoCardioDelete(root.deletedRecords[0]!.id);
    root = await readCardioBackup();
    await expect(restoreCardio(root, "replace", false)).rejects.toThrow(
      "confirm",
    );
    const original = IDBObjectStore.prototype.put;
    const spy = vi
      .spyOn(IDBObjectStore.prototype, "put")
      .mockImplementation(function (
        this: IDBObjectStore,
        value: unknown,
        key?: IDBValidKey,
      ) {
        if (this.name === "cardioAuditEvents")
          throw Error("Synthetic queued-clear failure");
        return original.call(this, value, key!);
      });
    await expect(restoreCardio(root, "replace", true)).rejects.toThrow(
      "Synthetic",
    );
    spy.mockRestore();
    expect((await readCardioBackup()).cardioSessions).toHaveLength(1);
    const prefs = defaultCardioPreferences();
    prefs.value.trackingEnabled = false;
    await saveCardioPreferences(prefs);
    await expect(
      saveCardioSession(
        { ...s, revision: s.revision + 1 },
        s.revision,
        "owner-one",
      ),
    ).rejects.toThrow("disabled");
    const db = await openCardioDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("cardioSessions", "readwrite");
      tx.objectStore("cardioSessions").put({
        id: "unknown-future-record",
        futureField: true,
      });
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(Error("fixture failure"));
    });
    db.close();
    expect((await readCardioView()).quarantined).toBeGreaterThan(0);
    expect((await readRawCardioData()).cardioSessions).toHaveLength(2);
    await expect(readCardioBackup()).rejects.toThrow();
    await restoreCardio(root, "replace", true);
    expect((await readCardioBackup()).cardioSessions).toHaveLength(1);
    await expect(clearCardioData("wrong")).rejects.toThrow("DELETE");
    await clearCardioData("DELETE CARDIO DATA");
    expect((await readCardioBackup()).cardioSessions).toHaveLength(0);
  } finally {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
