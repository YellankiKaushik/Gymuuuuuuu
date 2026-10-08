import { z } from "zod";
import reference from "../../content/supplements/runtime-reference.json";
import * as n from "./schema.generated";
export const supplementReference = reference;
export const id = z.string().min(1).max(180),
  text = z.string().max(10000),
  timestamp = z.iso.datetime({ offset: true });
const nullableText = text.nullable();
export const imageSchema = z
  .strictObject({
    id,
    mime: z.enum(["image/png", "image/jpeg", "image/webp"]),
    dataUrl: z
      .string()
      .max(3000000)
      .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/),
  })
  .refine(
    (v) => v.dataUrl.startsWith(`data:${v.mime};base64,`),
    "Image MIME mismatch",
  );
export const certificationSchema =
  n.certificationVerificationNormativeSchema.extend({
    registryUrl: z
      .url({ protocol: /^https?$/ })
      .max(2048)
      .nullable(),
    id,
    lotSpecific: z.boolean(),
    matchedLot: nullableText,
    scope: z.array(
      z.enum([
        "identity",
        "potency",
        "contaminants",
        "banned_substances",
        "manufacturing",
      ]),
    ),
    validUntil: z.iso.date().nullable(),
  });
export const productSchema = n.personalProductNormativeSchema.extend({
  productType: z.enum([
    "single_ingredient",
    "multi_ingredient",
    "sports_food",
    "other",
  ]),
  notes: text,
  archived: z.boolean(),
  revision: z.number().int().min(1),
});
export const labelSchema = n.productLabelVersionNormativeSchema.extend({
  certifications: z.array(certificationSchema),
  allergensText: nullableText,
  manufacturerText: nullableText,
  servingMassGrams: z.number().finite().positive().nullable(),
  images: z.array(imageSchema).max(5),
  changeReason: z.string().min(1).max(1000),
});
export const observationSchema = z.strictObject({
  id,
  date: z.iso.date(),
  kind: z.enum(["subjective", "objective"]),
  outcome: text.min(1),
  value: z.number().finite().nullable(),
  unit: nullableText,
  note: text,
  adherence: z.enum(["as_recorded", "partial", "missed", "not_recorded"]),
});
export const contextLinkSchema = z.strictObject({
  module: z.enum(["workout", "nutrition", "sleep", "recovery", "cardio"]),
  recordId: id,
  note: text,
});
export const trialSchema = n.supplementTrialNormativeSchema.extend({
  labelSnapshot: labelSchema.nullable(),
  observations: z.array(observationSchema),
  contextLinks: z.array(contextLinkSchema),
  revision: z.number().int().min(1),
});
export const intakeBaseSchema = n.intakeLogNormativeSchema.extend({
  productSnapshot: productSchema.nullable(),
  labelSnapshot: labelSchema.nullable(),
  revision: z.number().int().min(1),
  correctionReason: text,
});
export const intakeSchema = intakeBaseSchema.extend({
  history: z.array(
    z.strictObject({
      record: intakeBaseSchema,
      reason: z.string().min(1).max(1000),
      correctedAt: timestamp,
    }),
  ),
});
export const eventSchema = n.adverseEventNormativeSchema.extend({
  stopSignals: z.array(
    z.enum(reference.adverseEventStopSignals as [string, ...string[]]),
  ),
  labelSnapshots: z.array(labelSchema),
  revision: z.number().int().min(1),
});
export const comparisonSchema = n.savedComparisonNormativeSchema
  .extend({ outcome: text, population: text, updatedAt: timestamp })
  .refine(
    (v) => v.ingredientIdentityIds.length <= 4,
    "Choose at most four ingredients",
  );
export const preferencesSchema = z.strictObject({
  id: z.literal("supplement-preferences"),
  key: z.literal("preferences"),
  value: z.strictObject({
    trackingEnabled: z.boolean(),
    athleteMode: z.boolean(),
    timezone: z.string().min(1),
    jurisdiction: z.enum([
      "global_education",
      "united_states",
      "india",
      "australia",
      "world_anti_doping_code",
      "other",
    ]),
    listYear: z.number().int().min(2020).max(2100),
  }),
  updatedAt: timestamp,
});
export const deletionSchema = n.deletedRecordNormativeSchema.extend({
  collection: z.enum([
    "personalProducts",
    "supplementTrials",
    "intakeLogs",
    "adverseEvents",
    "safetyContexts",
    "savedComparisons",
  ]),
  snapshot: z.json(),
});
export const conflictSchema = z.strictObject({
  id,
  collection: text,
  entityId: id,
  resolution: z.literal("kept_existing"),
  occurredAt: timestamp,
});
export const backupSchema = z.strictObject({
  schemaVersion: z.literal("1.0.0"),
  companionVersion: z.literal(1),
  exportedAt: timestamp,
  moduleId: z.literal("phase_14_supplements_evidence"),
  personalProducts: z.array(productSchema),
  productLabelVersions: z.array(labelSchema),
  supplementTrials: z.array(trialSchema),
  intakeLogs: z.array(intakeSchema),
  adverseEvents: z.array(eventSchema),
  safetyContexts: z.array(n.safetyContextNormativeSchema),
  savedComparisons: z.array(comparisonSchema),
  settings: z.array(preferencesSchema).max(1),
  auditEvents: z.array(n.auditEventNormativeSchema),
  deletedRecords: z.array(deletionSchema),
  importConflicts: z.array(conflictSchema),
});
export type Backup = z.infer<typeof backupSchema>;
export type Product = z.infer<typeof productSchema>;
export type Label = z.infer<typeof labelSchema>;
export type Trial = z.infer<typeof trialSchema>;
export type Intake = z.infer<typeof intakeSchema>;
export type AdverseEvent = z.infer<typeof eventSchema>;
export type Amount = z.infer<typeof n.ingredientAmountNormativeSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export const rowSchemas = {
  personalProducts: productSchema,
  productLabelVersions: labelSchema,
  supplementTrials: trialSchema,
  intakeLogs: intakeSchema,
  adverseEvents: eventSchema,
  safetyContexts: n.safetyContextNormativeSchema,
  savedComparisons: comparisonSchema,
  settings: preferencesSchema,
  auditEvents: n.auditEventNormativeSchema,
  deletedRecords: deletionSchema,
  importConflicts: conflictSchema,
};
export type Collection = keyof typeof rowSchemas;
