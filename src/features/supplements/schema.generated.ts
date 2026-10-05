// Generated from DOCS_for_entire_apppliaction/GYM/Phase_14_Supplements_Evidence_Data_Schema.json; behavioral companions live in schema.ts.
import { z } from "zod";
export const backupNormativeSchema = z.strictObject({
  schemaVersion: z.literal("1.0.0"),
  exportedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  moduleId: z.literal("phase_14_supplements_evidence"),
  personalProducts: z.array(
    z.strictObject({
      id: z.string().min(1).max(180),
      displayName: z.string().min(1).max(300),
      brand: z.string().max(200).nullable(),
      currentLabelVersionId: z.string().nullable(),
      purchaseCountry: z.string().max(100).nullable(),
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
  productLabelVersions: z.array(
    z.strictObject({
      id: z.string().min(1).max(180),
      personalProductId: z.string().min(1).max(180),
      versionNumber: z.number().finite().int().min(1),
      capturedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      servingSizeText: z.string().max(300).nullable(),
      servingsPerContainer: z.number().finite().min(0).nullable(),
      ingredients: z.array(
        z.strictObject({
          ingredientIdentityId: z.string().nullable(),
          labelName: z.string().min(1).max(300),
          form: z.string().max(200).nullable(),
          amount: z.number().finite().min(0).nullable(),
          unit: z.string().max(40).nullable(),
          amountDisclosure: z.enum([
            "exact",
            "proprietary_blend_total_only",
            "not_disclosed",
            "unknown",
          ]),
          sourceText: z.string().max(1000),
        }),
      ),
      otherIngredientsText: z.string().max(5000).nullable(),
      lotNumber: z.string().max(200).nullable(),
      expiryDate: z.union([
        z
          .string()
          .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
        z.null(),
      ]),
      certifications: z.array(
        z.strictObject({
          schemeId: z.string(),
          status: z.enum([
            "verified_current",
            "verified_historical",
            "not_found",
            "not_checked",
            "registry_unavailable",
            "uncertain",
          ]),
          productOrLotIdentifier: z.string().max(300).nullable(),
          verifiedAt: z.union([
            z
              .string()
              .refine(
                (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
                "Invalid timestamp",
              ),
            z.null(),
          ]),
          registryUrl: z.string().url().nullable(),
          evidenceNote: z.string().max(2000),
        }),
      ),
      warningsText: z.string().max(5000).nullable(),
      labelImageReferences: z.array(z.string()),
      notes: z.string().max(10000),
      immutable: z.literal(true),
    }),
  ),
  supplementTrials: z.array(
    z.strictObject({
      id: z.string().min(1).max(180),
      title: z.string().min(1).max(300),
      labelVersionId: z.string().nullable(),
      ingredientIdentityIds: z
        .array(z.string())
        .refine(
          (v) => new Set(v.map((x) => JSON.stringify(x))).size === v.length,
          "Duplicate entries",
        ),
      reasonForTrial: z.string().max(3000),
      primaryOutcomeIds: z
        .array(z.string())
        .refine(
          (v) => new Set(v.map((x) => JSON.stringify(x))).size === v.length,
          "Duplicate entries",
        ),
      baselineStartDate: z.union([
        z
          .string()
          .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
        z.null(),
      ]),
      trialStartDate: z.union([
        z
          .string()
          .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
        z.null(),
      ]),
      plannedEndDate: z.union([
        z
          .string()
          .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
        z.null(),
      ]),
      actualEndDate: z.union([
        z
          .string()
          .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
        z.null(),
      ]),
      status: z.enum([
        "draft",
        "baseline",
        "active",
        "paused",
        "completed",
        "stopped_for_adverse_event",
        "abandoned",
      ]),
      plannedProtocolText: z.string().max(5000),
      professionalReview: z.enum([
        "not_recorded",
        "not_reviewed",
        "doctor",
        "pharmacist",
        "registered_dietitian",
        "sports_dietitian",
        "other_qualified_professional",
      ]),
      stopRules: z.array(z.string()),
      notes: z.string().max(10000),
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
  intakeLogs: z.array(
    z.strictObject({
      id: z.string().min(1).max(180),
      localDate: z
        .string()
        .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
      timezone: z.string().min(1),
      takenAt: z.union([
        z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
        z.null(),
      ]),
      trialId: z.string().nullable(),
      labelVersionId: z.string().nullable(),
      servings: z.number().finite().gt(0).nullable(),
      servingText: z.string().max(300).nullable(),
      ingredientSnapshot: z.array(
        z.strictObject({
          ingredientIdentityId: z.string().nullable(),
          labelName: z.string().min(1).max(300),
          form: z.string().max(200).nullable(),
          amount: z.number().finite().min(0).nullable(),
          unit: z.string().max(40).nullable(),
          amountDisclosure: z.enum([
            "exact",
            "proprietary_blend_total_only",
            "not_disclosed",
            "unknown",
          ]),
          sourceText: z.string().max(1000),
        }),
      ),
      contextTags: z
        .array(z.string())
        .refine(
          (v) => new Set(v.map((x) => JSON.stringify(x))).size === v.length,
          "Duplicate entries",
        ),
      notes: z.string().max(5000),
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
  adverseEvents: z.array(
    z.strictObject({
      id: z.string().min(1).max(180),
      localDate: z
        .string()
        .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
      timezone: z.string(),
      onsetAt: z.union([
        z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
        z.null(),
      ]),
      severity: z.enum([
        "mild",
        "moderate",
        "severe",
        "urgent_or_emergency",
        "unknown",
      ]),
      symptoms: z.array(z.string()).min(1),
      relatedIntakeLogIds: z.array(z.string()),
      suspectedProductIds: z.array(z.string()),
      actionTaken: z.array(z.string()),
      resolvedAt: z.union([
        z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
        z.null(),
      ]),
      professionalCare: z.enum([
        "none",
        "planned",
        "pharmacist",
        "doctor",
        "urgent_care",
        "emergency_department",
        "hospitalized",
        "unknown",
      ]),
      reportingJurisdiction: z.string().nullable(),
      externalReportReference: z.string().nullable(),
      notes: z.string().max(10000),
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
  safetyContexts: z.array(
    z.strictObject({
      id: z.string().min(1).max(180),
      contextType: z.enum([
        "under_18",
        "pregnancy_or_lactation",
        "medication_use",
        "kidney_condition",
        "liver_condition",
        "cardiovascular_condition",
        "bleeding_risk",
        "scheduled_surgery",
        "allergy_or_intolerance",
        "tested_athlete",
        "other_professional_review_needed",
      ]),
      active: z.boolean(),
      userLabel: z.string().max(300),
      details: z.string().max(5000),
      professionalAdviceRecorded: z.boolean(),
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
  savedComparisons: z.array(
    z.strictObject({
      id: z.string().min(1).max(180),
      title: z.string().max(300),
      ingredientIdentityIds: z
        .array(z.string())
        .refine(
          (v) => new Set(v.map((x) => JSON.stringify(x))).size === v.length,
          "Duplicate entries",
        ),
      claimIds: z
        .array(z.string())
        .refine(
          (v) => new Set(v.map((x) => JSON.stringify(x))).size === v.length,
          "Duplicate entries",
        ),
      createdAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      notes: z.string().max(5000),
    }),
  ),
  settings: z.array(
    z.strictObject({
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
      id: z.string().min(1).max(180),
      eventType: z.string(),
      entityType: z.string(),
      entityId: z.string(),
      occurredAt: z
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
      id: z.string().min(1).max(180),
      entityType: z.string(),
      entityId: z.string(),
      deletedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
    }),
  ),
});
export const idNormativeSchema = z.string().min(1).max(180);
export const timestampNormativeSchema = z
  .string()
  .refine(
    (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
    "Invalid timestamp",
  );
export const localDateNormativeSchema = z
  .string()
  .refine((v) => z.iso.date().safeParse(v).success, "Invalid date");
export const ingredientAmountNormativeSchema = z.strictObject({
  ingredientIdentityId: z.string().nullable(),
  labelName: z.string().min(1).max(300),
  form: z.string().max(200).nullable(),
  amount: z.number().finite().min(0).nullable(),
  unit: z.string().max(40).nullable(),
  amountDisclosure: z.enum([
    "exact",
    "proprietary_blend_total_only",
    "not_disclosed",
    "unknown",
  ]),
  sourceText: z.string().max(1000),
});
export const certificationVerificationNormativeSchema = z.strictObject({
  schemeId: z.string(),
  status: z.enum([
    "verified_current",
    "verified_historical",
    "not_found",
    "not_checked",
    "registry_unavailable",
    "uncertain",
  ]),
  productOrLotIdentifier: z.string().max(300).nullable(),
  verifiedAt: z.union([
    z
      .string()
      .refine(
        (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  registryUrl: z.string().url().nullable(),
  evidenceNote: z.string().max(2000),
});
export const personalProductNormativeSchema = z.strictObject({
  id: z.string().min(1).max(180),
  displayName: z.string().min(1).max(300),
  brand: z.string().max(200).nullable(),
  currentLabelVersionId: z.string().nullable(),
  purchaseCountry: z.string().max(100).nullable(),
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
export const productLabelVersionNormativeSchema = z.strictObject({
  id: z.string().min(1).max(180),
  personalProductId: z.string().min(1).max(180),
  versionNumber: z.number().finite().int().min(1),
  capturedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  servingSizeText: z.string().max(300).nullable(),
  servingsPerContainer: z.number().finite().min(0).nullable(),
  ingredients: z.array(
    z.strictObject({
      ingredientIdentityId: z.string().nullable(),
      labelName: z.string().min(1).max(300),
      form: z.string().max(200).nullable(),
      amount: z.number().finite().min(0).nullable(),
      unit: z.string().max(40).nullable(),
      amountDisclosure: z.enum([
        "exact",
        "proprietary_blend_total_only",
        "not_disclosed",
        "unknown",
      ]),
      sourceText: z.string().max(1000),
    }),
  ),
  otherIngredientsText: z.string().max(5000).nullable(),
  lotNumber: z.string().max(200).nullable(),
  expiryDate: z.union([
    z.string().refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
    z.null(),
  ]),
  certifications: z.array(
    z.strictObject({
      schemeId: z.string(),
      status: z.enum([
        "verified_current",
        "verified_historical",
        "not_found",
        "not_checked",
        "registry_unavailable",
        "uncertain",
      ]),
      productOrLotIdentifier: z.string().max(300).nullable(),
      verifiedAt: z.union([
        z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
        z.null(),
      ]),
      registryUrl: z.string().url().nullable(),
      evidenceNote: z.string().max(2000),
    }),
  ),
  warningsText: z.string().max(5000).nullable(),
  labelImageReferences: z.array(z.string()),
  notes: z.string().max(10000),
  immutable: z.literal(true),
});
export const supplementTrialNormativeSchema = z.strictObject({
  id: z.string().min(1).max(180),
  title: z.string().min(1).max(300),
  labelVersionId: z.string().nullable(),
  ingredientIdentityIds: z
    .array(z.string())
    .refine(
      (v) => new Set(v.map((x) => JSON.stringify(x))).size === v.length,
      "Duplicate entries",
    ),
  reasonForTrial: z.string().max(3000),
  primaryOutcomeIds: z
    .array(z.string())
    .refine(
      (v) => new Set(v.map((x) => JSON.stringify(x))).size === v.length,
      "Duplicate entries",
    ),
  baselineStartDate: z.union([
    z.string().refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
    z.null(),
  ]),
  trialStartDate: z.union([
    z.string().refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
    z.null(),
  ]),
  plannedEndDate: z.union([
    z.string().refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
    z.null(),
  ]),
  actualEndDate: z.union([
    z.string().refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
    z.null(),
  ]),
  status: z.enum([
    "draft",
    "baseline",
    "active",
    "paused",
    "completed",
    "stopped_for_adverse_event",
    "abandoned",
  ]),
  plannedProtocolText: z.string().max(5000),
  professionalReview: z.enum([
    "not_recorded",
    "not_reviewed",
    "doctor",
    "pharmacist",
    "registered_dietitian",
    "sports_dietitian",
    "other_qualified_professional",
  ]),
  stopRules: z.array(z.string()),
  notes: z.string().max(10000),
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
export const intakeLogNormativeSchema = z.strictObject({
  id: z.string().min(1).max(180),
  localDate: z
    .string()
    .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
  timezone: z.string().min(1),
  takenAt: z.union([
    z
      .string()
      .refine(
        (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  trialId: z.string().nullable(),
  labelVersionId: z.string().nullable(),
  servings: z.number().finite().gt(0).nullable(),
  servingText: z.string().max(300).nullable(),
  ingredientSnapshot: z.array(
    z.strictObject({
      ingredientIdentityId: z.string().nullable(),
      labelName: z.string().min(1).max(300),
      form: z.string().max(200).nullable(),
      amount: z.number().finite().min(0).nullable(),
      unit: z.string().max(40).nullable(),
      amountDisclosure: z.enum([
        "exact",
        "proprietary_blend_total_only",
        "not_disclosed",
        "unknown",
      ]),
      sourceText: z.string().max(1000),
    }),
  ),
  contextTags: z
    .array(z.string())
    .refine(
      (v) => new Set(v.map((x) => JSON.stringify(x))).size === v.length,
      "Duplicate entries",
    ),
  notes: z.string().max(5000),
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
export const adverseEventNormativeSchema = z.strictObject({
  id: z.string().min(1).max(180),
  localDate: z
    .string()
    .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
  timezone: z.string(),
  onsetAt: z.union([
    z
      .string()
      .refine(
        (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  severity: z.enum([
    "mild",
    "moderate",
    "severe",
    "urgent_or_emergency",
    "unknown",
  ]),
  symptoms: z.array(z.string()).min(1),
  relatedIntakeLogIds: z.array(z.string()),
  suspectedProductIds: z.array(z.string()),
  actionTaken: z.array(z.string()),
  resolvedAt: z.union([
    z
      .string()
      .refine(
        (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
        "Invalid timestamp",
      ),
    z.null(),
  ]),
  professionalCare: z.enum([
    "none",
    "planned",
    "pharmacist",
    "doctor",
    "urgent_care",
    "emergency_department",
    "hospitalized",
    "unknown",
  ]),
  reportingJurisdiction: z.string().nullable(),
  externalReportReference: z.string().nullable(),
  notes: z.string().max(10000),
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
export const safetyContextNormativeSchema = z.strictObject({
  id: z.string().min(1).max(180),
  contextType: z.enum([
    "under_18",
    "pregnancy_or_lactation",
    "medication_use",
    "kidney_condition",
    "liver_condition",
    "cardiovascular_condition",
    "bleeding_risk",
    "scheduled_surgery",
    "allergy_or_intolerance",
    "tested_athlete",
    "other_professional_review_needed",
  ]),
  active: z.boolean(),
  userLabel: z.string().max(300),
  details: z.string().max(5000),
  professionalAdviceRecorded: z.boolean(),
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
export const savedComparisonNormativeSchema = z.strictObject({
  id: z.string().min(1).max(180),
  title: z.string().max(300),
  ingredientIdentityIds: z
    .array(z.string())
    .refine(
      (v) => new Set(v.map((x) => JSON.stringify(x))).size === v.length,
      "Duplicate entries",
    ),
  claimIds: z
    .array(z.string())
    .refine(
      (v) => new Set(v.map((x) => JSON.stringify(x))).size === v.length,
      "Duplicate entries",
    ),
  createdAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  notes: z.string().max(5000),
});
export const settingNormativeSchema = z.strictObject({
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
  id: z.string().min(1).max(180),
  eventType: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  occurredAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  details: z.record(z.string(), z.json()),
});
export const deletedRecordNormativeSchema = z.strictObject({
  id: z.string().min(1).max(180),
  entityType: z.string(),
  entityId: z.string(),
  deletedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
