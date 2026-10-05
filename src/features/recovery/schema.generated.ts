// Generated from DOCS_for_entire_apppliaction/GYM/Phase_12_Recovery_Sleep_Mobility_Data_Schema.json; behavioral companions live in schema.ts.
import { z } from "zod";
export const backupNormativeSchema = z.strictObject({
  schemaVersion: z.string().regex(new RegExp("^1\\.")),
  exportedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  moduleId: z.literal("phase_12_recovery_sleep_mobility"),
  sleepLogs: z.array(
    z.strictObject({
      id: z.string().min(8).max(100),
      sleepDate: z
        .string()
        .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
      timezone: z.string().min(1),
      source: z.enum([
        "manual_recall",
        "manual_morning_diary",
        "consumer_device_estimate",
      ]),
      status: z.enum(["draft", "complete", "incomplete", "archived"]),
      gotIntoBedAt: z
        .union([
          z
            .string()
            .refine(
              (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
              "Invalid timestamp",
            ),
          z.null(),
        ])
        .optional(),
      attemptedSleepAt: z
        .union([
          z
            .string()
            .refine(
              (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
              "Invalid timestamp",
            ),
          z.null(),
        ])
        .optional(),
      sleepOnsetLatencyMinutes: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(720)
        .nullable()
        .optional(),
      awakeningsCount: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(100)
        .nullable()
        .optional(),
      wakeAfterSleepOnsetMinutes: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(1440)
        .nullable()
        .optional(),
      finalWakeAt: z
        .union([
          z
            .string()
            .refine(
              (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
              "Invalid timestamp",
            ),
          z.null(),
        ])
        .optional(),
      outOfBedAt: z
        .union([
          z
            .string()
            .refine(
              (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
              "Invalid timestamp",
            ),
          z.null(),
        ])
        .optional(),
      calculated: z
        .strictObject({
          sleepOpportunityMinutes: z
            .number()
            .finite()
            .int()
            .min(0)
            .max(1440)
            .nullable()
            .optional(),
          terminalWakeMinutes: z
            .number()
            .finite()
            .int()
            .min(0)
            .max(1440)
            .nullable()
            .optional(),
          estimatedTotalSleepMinutes: z
            .number()
            .finite()
            .int()
            .min(0)
            .max(1440)
            .nullable()
            .optional(),
          sleepEfficiencyPercent: z
            .number()
            .finite()
            .min(0)
            .max(100)
            .nullable()
            .optional(),
          dailyTotalSleepMinutes: z
            .number()
            .finite()
            .int()
            .min(0)
            .max(1440)
            .nullable()
            .optional(),
          calculationVersion: z.string().optional(),
          validationWarnings: z.array(z.string()).optional(),
        })
        .optional(),
      naps: z
        .array(
          z.strictObject({
            id: z.string().min(8).max(100),
            startAt: z
              .string()
              .refine(
                (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
                "Invalid timestamp",
              ),
            endAt: z
              .string()
              .refine(
                (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
                "Invalid timestamp",
              ),
            notes: z.string().max(1000).optional(),
          }),
        )
        .optional(),
      quality: z
        .union([z.number().finite().int().min(1).max(5), z.null()])
        .optional(),
      restedness: z
        .union([z.number().finite().int().min(1).max(5), z.null()])
        .optional(),
      daytimeSleepiness: z
        .union([z.number().finite().int().min(1).max(5), z.null()])
        .optional(),
      tags: z
        .array(
          z.enum([
            "late_caffeine",
            "alcohol",
            "late_intense_exercise",
            "travel",
            "shift_work",
            "illness",
            "high_stress",
            "device_estimate",
            "other",
          ]),
        )
        .optional(),
      notes: z.string().max(5000).optional(),
      deviceName: z.string().max(200).nullable().optional(),
      createdAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      updatedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
    }),
  ),
  recoveryCheckIns: z.array(
    z.strictObject({
      id: z.string().min(8).max(100),
      date: z
        .string()
        .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
      timezone: z.string(),
      overallReadiness: z
        .union([z.number().finite().int().min(1).max(5), z.null()])
        .optional(),
      energy: z
        .union([z.number().finite().int().min(1).max(5), z.null()])
        .optional(),
      generalFatigue: z
        .union([z.number().finite().int().min(1).max(5), z.null()])
        .optional(),
      stress: z
        .union([z.number().finite().int().min(1).max(5), z.null()])
        .optional(),
      motivation: z
        .union([z.number().finite().int().min(1).max(5), z.null()])
        .optional(),
      mood: z
        .union([z.number().finite().int().min(1).max(5), z.null()])
        .optional(),
      perceivedRecovery: z
        .union([z.number().finite().int().min(1).max(5), z.null()])
        .optional(),
      regionalSoreness: z
        .array(
          z.strictObject({
            regionId: z.string(),
            severity: z.number().finite().int().min(0).max(10),
            laterality: z
              .enum(["left", "right", "bilateral", "midline", "not_applicable"])
              .optional(),
            notes: z.string().max(1000).optional(),
          }),
        )
        .optional(),
      painOrInjuryConcern: z.boolean().optional(),
      painConcernSeverity: z
        .union([z.number().finite().int().min(0).max(10), z.null()])
        .optional(),
      illnessSymptoms: z.boolean().optional(),
      alertCategories: z.array(z.string()).optional(),
      linkedSleepLogId: z.string().nullable().optional(),
      linkedWorkoutSessionIds: z.array(z.string()).optional(),
      notes: z.string().max(5000).optional(),
      createdAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      updatedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
    }),
  ),
  mobilitySessions: z.array(
    z.strictObject({
      id: z.string().min(8).max(100),
      routineId: z.string(),
      routineVersionId: z.string(),
      startedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      endedAt: z
        .union([
          z
            .string()
            .refine(
              (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
              "Invalid timestamp",
            ),
          z.null(),
        ])
        .optional(),
      timezone: z.string(),
      completedStepIds: z.array(z.string()),
      skippedStepIds: z.array(z.string()).optional(),
      perceivedDifficulty: z
        .union([z.number().finite().int().min(1).max(5), z.null()])
        .optional(),
      discomfortConcern: z.boolean().optional(),
      notes: z.string().max(5000).optional(),
      createdAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      updatedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
    }),
  ),
  customRoutineVersions: z.array(
    z.strictObject({
      id: z.string().min(8).max(100),
      routineIdentityId: z.string().min(8).max(100),
      versionNumber: z.number().finite().int().min(1),
      title: z.string().min(1).max(200),
      context: z.string(),
      publicationStatus: z.enum(["local_draft", "local_active", "archived"]),
      estimatedMinutes: z
        .number()
        .finite()
        .int()
        .min(1)
        .max(180)
        .nullable()
        .optional(),
      steps: z
        .array(
          z.strictObject({
            id: z.string(),
            order: z.number().finite().int().min(1),
            title: z.string().min(1).max(200),
            phase03ExerciseId: z.string().nullable().optional(),
            doseType: z.enum([
              "repetitions",
              "seconds",
              "breaths",
              "distance",
              "ramp_up_set",
            ]),
            doseValue: z.number().finite().gt(0),
            sides: z
              .enum(["none", "left_right", "alternating", "bilateral"])
              .optional(),
            intensityCue: z.string().max(500).optional(),
            techniqueCue: z.string().max(1000).optional(),
            stopSignals: z.array(z.string()).optional(),
            alternativeExerciseIds: z.array(z.string()).optional(),
          }),
        )
        .min(1),
      notes: z.string().max(5000).optional(),
      createdAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
    }),
  ),
  settings: z.array(
    z.strictObject({
      id: z.string().min(8).max(100),
      key: z.string(),
      value: z.json(),
      updatedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
    }),
  ),
  auditEvents: z.array(
    z.strictObject({
      id: z.string().min(8).max(100),
      entityType: z.string(),
      entityId: z.string(),
      action: z.string(),
      at: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      details: z.record(z.string(), z.json()).optional(),
    }),
  ),
  deletedRecords: z
    .array(
      z.strictObject({
        entityType: z.string(),
        entityId: z.string(),
        deletedAt: z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
      }),
    )
    .optional(),
});
export const uuidNormativeSchema = z.string().min(8).max(100);
export const rating1to5NormativeSchema = z
  .number()
  .finite()
  .int()
  .min(1)
  .max(5);
export const rating0to10NormativeSchema = z
  .number()
  .finite()
  .int()
  .min(0)
  .max(10);
export const timestampNormativeSchema = z
  .string()
  .refine(
    (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
    "Invalid timestamp",
  );
export const sleepLogNormativeSchema = z.strictObject({
  id: z.string().min(8).max(100),
  sleepDate: z
    .string()
    .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
  timezone: z.string().min(1),
  source: z.enum([
    "manual_recall",
    "manual_morning_diary",
    "consumer_device_estimate",
  ]),
  status: z.enum(["draft", "complete", "incomplete", "archived"]),
  gotIntoBedAt: z
    .union([
      z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      z.null(),
    ])
    .optional(),
  attemptedSleepAt: z
    .union([
      z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      z.null(),
    ])
    .optional(),
  sleepOnsetLatencyMinutes: z
    .number()
    .finite()
    .int()
    .min(0)
    .max(720)
    .nullable()
    .optional(),
  awakeningsCount: z
    .number()
    .finite()
    .int()
    .min(0)
    .max(100)
    .nullable()
    .optional(),
  wakeAfterSleepOnsetMinutes: z
    .number()
    .finite()
    .int()
    .min(0)
    .max(1440)
    .nullable()
    .optional(),
  finalWakeAt: z
    .union([
      z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      z.null(),
    ])
    .optional(),
  outOfBedAt: z
    .union([
      z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      z.null(),
    ])
    .optional(),
  calculated: z
    .strictObject({
      sleepOpportunityMinutes: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(1440)
        .nullable()
        .optional(),
      terminalWakeMinutes: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(1440)
        .nullable()
        .optional(),
      estimatedTotalSleepMinutes: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(1440)
        .nullable()
        .optional(),
      sleepEfficiencyPercent: z
        .number()
        .finite()
        .min(0)
        .max(100)
        .nullable()
        .optional(),
      dailyTotalSleepMinutes: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(1440)
        .nullable()
        .optional(),
      calculationVersion: z.string().optional(),
      validationWarnings: z.array(z.string()).optional(),
    })
    .optional(),
  naps: z
    .array(
      z.strictObject({
        id: z.string().min(8).max(100),
        startAt: z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
        endAt: z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
        notes: z.string().max(1000).optional(),
      }),
    )
    .optional(),
  quality: z
    .union([z.number().finite().int().min(1).max(5), z.null()])
    .optional(),
  restedness: z
    .union([z.number().finite().int().min(1).max(5), z.null()])
    .optional(),
  daytimeSleepiness: z
    .union([z.number().finite().int().min(1).max(5), z.null()])
    .optional(),
  tags: z
    .array(
      z.enum([
        "late_caffeine",
        "alcohol",
        "late_intense_exercise",
        "travel",
        "shift_work",
        "illness",
        "high_stress",
        "device_estimate",
        "other",
      ]),
    )
    .optional(),
  notes: z.string().max(5000).optional(),
  deviceName: z.string().max(200).nullable().optional(),
  createdAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  updatedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const sleepCalculatedNormativeSchema = z.strictObject({
  sleepOpportunityMinutes: z
    .number()
    .finite()
    .int()
    .min(0)
    .max(1440)
    .nullable()
    .optional(),
  terminalWakeMinutes: z
    .number()
    .finite()
    .int()
    .min(0)
    .max(1440)
    .nullable()
    .optional(),
  estimatedTotalSleepMinutes: z
    .number()
    .finite()
    .int()
    .min(0)
    .max(1440)
    .nullable()
    .optional(),
  sleepEfficiencyPercent: z
    .number()
    .finite()
    .min(0)
    .max(100)
    .nullable()
    .optional(),
  dailyTotalSleepMinutes: z
    .number()
    .finite()
    .int()
    .min(0)
    .max(1440)
    .nullable()
    .optional(),
  calculationVersion: z.string().optional(),
  validationWarnings: z.array(z.string()).optional(),
});
export const napNormativeSchema = z.strictObject({
  id: z.string().min(8).max(100),
  startAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  endAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  notes: z.string().max(1000).optional(),
});
export const recoveryCheckInNormativeSchema = z.strictObject({
  id: z.string().min(8).max(100),
  date: z
    .string()
    .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
  timezone: z.string(),
  overallReadiness: z
    .union([z.number().finite().int().min(1).max(5), z.null()])
    .optional(),
  energy: z
    .union([z.number().finite().int().min(1).max(5), z.null()])
    .optional(),
  generalFatigue: z
    .union([z.number().finite().int().min(1).max(5), z.null()])
    .optional(),
  stress: z
    .union([z.number().finite().int().min(1).max(5), z.null()])
    .optional(),
  motivation: z
    .union([z.number().finite().int().min(1).max(5), z.null()])
    .optional(),
  mood: z.union([z.number().finite().int().min(1).max(5), z.null()]).optional(),
  perceivedRecovery: z
    .union([z.number().finite().int().min(1).max(5), z.null()])
    .optional(),
  regionalSoreness: z
    .array(
      z.strictObject({
        regionId: z.string(),
        severity: z.number().finite().int().min(0).max(10),
        laterality: z
          .enum(["left", "right", "bilateral", "midline", "not_applicable"])
          .optional(),
        notes: z.string().max(1000).optional(),
      }),
    )
    .optional(),
  painOrInjuryConcern: z.boolean().optional(),
  painConcernSeverity: z
    .union([z.number().finite().int().min(0).max(10), z.null()])
    .optional(),
  illnessSymptoms: z.boolean().optional(),
  alertCategories: z.array(z.string()).optional(),
  linkedSleepLogId: z.string().nullable().optional(),
  linkedWorkoutSessionIds: z.array(z.string()).optional(),
  notes: z.string().max(5000).optional(),
  createdAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  updatedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const regionalSorenessNormativeSchema = z.strictObject({
  regionId: z.string(),
  severity: z.number().finite().int().min(0).max(10),
  laterality: z
    .enum(["left", "right", "bilateral", "midline", "not_applicable"])
    .optional(),
  notes: z.string().max(1000).optional(),
});
export const mobilitySessionNormativeSchema = z.strictObject({
  id: z.string().min(8).max(100),
  routineId: z.string(),
  routineVersionId: z.string(),
  startedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  endedAt: z
    .union([
      z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      z.null(),
    ])
    .optional(),
  timezone: z.string(),
  completedStepIds: z.array(z.string()),
  skippedStepIds: z.array(z.string()).optional(),
  perceivedDifficulty: z
    .union([z.number().finite().int().min(1).max(5), z.null()])
    .optional(),
  discomfortConcern: z.boolean().optional(),
  notes: z.string().max(5000).optional(),
  createdAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  updatedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const customRoutineVersionNormativeSchema = z.strictObject({
  id: z.string().min(8).max(100),
  routineIdentityId: z.string().min(8).max(100),
  versionNumber: z.number().finite().int().min(1),
  title: z.string().min(1).max(200),
  context: z.string(),
  publicationStatus: z.enum(["local_draft", "local_active", "archived"]),
  estimatedMinutes: z
    .number()
    .finite()
    .int()
    .min(1)
    .max(180)
    .nullable()
    .optional(),
  steps: z
    .array(
      z.strictObject({
        id: z.string(),
        order: z.number().finite().int().min(1),
        title: z.string().min(1).max(200),
        phase03ExerciseId: z.string().nullable().optional(),
        doseType: z.enum([
          "repetitions",
          "seconds",
          "breaths",
          "distance",
          "ramp_up_set",
        ]),
        doseValue: z.number().finite().gt(0),
        sides: z
          .enum(["none", "left_right", "alternating", "bilateral"])
          .optional(),
        intensityCue: z.string().max(500).optional(),
        techniqueCue: z.string().max(1000).optional(),
        stopSignals: z.array(z.string()).optional(),
        alternativeExerciseIds: z.array(z.string()).optional(),
      }),
    )
    .min(1),
  notes: z.string().max(5000).optional(),
  createdAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const routineStepNormativeSchema = z.strictObject({
  id: z.string(),
  order: z.number().finite().int().min(1),
  title: z.string().min(1).max(200),
  phase03ExerciseId: z.string().nullable().optional(),
  doseType: z.enum([
    "repetitions",
    "seconds",
    "breaths",
    "distance",
    "ramp_up_set",
  ]),
  doseValue: z.number().finite().gt(0),
  sides: z.enum(["none", "left_right", "alternating", "bilateral"]).optional(),
  intensityCue: z.string().max(500).optional(),
  techniqueCue: z.string().max(1000).optional(),
  stopSignals: z.array(z.string()).optional(),
  alternativeExerciseIds: z.array(z.string()).optional(),
});
export const settingRecordNormativeSchema = z.strictObject({
  id: z.string().min(8).max(100),
  key: z.string(),
  value: z.json(),
  updatedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const auditEventNormativeSchema = z.strictObject({
  id: z.string().min(8).max(100),
  entityType: z.string(),
  entityId: z.string(),
  action: z.string(),
  at: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  details: z.record(z.string(), z.json()).optional(),
});
export const deletedRecordNormativeSchema = z.strictObject({
  entityType: z.string(),
  entityId: z.string(),
  deletedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
