// Generated from DOCS_for_entire_apppliaction/GYM/Phase_06_Workout_Tracker_Data_Schema.json; do not hand edit.
import { z } from "zod";
export const workoutPreferencesNormativeSchema = z.strictObject({
  id: z.literal("workout-preferences"),
  schemaVersion: z.number().finite().int().min(1),
  weightUnit: z.enum(["kg", "lb"]),
  distanceUnit: z.enum(["km", "mi"]),
  effortMode: z.enum(["none", "rir", "rpe"]),
  defaultRestSeconds: z.number().finite().int().min(0).max(3600),
  autoStartRestTimer: z.boolean(),
  timerSound: z.enum(["off", "beep"]),
  showPreviousPerformance: z.boolean(),
  confirmBeforeDiscard: z.boolean(),
  weekStartsOn: z.enum(["monday", "sunday"]),
  updatedAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
});
export type WorkoutPreferences = z.infer<
  typeof workoutPreferencesNormativeSchema
>;
export const programTrackingStateNormativeSchema = z.strictObject({
  programInstanceId: z
    .string()
    .regex(new RegExp("^program_instance_[a-z0-9_-]+$")),
  schemaVersion: z.number().finite().int().min(1),
  sequenceCursor: z.number().finite().int().min(0).nullable(),
  completedSessionCount: z.number().finite().int().min(0),
  lastStartedCanonicalSessionId: z
    .string()
    .regex(new RegExp("^session_[a-z0-9_]+$"))
    .nullable(),
  lastCompletedCanonicalSessionId: z
    .string()
    .regex(new RegExp("^session_[a-z0-9_]+$"))
    .nullable(),
  lastCompletedAt: z.union([
    z
      .string()
      .refine(
        (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  createdAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
  updatedAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
});
export type ProgramTrackingState = z.infer<
  typeof programTrackingStateNormativeSchema
>;
export const customExerciseNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^custom_exercise_[a-z0-9_-]+$")),
  schemaVersion: z.number().finite().int().min(1),
  displayName: z.string().min(1).max(120),
  performanceMode: z.enum([
    "load_reps",
    "bodyweight_reps",
    "reps_only",
    "duration",
    "distance_duration",
    "load_duration",
    "assisted_reps",
  ]),
  loadScope: z.enum([
    "total_external",
    "per_hand",
    "machine_stack",
    "added_load",
    "assistance",
    "bodyweight",
    "not_applicable",
  ]),
  notes: z.string().max(1000).nullable().optional(),
  createdAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
  updatedAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
  archivedAt: z.union([
    z
      .string()
      .refine(
        (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
});
export type CustomExercise = z.infer<typeof customExerciseNormativeSchema>;
export const workoutSetNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^set_[a-z0-9_-]+$")),
  order: z.number().finite().int().min(1),
  setType: z.enum([
    "warmup",
    "working",
    "backoff",
    "drop",
    "amrap",
    "technique",
    "timed",
    "distance",
    "other",
  ]),
  status: z.enum(["planned", "completed", "skipped"]),
  plannedTarget: z
    .strictObject({
      repsMin: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(10000)
        .nullable()
        .optional(),
      repsMax: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(10000)
        .nullable()
        .optional(),
      durationSecondsMin: z
        .number()
        .finite()
        .int()
        .min(0)
        .nullable()
        .optional(),
      durationSecondsMax: z
        .number()
        .finite()
        .int()
        .min(0)
        .nullable()
        .optional(),
      distanceMetersMin: z.number().finite().min(0).nullable().optional(),
      distanceMetersMax: z.number().finite().min(0).nullable().optional(),
      effortMode: z
        .union([
          z.literal("none"),
          z.literal("rir"),
          z.literal("rpe"),
          z.literal(null),
        ])
        .optional(),
      effortMin: z.number().finite().min(0).max(10).nullable().optional(),
      effortMax: z.number().finite().min(0).max(10).nullable().optional(),
      restSecondsMin: z.number().finite().int().min(0).nullable().optional(),
      restSecondsMax: z.number().finite().int().min(0).nullable().optional(),
    })
    .nullable(),
  performance: z.union([
    z.union([
      z.strictObject({
        mode: z.literal("load_reps"),
        loadGrams: z.number().finite().int().min(0),
        reps: z.number().finite().int().min(0).max(10000),
      }),
      z.strictObject({
        mode: z.literal("bodyweight_reps"),
        reps: z.number().finite().int().min(0).max(10000),
        addedLoadGrams: z.number().finite().int().min(0).nullable(),
      }),
      z.strictObject({
        mode: z.literal("reps_only"),
        reps: z.number().finite().int().min(0).max(10000),
      }),
      z.strictObject({
        mode: z.literal("duration"),
        durationSeconds: z.number().finite().int().min(0),
      }),
      z.strictObject({
        mode: z.literal("distance_duration"),
        distanceMeters: z.number().finite().min(0),
        durationSeconds: z.number().finite().int().min(0),
      }),
      z.strictObject({
        mode: z.literal("load_duration"),
        loadGrams: z.number().finite().int().min(0),
        durationSeconds: z.number().finite().int().min(0),
      }),
      z.strictObject({
        mode: z.literal("assisted_reps"),
        assistanceGrams: z.number().finite().int().min(0),
        reps: z.number().finite().int().min(0).max(10000),
      }),
    ]),
    z.null(),
  ]),
  effort: z.union([
    z.strictObject({ mode: z.literal("none") }),
    z.strictObject({
      mode: z.literal("rir"),
      value: z.number().finite().min(0).max(10),
    }),
    z.strictObject({
      mode: z.literal("rpe"),
      value: z.number().finite().min(1).max(10),
    }),
  ]),
  loadScope: z.enum([
    "total_external",
    "per_hand",
    "machine_stack",
    "added_load",
    "assistance",
    "bodyweight",
    "not_applicable",
  ]),
  restTargetSeconds: z.number().finite().int().min(0).max(7200).nullable(),
  actualRestSeconds: z.number().finite().int().min(0).max(86400).nullable(),
  completedAt: z.union([
    z
      .string()
      .refine(
        (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  note: z.string().max(1000).nullable(),
  createdAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
  updatedAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
});
export type WorkoutSet = z.infer<typeof workoutSetNormativeSchema>;
export const workoutExerciseNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^workout_exercise_[a-z0-9_-]+$")),
  order: z.number().finite().int().min(1),
  exerciseRef: z.union([
    z.strictObject({
      kind: z.literal("canonical"),
      exerciseId: z.string().regex(new RegExp("^exercise_[a-z0-9_]+$")),
    }),
    z.strictObject({
      kind: z.literal("local_custom"),
      customExerciseId: z
        .string()
        .regex(new RegExp("^custom_exercise_[a-z0-9_-]+$")),
    }),
  ]),
  displayNameSnapshot: z.string().min(1).max(160),
  performanceMode: z.enum([
    "load_reps",
    "bodyweight_reps",
    "reps_only",
    "duration",
    "distance_duration",
    "load_duration",
    "assisted_reps",
  ]),
  loadScope: z.enum([
    "total_external",
    "per_hand",
    "machine_stack",
    "added_load",
    "assistance",
    "bodyweight",
    "not_applicable",
  ]),
  prescriptionSnapshot: z
    .strictObject({
      canonicalPrescriptionId: z.string().max(160).nullable().optional(),
      canonicalBlockId: z
        .string()
        .regex(new RegExp("^block_[a-z0-9_]+$"))
        .nullable()
        .optional(),
      programVersion: z.string().max(40).nullable().optional(),
      role: z.string().max(80).nullable().optional(),
      plannedSetCount: z.number().finite().int().min(0).nullable().optional(),
      progressionRuleId: z
        .string()
        .regex(new RegExp("^progression_[a-z0-9_]+$"))
        .nullable()
        .optional(),
      substitutionGroupId: z
        .string()
        .regex(new RegExp("^substitution_[a-z0-9_]+$"))
        .nullable()
        .optional(),
      notesSnapshot: z.array(z.string().max(500)).optional(),
    })
    .nullable(),
  originalExerciseId: z
    .string()
    .regex(new RegExp("^exercise_[a-z0-9_]+$"))
    .nullable(),
  isProgramDeviation: z.boolean(),
  sets: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^set_[a-z0-9_-]+$")),
      order: z.number().finite().int().min(1),
      setType: z.enum([
        "warmup",
        "working",
        "backoff",
        "drop",
        "amrap",
        "technique",
        "timed",
        "distance",
        "other",
      ]),
      status: z.enum(["planned", "completed", "skipped"]),
      plannedTarget: z
        .strictObject({
          repsMin: z
            .number()
            .finite()
            .int()
            .min(0)
            .max(10000)
            .nullable()
            .optional(),
          repsMax: z
            .number()
            .finite()
            .int()
            .min(0)
            .max(10000)
            .nullable()
            .optional(),
          durationSecondsMin: z
            .number()
            .finite()
            .int()
            .min(0)
            .nullable()
            .optional(),
          durationSecondsMax: z
            .number()
            .finite()
            .int()
            .min(0)
            .nullable()
            .optional(),
          distanceMetersMin: z.number().finite().min(0).nullable().optional(),
          distanceMetersMax: z.number().finite().min(0).nullable().optional(),
          effortMode: z
            .union([
              z.literal("none"),
              z.literal("rir"),
              z.literal("rpe"),
              z.literal(null),
            ])
            .optional(),
          effortMin: z.number().finite().min(0).max(10).nullable().optional(),
          effortMax: z.number().finite().min(0).max(10).nullable().optional(),
          restSecondsMin: z
            .number()
            .finite()
            .int()
            .min(0)
            .nullable()
            .optional(),
          restSecondsMax: z
            .number()
            .finite()
            .int()
            .min(0)
            .nullable()
            .optional(),
        })
        .nullable(),
      performance: z.union([
        z.union([
          z.strictObject({
            mode: z.literal("load_reps"),
            loadGrams: z.number().finite().int().min(0),
            reps: z.number().finite().int().min(0).max(10000),
          }),
          z.strictObject({
            mode: z.literal("bodyweight_reps"),
            reps: z.number().finite().int().min(0).max(10000),
            addedLoadGrams: z.number().finite().int().min(0).nullable(),
          }),
          z.strictObject({
            mode: z.literal("reps_only"),
            reps: z.number().finite().int().min(0).max(10000),
          }),
          z.strictObject({
            mode: z.literal("duration"),
            durationSeconds: z.number().finite().int().min(0),
          }),
          z.strictObject({
            mode: z.literal("distance_duration"),
            distanceMeters: z.number().finite().min(0),
            durationSeconds: z.number().finite().int().min(0),
          }),
          z.strictObject({
            mode: z.literal("load_duration"),
            loadGrams: z.number().finite().int().min(0),
            durationSeconds: z.number().finite().int().min(0),
          }),
          z.strictObject({
            mode: z.literal("assisted_reps"),
            assistanceGrams: z.number().finite().int().min(0),
            reps: z.number().finite().int().min(0).max(10000),
          }),
        ]),
        z.null(),
      ]),
      effort: z.union([
        z.strictObject({ mode: z.literal("none") }),
        z.strictObject({
          mode: z.literal("rir"),
          value: z.number().finite().min(0).max(10),
        }),
        z.strictObject({
          mode: z.literal("rpe"),
          value: z.number().finite().min(1).max(10),
        }),
      ]),
      loadScope: z.enum([
        "total_external",
        "per_hand",
        "machine_stack",
        "added_load",
        "assistance",
        "bodyweight",
        "not_applicable",
      ]),
      restTargetSeconds: z.number().finite().int().min(0).max(7200).nullable(),
      actualRestSeconds: z.number().finite().int().min(0).max(86400).nullable(),
      completedAt: z.union([
        z
          .string()
          .refine(
            (value) =>
              z.iso.datetime({ offset: true }).safeParse(value).success,
            "Invalid timestamp",
          ),
        z.null(),
      ]),
      note: z.string().max(1000).nullable(),
      createdAt: z
        .string()
        .refine(
          (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
          "Invalid timestamp",
        ),
      updatedAt: z
        .string()
        .refine(
          (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
          "Invalid timestamp",
        ),
    }),
  ),
  note: z.string().max(2000).nullable(),
  createdAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
  updatedAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
});
export type WorkoutExercise = z.infer<typeof workoutExerciseNormativeSchema>;
export const workoutSessionNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^workout_[a-z0-9_-]+$")),
  schemaVersion: z.number().finite().int().min(1),
  revision: z.number().finite().int().min(1),
  status: z.enum(["active", "paused", "completed", "abandoned"]),
  source: z.enum(["program", "ad_hoc", "repeat", "import"]),
  title: z.string().min(1).max(160),
  localDate: z
    .string()
    .refine((value) => z.iso.date().safeParse(value).success, "Invalid date"),
  timeZone: z.string().min(1).max(120),
  startedAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
  pausedAt: z.union([
    z
      .string()
      .refine(
        (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  completedAt: z.union([
    z
      .string()
      .refine(
        (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  abandonedAt: z.union([
    z
      .string()
      .refine(
        (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  accumulatedPausedSeconds: z.number().finite().int().min(0),
  programRef: z.union([
    z.strictObject({
      programInstanceId: z
        .string()
        .regex(new RegExp("^program_instance_[a-z0-9_-]+$")),
      canonicalProgramId: z.string().regex(new RegExp("^program_[a-z0-9_]+$")),
      canonicalProgramVersion: z.string().min(1).max(40),
      canonicalSessionId: z.string().regex(new RegExp("^session_[a-z0-9_]+$")),
      canonicalSessionNameSnapshot: z.string().min(1).max(160),
      scheduleSequenceIndex: z.number().finite().int().min(0).nullable(),
    }),
    z.null(),
  ]),
  exerciseIds: z
    .array(z.string().min(3).max(160))
    .refine(
      (items) =>
        new Set(items.map((item) => JSON.stringify(item))).size ===
        items.length,
      "Duplicate array value",
    ),
  exercises: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^workout_exercise_[a-z0-9_-]+$")),
      order: z.number().finite().int().min(1),
      exerciseRef: z.union([
        z.strictObject({
          kind: z.literal("canonical"),
          exerciseId: z.string().regex(new RegExp("^exercise_[a-z0-9_]+$")),
        }),
        z.strictObject({
          kind: z.literal("local_custom"),
          customExerciseId: z
            .string()
            .regex(new RegExp("^custom_exercise_[a-z0-9_-]+$")),
        }),
      ]),
      displayNameSnapshot: z.string().min(1).max(160),
      performanceMode: z.enum([
        "load_reps",
        "bodyweight_reps",
        "reps_only",
        "duration",
        "distance_duration",
        "load_duration",
        "assisted_reps",
      ]),
      loadScope: z.enum([
        "total_external",
        "per_hand",
        "machine_stack",
        "added_load",
        "assistance",
        "bodyweight",
        "not_applicable",
      ]),
      prescriptionSnapshot: z
        .strictObject({
          canonicalPrescriptionId: z.string().max(160).nullable().optional(),
          canonicalBlockId: z
            .string()
            .regex(new RegExp("^block_[a-z0-9_]+$"))
            .nullable()
            .optional(),
          programVersion: z.string().max(40).nullable().optional(),
          role: z.string().max(80).nullable().optional(),
          plannedSetCount: z
            .number()
            .finite()
            .int()
            .min(0)
            .nullable()
            .optional(),
          progressionRuleId: z
            .string()
            .regex(new RegExp("^progression_[a-z0-9_]+$"))
            .nullable()
            .optional(),
          substitutionGroupId: z
            .string()
            .regex(new RegExp("^substitution_[a-z0-9_]+$"))
            .nullable()
            .optional(),
          notesSnapshot: z.array(z.string().max(500)).optional(),
        })
        .nullable(),
      originalExerciseId: z
        .string()
        .regex(new RegExp("^exercise_[a-z0-9_]+$"))
        .nullable(),
      isProgramDeviation: z.boolean(),
      sets: z.array(
        z.strictObject({
          id: z.string().regex(new RegExp("^set_[a-z0-9_-]+$")),
          order: z.number().finite().int().min(1),
          setType: z.enum([
            "warmup",
            "working",
            "backoff",
            "drop",
            "amrap",
            "technique",
            "timed",
            "distance",
            "other",
          ]),
          status: z.enum(["planned", "completed", "skipped"]),
          plannedTarget: z
            .strictObject({
              repsMin: z
                .number()
                .finite()
                .int()
                .min(0)
                .max(10000)
                .nullable()
                .optional(),
              repsMax: z
                .number()
                .finite()
                .int()
                .min(0)
                .max(10000)
                .nullable()
                .optional(),
              durationSecondsMin: z
                .number()
                .finite()
                .int()
                .min(0)
                .nullable()
                .optional(),
              durationSecondsMax: z
                .number()
                .finite()
                .int()
                .min(0)
                .nullable()
                .optional(),
              distanceMetersMin: z
                .number()
                .finite()
                .min(0)
                .nullable()
                .optional(),
              distanceMetersMax: z
                .number()
                .finite()
                .min(0)
                .nullable()
                .optional(),
              effortMode: z
                .union([
                  z.literal("none"),
                  z.literal("rir"),
                  z.literal("rpe"),
                  z.literal(null),
                ])
                .optional(),
              effortMin: z
                .number()
                .finite()
                .min(0)
                .max(10)
                .nullable()
                .optional(),
              effortMax: z
                .number()
                .finite()
                .min(0)
                .max(10)
                .nullable()
                .optional(),
              restSecondsMin: z
                .number()
                .finite()
                .int()
                .min(0)
                .nullable()
                .optional(),
              restSecondsMax: z
                .number()
                .finite()
                .int()
                .min(0)
                .nullable()
                .optional(),
            })
            .nullable(),
          performance: z.union([
            z.union([
              z.strictObject({
                mode: z.literal("load_reps"),
                loadGrams: z.number().finite().int().min(0),
                reps: z.number().finite().int().min(0).max(10000),
              }),
              z.strictObject({
                mode: z.literal("bodyweight_reps"),
                reps: z.number().finite().int().min(0).max(10000),
                addedLoadGrams: z.number().finite().int().min(0).nullable(),
              }),
              z.strictObject({
                mode: z.literal("reps_only"),
                reps: z.number().finite().int().min(0).max(10000),
              }),
              z.strictObject({
                mode: z.literal("duration"),
                durationSeconds: z.number().finite().int().min(0),
              }),
              z.strictObject({
                mode: z.literal("distance_duration"),
                distanceMeters: z.number().finite().min(0),
                durationSeconds: z.number().finite().int().min(0),
              }),
              z.strictObject({
                mode: z.literal("load_duration"),
                loadGrams: z.number().finite().int().min(0),
                durationSeconds: z.number().finite().int().min(0),
              }),
              z.strictObject({
                mode: z.literal("assisted_reps"),
                assistanceGrams: z.number().finite().int().min(0),
                reps: z.number().finite().int().min(0).max(10000),
              }),
            ]),
            z.null(),
          ]),
          effort: z.union([
            z.strictObject({ mode: z.literal("none") }),
            z.strictObject({
              mode: z.literal("rir"),
              value: z.number().finite().min(0).max(10),
            }),
            z.strictObject({
              mode: z.literal("rpe"),
              value: z.number().finite().min(1).max(10),
            }),
          ]),
          loadScope: z.enum([
            "total_external",
            "per_hand",
            "machine_stack",
            "added_load",
            "assistance",
            "bodyweight",
            "not_applicable",
          ]),
          restTargetSeconds: z
            .number()
            .finite()
            .int()
            .min(0)
            .max(7200)
            .nullable(),
          actualRestSeconds: z
            .number()
            .finite()
            .int()
            .min(0)
            .max(86400)
            .nullable(),
          completedAt: z.union([
            z
              .string()
              .refine(
                (value) =>
                  z.iso.datetime({ offset: true }).safeParse(value).success,
                "Invalid timestamp",
              ),
            z.null(),
          ]),
          note: z.string().max(1000).nullable(),
          createdAt: z
            .string()
            .refine(
              (value) =>
                z.iso.datetime({ offset: true }).safeParse(value).success,
              "Invalid timestamp",
            ),
          updatedAt: z
            .string()
            .refine(
              (value) =>
                z.iso.datetime({ offset: true }).safeParse(value).success,
              "Invalid timestamp",
            ),
        }),
      ),
      note: z.string().max(2000).nullable(),
      createdAt: z
        .string()
        .refine(
          (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
          "Invalid timestamp",
        ),
      updatedAt: z
        .string()
        .refine(
          (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
          "Invalid timestamp",
        ),
    }),
  ),
  sessionNote: z.string().max(5000).nullable(),
  sessionRpe: z.number().finite().min(1).max(10).nullable(),
  discomfortFlag: z.enum(["none", "noticed", "stopped_set", "stopped_session"]),
  createdAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
  updatedAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
  deletedAt: z.union([
    z
      .string()
      .refine(
        (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  dataOrigin: z.enum(["local", "imported"]),
  importBatchId: z.string().max(160).nullable(),
});
export type WorkoutSession = z.infer<typeof workoutSessionNormativeSchema>;
export const performanceNormativeSchema = z.union([
  z.strictObject({
    mode: z.literal("load_reps"),
    loadGrams: z.number().finite().int().min(0),
    reps: z.number().finite().int().min(0).max(10000),
  }),
  z.strictObject({
    mode: z.literal("bodyweight_reps"),
    reps: z.number().finite().int().min(0).max(10000),
    addedLoadGrams: z.number().finite().int().min(0).nullable(),
  }),
  z.strictObject({
    mode: z.literal("reps_only"),
    reps: z.number().finite().int().min(0).max(10000),
  }),
  z.strictObject({
    mode: z.literal("duration"),
    durationSeconds: z.number().finite().int().min(0),
  }),
  z.strictObject({
    mode: z.literal("distance_duration"),
    distanceMeters: z.number().finite().min(0),
    durationSeconds: z.number().finite().int().min(0),
  }),
  z.strictObject({
    mode: z.literal("load_duration"),
    loadGrams: z.number().finite().int().min(0),
    durationSeconds: z.number().finite().int().min(0),
  }),
  z.strictObject({
    mode: z.literal("assisted_reps"),
    assistanceGrams: z.number().finite().int().min(0),
    reps: z.number().finite().int().min(0).max(10000),
  }),
]);
export type Performance = z.infer<typeof performanceNormativeSchema>;
export const effortNormativeSchema = z.union([
  z.strictObject({ mode: z.literal("none") }),
  z.strictObject({
    mode: z.literal("rir"),
    value: z.number().finite().min(0).max(10),
  }),
  z.strictObject({
    mode: z.literal("rpe"),
    value: z.number().finite().min(1).max(10),
  }),
]);
export type Effort = z.infer<typeof effortNormativeSchema>;
export const workoutBackupNormativeSchema = z.strictObject({
  format: z.literal("fitness-os-workout-backup"),
  schemaVersion: z.number().finite().int().min(1),
  exportedAt: z
    .string()
    .refine(
      (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
      "Invalid timestamp",
    ),
  appVersion: z.string().min(1).max(80),
  sourceDeviceLabel: z.string().max(120).nullable().optional(),
  data: z.strictObject({
    workoutPreferences: z.strictObject({
      id: z.literal("workout-preferences"),
      schemaVersion: z.number().finite().int().min(1),
      weightUnit: z.enum(["kg", "lb"]),
      distanceUnit: z.enum(["km", "mi"]),
      effortMode: z.enum(["none", "rir", "rpe"]),
      defaultRestSeconds: z.number().finite().int().min(0).max(3600),
      autoStartRestTimer: z.boolean(),
      timerSound: z.enum(["off", "beep"]),
      showPreviousPerformance: z.boolean(),
      confirmBeforeDiscard: z.boolean(),
      weekStartsOn: z.enum(["monday", "sunday"]),
      updatedAt: z
        .string()
        .refine(
          (value) => z.iso.datetime({ offset: true }).safeParse(value).success,
          "Invalid timestamp",
        ),
    }),
    programTrackingStates: z.array(
      z.strictObject({
        programInstanceId: z
          .string()
          .regex(new RegExp("^program_instance_[a-z0-9_-]+$")),
        schemaVersion: z.number().finite().int().min(1),
        sequenceCursor: z.number().finite().int().min(0).nullable(),
        completedSessionCount: z.number().finite().int().min(0),
        lastStartedCanonicalSessionId: z
          .string()
          .regex(new RegExp("^session_[a-z0-9_]+$"))
          .nullable(),
        lastCompletedCanonicalSessionId: z
          .string()
          .regex(new RegExp("^session_[a-z0-9_]+$"))
          .nullable(),
        lastCompletedAt: z.union([
          z
            .string()
            .refine(
              (value) =>
                z.iso.datetime({ offset: true }).safeParse(value).success,
              "Invalid timestamp",
            ),
          z.null(),
        ]),
        createdAt: z
          .string()
          .refine(
            (value) =>
              z.iso.datetime({ offset: true }).safeParse(value).success,
            "Invalid timestamp",
          ),
        updatedAt: z
          .string()
          .refine(
            (value) =>
              z.iso.datetime({ offset: true }).safeParse(value).success,
            "Invalid timestamp",
          ),
      }),
    ),
    customExercises: z.array(
      z.strictObject({
        id: z.string().regex(new RegExp("^custom_exercise_[a-z0-9_-]+$")),
        schemaVersion: z.number().finite().int().min(1),
        displayName: z.string().min(1).max(120),
        performanceMode: z.enum([
          "load_reps",
          "bodyweight_reps",
          "reps_only",
          "duration",
          "distance_duration",
          "load_duration",
          "assisted_reps",
        ]),
        loadScope: z.enum([
          "total_external",
          "per_hand",
          "machine_stack",
          "added_load",
          "assistance",
          "bodyweight",
          "not_applicable",
        ]),
        notes: z.string().max(1000).nullable().optional(),
        createdAt: z
          .string()
          .refine(
            (value) =>
              z.iso.datetime({ offset: true }).safeParse(value).success,
            "Invalid timestamp",
          ),
        updatedAt: z
          .string()
          .refine(
            (value) =>
              z.iso.datetime({ offset: true }).safeParse(value).success,
            "Invalid timestamp",
          ),
        archivedAt: z.union([
          z
            .string()
            .refine(
              (value) =>
                z.iso.datetime({ offset: true }).safeParse(value).success,
              "Invalid timestamp",
            ),
          z.null(),
        ]),
      }),
    ),
    workoutSessions: z.array(
      z.strictObject({
        id: z.string().regex(new RegExp("^workout_[a-z0-9_-]+$")),
        schemaVersion: z.number().finite().int().min(1),
        revision: z.number().finite().int().min(1),
        status: z.enum(["active", "paused", "completed", "abandoned"]),
        source: z.enum(["program", "ad_hoc", "repeat", "import"]),
        title: z.string().min(1).max(160),
        localDate: z
          .string()
          .refine(
            (value) => z.iso.date().safeParse(value).success,
            "Invalid date",
          ),
        timeZone: z.string().min(1).max(120),
        startedAt: z
          .string()
          .refine(
            (value) =>
              z.iso.datetime({ offset: true }).safeParse(value).success,
            "Invalid timestamp",
          ),
        pausedAt: z.union([
          z
            .string()
            .refine(
              (value) =>
                z.iso.datetime({ offset: true }).safeParse(value).success,
              "Invalid timestamp",
            ),
          z.null(),
        ]),
        completedAt: z.union([
          z
            .string()
            .refine(
              (value) =>
                z.iso.datetime({ offset: true }).safeParse(value).success,
              "Invalid timestamp",
            ),
          z.null(),
        ]),
        abandonedAt: z.union([
          z
            .string()
            .refine(
              (value) =>
                z.iso.datetime({ offset: true }).safeParse(value).success,
              "Invalid timestamp",
            ),
          z.null(),
        ]),
        accumulatedPausedSeconds: z.number().finite().int().min(0),
        programRef: z.union([
          z.strictObject({
            programInstanceId: z
              .string()
              .regex(new RegExp("^program_instance_[a-z0-9_-]+$")),
            canonicalProgramId: z
              .string()
              .regex(new RegExp("^program_[a-z0-9_]+$")),
            canonicalProgramVersion: z.string().min(1).max(40),
            canonicalSessionId: z
              .string()
              .regex(new RegExp("^session_[a-z0-9_]+$")),
            canonicalSessionNameSnapshot: z.string().min(1).max(160),
            scheduleSequenceIndex: z.number().finite().int().min(0).nullable(),
          }),
          z.null(),
        ]),
        exerciseIds: z
          .array(z.string().min(3).max(160))
          .refine(
            (items) =>
              new Set(items.map((item) => JSON.stringify(item))).size ===
              items.length,
            "Duplicate array value",
          ),
        exercises: z.array(
          z.strictObject({
            id: z.string().regex(new RegExp("^workout_exercise_[a-z0-9_-]+$")),
            order: z.number().finite().int().min(1),
            exerciseRef: z.union([
              z.strictObject({
                kind: z.literal("canonical"),
                exerciseId: z
                  .string()
                  .regex(new RegExp("^exercise_[a-z0-9_]+$")),
              }),
              z.strictObject({
                kind: z.literal("local_custom"),
                customExerciseId: z
                  .string()
                  .regex(new RegExp("^custom_exercise_[a-z0-9_-]+$")),
              }),
            ]),
            displayNameSnapshot: z.string().min(1).max(160),
            performanceMode: z.enum([
              "load_reps",
              "bodyweight_reps",
              "reps_only",
              "duration",
              "distance_duration",
              "load_duration",
              "assisted_reps",
            ]),
            loadScope: z.enum([
              "total_external",
              "per_hand",
              "machine_stack",
              "added_load",
              "assistance",
              "bodyweight",
              "not_applicable",
            ]),
            prescriptionSnapshot: z
              .strictObject({
                canonicalPrescriptionId: z
                  .string()
                  .max(160)
                  .nullable()
                  .optional(),
                canonicalBlockId: z
                  .string()
                  .regex(new RegExp("^block_[a-z0-9_]+$"))
                  .nullable()
                  .optional(),
                programVersion: z.string().max(40).nullable().optional(),
                role: z.string().max(80).nullable().optional(),
                plannedSetCount: z
                  .number()
                  .finite()
                  .int()
                  .min(0)
                  .nullable()
                  .optional(),
                progressionRuleId: z
                  .string()
                  .regex(new RegExp("^progression_[a-z0-9_]+$"))
                  .nullable()
                  .optional(),
                substitutionGroupId: z
                  .string()
                  .regex(new RegExp("^substitution_[a-z0-9_]+$"))
                  .nullable()
                  .optional(),
                notesSnapshot: z.array(z.string().max(500)).optional(),
              })
              .nullable(),
            originalExerciseId: z
              .string()
              .regex(new RegExp("^exercise_[a-z0-9_]+$"))
              .nullable(),
            isProgramDeviation: z.boolean(),
            sets: z.array(
              z.strictObject({
                id: z.string().regex(new RegExp("^set_[a-z0-9_-]+$")),
                order: z.number().finite().int().min(1),
                setType: z.enum([
                  "warmup",
                  "working",
                  "backoff",
                  "drop",
                  "amrap",
                  "technique",
                  "timed",
                  "distance",
                  "other",
                ]),
                status: z.enum(["planned", "completed", "skipped"]),
                plannedTarget: z
                  .strictObject({
                    repsMin: z
                      .number()
                      .finite()
                      .int()
                      .min(0)
                      .max(10000)
                      .nullable()
                      .optional(),
                    repsMax: z
                      .number()
                      .finite()
                      .int()
                      .min(0)
                      .max(10000)
                      .nullable()
                      .optional(),
                    durationSecondsMin: z
                      .number()
                      .finite()
                      .int()
                      .min(0)
                      .nullable()
                      .optional(),
                    durationSecondsMax: z
                      .number()
                      .finite()
                      .int()
                      .min(0)
                      .nullable()
                      .optional(),
                    distanceMetersMin: z
                      .number()
                      .finite()
                      .min(0)
                      .nullable()
                      .optional(),
                    distanceMetersMax: z
                      .number()
                      .finite()
                      .min(0)
                      .nullable()
                      .optional(),
                    effortMode: z
                      .union([
                        z.literal("none"),
                        z.literal("rir"),
                        z.literal("rpe"),
                        z.literal(null),
                      ])
                      .optional(),
                    effortMin: z
                      .number()
                      .finite()
                      .min(0)
                      .max(10)
                      .nullable()
                      .optional(),
                    effortMax: z
                      .number()
                      .finite()
                      .min(0)
                      .max(10)
                      .nullable()
                      .optional(),
                    restSecondsMin: z
                      .number()
                      .finite()
                      .int()
                      .min(0)
                      .nullable()
                      .optional(),
                    restSecondsMax: z
                      .number()
                      .finite()
                      .int()
                      .min(0)
                      .nullable()
                      .optional(),
                  })
                  .nullable(),
                performance: z.union([
                  z.union([
                    z.strictObject({
                      mode: z.literal("load_reps"),
                      loadGrams: z.number().finite().int().min(0),
                      reps: z.number().finite().int().min(0).max(10000),
                    }),
                    z.strictObject({
                      mode: z.literal("bodyweight_reps"),
                      reps: z.number().finite().int().min(0).max(10000),
                      addedLoadGrams: z
                        .number()
                        .finite()
                        .int()
                        .min(0)
                        .nullable(),
                    }),
                    z.strictObject({
                      mode: z.literal("reps_only"),
                      reps: z.number().finite().int().min(0).max(10000),
                    }),
                    z.strictObject({
                      mode: z.literal("duration"),
                      durationSeconds: z.number().finite().int().min(0),
                    }),
                    z.strictObject({
                      mode: z.literal("distance_duration"),
                      distanceMeters: z.number().finite().min(0),
                      durationSeconds: z.number().finite().int().min(0),
                    }),
                    z.strictObject({
                      mode: z.literal("load_duration"),
                      loadGrams: z.number().finite().int().min(0),
                      durationSeconds: z.number().finite().int().min(0),
                    }),
                    z.strictObject({
                      mode: z.literal("assisted_reps"),
                      assistanceGrams: z.number().finite().int().min(0),
                      reps: z.number().finite().int().min(0).max(10000),
                    }),
                  ]),
                  z.null(),
                ]),
                effort: z.union([
                  z.strictObject({ mode: z.literal("none") }),
                  z.strictObject({
                    mode: z.literal("rir"),
                    value: z.number().finite().min(0).max(10),
                  }),
                  z.strictObject({
                    mode: z.literal("rpe"),
                    value: z.number().finite().min(1).max(10),
                  }),
                ]),
                loadScope: z.enum([
                  "total_external",
                  "per_hand",
                  "machine_stack",
                  "added_load",
                  "assistance",
                  "bodyweight",
                  "not_applicable",
                ]),
                restTargetSeconds: z
                  .number()
                  .finite()
                  .int()
                  .min(0)
                  .max(7200)
                  .nullable(),
                actualRestSeconds: z
                  .number()
                  .finite()
                  .int()
                  .min(0)
                  .max(86400)
                  .nullable(),
                completedAt: z.union([
                  z
                    .string()
                    .refine(
                      (value) =>
                        z.iso.datetime({ offset: true }).safeParse(value)
                          .success,
                      "Invalid timestamp",
                    ),
                  z.null(),
                ]),
                note: z.string().max(1000).nullable(),
                createdAt: z
                  .string()
                  .refine(
                    (value) =>
                      z.iso.datetime({ offset: true }).safeParse(value).success,
                    "Invalid timestamp",
                  ),
                updatedAt: z
                  .string()
                  .refine(
                    (value) =>
                      z.iso.datetime({ offset: true }).safeParse(value).success,
                    "Invalid timestamp",
                  ),
              }),
            ),
            note: z.string().max(2000).nullable(),
            createdAt: z
              .string()
              .refine(
                (value) =>
                  z.iso.datetime({ offset: true }).safeParse(value).success,
                "Invalid timestamp",
              ),
            updatedAt: z
              .string()
              .refine(
                (value) =>
                  z.iso.datetime({ offset: true }).safeParse(value).success,
                "Invalid timestamp",
              ),
          }),
        ),
        sessionNote: z.string().max(5000).nullable(),
        sessionRpe: z.number().finite().min(1).max(10).nullable(),
        discomfortFlag: z.enum([
          "none",
          "noticed",
          "stopped_set",
          "stopped_session",
        ]),
        createdAt: z
          .string()
          .refine(
            (value) =>
              z.iso.datetime({ offset: true }).safeParse(value).success,
            "Invalid timestamp",
          ),
        updatedAt: z
          .string()
          .refine(
            (value) =>
              z.iso.datetime({ offset: true }).safeParse(value).success,
            "Invalid timestamp",
          ),
        deletedAt: z.union([
          z
            .string()
            .refine(
              (value) =>
                z.iso.datetime({ offset: true }).safeParse(value).success,
              "Invalid timestamp",
            ),
          z.null(),
        ]),
        dataOrigin: z.enum(["local", "imported"]),
        importBatchId: z.string().max(160).nullable(),
      }),
    ),
  }),
});
export type WorkoutBackup = z.infer<typeof workoutBackupNormativeSchema>;
