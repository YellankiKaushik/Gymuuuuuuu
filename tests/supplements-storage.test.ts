import { expect, it, vi } from "vitest";
import { IDBFactory, IDBObjectStore } from "fake-indexeddb";
import {
  saveProduct,
  saveTrial,
  saveIntake,
  saveEvent,
  readBackup,
  readView,
  restore,
  rawRecovery,
  removeRecord,
  undoDelete,
  openDatabase,
  clearData,
} from "../src/features/supplements/storage";
import { product, label, trial, intake, event } from "./supplements-fixtures";
it("preserves immutable snapshots, rolls back failed writes, isolates corruption and atomically stops urgent trials", async () => {
  vi.stubGlobal("window", { indexedDB: new IDBFactory() });
  vi.stubGlobal("BroadcastChannel", undefined);
  try {
    await saveProduct(product, label);
    await saveTrial(trial);
    await saveIntake(intake);
    await expect(
      saveProduct({ ...product, revision: 2 }, undefined, 0),
    ).rejects.toThrow("another tab");
    await saveEvent(event);
    expect((await readBackup()).supplementTrials[0]!.status).toBe(
      "stopped_for_adverse_event",
    );
    const old = await readBackup();
    const spy = vi
      .spyOn(IDBObjectStore.prototype, "put")
      .mockImplementation(() => {
        throw Error("synthetic quota failure");
      });
    await expect(restore(old, "replace", true)).rejects.toThrow("quota");
    spy.mockRestore();
    expect((await readBackup()).intakeLogs).toEqual(old.intakeLogs);
    await expect(restore(old, "replace", false)).rejects.toThrow("confirm");
    await removeRecord("intakeLogs", intake.id, true);
    let root = await readBackup();
    expect(root.intakeLogs).toHaveLength(0);
    await undoDelete(root.deletedRecords[0]!.id, true);
    root = await readBackup();
    expect(root.intakeLogs).toHaveLength(1);
    const { history, ...record } = root.intakeLogs[0]!;
    await saveIntake(
      {
        ...root.intakeLogs[0]!,
        notes: "corrected",
        revision: 2,
        history: [
          ...history,
          {
            record,
            reason: "test correction",
            correctedAt: new Date().toISOString(),
          },
        ],
      },
      1,
    );
    expect((await readBackup()).intakeLogs[0]!.history[0]!.record.notes).toBe(
      "Test",
    );
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("intakeLogs", "readwrite");
      tx.objectStore("intakeLogs").put({
        id: "malformed",
        notes: "recoverable",
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(Error("fixture failure"));
    });
    db.close();
    expect((await readView()).quarantined).toBe(1);
    expect((await readView()).data.intakeLogs).toHaveLength(1);
    expect((await rawRecovery()).intakeLogs).toHaveLength(2);
    await restore(old, "replace", true);
    expect((await readBackup()).intakeLogs).toHaveLength(1);
    await expect(clearData("wrong")).rejects.toThrow("Enter");
    await clearData("DELETE SUPPLEMENT DATA");
    expect((await readBackup()).personalProducts).toHaveLength(0);
  } finally {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  }
});
