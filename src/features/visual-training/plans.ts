import {
  personalPlanSchema,
  type PersonalPlan,
} from "../../domain/schemas/personal-workout-plan";
import type { AtomicRecordStorage } from "../../storage/indexed-db/adapter";
import { exerciseIndexes } from "../exercises/repository";
import { localId, newSession, newSet } from "../workout-tracker/domain";
import type { WorkoutExercise } from "../workout-tracker/schema";
import { encodeCsv } from "../../storage/backup/envelope";

export function canonicalPlanRest(value: number | null, unit: "s" | "min") {
  if (value === null) return null;
  const seconds = value * (unit === "min" ? 60 : 1),
    whole = Math.round(seconds);
  // Normalize binary conversion noise (e.g. 1.1 min); retain actual fractions
  // for the whole-second contract to reject, rather than rounding user targets.
  return Math.abs(seconds - whole) <= Number.EPSILON * Math.abs(seconds) * 2
    ? whole
    : seconds;
}

export function newPersonalPlan(): PersonalPlan {
  const now = new Date().toISOString();
  return {
    id: localId("personal_plan"),
    module: "plans",
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    payload: {
      kind: "personal-workout-plan",
      version: 1,
      revision: 1,
      name: "",
      sessions: [{ id: "A", entries: [] }],
    },
  };
}
export async function listPersonalPlans(storage: AtomicRecordStorage) {
  return (await storage.list())
    .filter((r) => r.payload.kind === "personal-workout-plan")
    .map((r) => personalPlanSchema.parse(r))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}
export async function savePersonalPlan(
  storage: AtomicRecordStorage,
  draft: PersonalPlan,
  expected?: PersonalPlan,
) {
  if (
    expected &&
    (expected.id !== draft.id || expected.createdAt !== draft.createdAt)
  )
    throw Error("Saved plan identity cannot change.");
  const valid = personalPlanSchema.parse({
    ...draft,
    updatedAt: new Date().toISOString(),
    payload: {
      ...draft.payload,
      revision: (expected?.payload.revision ?? 0) + 1,
    },
  });
  await withPersonalPlanWrite(() =>
    storage.compareAndSwap(valid.id, expected, valid),
  );
  return valid;
}
export async function deletePersonalPlan(
  storage: AtomicRecordStorage,
  expected: PersonalPlan,
) {
  await withPersonalPlanWrite(() =>
    storage.compareAndSwap(expected.id, expected, undefined),
  );
}
export async function withPersonalPlanWrite<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const { readDataHistory, withRestoreCoordination } =
    await import("../data-management/service");
  return withRestoreCoordination(async () => {
    const history = await readDataHistory();
    if (
      history.phase17RestoreJournal?.some(
        (row) => !["completed", "rolled_back"].includes(String(row.status)),
      )
    )
      throw Error(
        "A restore needs recovery. Open Data health before changing personal plans.",
      );
    return operation();
  }, "shared");
}
export function workoutFromPersonalPlan(
  raw: PersonalPlan,
  sessionId: "A" | "B",
) {
  const plan = personalPlanSchema.parse(raw),
    session = plan.payload.sessions.find((s) => s.id === sessionId);
  if (!session?.entries.length)
    throw Error("Add an exercise to this session and save before starting.");
  const exercises: WorkoutExercise[] = session.entries.map((entry, index) => {
    const record = exerciseIndexes.byId.get(entry.exerciseId);
    if (record?.contentStatus !== "published")
      throw Error("A selected published exercise is unavailable.");
    const now = new Date().toISOString();
    const target = {
      repsMin: entry.repetitions,
      repsMax: entry.repetitions,
      restSecondsMin: entry.restSeconds,
      restSecondsMax: entry.restSeconds,
    };
    return {
      id: localId("workout_exercise"),
      order: index + 1,
      exerciseRef: { kind: "canonical", exerciseId: entry.exerciseId },
      displayNameSnapshot: record.displayName,
      performanceMode: "reps_only",
      loadScope: "not_applicable",
      prescriptionSnapshot: {
        plannedSetCount: entry.sets,
        notesSnapshot: [
          `Personal plan ${plan.id}, revision ${plan.payload.revision}, Session ${sessionId}.`,
          "User-authored targets; not a canonical program.",
        ],
      },
      originalExerciseId: null,
      isProgramDeviation: false,
      sets: Array.from({ length: entry.sets ?? 0 }, (_, i) =>
        newSet(i + 1, "not_applicable", { ...target }),
      ),
      note: null,
      createdAt: now,
      updatedAt: now,
    };
  });
  const workout = newSession(
    `${plan.payload.name} · Session ${sessionId}`,
    exercises,
  );
  workout.sessionNote = `Personal plan: ${plan.payload.name} · Session ${sessionId} · saved revision ${plan.payload.revision}. User-authored targets, not a published program.`;
  return workout;
}
export function personalPlanCsv(raw: PersonalPlan) {
  const plan = personalPlanSchema.parse(raw);
  return encodeCsv([
    [
      "plan_id",
      "plan_version",
      "revision",
      "plan_name",
      "session",
      "exercise_order",
      "exercise_id",
      "intended_sets",
      "intended_repetitions",
      "rest_s",
    ],
    ...plan.payload.sessions.flatMap((s) =>
      s.entries.length
        ? s.entries.map((e, i) => [
            plan.id,
            plan.payload.version,
            plan.payload.revision,
            plan.payload.name,
            s.id,
            i + 1,
            e.exerciseId,
            e.sets,
            e.repetitions,
            e.restSeconds,
          ])
        : [
            [
              plan.id,
              plan.payload.version,
              plan.payload.revision,
              plan.payload.name,
              s.id,
              null,
              null,
              null,
              null,
              null,
            ],
          ],
    ),
  ]);
}
