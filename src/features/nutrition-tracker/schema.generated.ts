// Generated from DOCS_for_entire_apppliaction/GYM/Phase_10_Nutrition_Tracker_Data_Schema.json. Conditional food-entry refs are enforced in schema.ts.
import { z } from "zod";
export const backupNormativeSchema = z.strictObject({
  format: z.literal("fitness-os-nutrition-backup"),
  schemaVersion: z.number().finite().int().min(1),
  module: z.literal("nutrition-tracker"),
  exportedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  appVersion: z.string().nullable().optional(),
  preferences: z.strictObject({
    id: z.literal("nutrition-preferences"),
    schemaVersion: z.number().finite().int().min(1),
    massUnit: z.enum(["g", "oz"]),
    energyUnit: z.enum(["kcal", "kJ"]),
    mealSlots: z
      .array(
        z.strictObject({
          id: z.string().regex(new RegExp("^meal_[a-z0-9_]+$")),
          label: z.string().min(1).max(60),
          order: z.number().finite().int().min(0).max(100),
          visible: z.boolean(),
        }),
      )
      .min(1)
      .max(12),
    currentDietPlanId: z.string().nullable(),
    referenceProfileId: z.string().nullable(),
    showMicronutrients: z.boolean().optional(),
    requestPersistentStorage: z.boolean().optional(),
    updatedAt: z
      .string()
      .refine(
        (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
        "Invalid timestamp",
      ),
  }),
  days: z.array(
    z.strictObject({
      localDate: z
        .string()
        .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
      schemaVersion: z.number().finite().int().min(1),
      timeZone: z.string().min(1).max(80),
      targetSnapshot: z.union([
        z.strictObject({
          planId: z.string().min(1),
          planVersion: z.number().finite().int().min(1),
          title: z.string().min(1).max(160),
          energyKcal: z.number().finite().min(0).nullable(),
          proteinGrams: z.number().finite().min(0).nullable(),
          proteinRangeGrams: z
            .array(z.number().finite().min(0))
            .min(2)
            .max(2)
            .nullable()
            .optional(),
          fatGrams: z.number().finite().min(0).nullable(),
          carbohydrateGrams: z.number().finite().min(0).nullable(),
          fiberGrams: z.number().finite().min(0).nullable(),
          formulaVersion: z.string().min(1),
          referenceDataVersion: z.string().min(1),
          snapshottedAt: z
            .string()
            .refine(
              (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
              "Invalid timestamp",
            ),
        }),
        z.null(),
      ]),
      referenceSnapshots: z.array(
        z.strictObject({
          nutrientId: z.string().min(1),
          frameworkId: z.string().min(1),
          frameworkVersion: z.string().min(1),
          populationLabel: z.string().max(200).nullable().optional(),
          referenceType: z.enum([
            "RDA",
            "AI",
            "EAR",
            "UL",
            "TUL",
            "DV",
            "PRI",
            "AR",
            "RI",
            "CDRR",
          ]),
          value: z.number().finite().min(0),
          unit: z.string().min(1).max(20),
          scope: z.enum([
            "total_intake",
            "food_only",
            "supplemental_only",
            "label_reference",
            "other",
          ]),
          sourceId: z.string().min(1),
          snapshottedAt: z
            .string()
            .refine(
              (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
              "Invalid timestamp",
            ),
        }),
      ),
      note: z.string().max(2000).nullable().optional(),
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
  foodEntries: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^nentry_[a-zA-Z0-9_-]+$")),
      schemaVersion: z.number().finite().int().min(1),
      sourceKind: z.enum([
        "canonical_food",
        "custom_food",
        "quick_add",
        "recipe",
      ]),
      localDate: z
        .string()
        .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
      occurredAtUtc: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      timeZone: z.string().min(1).max(80),
      localTime: z
        .string()
        .regex(new RegExp("^([01]\\d|2[0-3]):[0-5]\\d$"))
        .nullable()
        .optional(),
      mealSlotId: z.string().regex(new RegExp("^meal_[a-z0-9_]+$")),
      mealLabelSnapshot: z.string().max(60).nullable().optional(),
      displayNameSnapshot: z.string().min(1).max(200),
      canonicalFoodRef: z
        .union([
          z.strictObject({
            foodId: z.string().regex(new RegExp("^food_[a-z0-9_]+$")),
            foodSlug: z.string().min(1),
            foodName: z.string().min(1).max(200),
            profileId: z.string().regex(new RegExp("^profile_[a-z0-9_]+$")),
            profileState: z.string().min(1).max(120),
            sourceRecordId: z.string().min(1).max(180),
            sourceDatabase: z.string().min(1).max(120),
            sourceRelease: z.string().min(1).max(80),
            sourceLicence: z.string().max(120).nullable().optional(),
            profileReviewedAt: z
              .string()
              .refine(
                (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
                "Invalid timestamp",
              ),
          }),
          z.null(),
        ])
        .optional(),
      customFoodRef: z
        .union([
          z.strictObject({
            customFoodId: z
              .string()
              .regex(new RegExp("^custom_food_[a-zA-Z0-9_-]+$")),
            revisionId: z
              .string()
              .regex(new RegExp("^custom_food_revision_[a-zA-Z0-9_-]+$")),
            name: z.string().min(1).max(200),
            brand: z.string().max(120).nullable().optional(),
            sourceType: z.enum([
              "nutrition_label",
              "manufacturer_document",
              "personal_calculation",
              "other",
            ]),
          }),
          z.null(),
        ])
        .optional(),
      recipeRef: z.record(z.string(), z.json()).nullable().optional(),
      quickAdd: z
        .union([
          z.strictObject({ description: z.string().min(1).max(200) }),
          z.null(),
        ])
        .optional(),
      amount: z.strictObject({
        quantity: z.number().finite().gt(0),
        inputUnit: z.string().min(1).max(80),
        portionId: z.string().max(120).nullable().optional(),
        portionDescription: z.string().max(160).nullable().optional(),
        gramsPerUnit: z.number().finite().gt(0).nullable().optional(),
        gramWeight: z.number().finite().gt(0),
        conversionKind: z.enum([
          "exact_mass",
          "verified_source_portion",
          "custom_food_serving",
          "manual_grams",
        ]),
      }),
      nutrients: z.array(
        z.strictObject({
          nutrientId: z.string().min(1).max(80),
          unit: z.string().min(1).max(20),
          sourceStatus: z.enum([
            "measured",
            "calculated",
            "imputed",
            "estimated",
            "trace",
            "not_detected",
            "not_available",
            "user_entered",
          ]),
          per100gValue: z.number().finite().min(0).nullable(),
          loggedValue: z.number().finite().min(0).nullable(),
          minValue: z.number().finite().min(0).nullable().optional(),
          maxValue: z.number().finite().min(0).nullable().optional(),
          sourceRecordId: z.string().min(1).max(180),
          methodNote: z.string().max(500).nullable().optional(),
        }),
      ),
      dataQualityFlags: z
        .array(z.string().max(80))
        .refine(
          (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
          "Duplicate array value",
        )
        .optional(),
      note: z.string().max(1000).nullable().optional(),
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
      deletedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        )
        .nullable(),
      revision: z.number().finite().int().min(1),
    }),
  ),
  hydrationEntries: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^hydration_[a-zA-Z0-9_-]+$")),
      schemaVersion: z.number().finite().int().min(1),
      localDate: z
        .string()
        .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
      occurredAtUtc: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      timeZone: z.string().min(1).max(80),
      kind: z.enum(["plain_water", "other_noncaloric_fluid"]),
      volumeMl: z.number().finite().max(10000).gt(0),
      note: z.string().max(500).nullable().optional(),
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
      deletedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        )
        .nullable(),
    }),
  ),
  customFoods: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^custom_food_[a-zA-Z0-9_-]+$")),
      currentRevisionId: z
        .string()
        .regex(new RegExp("^custom_food_revision_[a-zA-Z0-9_-]+$")),
      name: z.string().min(1).max(200),
      normalizedName: z.string().min(1).max(200),
      brand: z.string().max(120).nullable().optional(),
      status: z.enum(["active", "archived"]),
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
  customFoodRevisions: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^custom_food_revision_[a-zA-Z0-9_-]+$")),
      customFoodId: z
        .string()
        .regex(new RegExp("^custom_food_[a-zA-Z0-9_-]+$")),
      revisionNumber: z.number().finite().int().min(1),
      basis: z.enum(["per_serving", "per_100g"]),
      serving: z.strictObject({
        description: z.string().min(1).max(160),
        gramWeight: z.number().finite().gt(0),
      }),
      nutrients: z.array(
        z.strictObject({
          nutrientId: z.string().min(1).max(80),
          value: z.number().finite().min(0),
          unit: z.string().min(1).max(20),
        }),
      ),
      sourceType: z.enum([
        "nutrition_label",
        "manufacturer_document",
        "personal_calculation",
        "other",
      ]),
      sourceNote: z.string().max(1000).nullable().optional(),
      createdAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
    }),
  ),
  favourites: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^nutrition_favourite_[a-zA-Z0-9_-]+$")),
      sourceKind: z.enum(["canonical_food", "custom_food"]),
      canonicalFoodRef: z
        .union([
          z.strictObject({
            foodId: z.string().regex(new RegExp("^food_[a-z0-9_]+$")),
            foodSlug: z.string().min(1),
            foodName: z.string().min(1).max(200),
            profileId: z.string().regex(new RegExp("^profile_[a-z0-9_]+$")),
            profileState: z.string().min(1).max(120),
            sourceRecordId: z.string().min(1).max(180),
            sourceDatabase: z.string().min(1).max(120),
            sourceRelease: z.string().min(1).max(80),
            sourceLicence: z.string().max(120).nullable().optional(),
            profileReviewedAt: z
              .string()
              .refine(
                (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
                "Invalid timestamp",
              ),
          }),
          z.null(),
        ])
        .optional(),
      customFoodRef: z
        .union([
          z.strictObject({
            customFoodId: z
              .string()
              .regex(new RegExp("^custom_food_[a-zA-Z0-9_-]+$")),
            revisionId: z
              .string()
              .regex(new RegExp("^custom_food_revision_[a-zA-Z0-9_-]+$")),
            name: z.string().min(1).max(200),
            brand: z.string().max(120).nullable().optional(),
            sourceType: z.enum([
              "nutrition_label",
              "manufacturer_document",
              "personal_calculation",
              "other",
            ]),
          }),
          z.null(),
        ])
        .optional(),
      displayName: z.string().min(1).max(200),
      amount: z.strictObject({
        quantity: z.number().finite().gt(0),
        inputUnit: z.string().min(1).max(80),
        portionId: z.string().max(120).nullable().optional(),
        portionDescription: z.string().max(160).nullable().optional(),
        gramsPerUnit: z.number().finite().gt(0).nullable().optional(),
        gramWeight: z.number().finite().gt(0),
        conversionKind: z.enum([
          "exact_mass",
          "verified_source_portion",
          "custom_food_serving",
          "manual_grams",
        ]),
      }),
      defaultMealSlotId: z
        .string()
        .regex(new RegExp("^meal_[a-z0-9_]+$"))
        .nullable()
        .optional(),
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
  auditLog: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^nutrition_audit_[a-zA-Z0-9_-]+$")),
      action: z.enum([
        "target_snapshot_replaced",
        "reference_snapshot_replaced",
        "restore_merge",
        "restore_duplicate",
        "restore_skip",
        "purge",
        "migration",
      ]),
      occurredAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
      localDate: z
        .string()
        .refine((v) => z.iso.date().safeParse(v).success, "Invalid date")
        .nullable()
        .optional(),
      summary: z.string().min(1).max(1000),
      reason: z.string().max(1000).nullable().optional(),
    }),
  ),
});
export const preferencesNormativeSchema = z.strictObject({
  id: z.literal("nutrition-preferences"),
  schemaVersion: z.number().finite().int().min(1),
  massUnit: z.enum(["g", "oz"]),
  energyUnit: z.enum(["kcal", "kJ"]),
  mealSlots: z
    .array(
      z.strictObject({
        id: z.string().regex(new RegExp("^meal_[a-z0-9_]+$")),
        label: z.string().min(1).max(60),
        order: z.number().finite().int().min(0).max(100),
        visible: z.boolean(),
      }),
    )
    .min(1)
    .max(12),
  currentDietPlanId: z.string().nullable(),
  referenceProfileId: z.string().nullable(),
  showMicronutrients: z.boolean().optional(),
  requestPersistentStorage: z.boolean().optional(),
  updatedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const mealSlotNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^meal_[a-z0-9_]+$")),
  label: z.string().min(1).max(60),
  order: z.number().finite().int().min(0).max(100),
  visible: z.boolean(),
});
export const nutritionDayNormativeSchema = z.strictObject({
  localDate: z
    .string()
    .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
  schemaVersion: z.number().finite().int().min(1),
  timeZone: z.string().min(1).max(80),
  targetSnapshot: z.union([
    z.strictObject({
      planId: z.string().min(1),
      planVersion: z.number().finite().int().min(1),
      title: z.string().min(1).max(160),
      energyKcal: z.number().finite().min(0).nullable(),
      proteinGrams: z.number().finite().min(0).nullable(),
      proteinRangeGrams: z
        .array(z.number().finite().min(0))
        .min(2)
        .max(2)
        .nullable()
        .optional(),
      fatGrams: z.number().finite().min(0).nullable(),
      carbohydrateGrams: z.number().finite().min(0).nullable(),
      fiberGrams: z.number().finite().min(0).nullable(),
      formulaVersion: z.string().min(1),
      referenceDataVersion: z.string().min(1),
      snapshottedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
    }),
    z.null(),
  ]),
  referenceSnapshots: z.array(
    z.strictObject({
      nutrientId: z.string().min(1),
      frameworkId: z.string().min(1),
      frameworkVersion: z.string().min(1),
      populationLabel: z.string().max(200).nullable().optional(),
      referenceType: z.enum([
        "RDA",
        "AI",
        "EAR",
        "UL",
        "TUL",
        "DV",
        "PRI",
        "AR",
        "RI",
        "CDRR",
      ]),
      value: z.number().finite().min(0),
      unit: z.string().min(1).max(20),
      scope: z.enum([
        "total_intake",
        "food_only",
        "supplemental_only",
        "label_reference",
        "other",
      ]),
      sourceId: z.string().min(1),
      snapshottedAt: z
        .string()
        .refine(
          (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
          "Invalid timestamp",
        ),
    }),
  ),
  note: z.string().max(2000).nullable().optional(),
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
export const targetSnapshotNormativeSchema = z.strictObject({
  planId: z.string().min(1),
  planVersion: z.number().finite().int().min(1),
  title: z.string().min(1).max(160),
  energyKcal: z.number().finite().min(0).nullable(),
  proteinGrams: z.number().finite().min(0).nullable(),
  proteinRangeGrams: z
    .array(z.number().finite().min(0))
    .min(2)
    .max(2)
    .nullable()
    .optional(),
  fatGrams: z.number().finite().min(0).nullable(),
  carbohydrateGrams: z.number().finite().min(0).nullable(),
  fiberGrams: z.number().finite().min(0).nullable(),
  formulaVersion: z.string().min(1),
  referenceDataVersion: z.string().min(1),
  snapshottedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const referenceSnapshotNormativeSchema = z.strictObject({
  nutrientId: z.string().min(1),
  frameworkId: z.string().min(1),
  frameworkVersion: z.string().min(1),
  populationLabel: z.string().max(200).nullable().optional(),
  referenceType: z.enum([
    "RDA",
    "AI",
    "EAR",
    "UL",
    "TUL",
    "DV",
    "PRI",
    "AR",
    "RI",
    "CDRR",
  ]),
  value: z.number().finite().min(0),
  unit: z.string().min(1).max(20),
  scope: z.enum([
    "total_intake",
    "food_only",
    "supplemental_only",
    "label_reference",
    "other",
  ]),
  sourceId: z.string().min(1),
  snapshottedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const foodEntryNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^nentry_[a-zA-Z0-9_-]+$")),
  schemaVersion: z.number().finite().int().min(1),
  sourceKind: z.enum(["canonical_food", "custom_food", "quick_add", "recipe"]),
  localDate: z
    .string()
    .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
  occurredAtUtc: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  timeZone: z.string().min(1).max(80),
  localTime: z
    .string()
    .regex(new RegExp("^([01]\\d|2[0-3]):[0-5]\\d$"))
    .nullable()
    .optional(),
  mealSlotId: z.string().regex(new RegExp("^meal_[a-z0-9_]+$")),
  mealLabelSnapshot: z.string().max(60).nullable().optional(),
  displayNameSnapshot: z.string().min(1).max(200),
  canonicalFoodRef: z
    .union([
      z.strictObject({
        foodId: z.string().regex(new RegExp("^food_[a-z0-9_]+$")),
        foodSlug: z.string().min(1),
        foodName: z.string().min(1).max(200),
        profileId: z.string().regex(new RegExp("^profile_[a-z0-9_]+$")),
        profileState: z.string().min(1).max(120),
        sourceRecordId: z.string().min(1).max(180),
        sourceDatabase: z.string().min(1).max(120),
        sourceRelease: z.string().min(1).max(80),
        sourceLicence: z.string().max(120).nullable().optional(),
        profileReviewedAt: z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
      }),
      z.null(),
    ])
    .optional(),
  customFoodRef: z
    .union([
      z.strictObject({
        customFoodId: z
          .string()
          .regex(new RegExp("^custom_food_[a-zA-Z0-9_-]+$")),
        revisionId: z
          .string()
          .regex(new RegExp("^custom_food_revision_[a-zA-Z0-9_-]+$")),
        name: z.string().min(1).max(200),
        brand: z.string().max(120).nullable().optional(),
        sourceType: z.enum([
          "nutrition_label",
          "manufacturer_document",
          "personal_calculation",
          "other",
        ]),
      }),
      z.null(),
    ])
    .optional(),
  recipeRef: z.record(z.string(), z.json()).nullable().optional(),
  quickAdd: z
    .union([
      z.strictObject({ description: z.string().min(1).max(200) }),
      z.null(),
    ])
    .optional(),
  amount: z.strictObject({
    quantity: z.number().finite().gt(0),
    inputUnit: z.string().min(1).max(80),
    portionId: z.string().max(120).nullable().optional(),
    portionDescription: z.string().max(160).nullable().optional(),
    gramsPerUnit: z.number().finite().gt(0).nullable().optional(),
    gramWeight: z.number().finite().gt(0),
    conversionKind: z.enum([
      "exact_mass",
      "verified_source_portion",
      "custom_food_serving",
      "manual_grams",
    ]),
  }),
  nutrients: z.array(
    z.strictObject({
      nutrientId: z.string().min(1).max(80),
      unit: z.string().min(1).max(20),
      sourceStatus: z.enum([
        "measured",
        "calculated",
        "imputed",
        "estimated",
        "trace",
        "not_detected",
        "not_available",
        "user_entered",
      ]),
      per100gValue: z.number().finite().min(0).nullable(),
      loggedValue: z.number().finite().min(0).nullable(),
      minValue: z.number().finite().min(0).nullable().optional(),
      maxValue: z.number().finite().min(0).nullable().optional(),
      sourceRecordId: z.string().min(1).max(180),
      methodNote: z.string().max(500).nullable().optional(),
    }),
  ),
  dataQualityFlags: z
    .array(z.string().max(80))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
  note: z.string().max(1000).nullable().optional(),
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
  deletedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    )
    .nullable(),
  revision: z.number().finite().int().min(1),
});
export const canonicalFoodRefNormativeSchema = z.strictObject({
  foodId: z.string().regex(new RegExp("^food_[a-z0-9_]+$")),
  foodSlug: z.string().min(1),
  foodName: z.string().min(1).max(200),
  profileId: z.string().regex(new RegExp("^profile_[a-z0-9_]+$")),
  profileState: z.string().min(1).max(120),
  sourceRecordId: z.string().min(1).max(180),
  sourceDatabase: z.string().min(1).max(120),
  sourceRelease: z.string().min(1).max(80),
  sourceLicence: z.string().max(120).nullable().optional(),
  profileReviewedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const customFoodRefNormativeSchema = z.strictObject({
  customFoodId: z.string().regex(new RegExp("^custom_food_[a-zA-Z0-9_-]+$")),
  revisionId: z
    .string()
    .regex(new RegExp("^custom_food_revision_[a-zA-Z0-9_-]+$")),
  name: z.string().min(1).max(200),
  brand: z.string().max(120).nullable().optional(),
  sourceType: z.enum([
    "nutrition_label",
    "manufacturer_document",
    "personal_calculation",
    "other",
  ]),
});
export const quickAddNormativeSchema = z.strictObject({
  description: z.string().min(1).max(200),
});
export const amountNormativeSchema = z.strictObject({
  quantity: z.number().finite().gt(0),
  inputUnit: z.string().min(1).max(80),
  portionId: z.string().max(120).nullable().optional(),
  portionDescription: z.string().max(160).nullable().optional(),
  gramsPerUnit: z.number().finite().gt(0).nullable().optional(),
  gramWeight: z.number().finite().gt(0),
  conversionKind: z.enum([
    "exact_mass",
    "verified_source_portion",
    "custom_food_serving",
    "manual_grams",
  ]),
});
export const loggedNutrientNormativeSchema = z.strictObject({
  nutrientId: z.string().min(1).max(80),
  unit: z.string().min(1).max(20),
  sourceStatus: z.enum([
    "measured",
    "calculated",
    "imputed",
    "estimated",
    "trace",
    "not_detected",
    "not_available",
    "user_entered",
  ]),
  per100gValue: z.number().finite().min(0).nullable(),
  loggedValue: z.number().finite().min(0).nullable(),
  minValue: z.number().finite().min(0).nullable().optional(),
  maxValue: z.number().finite().min(0).nullable().optional(),
  sourceRecordId: z.string().min(1).max(180),
  methodNote: z.string().max(500).nullable().optional(),
});
export const hydrationEntryNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^hydration_[a-zA-Z0-9_-]+$")),
  schemaVersion: z.number().finite().int().min(1),
  localDate: z
    .string()
    .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
  occurredAtUtc: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  timeZone: z.string().min(1).max(80),
  kind: z.enum(["plain_water", "other_noncaloric_fluid"]),
  volumeMl: z.number().finite().max(10000).gt(0),
  note: z.string().max(500).nullable().optional(),
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
  deletedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    )
    .nullable(),
});
export const customFoodNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^custom_food_[a-zA-Z0-9_-]+$")),
  currentRevisionId: z
    .string()
    .regex(new RegExp("^custom_food_revision_[a-zA-Z0-9_-]+$")),
  name: z.string().min(1).max(200),
  normalizedName: z.string().min(1).max(200),
  brand: z.string().max(120).nullable().optional(),
  status: z.enum(["active", "archived"]),
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
export const customFoodRevisionNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^custom_food_revision_[a-zA-Z0-9_-]+$")),
  customFoodId: z.string().regex(new RegExp("^custom_food_[a-zA-Z0-9_-]+$")),
  revisionNumber: z.number().finite().int().min(1),
  basis: z.enum(["per_serving", "per_100g"]),
  serving: z.strictObject({
    description: z.string().min(1).max(160),
    gramWeight: z.number().finite().gt(0),
  }),
  nutrients: z.array(
    z.strictObject({
      nutrientId: z.string().min(1).max(80),
      value: z.number().finite().min(0),
      unit: z.string().min(1).max(20),
    }),
  ),
  sourceType: z.enum([
    "nutrition_label",
    "manufacturer_document",
    "personal_calculation",
    "other",
  ]),
  sourceNote: z.string().max(1000).nullable().optional(),
  createdAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const customServingNormativeSchema = z.strictObject({
  description: z.string().min(1).max(160),
  gramWeight: z.number().finite().gt(0),
});
export const customNutrientNormativeSchema = z.strictObject({
  nutrientId: z.string().min(1).max(80),
  value: z.number().finite().min(0),
  unit: z.string().min(1).max(20),
});
export const favouriteNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^nutrition_favourite_[a-zA-Z0-9_-]+$")),
  sourceKind: z.enum(["canonical_food", "custom_food"]),
  canonicalFoodRef: z
    .union([
      z.strictObject({
        foodId: z.string().regex(new RegExp("^food_[a-z0-9_]+$")),
        foodSlug: z.string().min(1),
        foodName: z.string().min(1).max(200),
        profileId: z.string().regex(new RegExp("^profile_[a-z0-9_]+$")),
        profileState: z.string().min(1).max(120),
        sourceRecordId: z.string().min(1).max(180),
        sourceDatabase: z.string().min(1).max(120),
        sourceRelease: z.string().min(1).max(80),
        sourceLicence: z.string().max(120).nullable().optional(),
        profileReviewedAt: z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
      }),
      z.null(),
    ])
    .optional(),
  customFoodRef: z
    .union([
      z.strictObject({
        customFoodId: z
          .string()
          .regex(new RegExp("^custom_food_[a-zA-Z0-9_-]+$")),
        revisionId: z
          .string()
          .regex(new RegExp("^custom_food_revision_[a-zA-Z0-9_-]+$")),
        name: z.string().min(1).max(200),
        brand: z.string().max(120).nullable().optional(),
        sourceType: z.enum([
          "nutrition_label",
          "manufacturer_document",
          "personal_calculation",
          "other",
        ]),
      }),
      z.null(),
    ])
    .optional(),
  displayName: z.string().min(1).max(200),
  amount: z.strictObject({
    quantity: z.number().finite().gt(0),
    inputUnit: z.string().min(1).max(80),
    portionId: z.string().max(120).nullable().optional(),
    portionDescription: z.string().max(160).nullable().optional(),
    gramsPerUnit: z.number().finite().gt(0).nullable().optional(),
    gramWeight: z.number().finite().gt(0),
    conversionKind: z.enum([
      "exact_mass",
      "verified_source_portion",
      "custom_food_serving",
      "manual_grams",
    ]),
  }),
  defaultMealSlotId: z
    .string()
    .regex(new RegExp("^meal_[a-z0-9_]+$"))
    .nullable()
    .optional(),
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
export const auditRecordNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^nutrition_audit_[a-zA-Z0-9_-]+$")),
  action: z.enum([
    "target_snapshot_replaced",
    "reference_snapshot_replaced",
    "restore_merge",
    "restore_duplicate",
    "restore_skip",
    "purge",
    "migration",
  ]),
  occurredAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  localDate: z
    .string()
    .refine((v) => z.iso.date().safeParse(v).success, "Invalid date")
    .nullable()
    .optional(),
  summary: z.string().min(1).max(1000),
  reason: z.string().max(1000).nullable().optional(),
});
