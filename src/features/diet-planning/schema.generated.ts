// Generated from DOCS_for_entire_apppliaction/GYM/Phase_09_Diet_Planning_Data_Schema.json.
import { z } from "zod";
export const backupNormativeSchema = z.strictObject({
  schemaVersion: z.literal("1.0.0"),
  exportedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  currentPlanId: z.string().nullable().optional(),
  settings: z.strictObject({
    unitSystem: z.enum(["metric", "imperial"]),
    referenceFrameworkId: z.string().min(2).max(80),
    storeInputsInSavedPlans: z.boolean(),
    defaultMealCount: z.number().finite().int().min(2).max(6).optional(),
    lastBackupAt: z
      .string()
      .refine(
        (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
        "Invalid timestamp",
      )
      .nullable()
      .optional(),
  }),
  plans: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^dietplan_[a-z0-9_-]+$")),
      name: z.string().min(1).max(100),
      status: z.enum(["current", "saved", "archived"]),
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
      goal: z.enum([
        "maintenance",
        "fat_loss",
        "muscle_gain",
        "recomposition",
        "manual",
      ]),
      inputs: z.strictObject({
        ageYears: z.number().finite().min(19).max(100),
        sexForEquation: z.enum(["male", "female"]),
        heightCm: z.number().finite().min(120).max(230),
        weightKg: z.number().finite().min(30).max(350),
        activityCategory: z.enum([
          "inactive",
          "low_active",
          "active",
          "very_active",
        ]),
        pregnancyOrLactation: z.boolean(),
        targetWeightKg: z
          .number()
          .finite()
          .min(30)
          .max(350)
          .nullable()
          .optional(),
        calculationWeightKg: z
          .number()
          .finite()
          .min(30)
          .max(350)
          .nullable()
          .optional(),
        professionalReviewAcknowledged: z.boolean().optional(),
      }),
      energy: z.strictObject({
        modelId: z.literal("nasem_2023_adult_eer"),
        modelVersion: z.literal("2023.1"),
        unroundedMaintenanceKcal: z.number().finite().min(500).max(10000),
        maintenanceKcal: z
          .number()
          .finite()
          .int()
          .min(500)
          .max(10000)
          .multipleOf(25),
        modelRmseKcal: z.number().finite().int().min(1).max(1000),
        adjustmentPercent: z.number().finite().min(-20).max(15),
        targetKcal: z.number().finite().int().min(1000).max(10000),
        manualOverrideKcal: z
          .number()
          .finite()
          .int()
          .min(1000)
          .max(10000)
          .nullable()
          .optional(),
        manualOverrideReason: z.string().max(500).nullable().optional(),
      }),
      macros: z.strictObject({
        protein: z.strictObject({
          min: z.number().finite().min(0),
          max: z.number().finite().min(0),
          selected: z.number().finite().min(0),
          unit: z.string().min(1).max(30),
          basis: z.string().max(100).nullable().optional(),
        }),
        fat: z.strictObject({
          min: z.number().finite().min(0),
          max: z.number().finite().min(0),
          selected: z.number().finite().min(0),
          unit: z.string().min(1).max(30),
          basis: z.string().max(100).nullable().optional(),
        }),
        carbohydrate: z.strictObject({
          min: z.number().finite().min(0),
          max: z.number().finite().min(0),
          selected: z.number().finite().min(0),
          unit: z.string().min(1).max(30),
          basis: z.string().max(100).nullable().optional(),
        }),
        fiber: z.strictObject({
          min: z.number().finite().min(0),
          max: z.number().finite().min(0),
          selected: z.number().finite().min(0),
          unit: z.string().min(1).max(30),
          basis: z.string().max(100).nullable().optional(),
        }),
        proteinPresetId: z.string().min(2).max(80).optional(),
        fatPercentEnergy: z.number().finite().min(20).max(35).optional(),
        carbohydratePercentEnergy: z
          .number()
          .finite()
          .min(0)
          .max(100)
          .optional(),
        energyCheckKcal: z.number().finite().min(0).max(10000),
        amdrStatus: z
          .record(
            z.string(),
            z.enum(["within", "below", "above", "not_applicable"]),
          )
          .optional(),
      }),
      mealDistribution: z.strictObject({
        mealCount: z.number().finite().int().min(2).max(6),
        mode: z.enum(["even", "custom"]),
        meals: z
          .array(
            z.strictObject({
              label: z.string().min(1).max(50),
              energyKcal: z.number().finite().min(0),
              proteinGrams: z.number().finite().min(0),
              carbohydrateGrams: z.number().finite().min(0),
              fatGrams: z.number().finite().min(0),
            }),
          )
          .min(2)
          .max(6),
      }),
      dietPreferences: z
        .strictObject({
          pattern: z
            .enum([
              "omnivore",
              "vegetarian",
              "vegan",
              "pescatarian",
              "eggetarian",
              "unspecified",
            ])
            .optional(),
          excludedFoodIds: z
            .array(z.string())
            .refine(
              (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
              "Duplicate array value",
            )
            .optional(),
          allergenNotes: z.string().max(500).nullable().optional(),
          cuisinePreferences: z
            .array(z.string().max(80))
            .refine(
              (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
              "Duplicate array value",
            )
            .optional(),
        })
        .optional(),
      warnings: z.array(
        z.strictObject({
          code: z.string().regex(new RegExp("^[a-z0-9_]+$")),
          severity: z.enum(["info", "caution", "block"]),
          message: z.string().min(5).max(500),
          sourceIds: z
            .array(z.string())
            .refine(
              (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
              "Duplicate array value",
            )
            .optional(),
        }),
      ),
      notes: z.string().max(2000).nullable().optional(),
      provenance: z.strictObject({
        formulaSetId: z.literal("phase09_diet_targets"),
        formulaSetVersion: z.literal("1.0.0"),
        referenceDataVersion: z.literal("1.0.0"),
        sourceIds: z
          .array(z.string())
          .min(1)
          .refine(
            (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
            "Duplicate array value",
          ),
        calculatedAt: z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
      }),
    }),
  ),
  auditLog: z
    .array(
      z.strictObject({
        id: z.string(),
        planId: z.string(),
        timestamp: z
          .string()
          .refine(
            (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
            "Invalid timestamp",
          ),
        action: z.enum([
          "created",
          "updated",
          "set_current",
          "archived",
          "deleted",
          "exported",
          "imported",
        ]),
        summary: z.string().max(500).nullable().optional(),
      }),
    )
    .optional(),
});
export const settingsNormativeSchema = z.strictObject({
  unitSystem: z.enum(["metric", "imperial"]),
  referenceFrameworkId: z.string().min(2).max(80),
  storeInputsInSavedPlans: z.boolean(),
  defaultMealCount: z.number().finite().int().min(2).max(6).optional(),
  lastBackupAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    )
    .nullable()
    .optional(),
});
export const planNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^dietplan_[a-z0-9_-]+$")),
  name: z.string().min(1).max(100),
  status: z.enum(["current", "saved", "archived"]),
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
  goal: z.enum([
    "maintenance",
    "fat_loss",
    "muscle_gain",
    "recomposition",
    "manual",
  ]),
  inputs: z.strictObject({
    ageYears: z.number().finite().min(19).max(100),
    sexForEquation: z.enum(["male", "female"]),
    heightCm: z.number().finite().min(120).max(230),
    weightKg: z.number().finite().min(30).max(350),
    activityCategory: z.enum([
      "inactive",
      "low_active",
      "active",
      "very_active",
    ]),
    pregnancyOrLactation: z.boolean(),
    targetWeightKg: z.number().finite().min(30).max(350).nullable().optional(),
    calculationWeightKg: z
      .number()
      .finite()
      .min(30)
      .max(350)
      .nullable()
      .optional(),
    professionalReviewAcknowledged: z.boolean().optional(),
  }),
  energy: z.strictObject({
    modelId: z.literal("nasem_2023_adult_eer"),
    modelVersion: z.literal("2023.1"),
    unroundedMaintenanceKcal: z.number().finite().min(500).max(10000),
    maintenanceKcal: z
      .number()
      .finite()
      .int()
      .min(500)
      .max(10000)
      .multipleOf(25),
    modelRmseKcal: z.number().finite().int().min(1).max(1000),
    adjustmentPercent: z.number().finite().min(-20).max(15),
    targetKcal: z.number().finite().int().min(1000).max(10000),
    manualOverrideKcal: z
      .number()
      .finite()
      .int()
      .min(1000)
      .max(10000)
      .nullable()
      .optional(),
    manualOverrideReason: z.string().max(500).nullable().optional(),
  }),
  macros: z.strictObject({
    protein: z.strictObject({
      min: z.number().finite().min(0),
      max: z.number().finite().min(0),
      selected: z.number().finite().min(0),
      unit: z.string().min(1).max(30),
      basis: z.string().max(100).nullable().optional(),
    }),
    fat: z.strictObject({
      min: z.number().finite().min(0),
      max: z.number().finite().min(0),
      selected: z.number().finite().min(0),
      unit: z.string().min(1).max(30),
      basis: z.string().max(100).nullable().optional(),
    }),
    carbohydrate: z.strictObject({
      min: z.number().finite().min(0),
      max: z.number().finite().min(0),
      selected: z.number().finite().min(0),
      unit: z.string().min(1).max(30),
      basis: z.string().max(100).nullable().optional(),
    }),
    fiber: z.strictObject({
      min: z.number().finite().min(0),
      max: z.number().finite().min(0),
      selected: z.number().finite().min(0),
      unit: z.string().min(1).max(30),
      basis: z.string().max(100).nullable().optional(),
    }),
    proteinPresetId: z.string().min(2).max(80).optional(),
    fatPercentEnergy: z.number().finite().min(20).max(35).optional(),
    carbohydratePercentEnergy: z.number().finite().min(0).max(100).optional(),
    energyCheckKcal: z.number().finite().min(0).max(10000),
    amdrStatus: z
      .record(
        z.string(),
        z.enum(["within", "below", "above", "not_applicable"]),
      )
      .optional(),
  }),
  mealDistribution: z.strictObject({
    mealCount: z.number().finite().int().min(2).max(6),
    mode: z.enum(["even", "custom"]),
    meals: z
      .array(
        z.strictObject({
          label: z.string().min(1).max(50),
          energyKcal: z.number().finite().min(0),
          proteinGrams: z.number().finite().min(0),
          carbohydrateGrams: z.number().finite().min(0),
          fatGrams: z.number().finite().min(0),
        }),
      )
      .min(2)
      .max(6),
  }),
  dietPreferences: z
    .strictObject({
      pattern: z
        .enum([
          "omnivore",
          "vegetarian",
          "vegan",
          "pescatarian",
          "eggetarian",
          "unspecified",
        ])
        .optional(),
      excludedFoodIds: z
        .array(z.string())
        .refine(
          (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
          "Duplicate array value",
        )
        .optional(),
      allergenNotes: z.string().max(500).nullable().optional(),
      cuisinePreferences: z
        .array(z.string().max(80))
        .refine(
          (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
          "Duplicate array value",
        )
        .optional(),
    })
    .optional(),
  warnings: z.array(
    z.strictObject({
      code: z.string().regex(new RegExp("^[a-z0-9_]+$")),
      severity: z.enum(["info", "caution", "block"]),
      message: z.string().min(5).max(500),
      sourceIds: z
        .array(z.string())
        .refine(
          (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
          "Duplicate array value",
        )
        .optional(),
    }),
  ),
  notes: z.string().max(2000).nullable().optional(),
  provenance: z.strictObject({
    formulaSetId: z.literal("phase09_diet_targets"),
    formulaSetVersion: z.literal("1.0.0"),
    referenceDataVersion: z.literal("1.0.0"),
    sourceIds: z
      .array(z.string())
      .min(1)
      .refine(
        (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
        "Duplicate array value",
      ),
    calculatedAt: z
      .string()
      .refine(
        (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
        "Invalid timestamp",
      ),
  }),
});
export const inputsNormativeSchema = z.strictObject({
  ageYears: z.number().finite().min(19).max(100),
  sexForEquation: z.enum(["male", "female"]),
  heightCm: z.number().finite().min(120).max(230),
  weightKg: z.number().finite().min(30).max(350),
  activityCategory: z.enum(["inactive", "low_active", "active", "very_active"]),
  pregnancyOrLactation: z.boolean(),
  targetWeightKg: z.number().finite().min(30).max(350).nullable().optional(),
  calculationWeightKg: z
    .number()
    .finite()
    .min(30)
    .max(350)
    .nullable()
    .optional(),
  professionalReviewAcknowledged: z.boolean().optional(),
});
export const energyNormativeSchema = z.strictObject({
  modelId: z.literal("nasem_2023_adult_eer"),
  modelVersion: z.literal("2023.1"),
  unroundedMaintenanceKcal: z.number().finite().min(500).max(10000),
  maintenanceKcal: z.number().finite().int().min(500).max(10000).multipleOf(25),
  modelRmseKcal: z.number().finite().int().min(1).max(1000),
  adjustmentPercent: z.number().finite().min(-20).max(15),
  targetKcal: z.number().finite().int().min(1000).max(10000),
  manualOverrideKcal: z
    .number()
    .finite()
    .int()
    .min(1000)
    .max(10000)
    .nullable()
    .optional(),
  manualOverrideReason: z.string().max(500).nullable().optional(),
});
export const targetRangeNormativeSchema = z.strictObject({
  min: z.number().finite().min(0),
  max: z.number().finite().min(0),
  selected: z.number().finite().min(0),
  unit: z.string().min(1).max(30),
  basis: z.string().max(100).nullable().optional(),
});
export const macrosNormativeSchema = z.strictObject({
  protein: z.strictObject({
    min: z.number().finite().min(0),
    max: z.number().finite().min(0),
    selected: z.number().finite().min(0),
    unit: z.string().min(1).max(30),
    basis: z.string().max(100).nullable().optional(),
  }),
  fat: z.strictObject({
    min: z.number().finite().min(0),
    max: z.number().finite().min(0),
    selected: z.number().finite().min(0),
    unit: z.string().min(1).max(30),
    basis: z.string().max(100).nullable().optional(),
  }),
  carbohydrate: z.strictObject({
    min: z.number().finite().min(0),
    max: z.number().finite().min(0),
    selected: z.number().finite().min(0),
    unit: z.string().min(1).max(30),
    basis: z.string().max(100).nullable().optional(),
  }),
  fiber: z.strictObject({
    min: z.number().finite().min(0),
    max: z.number().finite().min(0),
    selected: z.number().finite().min(0),
    unit: z.string().min(1).max(30),
    basis: z.string().max(100).nullable().optional(),
  }),
  proteinPresetId: z.string().min(2).max(80).optional(),
  fatPercentEnergy: z.number().finite().min(20).max(35).optional(),
  carbohydratePercentEnergy: z.number().finite().min(0).max(100).optional(),
  energyCheckKcal: z.number().finite().min(0).max(10000),
  amdrStatus: z
    .record(z.string(), z.enum(["within", "below", "above", "not_applicable"]))
    .optional(),
});
export const mealDistributionNormativeSchema = z.strictObject({
  mealCount: z.number().finite().int().min(2).max(6),
  mode: z.enum(["even", "custom"]),
  meals: z
    .array(
      z.strictObject({
        label: z.string().min(1).max(50),
        energyKcal: z.number().finite().min(0),
        proteinGrams: z.number().finite().min(0),
        carbohydrateGrams: z.number().finite().min(0),
        fatGrams: z.number().finite().min(0),
      }),
    )
    .min(2)
    .max(6),
});
export const dietPreferencesNormativeSchema = z.strictObject({
  pattern: z
    .enum([
      "omnivore",
      "vegetarian",
      "vegan",
      "pescatarian",
      "eggetarian",
      "unspecified",
    ])
    .optional(),
  excludedFoodIds: z
    .array(z.string())
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
  allergenNotes: z.string().max(500).nullable().optional(),
  cuisinePreferences: z
    .array(z.string().max(80))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
});
export const warningNormativeSchema = z.strictObject({
  code: z.string().regex(new RegExp("^[a-z0-9_]+$")),
  severity: z.enum(["info", "caution", "block"]),
  message: z.string().min(5).max(500),
  sourceIds: z
    .array(z.string())
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
});
export const provenanceNormativeSchema = z.strictObject({
  formulaSetId: z.literal("phase09_diet_targets"),
  formulaSetVersion: z.literal("1.0.0"),
  referenceDataVersion: z.literal("1.0.0"),
  sourceIds: z
    .array(z.string())
    .min(1)
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    ),
  calculatedAt: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
});
export const auditNormativeSchema = z.strictObject({
  id: z.string(),
  planId: z.string(),
  timestamp: z
    .string()
    .refine(
      (v) => z.iso.datetime({ offset: true }).safeParse(v).success,
      "Invalid timestamp",
    ),
  action: z.enum([
    "created",
    "updated",
    "set_current",
    "archived",
    "deleted",
    "exported",
    "imported",
  ]),
  summary: z.string().max(500).nullable().optional(),
});
