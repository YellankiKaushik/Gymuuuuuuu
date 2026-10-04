import { publishWorkoutPointer } from "../../components/app-shell/workout-resume";
import { encodeCsv } from "../../storage/backup/envelope";
import {
  workoutBackupSchema,
  workoutSessionSchema,
  type WorkoutBackup,
} from "./schema";
import {
  allTracker,
  getPreferences,
  openWorkoutDatabase,
  queryWorkouts,
  writeTracker,
} from "./storage";
import { exerciseKey, derivePersonalRecords } from "./domain";
export async function makeWorkoutBackup(): Promise<WorkoutBackup> {
  return workoutBackupSchema.parse({
    format: "fitness-os-workout-backup",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    appVersion: "0.1.0",
    data: {
      workoutPreferences: await getPreferences(),
      programTrackingStates: await allTracker("programTrackingStates"),
      customExercises: await allTracker("customExercises"),
      workoutSessions: await allTracker("workoutSessions"),
    },
  });
}
export function downloadLocal(
  name: string,
  content: string,
  type = "application/json",
) {
  const blob = new Blob([content], { type }),
    url = URL.createObjectURL(blob),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportWorkoutBackup() {
  const backup = await makeWorkoutBackup();
  downloadLocal(
    `fitness-os-workouts-v1-${backup.exportedAt.slice(0, 10)}.json`,
    JSON.stringify(backup, null, 2),
  );
  await writeTracker("appMeta", {
    key: "last-workout-backup",
    date: backup.exportedAt,
  });
  return backup;
}
export async function previewWorkoutBackup(text: string) {
  if (text.length > 50_000_000)
    throw new Error("Backup exceeds the 50 MB import limit.");
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  const backup = workoutBackupSchema.parse(raw),
    current = await makeWorkoutBackup(),
    conflicts: { store: string; id: string; identical: boolean }[] = [];
  for (const store of [
    "workoutSessions",
    "customExercises",
    "programTrackingStates",
  ] as const) {
    const id = (record: (typeof backup.data)[typeof store][number]) =>
      "id" in record ? record.id : record.programInstanceId;
    const existing = new Map(
      current.data[store].map((record) => [id(record), JSON.stringify(record)]),
    );
    for (const record of backup.data[store])
      if (existing.has(id(record)))
        conflicts.push({
          store,
          id: id(record),
          identical: existing.get(id(record)) === JSON.stringify(record),
        });
  }
  return {
    backup,
    current,
    conflicts,
    counts: {
      sessions: backup.data.workoutSessions.length,
      customExercises: backup.data.customExercises.length,
      trackingStates: backup.data.programTrackingStates.length,
    },
    dates: backup.data.workoutSessions.map((item) => item.localDate).sort(),
  };
}
export async function restoreWorkoutBackup(
  preview: Awaited<ReturnType<typeof previewWorkoutBackup>>,
  mode: "merge" | "replace",
  strategy: "keep" | "replace" | "copy",
) {
  const current = await makeWorkoutBackup();
  if (JSON.stringify(current.data) !== JSON.stringify(preview.current.data))
    throw new Error(
      "Local data changed after the preview. Preview the backup again.",
    );
  if (mode === "replace")
    downloadLocal(
      `fitness-os-workouts-safety-${Date.now()}.json`,
      JSON.stringify(current, null, 2),
    );
  const combined = structuredClone(
      mode === "replace" ? preview.backup.data : current.data,
    ),
    batch = `import_${crypto.randomUUID()}`;
  if (mode === "merge")
    for (const store of [
      "customExercises",
      "programTrackingStates",
      "workoutSessions",
    ] as const) {
      const records = combined[store] as Record<string, unknown>[],
        idKey = store === "programTrackingStates" ? "programInstanceId" : "id";
      for (const item of preview.backup.data[store]) {
        const incoming = structuredClone(item) as Record<string, unknown>,
          index = records.findIndex(
            (existing) => existing[idKey] === incoming[idKey],
          );
        if (index < 0) records.push(incoming);
        else if (
          JSON.stringify(records[index]) === JSON.stringify(incoming) ||
          strategy === "keep"
        )
          continue;
        else if (strategy === "replace") records[index] = incoming;
        else if (store === "workoutSessions") {
          incoming.id = `workout_${crypto.randomUUID()}`;
          incoming.dataOrigin = "imported";
          incoming.importBatchId = batch;
          if (["active", "paused"].includes(String(incoming.status))) {
            if (incoming.pausedAt)
              incoming.accumulatedPausedSeconds =
                Number(incoming.accumulatedPausedSeconds) +
                Math.max(
                  0,
                  Math.floor(
                    (Date.now() - Date.parse(String(incoming.pausedAt))) / 1000,
                  ),
                );
            incoming.status = "abandoned";
            incoming.abandonedAt = new Date().toISOString();
            incoming.pausedAt = null;
          }
          const copy = workoutSessionSchema.parse(incoming);
          copy.exercises = copy.exercises.map((exercise) => ({
            ...exercise,
            id: `workout_exercise_${crypto.randomUUID()}`,
            sets: exercise.sets.map((set) => ({
              ...set,
              id: `set_${crypto.randomUUID()}`,
            })),
          }));
          records.push(copy);
        } else
          throw new Error(
            "Copy applies to conflicting sessions only. Use keep or replace for custom labels and tracking states.",
          );
      }
    }
  combined.workoutSessions = combined.workoutSessions.map((session) => {
    const old = current.data.workoutSessions.find(
      (item) => item.id === session.id,
    );
    if (old && JSON.stringify(old) === JSON.stringify(session)) return old;
    return old
      ? { ...session, revision: Math.max(old.revision, session.revision) + 1 }
      : session;
  });
  const valid = workoutBackupSchema.parse({
      ...preview.backup,
      data: combined,
    }),
    db = await openWorkoutDatabase();
  await new Promise<void>((resolve, reject) => {
    const stores = [
        "workoutPreferences",
        "programTrackingStates",
        "customExercises",
        "workoutSessions",
        "activeTimers",
        "derivedPersonalRecords",
        "appMeta",
      ],
      tx = db.transaction(stores, "readwrite");
    tx.oncomplete = () => {
      publishWorkoutPointer(
        valid.data.workoutSessions.find(
          (item) =>
            !item.deletedAt && ["active", "paused"].includes(item.status),
        )?.id ?? null,
      );
      resolve();
    };
    tx.onerror = () =>
      reject(new Error("Import failed. Existing records were preserved."));
    tx.onabort = () =>
      reject(new Error("Import aborted. Existing records were preserved."));
    const pendingData: Record<string, unknown> = {};
    let reads = 0;
    const apply = () => {
      if (++reads !== 4) return;
      try {
        const observed = workoutBackupSchema.parse({
          ...current,
          data: pendingData,
        });
        if (JSON.stringify(observed.data) !== JSON.stringify(current.data)) {
          tx.abort();
          return;
        }
        for (const store of [
          "programTrackingStates",
          "customExercises",
          "workoutSessions",
        ] as const) {
          const objectStore = tx.objectStore(store);
          objectStore.clear();
          valid.data[store].forEach((item) => objectStore.put(item));
        }
        tx.objectStore("workoutPreferences").put(valid.data.workoutPreferences);
        tx.objectStore("activeTimers").clear();
        tx.objectStore("derivedPersonalRecords").clear();
        tx.objectStore("appMeta").put({
          key: "active-workout",
          sessionId:
            valid.data.workoutSessions.find(
              (item) =>
                !item.deletedAt && ["active", "paused"].includes(item.status),
            )?.id ?? null,
        });
        tx.objectStore("appMeta").put({
          key: "last-workout-import",
          date: new Date().toISOString(),
          batch,
        });
        valid.data.workoutSessions.forEach((session) =>
          tx.objectStore("appMeta").put({
            key: `editor:${session.id}`,
            owner: `import:${batch}`,
            expiresAt: 0,
          }),
        );
      } catch {
        tx.abort();
      }
    };
    for (const store of [
      "workoutPreferences",
      "programTrackingStates",
      "customExercises",
      "workoutSessions",
    ] as const) {
      const request =
        store === "workoutPreferences"
          ? tx.objectStore(store).get("workout-preferences")
          : tx.objectStore(store).getAll();
      request.onsuccess = () => {
        pendingData[store] = request.result;
        apply();
      };
    }
  });
  const total =
      preview.counts.sessions +
      preview.counts.customExercises +
      preview.counts.trackingStates,
    skipped =
      mode === "replace"
        ? 0
        : preview.conflicts.filter(
            (item) => item.identical || strategy === "keep",
          ).length;
  return { accepted: total - skipped, skipped, rejected: 0 };
}
export async function exportWorkoutCsv() {
  const backup = await makeWorkoutBackup(),
    sessions = backup.data.workoutSessions;
  downloadLocal(
    "workout_sessions.csv",
    encodeCsv([
      [
        "id",
        "title",
        "localDate",
        "status",
        "source",
        "startedAt",
        "completedAt",
        "deletedAt",
        "sessionNote",
      ],
      ...sessions.map((item) => [
        item.id,
        item.title,
        item.localDate,
        item.status,
        item.source,
        item.startedAt,
        item.completedAt,
        item.deletedAt,
        item.sessionNote,
      ]),
    ]),
    "text/csv;charset=utf-8",
  );
  downloadLocal(
    "workout_sets.csv",
    encodeCsv([
      [
        "sessionId",
        "exerciseId",
        "displayName",
        "setId",
        "setType",
        "status",
        "loadScope",
        "performanceMode",
        "loadGrams",
        "assistanceGrams",
        "reps",
        "durationSeconds",
        "distanceMeters",
        "effortMode",
        "effort",
        "note",
      ],
      ...sessions.flatMap((session) =>
        session.exercises.flatMap((exercise) =>
          exercise.sets.map((set) => {
            const p = set.performance;
            return [
              session.id,
              exerciseKey(exercise),
              exercise.displayNameSnapshot,
              set.id,
              set.setType,
              set.status,
              set.loadScope,
              p?.mode ?? null,
              p && "loadGrams" in p
                ? p.loadGrams
                : p && "addedLoadGrams" in p
                  ? p.addedLoadGrams
                  : null,
              p && "assistanceGrams" in p ? p.assistanceGrams : null,
              p && "reps" in p ? p.reps : null,
              p && "durationSeconds" in p ? p.durationSeconds : null,
              p && "distanceMeters" in p ? p.distanceMeters : null,
              set.effort.mode,
              "value" in set.effort ? set.effort.value : null,
              set.note,
            ];
          }),
        ),
      ),
    ]),
    "text/csv;charset=utf-8",
  );
  downloadLocal(
    "custom_exercises.csv",
    encodeCsv([
      [
        "id",
        "displayName",
        "performanceMode",
        "loadScope",
        "notes",
        "archivedAt",
      ],
      ...backup.data.customExercises.map((item) => [
        item.id,
        item.displayName,
        item.performanceMode,
        item.loadScope,
        item.notes ?? null,
        item.archivedAt,
      ]),
    ]),
    "text/csv;charset=utf-8",
  );
}
export async function previousPerformance(
  id: string,
  mode: string,
  scope: string,
) {
  const history = await queryWorkouts({
    exerciseId: id,
    status: "completed",
    limit: 100,
  });
  for (const session of history) {
    const exercise = session.exercises.find(
        (item) =>
          exerciseKey(item) === id &&
          item.performanceMode === mode &&
          item.loadScope === scope,
      ),
      sets = exercise?.sets.filter(
        (set) =>
          set.status === "completed" &&
          set.performance &&
          set.loadScope === scope,
      );
    if (sets?.length) return { date: session.localDate, sets };
  }
  return undefined;
}
export async function workoutPersonalRecords() {
  const records = new Map<
    string,
    ReturnType<typeof derivePersonalRecords>[number]
  >();
  for (let offset = 0; ; offset += 500) {
    const page = await queryWorkouts({
      status: "completed",
      limit: 500,
      offset,
      sort: "oldest",
    });
    for (const item of derivePersonalRecords(page)) {
      const previous = records.get(item.key);
      if (
        !previous ||
        item.value > previous.value ||
        (item.value === previous.value &&
          `${item.date}:${item.sessionId}` <
            `${previous.date}:${previous.sessionId}`)
      )
        records.set(item.key, item);
    }
    if (page.length < 500) break;
  }
  return [...records.values()];
}
