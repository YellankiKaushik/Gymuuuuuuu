import { expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { openWorkoutDatabase } from "../src/features/workout-tracker/storage";
it("upgrades every prior database version without deleting existing records", async () => {
  const factory = new IDBFactory();
  vi.stubGlobal("window", { indexedDB: factory });
  for (let version = 1; version < 10; version++) {
    const name = `migration-fixture-${version}`;
    const old = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = factory.open(name, version);
      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore("appMeta", { keyPath: "key" });
        if (version >= 2) {
          db.createObjectStore("workoutPreferences", { keyPath: "id" });
          db.createObjectStore("programInstances", { keyPath: "instanceId" });
          db.createObjectStore("programTrackingStates", {
            keyPath: "programInstanceId",
          });
        }
        if (version >= 3)
          db.createObjectStore("customExercises", { keyPath: "id" });
        if (version >= 4) {
          const store = db.createObjectStore("workoutSessions", {
            keyPath: "id",
          });
          store.createIndex("byStatus", "status");
          store.createIndex("byStartedAt", "startedAt");
          store.createIndex("byLocalDate", "localDate");
          store.createIndex(
            "byProgramInstanceId",
            "programRef.programInstanceId",
          );
          store.createIndex("byExerciseIds", "exerciseIds", {
            multiEntry: true,
          });
          store.createIndex("byDeletedAt", "deletedAt");
        }
        if (version >= 5)
          db.createObjectStore("activeTimers", { keyPath: "sessionId" });
        if (version >= 6)
          db.createObjectStore("derivedPersonalRecords", { keyPath: "id" });
        request.transaction!.objectStore("appMeta").put({
          key: "synthetic-preservation",
          unknownField: "Do not delete",
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    old.close();
    const upgraded = await openWorkoutDatabase(name);
    expect(upgraded.version).toBe(10);
    expect([...upgraded.objectStoreNames]).toHaveLength(17);
    const record = await new Promise<unknown>((resolve) => {
      const request = upgraded
        .transaction("appMeta")
        .objectStore("appMeta")
        .get("synthetic-preservation");
      request.onsuccess = () => resolve(request.result);
    });
    expect(record).toEqual({
      key: "synthetic-preservation",
      unknownField: "Do not delete",
    });
    upgraded.close();
  }
  vi.unstubAllGlobals();
});
