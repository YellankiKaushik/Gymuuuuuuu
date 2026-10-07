import type {
  CustomExercise,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
} from "./schema";
import { allowedScopes, workoutSessionSchema } from "./schema";
import type { Program, LocalProgramInstance } from "../programs/schema";
import { exerciseIndexes } from "../exercises/repository";
import type { Exercise } from "../exercises/schema";
export const localId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
export const exerciseKey = (exercise: WorkoutExercise) =>
  exercise.exerciseRef.kind === "canonical"
    ? exercise.exerciseRef.exerciseId
    : exercise.exerciseRef.customExerciseId;
export const toGrams = (value: number, unit: "kg" | "lb") =>
  Math.round(value * (unit === "kg" ? 1000 : 453.59237));
export const fromGrams = (value: number, unit: "kg" | "lb") =>
  value / (unit === "kg" ? 1000 : 453.59237);
export const toMeters = (value: number, unit: "km" | "mi") =>
  value * (unit === "km" ? 1000 : 1609.344);
export const fromMeters = (value: number, unit: "km" | "mi") =>
  value / (unit === "km" ? 1000 : 1609.344);
export function elapsedSeconds(session: WorkoutSession, now = Date.now()) {
  const end = Date.parse(
    session.completedAt ??
      session.abandonedAt ??
      session.pausedAt ??
      new Date(now).toISOString(),
  );
  const duration =
    Math.floor((end - Date.parse(session.startedAt)) / 1000) -
    session.accumulatedPausedSeconds;
  if (duration < 0)
    throw new Error(
      "Device time or pause data produces a negative workout duration.",
    );
  return duration;
}
export const remainingSeconds = (endsAt: string, now = Date.now()) =>
  Math.max(0, Math.ceil((Date.parse(endsAt) - now) / 1000));
export function newSet(
  order: number,
  scope: WorkoutSet["loadScope"],
  target: WorkoutSet["plannedTarget"] = null,
): WorkoutSet {
  const now = new Date().toISOString();
  return {
    id: localId("set"),
    order,
    setType: "working",
    status: "planned",
    plannedTarget: target,
    performance: null,
    effort: { mode: "none" },
    loadScope: scope,
    restTargetSeconds: target?.restSecondsMax ?? null,
    actualRestSeconds: null,
    completedAt: null,
    note: null,
    createdAt: now,
    updatedAt: now,
  };
}
export function newExercise(
  custom: CustomExercise,
  order: number,
): WorkoutExercise {
  const now = new Date().toISOString();
  return {
    id: localId("workout_exercise"),
    order,
    exerciseRef: { kind: "local_custom", customExerciseId: custom.id },
    displayNameSnapshot: custom.displayName,
    performanceMode: custom.performanceMode,
    loadScope: custom.loadScope,
    prescriptionSnapshot: null,
    originalExerciseId: null,
    isProgramDeviation: false,
    sets: [newSet(1, custom.loadScope)],
    note: null,
    createdAt: now,
    updatedAt: now,
  };
}
export function newSession(
  title: string,
  exercises: WorkoutExercise[] = [],
): WorkoutSession {
  const now = new Date(),
    time = now.toISOString(),
    date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return workoutSessionSchema.parse({
    id: localId("workout"),
    schemaVersion: 1,
    revision: 1,
    status: "active",
    source: "ad_hoc",
    title: title || `Workout ${date}`,
    localDate: date,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startedAt: time,
    pausedAt: null,
    completedAt: null,
    abandonedAt: null,
    accumulatedPausedSeconds: 0,
    programRef: null,
    exerciseIds: [...new Set(exercises.map(exerciseKey))],
    exercises,
    sessionNote: null,
    sessionRpe: null,
    discomfortFlag: "none",
    createdAt: time,
    updatedAt: time,
    deletedAt: null,
    dataOrigin: "local",
    importBatchId: null,
  });
}
export function repeatSession(old: WorkoutSession) {
  const session = newSession(
    old.title,
    old.exercises.map((exercise, index) => ({
      ...exercise,
      id: localId("workout_exercise"),
      order: index + 1,
      sets: exercise.sets.map((set, setIndex) => ({
        ...newSet(setIndex + 1, set.loadScope, set.plannedTarget),
        setType: set.setType,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
  );
  return { ...session, source: "repeat" as const, programRef: old.programRef };
}
export function fromProgram(
  program: Program,
  instance: LocalProgramInstance,
  sessionId: string,
  mode: WorkoutExercise["performanceMode"],
  resolveExercise: (id: string) => Exercise | undefined = (id) =>
    exerciseIndexes.byId.get(id),
) {
  if (
    program.contentStatus !== "published" ||
    program.id !== instance.canonicalProgramId ||
    program.version !== instance.canonicalProgramVersion ||
    !["planned", "active", "paused"].includes(instance.status)
  )
    throw new Error(
      "A reviewed template matching your current selection is required.",
    );
  const template = program.scheduleModel?.sessions.find(
    (item) => item.id === sessionId,
  );
  if (!template) throw new Error("Canonical session is unavailable.");
  const scope = allowedScopes[mode][0],
    now = new Date().toISOString();
  const exercises: WorkoutExercise[] = template.exerciseBlocks
    .flatMap((block) =>
      block.prescriptions.map((prescription, index) => {
        const slot = `${template.id}:${block.id}:${index}`,
          id = instance.substitutionSelections[slot] ?? prescription.exerciseId,
          canonical = resolveExercise(id);
        if (
          id !== prescription.exerciseId &&
          !program.substitutionGroups
            ?.find((group) => group.id === prescription.substitutionGroupId)
            ?.candidateExerciseIds.includes(id)
        )
          throw new Error(
            "The saved substitution is outside the reviewed alternatives.",
          );
        if (canonical?.contentStatus !== "published")
          throw new Error(`Reviewed exercise unavailable: ${id}`);
        const distanceFactor =
          prescription.repetitionTarget.type === "distance"
            ? (
                {
                  m: 1,
                  meters: 1,
                  metres: 1,
                  km: 1000,
                  mi: 1609.344,
                } as Record<string, number>
              )[prescription.repetitionTarget.unit ?? ""]
            : undefined;
        if (
          prescription.repetitionTarget.type === "distance" &&
          distanceFactor === undefined
        )
          throw new Error(
            "This reviewed distance unit is not supported by the tracker. Use an ad hoc record with explicit units.",
          );
        const target = {
          distanceMetersMin:
            distanceFactor === undefined
              ? null
              : (prescription.repetitionTarget.range?.min ?? 0) *
                distanceFactor,
          distanceMetersMax:
            distanceFactor === undefined
              ? null
              : (prescription.repetitionTarget.range?.max ?? 0) *
                distanceFactor,
          effortMode: ["rir", "rpe"].includes(prescription.effortTarget.method)
            ? (prescription.effortTarget.method as "rir" | "rpe")
            : ("none" as const),
          effortMin:
            typeof prescription.effortTarget.target === "string"
              ? null
              : ["rir", "rpe"].includes(prescription.effortTarget.method)
                ? prescription.effortTarget.target.min
                : null,
          effortMax:
            typeof prescription.effortTarget.target === "string"
              ? null
              : ["rir", "rpe"].includes(prescription.effortTarget.method)
                ? prescription.effortTarget.target.max
                : null,
          repsMin:
            prescription.repetitionTarget.type === "repetitions"
              ? prescription.repetitionTarget.range?.min
              : null,
          repsMax:
            prescription.repetitionTarget.type === "repetitions"
              ? prescription.repetitionTarget.range?.max
              : null,
          durationSecondsMin:
            prescription.repetitionTarget.type === "seconds"
              ? prescription.repetitionTarget.range?.min
              : null,
          durationSecondsMax:
            prescription.repetitionTarget.type === "seconds"
              ? prescription.repetitionTarget.range?.max
              : null,
          restSecondsMin: prescription.restSeconds?.min ?? null,
          restSecondsMax: prescription.restSeconds?.max ?? null,
        };
        return {
          id: localId("workout_exercise"),
          order: 1,
          exerciseRef: { kind: "canonical" as const, exerciseId: id },
          displayNameSnapshot: canonical.displayName,
          performanceMode: mode,
          loadScope: scope,
          prescriptionSnapshot: {
            canonicalPrescriptionId: slot,
            canonicalBlockId: block.id,
            programVersion: program.version,
            role: prescription.role,
            plannedSetCount: prescription.sets.min,
            progressionRuleId: prescription.progressionRuleId,
            substitutionGroupId: prescription.substitutionGroupId,
            notesSnapshot: [
              ...(prescription.restGuidance
                ? [
                    prescription.restGuidance.text,
                    `Rest source references: ${prescription.restGuidance.sourceIds.join(", ")}`,
                  ]
                : []),
              ...(prescription.notes ?? []),
              `Reviewed set range: ${prescription.sets.min}–${prescription.sets.max}`,
              `Reviewed target: ${prescription.repetitionTarget.type}, ${JSON.stringify(prescription.repetitionTarget.range ?? prescription.repetitionTarget.cap ?? "technical quality")}`,
              `Reviewed effort: ${prescription.effortTarget.method}, ${JSON.stringify(prescription.effortTarget.target)} ${prescription.effortTarget.qualifier ?? ""}`,
            ],
          },
          originalExerciseId: prescription.exerciseId,
          isProgramDeviation: false,
          sets: Array.from({ length: prescription.sets.min }, (_, setIndex) =>
            newSet(setIndex + 1, scope, target),
          ),
          note: null,
          createdAt: now,
          updatedAt: now,
        };
      }),
    )
    .map((exercise, index) => ({ ...exercise, order: index + 1 }));
  return workoutSessionSchema.parse({
    ...newSession(template.displayName, exercises),
    source: "program",
    programRef: {
      programInstanceId: instance.instanceId.startsWith("program_instance_")
        ? instance.instanceId
        : `program_instance_${instance.instanceId}`,
      canonicalProgramId: program.id,
      canonicalProgramVersion: program.version,
      canonicalSessionId: template.id,
      canonicalSessionNameSnapshot: template.displayName,
      scheduleSequenceIndex: program.scheduleModel!.sessions.indexOf(template),
    },
  });
}
export function sessionSummary(session: WorkoutSession) {
  const sets = session.exercises.flatMap((item) => item.sets),
    completed = sets.filter((item) => item.status === "completed");
  return {
    duration: elapsedSeconds(session),
    exercises: session.exercises.length,
    completed: completed.length,
    skipped: sets.filter((item) => item.status === "skipped").length,
    incomplete: sets.filter((item) => item.status === "planned").length,
    reps: completed.reduce(
      (sum, item) =>
        sum +
        (item.performance && "reps" in item.performance
          ? item.performance.reps
          : 0),
      0,
    ),
    volumeByScope: Object.fromEntries(
      [...new Set(completed.map((item) => item.loadScope))].flatMap((scope) => {
        const comparable = completed.filter(
          (item) =>
            item.loadScope === scope && item.performance?.mode === "load_reps",
        );
        return comparable.length
          ? [
              [
                scope,
                comparable.reduce(
                  (sum, item) =>
                    sum +
                    (item.performance?.mode === "load_reps"
                      ? (item.performance.loadGrams / 1000) *
                        item.performance.reps
                      : 0),
                  0,
                ),
              ],
            ]
          : [];
      }),
    ),
  };
}
export function derivePersonalRecords(sessions: readonly WorkoutSession[]) {
  const records = new Map<
    string,
    {
      key: string;
      value: number;
      sessionId: string;
      setId: string;
      date: string;
      label: string;
    }
  >();
  for (const session of [...sessions].sort(
    (a, b) =>
      a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id),
  )) {
    if (session.deletedAt || session.status !== "completed") continue;
    for (const exercise of session.exercises)
      for (const set of exercise.sets) {
        const p = set.performance;
        if (set.status !== "completed" || !p || set.setType === "warmup")
          continue;
        const base = `${exerciseKey(exercise)}:${p.mode}:${set.loadScope}`,
          candidates: [string, number, string][] = [];
        if (p.mode === "load_reps") {
          candidates.push(
            ["max_load", p.loadGrams, "Heaviest comparable set"],
            [
              `max_reps_at_load:${p.loadGrams}`,
              p.reps,
              "Most repetitions at this load",
            ],
            ["volume", p.loadGrams * p.reps, "Highest external set volume"],
          );
        }
        if (p.mode === "reps_only" || p.mode === "bodyweight_reps") {
          candidates.push([
            `max_reps${p.mode === "bodyweight_reps" ? `:${p.addedLoadGrams ?? 0}` : ""}`,
            p.reps,
            "Most comparable repetitions",
          ]);
        }
        if ("durationSeconds" in p)
          candidates.push([
            "duration",
            "distanceMeters" in p ? 0 : p.durationSeconds,
            "Longest duration",
          ]);
        if ("distanceMeters" in p)
          candidates.push(["distance", p.distanceMeters, "Longest distance"]);
        for (const [type, value, label] of candidates) {
          if (type === "duration" && p.mode === "distance_duration") continue;
          const key = `${base}:${type}`;
          if (!records.has(key) || records.get(key)!.value < value)
            records.set(key, {
              key,
              value,
              sessionId: session.id,
              setId: set.id,
              date: session.localDate,
              label,
            });
        }
      }
  }
  return [...records.values()];
}
