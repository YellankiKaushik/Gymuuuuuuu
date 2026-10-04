import { publishWorkoutPointer } from "../../components/app-shell/workout-resume";
import reference from "../../../DOCS_for_entire_apppliaction/GYM/Phase_06_Workout_Tracker_Reference_Data.json";
import {
  customExerciseSchema,
  workoutSessionSchema,
  workoutPreferencesNormativeSchema,
  programTrackingStateNormativeSchema,
  type CustomExercise,
  type WorkoutPreferences,
  type WorkoutSession,
  type ProgramTrackingState,
} from "./schema";
export const trackerStores = reference.database.stores.map((item) => item.id);
export const editorId =
  typeof window === "undefined" ? "server" : crypto.randomUUID();
let database: Promise<IDBDatabase> | undefined;
export function openWorkoutDatabase(name = "fitness-os"): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB)
    return Promise.reject(
      new Error(
        "IndexedDB is unavailable. Your workout cannot be saved in this browser.",
      ),
    );
  if (name === "fitness-os" && database) return database;
  const pending = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(name, 6);
    request.onupgradeneeded = (event) => {
      const db = request.result,
        tx = request.transaction!;
      for (let version = event.oldVersion + 1; version <= 6; version++) {
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
          const store = db.createObjectStore("workoutSessions", {
            keyPath: "id",
          });
          reference.database.workoutSessionIndexes.forEach((index) =>
            store.createIndex(index.name, index.keyPath, {
              multiEntry: "multiEntry" in index && index.multiEntry,
            }),
          );
        }
        if (version === 5)
          db.createObjectStore("activeTimers", { keyPath: "sessionId" });
        if (version === 6)
          db.createObjectStore("derivedPersonalRecords", { keyPath: "id" });
        tx.objectStore("appMeta").put({ key: `migration:${version}`, version });
      }
    };
    request.onerror = () =>
      reject(
        new Error(
          "Workout storage could not open. Preserve/export data before clearing browser storage.",
        ),
      );
    request.onblocked = () =>
      reject(
        new Error(
          "Close other Fitness OS tabs before upgrading workout storage.",
        ),
      );
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        database = undefined;
      };
      resolve(db);
    };
  });
  if (name === "fitness-os") {
    database = pending;
    void pending.catch(() => {
      database = undefined;
    });
  }
  return pending;
}
export async function readTracker<T>(
  store: string,
  id: IDBValidKey,
): Promise<T | undefined> {
  const db = await openWorkoutDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store),
      request = tx.objectStore(store).get(id);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () =>
      reject(new Error("Local record could not be read."));
  });
}
export async function allTracker<T>(store: string): Promise<T[]> {
  const db = await openWorkoutDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(store).objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () =>
      reject(new Error("Local records could not be read."));
  });
}
export async function writeTracker(store: string, value: unknown) {
  const db = await openWorkoutDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(new Error("Save failed; your draft remains on this page."));
    tx.onabort = () =>
      reject(new Error("Save aborted; existing data was preserved."));
    try {
      tx.objectStore(store).put(value);
    } catch {
      tx.abort();
    }
  });
}
export async function getPreferences(): Promise<WorkoutPreferences> {
  const value = await readTracker("workoutPreferences", "workout-preferences");
  const preferences = workoutPreferencesNormativeSchema.parse(
    value ?? {
      ...reference.defaultPreferences,
      updatedAt: new Date().toISOString(),
    },
  );
  if (preferences.schemaVersion !== 1)
    throw new Error("Unsupported tracker preferences version.");
  if (!value) await writeTracker("workoutPreferences", preferences);
  return preferences;
}
export async function savePreferences(value: WorkoutPreferences) {
  if (value.schemaVersion !== 1)
    throw new Error("Unsupported preferences version");
  await writeTracker(
    "workoutPreferences",
    workoutPreferencesNormativeSchema.parse(value),
  );
}
export async function getCustomExercises() {
  return (await allTracker("customExercises")).map((item) =>
    customExerciseSchema.parse(item),
  );
}
export async function saveCustomExercise(value: CustomExercise) {
  await writeTracker("customExercises", customExerciseSchema.parse(value));
}
export async function getWorkout(id: string) {
  const value = await readTracker("workoutSessions", id);
  if (!value) return undefined;
  const result = workoutSessionSchema.safeParse(value);
  if (!result.success)
    throw new Error(
      "This workout is corrupt or uses an unsupported version. Export the raw backup before making changes.",
    );
  return result.data;
}
export async function activeWorkout() {
  const pointer = await readTracker<{ key: string; sessionId: string | null }>(
    "appMeta",
    "active-workout",
  );
  return pointer?.sessionId ? getWorkout(pointer.sessionId) : undefined;
}
type Lease = { key: string; owner: string; expiresAt: number };
export async function claimWorkout(
  id: string,
  owner: string,
  takeover = false,
) {
  const db = await openWorkoutDatabase();
  return new Promise<boolean>((resolve, reject) => {
    const tx = db.transaction("appMeta", "readwrite"),
      store = tx.objectStore("appMeta"),
      request = store.get(`editor:${id}`);
    let accepted = false;
    request.onsuccess = () => {
      const lease = request.result as Lease | undefined;
      accepted =
        !lease ||
        lease.owner === owner ||
        lease.expiresAt < Date.now() ||
        takeover;
      if (accepted)
        store.put({
          key: `editor:${id}`,
          owner,
          expiresAt: Date.now() + 30000,
        });
    };
    tx.oncomplete = () => resolve(accepted);
    tx.onerror = () =>
      reject(new Error("Editor ownership could not be checked."));
  });
}
export async function createWorkout(session: WorkoutSession, owner = editorId) {
  const valid = workoutSessionSchema.parse(session),
    db = await openWorkoutDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["workoutSessions", "appMeta"], "readwrite"),
      meta = tx.objectStore("appMeta"),
      request = meta.get("active-workout");
    let reason = "Could not create workout.";
    request.onsuccess = () => {
      if (request.result?.sessionId) {
        reason = "Resume or end your current workout before starting another.";
        tx.abort();
        return;
      }
      tx.objectStore("workoutSessions").add(valid);
      meta.put({ key: "active-workout", sessionId: valid.id });
      meta.put({
        key: `editor:${valid.id}`,
        owner,
        expiresAt: Date.now() + 30000,
      });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error(reason));
    tx.onabort = () => reject(new Error(reason));
  });
  publishWorkoutPointer(valid.id);
  return valid;
}
export async function saveWorkout(
  session: WorkoutSession,
  expectedRevision: number,
  owner = editorId,
) {
  const valid = workoutSessionSchema.parse(session),
    db = await openWorkoutDatabase();
  return new Promise<WorkoutSession>((resolve, reject) => {
    const tx = db.transaction(
        ["workoutSessions", "appMeta", "programTrackingStates", "activeTimers"],
        "readwrite",
      ),
      store = tx.objectStore("workoutSessions"),
      meta = tx.objectStore("appMeta");
    let result = valid,
      reason =
        "Save failed. Your unsaved draft remains available for retry or export.";
    let loaded = 0;
    let existing: WorkoutSession | undefined, lease: Lease | undefined;
    const apply = () => {
      if (++loaded !== 2) return;
      if (!existing || existing.revision !== expectedRevision) {
        reason =
          "This workout changed in another tab. Export your draft, then reload the latest revision.";
        tx.abort();
        return;
      }
      if (lease && lease.owner !== owner && lease.expiresAt > Date.now()) {
        reason =
          "Another tab owns this editor. Explicitly take over before changing the workout.";
        tx.abort();
        return;
      }
      result = {
        ...valid,
        revision: expectedRevision + 1,
        updatedAt: new Date().toISOString(),
      };
      store.put(result);
      meta.put({
        key: `editor:${valid.id}`,
        owner,
        expiresAt: Date.now() + 30000,
      });
      if (["completed", "abandoned"].includes(result.status)) {
        meta.get("active-workout").onsuccess = (event) => {
          const pointer = (event.target as IDBRequest).result;
          if (pointer?.sessionId === result.id)
            meta.put({ key: "active-workout", sessionId: null });
        };
        tx.objectStore("activeTimers").delete(result.id);
      }
      if (
        result.status === "completed" &&
        (existing.status !== "completed" ||
          existing.deletedAt !== result.deletedAt) &&
        result.programRef &&
        result.source === "program"
      ) {
        const ref = result.programRef,
          stateStore = tx.objectStore("programTrackingStates"),
          request = stateStore.get(ref.programInstanceId);
        request.onsuccess = () => {
          const previous = request.result as ProgramTrackingState | undefined;
          const history = store
            .index("byProgramInstanceId")
            .getAll(ref.programInstanceId);
          history.onsuccess = () => {
            const completed = (history.result as WorkoutSession[])
                .filter(
                  (item) =>
                    item.status === "completed" &&
                    !item.deletedAt &&
                    item.source === "program",
                )
                .sort((a, b) =>
                  (a.completedAt ?? "").localeCompare(b.completedAt ?? ""),
                ),
              last = completed.at(-1);
            stateStore.put(
              programTrackingStateNormativeSchema.parse({
                programInstanceId: ref.programInstanceId,
                schemaVersion: 1,
                sequenceCursor:
                  existing!.status === "completed"
                    ? (previous?.sequenceCursor ?? null)
                    : ref.scheduleSequenceIndex === null
                      ? null
                      : ref.scheduleSequenceIndex + 1,
                completedSessionCount: completed.length,
                lastStartedCanonicalSessionId: ref.canonicalSessionId,
                lastCompletedCanonicalSessionId:
                  last?.programRef?.canonicalSessionId ?? null,
                lastCompletedAt: last?.completedAt ?? null,
                createdAt: previous?.createdAt ?? result.createdAt,
                updatedAt: result.updatedAt,
              }),
            );
          };
        };
      }
    };
    store.get(valid.id).onsuccess = (event) => {
      existing = (event.target as IDBRequest).result;
      apply();
    };
    meta.get(`editor:${valid.id}`).onsuccess = (event) => {
      lease = (event.target as IDBRequest).result;
      apply();
    };
    tx.oncomplete = () => {
      if (existing && ["active", "paused"].includes(existing.status))
        publishWorkoutPointer(
          ["active", "paused"].includes(result.status) ? result.id : null,
        );
      resolve(result);
    };
    tx.onabort = () => reject(new Error(reason));
    tx.onerror = () => reject(new Error(reason));
  });
}
export type HistoryQuery = {
  q?: string;
  source?: string;
  status?: string;
  exerciseId?: string;
  programId?: string;
  from?: string;
  to?: string;
  sort?: "newest" | "oldest";
  offset?: number;
  limit?: number;
  deleted?: boolean;
  mode?: string;
  scope?: string;
};
export async function queryWorkouts(
  query: HistoryQuery = {},
): Promise<WorkoutSession[]> {
  const db = await openWorkoutDatabase();
  return new Promise((resolve, reject) => {
    const store = db
        .transaction("workoutSessions")
        .objectStore("workoutSessions"),
      results: WorkoutSession[] = [];
    const startCursor = (allowed?: Set<IDBValidKey>) => {
      if (allowed && !allowed.size) {
        resolve([]);
        return;
      }
      const request = store
        .index("byStartedAt")
        .openCursor(null, query.sort === "oldest" ? "next" : "prev");
      let skipped = 0;
      request.onerror = () => reject(new Error("History could not load."));
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve(results);
          return;
        }
        if (allowed && !allowed.has(cursor.primaryKey)) {
          cursor.continue();
          return;
        }
        const parsed = workoutSessionSchema.safeParse(cursor.value);
        if (!parsed.success) {
          reject(
            new Error(
              "History contains an unsupported or corrupt record. Export raw records from settings before recovery.",
            ),
          );
          return;
        }
        const item = parsed.data,
          match =
            (query.deleted ? Boolean(item.deletedAt) : !item.deletedAt) &&
            (!query.q ||
              item.title.toLowerCase().includes(query.q.toLowerCase())) &&
            (!query.source || item.source === query.source) &&
            ((!query.mode && !query.scope) ||
              item.exercises.some(
                (exercise) =>
                  (!query.mode || exercise.performanceMode === query.mode) &&
                  (!query.scope || exercise.loadScope === query.scope) &&
                  (!query.exerciseId ||
                    (exercise.exerciseRef.kind === "canonical"
                      ? exercise.exerciseRef.exerciseId
                      : exercise.exerciseRef.customExerciseId) ===
                      query.exerciseId),
              )) &&
            (!query.status || item.status === query.status) &&
            (!query.programId ||
              item.programRef?.canonicalProgramId === query.programId) &&
            (!query.from || item.localDate >= query.from) &&
            (!query.to || item.localDate <= query.to) &&
            ["completed", "abandoned"].includes(item.status);
        if (match) {
          if (skipped++ >= (query.offset ?? 0)) results.push(item);
          if (results.length >= Math.min(query.limit ?? 30, 500)) {
            resolve(results);
            return;
          }
        }
        cursor.continue();
      };
    };
    if (query.exerciseId || query.status) {
      const keys = store
        .index(query.exerciseId ? "byExerciseIds" : "byStatus")
        .getAllKeys(IDBKeyRange.only(query.exerciseId ?? query.status!));
      keys.onsuccess = () => startCursor(new Set(keys.result));
      keys.onerror = () => reject(new Error("History index could not load."));
    } else startCursor();
  });
}
export async function permanentDeleteWorkout(id: string) {
  const session = await getWorkout(id);
  if (!session?.deletedAt) throw new Error("Soft-delete the workout first.");
  const db = await openWorkoutDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(
      ["workoutSessions", "activeTimers", "appMeta"],
      "readwrite",
    );
    tx.objectStore("workoutSessions").delete(id);
    tx.objectStore("activeTimers").delete(id);
    tx.objectStore("appMeta").delete(`editor:${id}`);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error("Permanent deletion failed."));
  });
}
export function closeWorkoutDatabase() {
  if (database) void database.then((db) => db.close());
  database = undefined;
}
