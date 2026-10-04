import { z } from "zod";
import {
  workoutSessionNormativeSchema,
  workoutSetNormativeSchema,
  customExerciseNormativeSchema,
  workoutBackupNormativeSchema,
} from "./schema.generated";
export * from "./schema.generated";
export const restTimerSchema = z
  .strictObject({
    sessionId: z.string().regex(/^workout_[a-z0-9_-]+$/),
    startedAt: z.iso.datetime(),
    endsAt: z.iso.datetime(),
    durationSeconds: z.number().int().min(0).max(86400),
  })
  .refine(
    (timer) => timer.endsAt >= timer.startedAt,
    "Timer ends before it starts",
  );
export const performanceModes = [
  "load_reps",
  "bodyweight_reps",
  "reps_only",
  "duration",
  "distance_duration",
  "load_duration",
  "assisted_reps",
] as const;
export const loadScopes = [
  "total_external",
  "per_hand",
  "machine_stack",
  "added_load",
  "assistance",
  "bodyweight",
  "not_applicable",
] as const;
export const allowedScopes = {
  load_reps: ["total_external", "per_hand", "machine_stack"],
  bodyweight_reps: ["bodyweight", "added_load"],
  reps_only: ["not_applicable", "bodyweight"],
  duration: ["not_applicable", "bodyweight"],
  distance_duration: ["not_applicable", "bodyweight"],
  load_duration: ["total_external", "per_hand", "machine_stack", "added_load"],
  assisted_reps: ["assistance"],
} as const;
export const setTypes = [
  "warmup",
  "working",
  "backoff",
  "drop",
  "amrap",
  "technique",
  "timed",
  "distance",
  "other",
] as const;
export const customExerciseSchema = customExerciseNormativeSchema
  .refine(
    (item) => item.schemaVersion === 1,
    "Unsupported custom-exercise version",
  )
  .refine(
    (item) =>
      (allowedScopes[item.performanceMode] as readonly string[]).includes(
        item.loadScope,
      ),
    "Load scope conflicts with performance mode",
  );
export const workoutSetSchema = workoutSetNormativeSchema.superRefine(
  (set, ctx) => {
    const issue = (key: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [key], message });
    if (set.status === "completed" && (!set.performance || !set.completedAt))
      issue(
        "performance",
        "Completed sets need valid performance and a completion timestamp",
      );
    if (set.status !== "completed" && set.completedAt)
      issue("completedAt", "Only completed sets have a completion timestamp");
    if (
      set.performance &&
      !(allowedScopes[set.performance.mode] as readonly string[]).includes(
        set.loadScope,
      )
    )
      issue("loadScope", "Load scope conflicts with performance mode");
    if (set.updatedAt < set.createdAt)
      issue("updatedAt", "Timestamp precedes creation");
    for (const prefix of [
      "reps",
      "durationSeconds",
      "distanceMeters",
      "effort",
      "restSeconds",
    ] as const) {
      const target = set.plannedTarget as Record<string, unknown> | null;
      const min = target?.[`${prefix}Min`],
        max = target?.[`${prefix}Max`];
      if (typeof min === "number" && typeof max === "number" && min > max)
        issue("plannedTarget", "Target minimum exceeds maximum");
    }
  },
);
export const workoutSessionSchema = workoutSessionNormativeSchema.superRefine(
  (session, ctx) => {
    const issue = (key: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [key], message });
    if (session.schemaVersion !== 1)
      issue("schemaVersion", "Unsupported session version");
    if ((session.status === "paused") !== Boolean(session.pausedAt))
      issue("pausedAt", "Paused timestamp conflicts with status");
    if ((session.status === "completed") !== Boolean(session.completedAt))
      issue("completedAt", "Completion timestamp conflicts with status");
    if ((session.status === "abandoned") !== Boolean(session.abandonedAt))
      issue("abandonedAt", "Abandon timestamp conflicts with status");
    if (session.deletedAt && ["active", "paused"].includes(session.status))
      issue("deletedAt", "An active session cannot be deleted");
    if (
      session.updatedAt < session.createdAt ||
      session.startedAt < session.createdAt
    )
      issue("updatedAt", "Invalid timestamp order");
    const end = session.completedAt ?? session.abandonedAt ?? session.pausedAt;
    if (
      end &&
      (Date.parse(end) - Date.parse(session.startedAt)) / 1000 <
        session.accumulatedPausedSeconds
    )
      issue("accumulatedPausedSeconds", "Negative active duration");
    const refs = [
      ...new Set(
        session.exercises.map((item) =>
          item.exerciseRef.kind === "canonical"
            ? item.exerciseRef.exerciseId
            : item.exerciseRef.customExerciseId,
        ),
      ),
    ];
    if (
      JSON.stringify([...session.exerciseIds].sort()) !==
      JSON.stringify(refs.sort())
    )
      issue("exerciseIds", "Exercise index disagrees with exercise references");
    if (
      new Set(session.exercises.map((item) => item.order)).size !==
        session.exercises.length ||
      new Set(session.exercises.map((item) => item.id)).size !==
        session.exercises.length
    )
      issue("exercises", "Duplicate exercise order or ID");
    const allSets = session.exercises.flatMap((item) => item.sets);
    if (new Set(allSets.map((item) => item.id)).size !== allSets.length)
      issue("exercises", "Duplicate set ID");
    session.exercises.forEach((exercise, index) => {
      if (
        !(
          allowedScopes[exercise.performanceMode] as readonly string[]
        ).includes(exercise.loadScope)
      )
        issue("exercises", "Invalid exercise load scope");
      if (
        new Set(exercise.sets.map((set) => set.order)).size !==
        exercise.sets.length
      )
        issue("exercises", "Duplicate set order");
      exercise.sets.forEach((set, setIndex) => {
        const parsed = workoutSetSchema.safeParse(set);
        if (!parsed.success)
          parsed.error.issues.forEach((item) =>
            ctx.addIssue({
              ...item,
              path: ["exercises", index, "sets", setIndex, ...item.path],
            }),
          );
        if (
          set.performance &&
          set.performance.mode !== exercise.performanceMode
        )
          issue("exercises", "Set mode disagrees with exercise mode");
      });
    });
  },
);
export const workoutBackupSchema = workoutBackupNormativeSchema.superRefine(
  (backup, ctx) => {
    if (
      backup.data.workoutPreferences.schemaVersion !== 1 ||
      backup.data.programTrackingStates.some((item) => item.schemaVersion !== 1)
    )
      ctx.addIssue({
        code: "custom",
        path: ["data"],
        message: "Unsupported nested record version",
      });
    if (backup.schemaVersion !== 1)
      ctx.addIssue({
        code: "custom",
        path: ["schemaVersion"],
        message: "Unsupported backup version",
      });
    for (const key of [
      "customExercises",
      "workoutSessions",
      "programTrackingStates",
    ] as const) {
      const records = backup.data[key];
      const ids = records.map((item) =>
        "id" in item ? item.id : item.programInstanceId,
      );
      if (new Set(ids).size !== ids.length)
        ctx.addIssue({
          code: "custom",
          path: ["data", key],
          message: "Duplicate record IDs",
        });
    }
    backup.data.workoutSessions.forEach((session, index) => {
      const parsed = workoutSessionSchema.safeParse(session);
      if (!parsed.success)
        parsed.error.issues.forEach((item) =>
          ctx.addIssue({
            ...item,
            path: ["data", "workoutSessions", index, ...item.path],
          }),
        );
      for (const exercise of session.exercises)
        if (
          exercise.exerciseRef.kind === "local_custom" &&
          !backup.data.customExercises.some(
            (item) =>
              item.id ===
              ("customExerciseId" in exercise.exerciseRef
                ? exercise.exerciseRef.customExerciseId
                : undefined),
          )
        )
          ctx.addIssue({
            code: "custom",
            path: ["data", "workoutSessions", index],
            message: "Missing custom exercise reference",
          });
    });
    backup.data.customExercises.forEach((exercise, index) => {
      const parsed = customExerciseSchema.safeParse(exercise);
      if (!parsed.success)
        parsed.error.issues.forEach((item) =>
          ctx.addIssue({
            ...item,
            path: ["data", "customExercises", index, ...item.path],
          }),
        );
    });
    if (
      backup.data.workoutSessions.filter(
        (item) => !item.deletedAt && ["active", "paused"].includes(item.status),
      ).length > 1
    )
      ctx.addIssue({
        code: "custom",
        path: ["data", "workoutSessions"],
        message: "More than one active workout",
      });
  },
);
