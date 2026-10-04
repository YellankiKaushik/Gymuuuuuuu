import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import {
  customExerciseSchema,
  workoutBackupSchema,
  workoutSessionSchema,
  workoutSetSchema,
  allowedScopes,
  performanceModes,
} from "../src/features/workout-tracker/schema";
import {
  derivePersonalRecords,
  elapsedSeconds,
  fromGrams,
  localId,
  newExercise,
  newSession,
  remainingSeconds,
  repeatSession,
  sessionSummary,
  toGrams,
  fromProgram,
} from "../src/features/workout-tracker/domain";
import {
  activeWorkout,
  claimWorkout,
  closeWorkoutDatabase,
  createWorkout,
  getWorkout,
  openWorkoutDatabase,
  queryWorkouts,
  saveCustomExercise,
  saveWorkout,
  writeTracker,
  readTracker,
} from "../src/features/workout-tracker/storage";
import {
  makeWorkoutBackup,
  previewWorkoutBackup,
  restoreWorkoutBackup,
} from "../src/features/workout-tracker/backup";
import { programFixture } from "./fixtures/program";
import { reviewedExerciseFixture } from "./fixtures/exercise";
import { localProgramInstanceSchema } from "../src/features/programs/schema";
const custom = () => {
  const time = new Date().toISOString();
  return customExerciseSchema.parse({
    id: localId("custom_exercise"),
    schemaVersion: 1,
    displayName: "Synthetic local label",
    performanceMode: "load_reps",
    loadScope: "total_external",
    createdAt: time,
    updatedAt: time,
    archivedAt: null,
  });
};
const finished = () => {
  const label = custom(),
    session = newSession("Synthetic workout", [newExercise(label, 1)]),
    time = new Date().toISOString();
  session.status = "completed";
  session.completedAt = time;
  session.exercises[0]!.sets[0] = {
    ...session.exercises[0]!.sets[0]!,
    status: "completed",
    completedAt: time,
    performance: { mode: "load_reps", loadGrams: 20000, reps: 5 },
  };
  return { label, session: workoutSessionSchema.parse(session) };
};
beforeEach(() => {
  closeWorkoutDatabase();
  vi.stubGlobal("window", { indexedDB: new IDBFactory() });
  vi.stubGlobal("IDBKeyRange", IDBKeyRange);
});
it("snapshots reviewed programs without changing canonical records and rejects stale substitutions", () => {
  const now = new Date().toISOString(),
    instance = localProgramInstanceSchema.parse({
      instanceId: "program_instance_fixture",
      canonicalProgramId: programFixture.id,
      canonicalProgramVersion: programFixture.version,
      selectedAt: now,
      startDate: null,
      preferredWeekdays: {},
      substitutionSelections: {},
      status: "planned",
      createdAt: now,
      updatedAt: now,
    });
  const before = JSON.stringify(programFixture),
    session = fromProgram(
      programFixture,
      instance,
      "session_fixture",
      "load_reps",
      (id) => ({ ...reviewedExerciseFixture, id }),
    );
  expect(session.programRef?.canonicalProgramVersion).toBe("1.0.0");
  expect(session.exercises[0]?.prescriptionSnapshot?.progressionRuleId).toBe(
    "progression_fixture",
  );
  expect(session.exercises[0]?.sets[0]?.performance).toBeNull();
  expect(JSON.stringify(programFixture)).toBe(before);
  expect(() =>
    fromProgram(
      { ...programFixture, version: "2.0.0" },
      instance,
      "session_fixture",
      "load_reps",
      (id) => ({ ...reviewedExerciseFixture, id }),
    ),
  ).toThrow("matching");
  expect(() =>
    fromProgram(
      programFixture,
      {
        ...instance,
        substitutionSelections: {
          "session_fixture:block_fixture:0": "exercise_unreviewed",
        },
      },
      "session_fixture",
      "load_reps",
      (id) => ({ ...reviewedExerciseFixture, id }),
    ),
  ).toThrow("outside");
});
it("program tracking counts rebuild after deletion without silently rewinding the sequence", async () => {
  const label = custom();
  await saveCustomExercise(label);
  const session = await createWorkout(
    {
      ...newSession("Program fixture", [newExercise(label, 1)]),
      source: "program",
      programRef: {
        programInstanceId: "program_instance_fixture",
        canonicalProgramId: "program_fixture",
        canonicalProgramVersion: "1.0.0",
        canonicalSessionId: "session_fixture",
        canonicalSessionNameSnapshot: "Synthetic session",
        scheduleSequenceIndex: 1,
      },
    },
    "test-owner",
  );
  const complete = await saveWorkout(
    { ...session, status: "completed", completedAt: new Date().toISOString() },
    session.revision,
    "test-owner",
  );
  expect(
    await readTracker("programTrackingStates", "program_instance_fixture"),
  ).toMatchObject({ completedSessionCount: 1, sequenceCursor: 2 });
  await saveWorkout(
    { ...complete, deletedAt: new Date().toISOString() },
    complete.revision,
    "test-owner",
  );
  expect(
    await readTracker("programTrackingStates", "program_instance_fixture"),
  ).toMatchObject({ completedSessionCount: 0, sequenceCursor: 2 });
});
afterEach(() => {
  closeWorkoutDatabase();
  vi.unstubAllGlobals();
});
it("validates all performance modes and forbids missing completed performance", () => {
  const label = custom(),
    exercise = newExercise(label, 1),
    set = exercise.sets[0]!;
  const values = {
    load_reps: { loadGrams: 1000, reps: 5 },
    bodyweight_reps: { reps: 5, addedLoadGrams: null },
    reps_only: { reps: 5 },
    duration: { durationSeconds: 30 },
    distance_duration: { distanceMeters: 100, durationSeconds: 30 },
    load_duration: { loadGrams: 1000, durationSeconds: 30 },
    assisted_reps: { assistanceGrams: 1000, reps: 5 },
  };
  for (const mode of performanceModes) {
    expect(
      workoutSetSchema.safeParse({
        ...set,
        status: "completed",
        completedAt: new Date().toISOString(),
        loadScope: allowedScopes[mode][0],
        performance: { mode, ...values[mode] },
      }).success,
    ).toBe(true);
  }
  expect(
    workoutSetSchema.safeParse({
      ...set,
      status: "completed",
      completedAt: new Date().toISOString(),
    }).success,
  ).toBe(false);
  expect(
    workoutSetSchema.safeParse({ ...set, effort: { mode: "rpe", value: 0 } })
      .success,
  ).toBe(false);
});
it("calculates canonical units and timestamp timers without countdown drift", () => {
  expect(toGrams(fromGrams(20000, "lb"), "lb")).toBe(20000);
  const session = newSession("Timer");
  session.startedAt = "2026-10-04T00:00:00Z";
  session.createdAt = session.startedAt;
  session.status = "paused";
  session.pausedAt = "2026-10-04T00:10:00Z";
  session.accumulatedPausedSeconds = 120;
  expect(elapsedSeconds(session, Date.parse("2026-10-04T03:00:00Z"))).toBe(480);
  expect(
    remainingSeconds(
      "2026-10-04T00:02:00Z",
      Date.parse("2026-10-04T00:05:00Z"),
    ),
  ).toBe(0);
  expect(() =>
    elapsedSeconds({ ...session, accumulatedPausedSeconds: 700 }),
  ).toThrow("negative");
});
it("derives comparable records and rebuilds after editing or deletion", () => {
  const { session } = finished(),
    other = structuredClone(session);
  other.id = localId("workout");
  other.exercises[0]!.sets[0]!.performance = {
    mode: "load_reps",
    loadGrams: 30000,
    reps: 4,
  };
  expect(sessionSummary(session).volumeByScope).toEqual({
    total_external: 100,
  });
  expect(
    derivePersonalRecords([session, other]).find((item) =>
      item.key.endsWith("max_load"),
    )?.value,
  ).toBe(30000);
  other.deletedAt = new Date().toISOString();
  expect(
    derivePersonalRecords([session, other]).find((item) =>
      item.key.endsWith("max_load"),
    )?.value,
  ).toBe(20000);
  session.exercises[0]!.sets[0]!.setType = "warmup";
  expect(derivePersonalRecords([session, other])).toEqual([]);
});
it("initializes prescribed stores and guards active creation, stale revisions and cross-tab takeover", async () => {
  const db = await openWorkoutDatabase();
  expect([...db.objectStoreNames]).toContain("workoutSessions");
  expect([
    ...db.transaction("workoutSessions").objectStore("workoutSessions")
      .indexNames,
  ]).toContain("byExerciseIds");
  const label = custom();
  await saveCustomExercise(label);
  const first = await createWorkout(
    newSession("Local", [newExercise(label, 1)]),
    "tab-a",
  );
  await expect(createWorkout(newSession("Second"), "tab-b")).rejects.toThrow(
    "Resume",
  );
  expect((await activeWorkout())?.id).toBe(first.id);
  expect(await claimWorkout(first.id, "tab-b")).toBe(false);
  await expect(
    saveWorkout({ ...first, title: "Wrong tab" }, first.revision, "tab-b"),
  ).rejects.toThrow("Another tab");
  expect(await claimWorkout(first.id, "tab-b", true)).toBe(true);
  const next = await saveWorkout(
    { ...first, title: "Taken over" },
    first.revision,
    "tab-b",
  );
  await expect(saveWorkout(first, first.revision, "tab-b")).rejects.toThrow(
    "changed",
  );
  expect((await getWorkout(first.id))?.title).toBe("Taken over");
  const completed = await saveWorkout(
    { ...next, status: "completed", completedAt: new Date().toISOString() },
    next.revision,
    "tab-b",
  );
  expect(await activeWorkout()).toBeUndefined();
  expect((await queryWorkouts())[0]?.id).toBe(completed.id);
});
it("repeat creates fresh uncompleted sets without changing the source", () => {
  const { session } = finished(),
    repeat = repeatSession(session);
  expect(repeat.id).not.toBe(session.id);
  expect(repeat.exercises[0]?.sets[0]).toMatchObject({
    status: "planned",
    performance: null,
    completedAt: null,
  });
  expect(session.exercises[0]?.sets[0]?.status).toBe("completed");
});
it("validates backups, previews conflicts and applies merge atomically", async () => {
  const { label, session } = finished();
  await saveCustomExercise(label);
  await writeTracker("workoutSessions", session);
  const backup = await makeWorkoutBackup();
  expect(
    workoutBackupSchema.safeParse({ ...backup, schemaVersion: 2 }).success,
  ).toBe(false);
  const incoming = structuredClone(backup);
  incoming.data.workoutSessions[0]!.title = "Imported title";
  const preview = await previewWorkoutBackup(JSON.stringify(incoming));
  expect(
    preview.conflicts.some(
      (item) => item.store === "workoutSessions" && !item.identical,
    ),
  ).toBe(true);
  await restoreWorkoutBackup(preview, "merge", "keep");
  expect((await getWorkout(session.id))?.title).toBe(session.title);
  const newPreview = await previewWorkoutBackup(JSON.stringify(incoming));
  await restoreWorkoutBackup(newPreview, "merge", "replace");
  expect((await getWorkout(session.id))?.title).toBe("Imported title");
  expect(
    workoutBackupSchema.safeParse({
      ...backup,
      data: { ...backup.data, workoutSessions: [session, session] },
    }).success,
  ).toBe(false);
});
it("queries indexed histories with chronological ordering", async () => {
  const { label, session } = finished();
  await saveCustomExercise(label);
  const db = await openWorkoutDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("workoutSessions", "readwrite"),
      store = tx.objectStore("workoutSessions");
    for (let index = 0; index < 5000; index++) {
      const day = new Date(
        Date.parse(session.startedAt) + index * 1000,
      ).toISOString();
      store.put({
        ...session,
        exercises: session.exercises.map((exercise) => ({
          ...exercise,
          id: `workout_exercise_${index}`,
          sets: Array.from({ length: 20 }, (_, setIndex) => ({
            ...exercise.sets[0]!,
            id: `set_${index}_${setIndex}`,
            order: setIndex + 1,
          })),
        })),
        id: `workout_test_${index}`,
        startedAt: day,
        completedAt: day,
        updatedAt: day,
      });
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error("fixture write failed"));
  });
  expect(await queryWorkouts({ limit: 30 })).toHaveLength(30);
  const indexed = await queryWorkouts({ exerciseId: label.id, limit: 2 });
  expect(indexed.map((item) => item.id)).toEqual([
    "workout_test_4999",
    "workout_test_4998",
  ]);
}, 60000);
