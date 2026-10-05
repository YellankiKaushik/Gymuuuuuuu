// Generated from DOCS_for_entire_apppliaction/GYM/Phase_13_Cardio_Conditioning_Data_Schema.json; behavioral companions live in schema.ts.
import { z } from "zod";
export const backupNormativeSchema = z.strictObject({
  schemaVersion: z.string().regex(new RegExp("^1\\.0\\.0$")),
  exportedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  moduleId: z.literal("phase_13_cardio_conditioning"),
  cardioSessions: z.array(
    z.strictObject({
      id: z.string().min(1).max(160),
      sessionDate: z
        .string()
        .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
      timezone: z.string().min(1),
      status: z.enum(["active", "paused", "completed", "abandoned", "draft"]),
      modalityId: z.string().min(1).max(160),
      phase03ExerciseId: z.string().nullable(),
      sessionTypeId: z.string(),
      startedAt: z.union([
        z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
        z.null(),
      ]),
      endedAt: z.union([
        z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
        z.null(),
      ]),
      elapsedSeconds: z.number().finite().int().min(0).nullable(),
      distanceMeters: z.number().finite().min(0).nullable(),
      averageHeartRateBpm: z
        .number()
        .finite()
        .int()
        .min(20)
        .max(260)
        .nullable(),
      maximumHeartRateBpm: z
        .number()
        .finite()
        .int()
        .min(20)
        .max(280)
        .nullable(),
      heartRateSource: z.enum([
        "none",
        "manual_pulse",
        "chest_strap_estimate",
        "wrist_device_estimate",
        "machine_estimate",
        "other_device_estimate",
      ]),
      averagePowerWatts: z.number().finite().min(0).nullable(),
      averageCadence: z.number().finite().min(0).nullable(),
      perceivedEffort0to10: z.number().finite().int().min(0).max(10).nullable(),
      talkTest: z.enum([
        "not_recorded",
        "comfortable_conversation",
        "talk_but_not_sing",
        "few_words_only",
        "unable_to_speak_comfortably",
      ]),
      segments: z.array(
        z.strictObject({
          id: z.string().min(1).max(160),
          order: z.number().finite().int().min(1),
          segmentType: z.enum([
            "warm_up",
            "steady",
            "work",
            "recovery",
            "lap",
            "transition",
            "cool_down",
          ]),
          targetMode: z.enum(["duration", "distance", "repetitions", "open"]),
          targetValue: z.number().finite().min(0).nullable(),
          targetUnit: z.string().nullable(),
          actualDurationSeconds: z.number().finite().int().min(0).nullable(),
          actualDistanceMeters: z.number().finite().min(0).nullable(),
          intensity: z.strictObject({
            method: z.enum([
              "talk_test",
              "perceived_effort_0_10",
              "percent_hrmax",
              "heart_rate_reserve",
              "pace",
              "power",
              "manual_text",
            ]),
            methodVersion: z.string(),
            lower: z.number().finite().nullable(),
            upper: z.number().finite().nullable(),
            unit: z.string().nullable(),
            instruction: z.string().nullable(),
            maxHrSource: z.enum([
              "not_applicable",
              "measured",
              "age_predicted_tanaka",
              "clinician_supplied",
            ]),
          }),
          completed: z.boolean(),
        }),
      ),
      environment: z.strictObject({
        locationType: z.enum(["indoor", "outdoor", "mixed", "unknown"]),
        surface: z.string().nullable(),
        temperatureCelsius: z.number().finite().min(-80).max(80).nullable(),
        humidityPercent: z.number().finite().min(0).max(100).nullable(),
        elevationGainMeters: z.number().finite().min(0).nullable(),
        tags: z.array(z.string()),
      }),
      stopSignals: z.array(z.string()),
      notes: z.string().max(10000),
      sourcePlanSnapshot: z.union([
        z.strictObject({
          planId: z.string().min(1).max(160),
          planVersionId: z.string().min(1).max(160),
          weekNumber: z.number().finite().int().min(1).nullable(),
          sessionId: z.string().nullable(),
          title: z.string(),
        }),
        z.null(),
      ]),
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
  customPlanVersions: z.array(
    z.strictObject({
      id: z.string().min(1).max(160),
      planIdentityId: z.string().min(1).max(160),
      versionNumber: z.number().finite().int().min(1),
      title: z.string().min(1),
      goal: z.string(),
      durationWeeks: z.number().finite().int().min(1).max(52),
      sessions: z.array(
        z.strictObject({
          id: z.string().min(1).max(160),
          dayIndex: z.number().finite().int().min(1).max(14),
          title: z.string(),
          modalityId: z.string().min(1).max(160),
          sessionTypeId: z.string(),
          segments: z.array(
            z.strictObject({
              id: z.string().min(1).max(160),
              order: z.number().finite().int().min(1),
              segmentType: z.enum([
                "warm_up",
                "steady",
                "work",
                "recovery",
                "lap",
                "transition",
                "cool_down",
              ]),
              targetMode: z.enum([
                "duration",
                "distance",
                "repetitions",
                "open",
              ]),
              targetValue: z.number().finite().min(0).nullable(),
              targetUnit: z.string().nullable(),
              actualDurationSeconds: z
                .number()
                .finite()
                .int()
                .min(0)
                .nullable(),
              actualDistanceMeters: z.number().finite().min(0).nullable(),
              intensity: z.strictObject({
                method: z.enum([
                  "talk_test",
                  "perceived_effort_0_10",
                  "percent_hrmax",
                  "heart_rate_reserve",
                  "pace",
                  "power",
                  "manual_text",
                ]),
                methodVersion: z.string(),
                lower: z.number().finite().nullable(),
                upper: z.number().finite().nullable(),
                unit: z.string().nullable(),
                instruction: z.string().nullable(),
                maxHrSource: z.enum([
                  "not_applicable",
                  "measured",
                  "age_predicted_tanaka",
                  "clinician_supplied",
                ]),
              }),
              completed: z.boolean(),
            }),
          ),
          notes: z.string(),
        }),
      ),
      publicationStatus: z.literal("local_active"),
      createdAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
    }),
  ),
  customRoutineVersions: z.array(
    z.strictObject({
      id: z.string().min(1).max(160),
      routineIdentityId: z.string().min(1).max(160),
      versionNumber: z.number().finite().int().min(1),
      title: z.string().min(1),
      modalityId: z.string().min(1).max(160),
      sessionTypeId: z.string(),
      segments: z.array(
        z.strictObject({
          id: z.string().min(1).max(160),
          order: z.number().finite().int().min(1),
          segmentType: z.enum([
            "warm_up",
            "steady",
            "work",
            "recovery",
            "lap",
            "transition",
            "cool_down",
          ]),
          targetMode: z.enum(["duration", "distance", "repetitions", "open"]),
          targetValue: z.number().finite().min(0).nullable(),
          targetUnit: z.string().nullable(),
          actualDurationSeconds: z.number().finite().int().min(0).nullable(),
          actualDistanceMeters: z.number().finite().min(0).nullable(),
          intensity: z.strictObject({
            method: z.enum([
              "talk_test",
              "perceived_effort_0_10",
              "percent_hrmax",
              "heart_rate_reserve",
              "pace",
              "power",
              "manual_text",
            ]),
            methodVersion: z.string(),
            lower: z.number().finite().nullable(),
            upper: z.number().finite().nullable(),
            unit: z.string().nullable(),
            instruction: z.string().nullable(),
            maxHrSource: z.enum([
              "not_applicable",
              "measured",
              "age_predicted_tanaka",
              "clinician_supplied",
            ]),
          }),
          completed: z.boolean(),
        }),
      ),
      publicationStatus: z.literal("local_active"),
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
      id: z.string().min(1).max(160),
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
      id: z.string().min(1).max(160),
      entityType: z.string(),
      entityId: z.string().min(1).max(160),
      action: z.string(),
      at: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      details: z.record(z.string(), z.json()),
    }),
  ),
  deletedRecords: z.array(
    z.strictObject({
      id: z.string().min(1).max(160),
      entityType: z.string(),
      entityId: z.string().min(1).max(160),
      deletedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
    }),
  ),
});
export const idNormativeSchema = z.string().min(1).max(160);
export const timestampNormativeSchema = z
  .string()
  .refine(
    (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
    "Invalid timestamp",
  );
export const localDateNormativeSchema = z
  .string()
  .refine((v) => z.iso.date().safeParse(v).success, "Invalid date");
export const nullableNumberNormativeSchema = z.number().finite().nullable();
export const intensityPrescriptionNormativeSchema = z.strictObject({
  method: z.enum([
    "talk_test",
    "perceived_effort_0_10",
    "percent_hrmax",
    "heart_rate_reserve",
    "pace",
    "power",
    "manual_text",
  ]),
  methodVersion: z.string(),
  lower: z.number().finite().nullable(),
  upper: z.number().finite().nullable(),
  unit: z.string().nullable(),
  instruction: z.string().nullable(),
  maxHrSource: z.enum([
    "not_applicable",
    "measured",
    "age_predicted_tanaka",
    "clinician_supplied",
  ]),
});
export const segmentNormativeSchema = z.strictObject({
  id: z.string().min(1).max(160),
  order: z.number().finite().int().min(1),
  segmentType: z.enum([
    "warm_up",
    "steady",
    "work",
    "recovery",
    "lap",
    "transition",
    "cool_down",
  ]),
  targetMode: z.enum(["duration", "distance", "repetitions", "open"]),
  targetValue: z.number().finite().min(0).nullable(),
  targetUnit: z.string().nullable(),
  actualDurationSeconds: z.number().finite().int().min(0).nullable(),
  actualDistanceMeters: z.number().finite().min(0).nullable(),
  intensity: z.strictObject({
    method: z.enum([
      "talk_test",
      "perceived_effort_0_10",
      "percent_hrmax",
      "heart_rate_reserve",
      "pace",
      "power",
      "manual_text",
    ]),
    methodVersion: z.string(),
    lower: z.number().finite().nullable(),
    upper: z.number().finite().nullable(),
    unit: z.string().nullable(),
    instruction: z.string().nullable(),
    maxHrSource: z.enum([
      "not_applicable",
      "measured",
      "age_predicted_tanaka",
      "clinician_supplied",
    ]),
  }),
  completed: z.boolean(),
});
export const environmentNormativeSchema = z.strictObject({
  locationType: z.enum(["indoor", "outdoor", "mixed", "unknown"]),
  surface: z.string().nullable(),
  temperatureCelsius: z.number().finite().min(-80).max(80).nullable(),
  humidityPercent: z.number().finite().min(0).max(100).nullable(),
  elevationGainMeters: z.number().finite().min(0).nullable(),
  tags: z.array(z.string()),
});
export const cardioSessionNormativeSchema = z.strictObject({
  id: z.string().min(1).max(160),
  sessionDate: z
    .string()
    .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
  timezone: z.string().min(1),
  status: z.enum(["active", "paused", "completed", "abandoned", "draft"]),
  modalityId: z.string().min(1).max(160),
  phase03ExerciseId: z.string().nullable(),
  sessionTypeId: z.string(),
  startedAt: z.union([
    z
      .string()
      .refine(
        (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  endedAt: z.union([
    z
      .string()
      .refine(
        (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  elapsedSeconds: z.number().finite().int().min(0).nullable(),
  distanceMeters: z.number().finite().min(0).nullable(),
  averageHeartRateBpm: z.number().finite().int().min(20).max(260).nullable(),
  maximumHeartRateBpm: z.number().finite().int().min(20).max(280).nullable(),
  heartRateSource: z.enum([
    "none",
    "manual_pulse",
    "chest_strap_estimate",
    "wrist_device_estimate",
    "machine_estimate",
    "other_device_estimate",
  ]),
  averagePowerWatts: z.number().finite().min(0).nullable(),
  averageCadence: z.number().finite().min(0).nullable(),
  perceivedEffort0to10: z.number().finite().int().min(0).max(10).nullable(),
  talkTest: z.enum([
    "not_recorded",
    "comfortable_conversation",
    "talk_but_not_sing",
    "few_words_only",
    "unable_to_speak_comfortably",
  ]),
  segments: z.array(
    z.strictObject({
      id: z.string().min(1).max(160),
      order: z.number().finite().int().min(1),
      segmentType: z.enum([
        "warm_up",
        "steady",
        "work",
        "recovery",
        "lap",
        "transition",
        "cool_down",
      ]),
      targetMode: z.enum(["duration", "distance", "repetitions", "open"]),
      targetValue: z.number().finite().min(0).nullable(),
      targetUnit: z.string().nullable(),
      actualDurationSeconds: z.number().finite().int().min(0).nullable(),
      actualDistanceMeters: z.number().finite().min(0).nullable(),
      intensity: z.strictObject({
        method: z.enum([
          "talk_test",
          "perceived_effort_0_10",
          "percent_hrmax",
          "heart_rate_reserve",
          "pace",
          "power",
          "manual_text",
        ]),
        methodVersion: z.string(),
        lower: z.number().finite().nullable(),
        upper: z.number().finite().nullable(),
        unit: z.string().nullable(),
        instruction: z.string().nullable(),
        maxHrSource: z.enum([
          "not_applicable",
          "measured",
          "age_predicted_tanaka",
          "clinician_supplied",
        ]),
      }),
      completed: z.boolean(),
    }),
  ),
  environment: z.strictObject({
    locationType: z.enum(["indoor", "outdoor", "mixed", "unknown"]),
    surface: z.string().nullable(),
    temperatureCelsius: z.number().finite().min(-80).max(80).nullable(),
    humidityPercent: z.number().finite().min(0).max(100).nullable(),
    elevationGainMeters: z.number().finite().min(0).nullable(),
    tags: z.array(z.string()),
  }),
  stopSignals: z.array(z.string()),
  notes: z.string().max(10000),
  sourcePlanSnapshot: z.union([
    z.strictObject({
      planId: z.string().min(1).max(160),
      planVersionId: z.string().min(1).max(160),
      weekNumber: z.number().finite().int().min(1).nullable(),
      sessionId: z.string().nullable(),
      title: z.string(),
    }),
    z.null(),
  ]),
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
export const planSnapshotNormativeSchema = z.strictObject({
  planId: z.string().min(1).max(160),
  planVersionId: z.string().min(1).max(160),
  weekNumber: z.number().finite().int().min(1).nullable(),
  sessionId: z.string().nullable(),
  title: z.string(),
});
export const planSessionNormativeSchema = z.strictObject({
  id: z.string().min(1).max(160),
  dayIndex: z.number().finite().int().min(1).max(14),
  title: z.string(),
  modalityId: z.string().min(1).max(160),
  sessionTypeId: z.string(),
  segments: z.array(
    z.strictObject({
      id: z.string().min(1).max(160),
      order: z.number().finite().int().min(1),
      segmentType: z.enum([
        "warm_up",
        "steady",
        "work",
        "recovery",
        "lap",
        "transition",
        "cool_down",
      ]),
      targetMode: z.enum(["duration", "distance", "repetitions", "open"]),
      targetValue: z.number().finite().min(0).nullable(),
      targetUnit: z.string().nullable(),
      actualDurationSeconds: z.number().finite().int().min(0).nullable(),
      actualDistanceMeters: z.number().finite().min(0).nullable(),
      intensity: z.strictObject({
        method: z.enum([
          "talk_test",
          "perceived_effort_0_10",
          "percent_hrmax",
          "heart_rate_reserve",
          "pace",
          "power",
          "manual_text",
        ]),
        methodVersion: z.string(),
        lower: z.number().finite().nullable(),
        upper: z.number().finite().nullable(),
        unit: z.string().nullable(),
        instruction: z.string().nullable(),
        maxHrSource: z.enum([
          "not_applicable",
          "measured",
          "age_predicted_tanaka",
          "clinician_supplied",
        ]),
      }),
      completed: z.boolean(),
    }),
  ),
  notes: z.string(),
});
export const customPlanVersionNormativeSchema = z.strictObject({
  id: z.string().min(1).max(160),
  planIdentityId: z.string().min(1).max(160),
  versionNumber: z.number().finite().int().min(1),
  title: z.string().min(1),
  goal: z.string(),
  durationWeeks: z.number().finite().int().min(1).max(52),
  sessions: z.array(
    z.strictObject({
      id: z.string().min(1).max(160),
      dayIndex: z.number().finite().int().min(1).max(14),
      title: z.string(),
      modalityId: z.string().min(1).max(160),
      sessionTypeId: z.string(),
      segments: z.array(
        z.strictObject({
          id: z.string().min(1).max(160),
          order: z.number().finite().int().min(1),
          segmentType: z.enum([
            "warm_up",
            "steady",
            "work",
            "recovery",
            "lap",
            "transition",
            "cool_down",
          ]),
          targetMode: z.enum(["duration", "distance", "repetitions", "open"]),
          targetValue: z.number().finite().min(0).nullable(),
          targetUnit: z.string().nullable(),
          actualDurationSeconds: z.number().finite().int().min(0).nullable(),
          actualDistanceMeters: z.number().finite().min(0).nullable(),
          intensity: z.strictObject({
            method: z.enum([
              "talk_test",
              "perceived_effort_0_10",
              "percent_hrmax",
              "heart_rate_reserve",
              "pace",
              "power",
              "manual_text",
            ]),
            methodVersion: z.string(),
            lower: z.number().finite().nullable(),
            upper: z.number().finite().nullable(),
            unit: z.string().nullable(),
            instruction: z.string().nullable(),
            maxHrSource: z.enum([
              "not_applicable",
              "measured",
              "age_predicted_tanaka",
              "clinician_supplied",
            ]),
          }),
          completed: z.boolean(),
        }),
      ),
      notes: z.string(),
    }),
  ),
  publicationStatus: z.literal("local_active"),
  createdAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const customRoutineVersionNormativeSchema = z.strictObject({
  id: z.string().min(1).max(160),
  routineIdentityId: z.string().min(1).max(160),
  versionNumber: z.number().finite().int().min(1),
  title: z.string().min(1),
  modalityId: z.string().min(1).max(160),
  sessionTypeId: z.string(),
  segments: z.array(
    z.strictObject({
      id: z.string().min(1).max(160),
      order: z.number().finite().int().min(1),
      segmentType: z.enum([
        "warm_up",
        "steady",
        "work",
        "recovery",
        "lap",
        "transition",
        "cool_down",
      ]),
      targetMode: z.enum(["duration", "distance", "repetitions", "open"]),
      targetValue: z.number().finite().min(0).nullable(),
      targetUnit: z.string().nullable(),
      actualDurationSeconds: z.number().finite().int().min(0).nullable(),
      actualDistanceMeters: z.number().finite().min(0).nullable(),
      intensity: z.strictObject({
        method: z.enum([
          "talk_test",
          "perceived_effort_0_10",
          "percent_hrmax",
          "heart_rate_reserve",
          "pace",
          "power",
          "manual_text",
        ]),
        methodVersion: z.string(),
        lower: z.number().finite().nullable(),
        upper: z.number().finite().nullable(),
        unit: z.string().nullable(),
        instruction: z.string().nullable(),
        maxHrSource: z.enum([
          "not_applicable",
          "measured",
          "age_predicted_tanaka",
          "clinician_supplied",
        ]),
      }),
      completed: z.boolean(),
    }),
  ),
  publicationStatus: z.literal("local_active"),
  createdAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const settingNormativeSchema = z.strictObject({
  id: z.string().min(1).max(160),
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
  id: z.string().min(1).max(160),
  entityType: z.string(),
  entityId: z.string().min(1).max(160),
  action: z.string(),
  at: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  details: z.record(z.string(), z.json()),
});
export const deletedRecordNormativeSchema = z.strictObject({
  id: z.string().min(1).max(160),
  entityType: z.string(),
  entityId: z.string().min(1).max(160),
  deletedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
