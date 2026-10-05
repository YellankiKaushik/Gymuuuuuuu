import { z } from "zod";
import taxonomy from "../../content/muscles/taxonomy.json";
import reference from "../../content/recovery/reference.json";
import { getPublishedExercises } from "../exercises/repository";
import {
  sleepLogNormativeSchema,
  recoveryCheckInNormativeSchema,
  routineStepNormativeSchema,
  customRoutineVersionNormativeSchema,
  mobilitySessionNormativeSchema,
  auditEventNormativeSchema,
} from "./schema.generated";
export { reference as recoveryReference };
export const regions = taxonomy.regions;
export const dimensions = [
  "overallReadiness",
  "energy",
  "generalFatigue",
  "stress",
  "motivation",
  "mood",
  "perceivedRecovery",
] as const;
export const contexts = [
  "warm_up",
  "cool_down",
  "standalone_mobility",
  "flexibility",
  "recovery",
  "movement_break",
  "position_practice",
] as const;
export const stamp = z.iso.datetime({ offset: true });
export const id = z.string().min(8).max(100);
export const zone = z.string().refine((value) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}, "Use a valid IANA timezone");
const minutes = z.number().finite().min(0).max(1440).nullable();
export const calculatedSchema = z.strictObject({
  sleepOpportunityMinutes: minutes,
  terminalWakeMinutes: minutes,
  estimatedTotalSleepMinutes: minutes,
  dailyTotalSleepMinutes: minutes,
  sleepEfficiencyPercent: z.number().finite().min(0).max(100).nullable(),
  napMinutes: minutes,
  calculationVersion: z.literal("sleep-arithmetic-1"),
  validationWarnings: z.array(z.string()),
  valid: z.boolean(),
});
export const sleepSchema = sleepLogNormativeSchema.extend({
  timezone: zone,
  calculated: calculatedSchema,
  deviceDurationMinutes: minutes.optional(),
});
export const checkInSchema = recoveryCheckInNormativeSchema
  .extend({
    timezone: zone,
    regionalSoreness: z
      .array(
        z.strictObject({
          regionId: z
            .string()
            .refine(
              (v) => regions.some((r) => r.id === v),
              "Unknown canonical region",
            ),
          severity: z.number().int().min(0).max(10),
          laterality: z
            .enum(["left", "right", "bilateral", "midline", "not_applicable"])
            .default("not_applicable"),
          notes: z.string().max(1000).optional(),
        }),
      )
      .default([]),
    alertCategories: z
      .array(
        z.enum([
          "pain_or_injury_concern",
          "illness_symptoms",
          "severe_sleepiness",
          "breathing_during_sleep_concern",
          "persistent_sleep_problem",
          "none",
        ]),
      )
      .default([]),
  })
  .superRefine((v, ctx) => {
    const keys = v.regionalSoreness.map((r) => `${r.regionId}:${r.laterality}`);
    if (new Set(keys).size !== keys.length)
      ctx.addIssue({ code: "custom", message: "Duplicate region and side" });
    if (!v.painOrInjuryConcern && v.painConcernSeverity != null)
      ctx.addIssue({
        code: "custom",
        message: "Pain severity needs an explicit concern flag",
      });
    if (v.alertCategories.includes("none") && v.alertCategories.length > 1)
      ctx.addIssue({
        code: "custom",
        message: "None cannot accompany a concern",
      });
  });
export const stepSchema = routineStepNormativeSchema
  .extend({
    id,
    order: z.number().int().min(1).max(100),
    doseValue: z.number().finite().gt(0).max(86400),
  })
  .superRefine((v, ctx) => {
    const available = new Set(getPublishedExercises().map((e) => e.id));
    for (const exerciseId of [
      v.phase03ExerciseId,
      ...(v.alternativeExerciseIds ?? []),
    ])
      if (exerciseId && !available.has(exerciseId))
        ctx.addIssue({
          code: "custom",
          message: "Routine exercise references must be reviewed and published",
        });
    if (
      ["repetitions", "breaths", "ramp_up_set"].includes(v.doseType) &&
      !Number.isInteger(v.doseValue)
    )
      ctx.addIssue({
        code: "custom",
        message: "Count doses must be whole numbers",
      });
  });
export const routineSchema = customRoutineVersionNormativeSchema
  .extend({
    context: z.enum(contexts),
    steps: z.array(stepSchema).min(1).max(100),
    revisionReason: z.string().min(1).max(1000),
  })
  .superRefine((v, ctx) => {
    if (
      new Set(v.steps.map((s) => s.id)).size !== v.steps.length ||
      v.steps.some((s, i) => s.order !== i + 1)
    )
      ctx.addIssue({
        code: "custom",
        message: "Routine steps need unique IDs and consecutive order",
      });
  });
export const identitySchema = z.strictObject({
  id,
  currentVersionId: id,
  title: z.string().min(1).max(200),
  status: z.enum(["active", "archived"]),
  createdAt: stamp,
  updatedAt: stamp,
});
export const sessionSchema = mobilitySessionNormativeSchema
  .extend({
    timezone: zone,
    routineSnapshot: routineSchema,
    startedAt: stamp.transform((v) => new Date(v).toISOString()),
    state: z.enum(["running", "paused", "completed", "abandoned"]),
    stepIndex: z.number().int().min(0).max(100),
    activeSeconds: z.number().finite().min(0),
    stepSeconds: z.number().finite().min(0),
    runningSince: stamp.nullable(),
    side: z.enum(["left", "right", "both"]),
    completedSides: z
      .array(
        z.strictObject({ stepId: id, side: z.enum(["left", "right", "both"]) }),
      )
      .default([]),
    completedStepIds: z.array(id),
    skippedStepIds: z.array(id).default([]),
  })
  .superRefine((v, ctx) => {
    if (
      v.routineId !== v.routineSnapshot.routineIdentityId ||
      v.routineVersionId !== v.routineSnapshot.id
    )
      ctx.addIssue({
        code: "custom",
        message: "Session snapshot identity mismatch",
      });
    const all = [...v.completedStepIds, ...v.skippedStepIds];
    const sideKeys = v.completedSides.map((s) => `${s.stepId}:${s.side}`);
    if (
      new Set(sideKeys).size !== sideKeys.length ||
      v.completedSides.some(
        (s) => !v.routineSnapshot.steps.some((step) => step.id === s.stepId),
      )
    )
      ctx.addIssue({ code: "custom", message: "Invalid side completion" });
    for (const step of v.routineSnapshot.steps)
      if (
        step.sides === "left_right" &&
        v.completedStepIds.includes(step.id) &&
        !(["left", "right"] as const).every((side) =>
          v.completedSides.some((s) => s.stepId === step.id && s.side === side),
        )
      )
        ctx.addIssue({
          code: "custom",
          message:
            "Both sides must be completed before a bilateral step finishes",
        });
    if (
      v.state === "completed" &&
      (v.stepIndex !== v.routineSnapshot.steps.length ||
        all.length !== v.routineSnapshot.steps.length)
    )
      ctx.addIssue({
        code: "custom",
        message: "Completed sessions need every step performed or skipped",
      });
    if (
      v.state !== "completed" &&
      v.routineSnapshot.steps
        .slice(0, v.stepIndex)
        .some((step) => !all.includes(step.id))
    )
      ctx.addIssue({
        code: "custom",
        message: "Earlier steps must have explicit completion or skip state",
      });
    if (
      new Set(all).size !== all.length ||
      all.some((i) => !v.routineSnapshot.steps.some((s) => s.id === i))
    )
      ctx.addIssue({
        code: "custom",
        message: "Invalid completed/skipped step IDs",
      });
    if (
      v.stepIndex >= v.routineSnapshot.steps.length &&
      v.state !== "completed"
    )
      ctx.addIssue({ code: "custom", message: "Invalid current step" });
    if ((v.state === "running") !== (v.runningSince !== null))
      ctx.addIssue({
        code: "custom",
        message: "Running timestamp and state disagree",
      });
    if ((v.state === "completed" || v.state === "abandoned") && !v.endedAt)
      ctx.addIssue({
        code: "custom",
        message: "Finished sessions need an end time",
      });
    if (v.endedAt && Date.parse(v.endedAt) < Date.parse(v.startedAt))
      ctx.addIssue({
        code: "custom",
        message: "Session ends before it starts",
      });
  });
export const settingSchema = z.strictObject({
  id: z.literal("recovery-preferences"),
  key: z.literal("preferences"),
  value: z.strictObject({
    sleepGoalMinutes: z.number().int().min(1).max(1440).nullable(),
    historyDays: z.union([z.literal(7), z.literal(28), z.literal(90)]),
    timezone: zone,
    trackingEnabled: z.boolean(),
  }),
  updatedAt: stamp,
});
export const entityTypes = [
  "sleepLogs",
  "recoveryCheckIns",
  "mobilitySessions",
  "customRoutineIdentities",
] as const;
export const tombstoneSchema = z.strictObject({
  id,
  entityType: z.enum(entityTypes),
  entityId: id,
  deletedAt: stamp,
  snapshot: z.union([
    sleepSchema,
    checkInSchema,
    sessionSchema,
    identitySchema,
  ]),
});
export const auditSchema = auditEventNormativeSchema.extend({
  entityType: z.enum([
    ...entityTypes,
    "customRoutineVersions",
    "settings",
    "backup",
  ]),
  action: z.enum([
    "create",
    "edit",
    "delete",
    "undo",
    "version",
    "archive",
    "restore",
    "purge",
  ]),
  details: z.record(z.string(), z.json()).optional(),
});
export const backupSchema = z.strictObject({
  schemaVersion: z.literal("1.0.0"),
  exportedAt: stamp,
  moduleId: z.literal("phase_12_recovery_sleep_mobility"),
  sleepLogs: z.array(sleepSchema),
  recoveryCheckIns: z.array(checkInSchema),
  mobilitySessions: z.array(sessionSchema),
  customRoutineIdentities: z.array(identitySchema),
  customRoutineVersions: z.array(routineSchema),
  settings: z.array(settingSchema).max(1),
  auditEvents: z.array(auditSchema),
  deletedRecords: z.array(tombstoneSchema),
});
export type SleepLog = z.infer<typeof sleepSchema>;
export type CheckIn = z.infer<typeof checkInSchema>;
export type Routine = z.infer<typeof routineSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type RecoveryBackup = z.infer<typeof backupSchema>;
export type RecoverySettings = z.infer<typeof settingSchema>;
