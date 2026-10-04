import workoutReference from "../../../DOCS_for_entire_apppliaction/GYM/Phase_06_Workout_Tracker_Reference_Data.json";
import nutritionReference from "../../content/nutrition/reference.json";
export const fitnessDatabaseVersion =
  nutritionReference.database.targetSchemaVersion;
const connections = new WeakMap<
  IDBFactory,
  Map<string, Promise<IDBDatabase>>
>();
export function closeFitnessDatabase(name = "fitness-os") {
  if (typeof window === "undefined" || !window.indexedDB) return;
  const cache = connections.get(window.indexedDB),
    pending = cache?.get(name);
  cache?.delete(name);
  if (pending) void pending.then((db) => db.close()).catch(() => undefined);
}
export function migrateFitnessDatabase(
  db: IDBDatabase,
  tx: IDBTransaction,
  oldVersion: number,
) {
  for (
    let version = oldVersion + 1;
    version <= fitnessDatabaseVersion;
    version++
  ) {
    if (version === 1) db.createObjectStore("appMeta", { keyPath: "key" });
    if (version === 2) {
      db.createObjectStore("workoutPreferences", { keyPath: "id" });
      db.createObjectStore("programInstances", { keyPath: "instanceId" });
      db.createObjectStore("programTrackingStates", {
        keyPath: "programInstanceId",
      });
    }
    if (version === 3)
      db.createObjectStore("customExercises", { keyPath: "id" });
    if (version === 4) {
      const store = db.createObjectStore("workoutSessions", { keyPath: "id" });
      workoutReference.database.workoutSessionIndexes.forEach((index) =>
        store.createIndex(index.name, index.keyPath, {
          multiEntry: "multiEntry" in index && index.multiEntry,
        }),
      );
    }
    if (version === 5)
      db.createObjectStore("activeTimers", { keyPath: "sessionId" });
    if (version === 6)
      db.createObjectStore("derivedPersonalRecords", { keyPath: "id" });
    // Versions 7–9 were reserved by the phase sequence; no existing store is removed.
    if (version === 10) {
      nutritionReference.database.stores.forEach((def) => {
        if (!db.objectStoreNames.contains(def.id))
          db.createObjectStore(def.id, { keyPath: def.keyPath });
      });
      const entries = tx.objectStore("foodLogEntries");
      nutritionReference.database.entryIndexes.forEach((index) =>
        entries.createIndex(index.name, index.keyPath),
      );
      tx.objectStore("hydrationEntries").createIndex(
        "byLocalDate",
        "localDate",
      );
      tx.objectStore("customFoods").createIndex(
        "byNormalizedName",
        "normalizedName",
      );
      tx.objectStore("customFoodRevisions").createIndex(
        "byCustomFoodId",
        "customFoodId",
      );
      const favourites = tx.objectStore("nutritionFavourites");
      favourites.createIndex("byCanonicalFoodId", "canonicalFoodRef.foodId");
      favourites.createIndex("byCustomFoodId", "customFoodRef.customFoodId");
    }
    tx.objectStore("appMeta").put({ key: `migration:${version}`, version });
  }
}
export async function openFitnessDatabase(
  name = "fitness-os",
): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB)
    return Promise.reject(
      Error(
        "Browser IndexedDB is unavailable. Existing local data has not been changed.",
      ),
    );
  const factory = window.indexedDB;
  let cache = connections.get(factory);
  if (!cache) {
    cache = new Map();
    connections.set(factory, cache);
  }
  const existing = cache.get(name);
  if (existing) {
    try {
      const db = await existing;
      db.transaction("appMeta", "readonly").abort();
      return db;
    } catch {
      cache.delete(name);
    }
  }
  const pending = new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open(name, fitnessDatabaseVersion);
    request.onupgradeneeded = (event) => {
      migrateFitnessDatabase(
        request.result,
        request.transaction!,
        event.oldVersion,
      );
    };
    request.onerror = () =>
      reject(
        Error(
          "Local database could not open. Export available records before clearing browser storage.",
        ),
      );
    request.onblocked = () =>
      reject(
        Error("Close other Fitness OS tabs before upgrading local storage."),
      );
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        cache.delete(name);
      };
      resolve(db);
    };
  });
  cache.set(name, pending);
  void pending.catch(() => cache.delete(name));
  return pending;
}
