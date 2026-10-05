import { z } from "zod";

const id = z.string().min(1).max(180);
const localDate = z.iso.date();
const instant = z.iso.datetime({ offset: true });
const nullableNote = z.string().max(2000).nullable();
const timeZone = z.string().min(1).max(80).refine((value) => { try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; } }, "A valid IANA time zone is required.");
const baseRecord = { id, createdAt: instant, updatedAt: instant, deletedAt: instant.nullable().default(null) };

export const weightLogSchema = z.object({
  ...baseRecord, measuredAt: instant, localDate, timezone: timeZone, valueKg: z.number().positive().max(1000), enteredValue: z.number().positive(), enteredUnit: z.enum(["kg", "lb"]),
  source: z.enum(["manual", "csv_import"]), scaleId: z.string().max(180).nullable(),
  timeContext: z.enum(["morning", "afternoon", "evening", "night", "unknown"]), fastingState: z.enum(["fasted", "not_fasted", "unknown"]),
  clothing: z.enum(["none_or_minimal", "light", "normal", "heavy", "unknown"]), afterBathroom: z.boolean().nullable(), retrospective: z.boolean(), notes: nullableNote,
}).strict().superRefine((record, context) => {
  const expectedKg = record.enteredUnit === "lb" ? record.enteredValue / 2.2046226218 : record.enteredValue;
  if (Math.abs(expectedKg - record.valueKg) > 0.00001) context.addIssue({ code: "custom", path: ["valueKg"], message: "Canonical kilograms must match the entered value and unit." });
});
export const circumferenceSchema = z.object({
  ...baseRecord, measuredAt: instant, localDate, timezone: timeZone, siteId: id,
  protocolId: z.string().regex(/^protocol_[a-z0-9_]+$/), protocolVersion: z.string().min(1), side: z.enum(["not_applicable", "left", "right", "bilateral"]),
  posture: z.enum(["standing", "seated", "supine", "other"]), breathingPhase: z.enum(["normal_end_expiration", "relaxed_unspecified", "inspired", "not_applicable", "unknown"]),
  replicatesMm: z.array(z.number().positive().max(5000)).min(1).max(5), canonicalMm: z.number().positive().max(5000),
  operator: z.enum(["self", "other_person", "professional", "unknown"]), tapeId: id.nullable(), notes: nullableNote,
}).strict().superRefine((record, context) => {
  const sorted = [...record.replicatesMm].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2), value = sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
  if (value !== record.canonicalMm) context.addIssue({ code: "custom", path: ["canonicalMm"], message: "Canonical value must be the median of the recorded replicates." });
});
export const compositionSchema = z.object({
  ...baseRecord, measuredAt: instant, localDate, timezone: timeZone, method: z.enum(["dxa", "bia", "skinfold", "air_displacement", "hydrostatic", "ultrasound", "three_d_optical", "other"]),
  protocolId: id.nullable(), methodVersion: z.string().min(1), deviceManufacturer: z.string().nullable(), deviceModel: z.string().nullable(), softwareVersion: z.string().nullable(), facility: z.string().nullable(),
  bodyFatPercent: z.number().min(0).max(100).nullable(), fatMassKg: z.number().min(0).max(1000).nullable(), fatFreeMassKg: z.number().min(0).max(1000).nullable(),
  leanSoftTissueKg: z.number().min(0).max(1000).nullable(), skeletalMuscleEstimateKg: z.number().min(0).max(1000).nullable(),
  hydration: z.enum(["standardized", "not_standardized", "unknown"]), recentFood: z.enum(["standardized", "not_standardized", "unknown"]), recentExercise: z.enum(["standardized", "not_standardized", "unknown"]),
  timeContext: z.enum(["morning", "afternoon", "evening", "night", "unknown"]), sourceType: z.enum(["user_entered_report", "csv_import"]), sourceDocumentName: z.string().nullable(), notes: nullableNote,
}).strict().superRefine((record, context) => {
  for (const [label, value] of [["bodyFatPercent", record.bodyFatPercent], ["fatMassKg", record.fatMassKg], ["fatFreeMassKg", record.fatFreeMassKg], ["leanSoftTissueKg", record.leanSoftTissueKg], ["skeletalMuscleEstimateKg", record.skeletalMuscleEstimateKg]] as const)
    if (value !== null && (!Number.isFinite(value) || value < 0)) context.addIssue({ code: "custom", path: [label], message: "Enter a finite nonnegative value as shown on the report." });
});
export const photoSchema = z.object({
  ...baseRecord, setId: id, takenAt: instant, localDate, timezone: timeZone, view: z.enum(["front", "back", "side_left", "side_right", "custom"]),
  pose: z.string().nullable(), clothing: z.string().nullable(), lighting: z.string().nullable(), cameraDistance: z.string().nullable(), background: z.string().nullable(),
  blobKey: id, mime: z.enum(["image/jpeg", "image/png", "image/webp"]), width: z.number().int().positive().max(20000), height: z.number().int().positive().max(20000),
  sanitizedCopy: z.literal(true), originalMetadataRemoved: z.literal(true), includeBinaryInBackup: z.boolean(), sha256: z.string().regex(/^[a-f0-9]{64}$/).nullable(), notes: nullableNote,
}).strict();
export const heightSchema = z.object({ ...baseRecord, measuredAt: instant, localDate, timezone: timeZone, valueCm: z.number().positive().max(300), source: z.enum(["manual", "csv_import"]), notes: nullableNote }).strict();
export const goalSchema = z.object({
  ...baseRecord, title: z.string().min(1).max(120), metricId: id, direction: z.enum(["increase", "decrease", "maintain", "range", "consistency"]), unit: z.string().min(1).max(30), startDate: localDate,
  baseline: z.number().nullable().optional(), target: z.number().nullable().optional(), lowerBound: z.number().nullable().optional(), upperBound: z.number().nullable().optional(), targetDate: localDate.nullable().optional(),
  status: z.enum(["active", "completed", "paused", "archived"]), notes: nullableNote,
}).strict();
export const nutritionReviewSchema = z.object({ ...baseRecord, localDate, timezone: timeZone, status: z.enum(["complete_for_analysis", "partial", "unknown"]), reviewedAt: instant.nullable(), notes: nullableNote }).strict();
export const layoutSchema = z.object({ ...baseRecord, name: z.string().min(1), isDefault: z.boolean(), widgets: z.array(z.object({ widgetId: id, order: z.number().int().nonnegative(), visible: z.boolean(), size: z.enum(["small", "medium", "large", "full"]), settings: z.record(z.string(), z.unknown()) }).strict()) }).strict();
export const receiptSchema = z.object({ ...baseRecord, metricId: id, methodVersion: z.string().min(1), range: z.object({ from: localDate, to: localDate }).strict(), sourceRecordIds: z.array(id), included: z.array(z.object({ recordId: id, reason: z.string() }).strict()), excluded: z.array(z.object({ recordId: id, reason: z.string() }).strict()), result: z.record(z.string(), z.number().nullable()), flags: z.array(z.string()), calculatedAt: instant }).strict();
export const auditEventSchema = z.object({ id, eventType: z.string().min(1), entityType: z.string().min(1), entityId: id, occurredAt: instant, details: z.record(z.string(), z.unknown()) }).strict();
export const deletedRecordSchema = z.object({ entityType: z.string().min(1), entityId: id, deletedAt: instant, undoUntil: instant.optional(), snapshot: z.unknown().optional() }).strict();
export const settingSchema = z.object({ key: z.string().min(1), value: z.unknown(), updatedAt: instant }).strict();
export const importConflictSchema = z.record(z.string(), z.unknown());

export type WeightLog = z.infer<typeof weightLogSchema>;
export type CircumferenceSession = z.infer<typeof circumferenceSchema>;
export type BodyCompositionMeasurement = z.infer<typeof compositionSchema>;
export type ProgressPhoto = z.infer<typeof photoSchema>;
export type HeightMeasurement = z.infer<typeof heightSchema>;
export type ProgressGoal = z.infer<typeof goalSchema>;
export type NutritionDayReview = z.infer<typeof nutritionReviewSchema>;
export type DashboardLayout = z.infer<typeof layoutSchema>;
export type CalculationReceipt = z.infer<typeof receiptSchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;
export type DeletedRecord = z.infer<typeof deletedRecordSchema>;
export type Phase15Setting = z.infer<typeof settingSchema>;

export const phase15StoreNames = ["bodyWeightLogs", "circumferenceSessions", "bodyCompositionMeasurements", "progressPhotos", "progressPhotoBlobs", "heightMeasurements", "progressGoals", "nutritionDayReviews", "dashboardLayouts", "phase15Settings", "phase15AuditEvents", "phase15DeletedRecords", "phase15ImportConflicts", "derivedAnalyticsCache", "metricCalculationReceipts"] as const;
export type Phase15StoreName = typeof phase15StoreNames[number];
