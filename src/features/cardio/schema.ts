import { z } from "zod";
import reference from "../../content/cardio/runtime-reference.json";
import {
  intensityPrescriptionNormativeSchema,
  segmentNormativeSchema,
  cardioSessionNormativeSchema,
  customPlanVersionNormativeSchema,
  customRoutineVersionNormativeSchema,
  planSessionNormativeSchema,
  auditEventNormativeSchema,
  deletedRecordNormativeSchema,
} from "./schema.generated";
export { reference as cardioReference };
export const id = z.string().min(1).max(160);
export const stamp = z.iso.datetime({ offset: true });
export const zone = z
  .string()
  .max(100)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Use a valid IANA timezone.");
export const sessionTypes = [
  "easy_continuous",
  "moderate_continuous",
  "long_easy",
  "tempo_sustained",
  "fartlek",
  "aerobic_intervals",
  "hiit",
  "sprint_interval",
  "repeat_sprint",
  "recovery_cardio",
  "walk_jog",
  "hill_session",
  "circuit",
  "mixed_modal",
  "shuttle",
  "sled_conditioning",
  "sport_session",
  "race_or_time_trial",
  "warm_up_only",
  "cool_down_only",
  "manual_other",
] as const;
export const stopSignals = [
  "chest_pressure_or_pain",
  "unusual_or_extreme_shortness_of_breath",
  "dizziness_fainting_or_confusion",
  "fast_or_irregular_heartbeat",
  "new_severe_pain",
  "new_neurological_symptom",
  "heat_illness_concern",
  "other_urgent_concern",
] as const;
export const modalityId = id.refine(
  (value) => reference.modalities.some((m) => m.id === value),
  "Choose a known activity category.",
);
const seconds = z.number().finite().min(0).max(31536000);
export const intensitySchema = intensityPrescriptionNormativeSchema.extend({
  provenance: z.strictObject({
    sourceIds: z.array(id).max(20),
    basis: z.enum(["user_selected", "reviewed_source"]),
    frameworkId: id.nullable(),
    maximumHeartRateBpm: z.number().finite().min(20).max(280).nullable(),
    restingHeartRateBpm: z.number().finite().min(20).max(260).nullable(),
    ageYears: z.number().finite().min(18).max(100).nullable(),
    lowerFraction: z.number().finite().min(0).max(1).nullable(),
    upperFraction: z.number().finite().min(0).max(1).nullable(),
    estimated: z.boolean(),
    hrTargetingDisabled: z.boolean(),
    cautions: z.array(z.string().max(1000)).max(20),
  }),
});
export const segmentSchema = segmentNormativeSchema.extend({
  intensity: intensitySchema,
  title: z.string().trim().min(1).max(200),
  actualSecondsExact: seconds.nullable(),
  status: z.enum(["planned", "completed", "skipped"]),
  actualTalkTest: z.enum([
    "not_recorded",
    "comfortable_conversation",
    "talk_but_not_sing",
    "few_words_only",
    "unable_to_speak_comfortably",
  ]),
  actualPerceivedEffort: z.number().int().min(0).max(10).nullable(),
  modificationNote: z.string().max(2000),
  recoveryMode: z.enum(["active", "passive", "not_applicable"]),
});
const segments = z.array(segmentSchema).min(1).max(500);
export const planSessionSchema = planSessionNormativeSchema.extend({
  title: z.string().trim().min(1).max(200),
  modalityId,
  sessionTypeId: z.enum(sessionTypes),
  segments,
  notes: z.string().max(10000),
});
export const planSchema = customPlanVersionNormativeSchema.extend({
  title: z.string().trim().min(1).max(200),
  goal: z.string().max(200),
  sessions: z.array(planSessionSchema).min(1).max(100),
  revisionReason: z.string().trim().min(1).max(2000),
  progressionNotes: z.string().max(10000),
  sourceIds: z.array(id).max(20),
});
export const routineSchema = customRoutineVersionNormativeSchema.extend({
  title: z.string().trim().min(1).max(200),
  modalityId,
  sessionTypeId: z.enum(sessionTypes),
  segments,
  revisionReason: z.string().trim().min(1).max(2000),
  includeFinalRecovery: z.boolean().nullable(),
  sourceIds: z.array(id).max(20),
  prerequisites: z.string().max(10000),
});
export const identitySchema = z.strictObject({
  id,
  currentVersionId: id,
  title: z.string().trim().min(1).max(200),
  archived: z.boolean(),
  createdAt: stamp,
  updatedAt: stamp,
});
export const frozenSourceSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("plan"),
    version: planSchema,
    sessionId: id,
    weekNumber: z.number().int().min(1).max(52),
  }),
  z.strictObject({ kind: z.literal("routine"), version: routineSchema }),
]);
export const playerSchema = z.strictObject({
  currentIndex: z.number().int().min(0).max(500),
  accumulatedSeconds: seconds,
  segmentSeconds: seconds,
  runningSince: stamp.nullable(),
});
export const recordSchema = cardioSessionNormativeSchema.extend({
  timezone: zone,
  modalityId,
  sessionTypeId: z.enum(sessionTypes),
  segments,
  stopSignals: z.array(z.enum(stopSignals)).max(8),
  title: z.string().trim().min(1).max(200),
  elapsedSecondsExact: seconds.nullable(),
  classificationVersion: z.literal("cdc-talk-effort-examples-1"),
  deviceLabel: z.string().trim().min(1).max(200).nullable(),
  cadenceUnit: z.enum([
    "steps_per_minute",
    "revolutions_per_minute",
    "strokes_per_minute",
    "other",
    "not_recorded",
  ]),
  frozenSource: frozenSourceSchema.nullable(),
  player: playerSchema,
  linkedWorkoutIds: z.array(id).max(100),
  laps: z
    .array(
      z.strictObject({
        id,
        at: stamp,
        elapsedSecondsExact: seconds,
        distanceMeters: z.number().finite().min(0).nullable(),
      }),
    )
    .max(1000),
  strengthPriority: z.enum(["strength", "cardio", "balanced", "not_set"]),
  heartRateObservations: z
    .array(
      z.strictObject({
        id,
        at: stamp,
        bpm: z.number().int().min(20).max(280),
        source: z.enum([
          "manual_pulse",
          "chest_strap_estimate",
          "wrist_device_estimate",
          "machine_estimate",
          "other_device_estimate",
        ]),
      }),
    )
    .max(1000),
});
export const sessionSchema = recordSchema.extend({
  originalCompletedRecord: recordSchema.nullable(),
  revisions: z
    .array(
      z.strictObject({
        id,
        at: stamp,
        reason: z.string().trim().min(1).max(2000),
        record: recordSchema,
      }),
    )
    .max(100),
  revision: z.number().int().min(1),
  lease: z.strictObject({ ownerId: id, expiresAt: stamp }).nullable(),
});
export const preferencesSchema = z.strictObject({
  id: z.literal("cardio-preferences"),
  key: z.literal("preferences"),
  value: z.strictObject({
    trackingEnabled: z.boolean(),
    timezone: zone,
    distanceUnit: z.enum(["km", "mile"]),
    historyDays: z.number().int().min(1).max(365),
    currentPlanIdentityId: id.nullable(),
    planStartDate: z.iso.date().nullable(),
    hrTargetingDisabled: z.boolean(),
  }),
  updatedAt: stamp,
});
export const auditSchema = auditEventNormativeSchema.extend({
  entityType: z.enum(["session", "plan", "routine", "settings", "backup"]),
  action: z.string().min(1).max(100),
  details: z.record(z.string(), z.json()),
});
export const tombstoneSchema = deletedRecordNormativeSchema.extend({
  entityType: z.enum(["session", "plan", "routine"]),
  snapshot: z.discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("session"), session: sessionSchema }),
    z.strictObject({
      kind: z.literal("plan"),
      identity: identitySchema,
      versions: z.array(planSchema).min(1).max(1000),
    }),
    z.strictObject({
      kind: z.literal("routine"),
      identity: identitySchema,
      versions: z.array(routineSchema).min(1).max(1000),
    }),
  ]),
});
export const backupSchema = z.strictObject({
  schemaVersion: z.literal("1.0.0"),
  companionVersion: z.literal(1),
  exportedAt: stamp,
  moduleId: z.literal("phase_13_cardio_conditioning"),
  cardioSessions: z.array(sessionSchema).max(100000),
  customPlanIdentities: z.array(identitySchema).max(10000),
  customPlanVersions: z.array(planSchema).max(100000),
  customRoutineIdentities: z.array(identitySchema).max(10000),
  customRoutineVersions: z.array(routineSchema).max(100000),
  settings: z.array(preferencesSchema).max(1),
  auditEvents: z.array(auditSchema).max(500000),
  deletedRecords: z.array(tombstoneSchema).max(100000),
});
export type Intensity = z.infer<typeof intensitySchema>;
export type Segment = z.infer<typeof segmentSchema>;
export type Plan = z.infer<typeof planSchema>;
export type Routine = z.infer<typeof routineSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type SessionRecord = z.infer<typeof recordSchema>;
export type Identity = z.infer<typeof identitySchema>;
export type CardioBackup = z.infer<typeof backupSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
