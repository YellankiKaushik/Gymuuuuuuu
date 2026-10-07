// Generated from DOCS_for_entire_apppliaction/GYM/Phase_08_Nutrient_Data_Schema.json; do not hand edit.
import { z } from "zod";
export const nutrientNormativeSchema = z.strictObject({
  id: z.enum([
    "energy_kcal",
    "energy_kj",
    "water_g",
    "alcohol_g",
    "protein_g",
    "carbohydrate_total_g",
    "carbohydrate_available_g",
    "fiber_total_g",
    "sugars_total_g",
    "added_sugars_g",
    "fat_total_g",
    "fat_saturated_g",
    "fat_monounsaturated_g",
    "fat_polyunsaturated_g",
    "trans_fat_g",
    "omega_3_g",
    "omega_6_g",
    "cholesterol_mg",
    "sodium_mg",
    "potassium_mg",
    "calcium_mg",
    "iron_mg",
    "magnesium_mg",
    "phosphorus_mg",
    "zinc_mg",
    "copper_mg",
    "manganese_mg",
    "selenium_ug",
    "iodine_ug",
    "chloride_mg",
    "chromium_ug",
    "fluoride_mg",
    "molybdenum_ug",
    "vitamin_a_rae_ug",
    "retinol_ug",
    "beta_carotene_ug",
    "thiamin_mg",
    "riboflavin_mg",
    "niacin_mg",
    "pantothenic_acid_mg",
    "vitamin_b6_mg",
    "biotin_ug",
    "folate_food_ug",
    "folic_acid_ug",
    "folate_dfe_ug",
    "vitamin_b12_ug",
    "vitamin_c_mg",
    "vitamin_d_ug",
    "vitamin_e_mg",
    "vitamin_k_ug",
    "choline_mg",
  ]),
  slug: z.string().regex(new RegExp("^[a-z0-9]+(?:-[a-z0-9]+)*$")),
  canonicalName: z.string().min(2).max(160),
  aliases: z
    .array(z.string().min(1).max(120))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    ),
  groupId: z.enum([
    "energy_hydration",
    "macronutrients",
    "minerals_electrolytes",
    "vitamins",
    "other_essential",
  ]),
  canonicalUnit: z.string().min(1).max(32),
  foodDataNutrientIds: z
    .array(z.string().regex(new RegExp("^[a-z0-9_]+$")))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    ),
  essentiality: z.enum([
    "essential",
    "essential_class",
    "essential_family",
    "vitamin_form",
    "vitamin_precursor",
    "beneficial_component",
    "beneficial_trace_element",
    "reference_framework_dependent",
    "nonessential",
    "nonessential_measure",
    "not_a_nutrient",
  ]),
  displayKind: z.enum([
    "energy",
    "energy_equivalent",
    "nutrient",
    "macronutrient",
    "food_component",
    "dietary_component",
    "fat_component",
    "mineral",
    "vitamin",
    "vitamin_form",
    "other_nutrient",
  ]),
  status: z.enum([
    "draft_identity",
    "staged",
    "reviewed",
    "published",
    "deprecated",
    "archived",
  ]),
  contentStatus: z.enum([
    "unpopulated",
    "partial",
    "complete_for_mvp",
    "superseded",
  ]),
  summary: z.string().max(700).nullable().optional(),
  forms: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^[a-z0-9_]+$")),
      name: z.string().min(1).max(120),
      relationship: z.enum([
        "active_form",
        "precursor",
        "dietary_form",
        "supplement_form",
        "measurement_equivalent",
        "metabolite",
        "family_member",
      ]),
      conversionRule: z.string().max(500).nullable().optional(),
      sourceIds: z
        .array(
          z.enum([
            "nih_ods_fact_sheets",
            "us_canada_dri_tables",
            "fda_daily_values",
            "icmr_nin_rda_ear_2020",
            "efsa_drv",
            "usda_fooddata_central",
            "fda_nutrition_education",
            "fao_food_energy",
            "nhs_food_education",
          ]),
        )
        .optional(),
    }),
  ),
  functions: z.array(
    z.strictObject({
      title: z.string().min(2).max(120),
      description: z.string().min(10).max(700),
      sourceIds: z
        .array(
          z.enum([
            "nih_ods_fact_sheets",
            "us_canada_dri_tables",
            "fda_daily_values",
            "icmr_nin_rda_ear_2020",
            "efsa_drv",
            "usda_fooddata_central",
            "fda_nutrition_education",
            "fao_food_energy",
            "nhs_food_education",
          ]),
        )
        .min(1),
    }),
  ),
  referenceValues: z.array(
    z.strictObject({
      frameworkId: z.enum([
        "us_canada_dri",
        "fda_dv_adult_4_plus",
        "icmr_nin_2020",
        "efsa_drv",
      ]),
      valueType: z.enum([
        "RDA",
        "AI",
        "EAR",
        "UL",
        "AMDR",
        "CDRR",
        "DV",
        "PRI",
        "AR",
        "RI",
        "TUL",
        "no_value_established",
      ]),
      population: z.strictObject({
        ageMinMonths: z.number().finite().int().min(0).max(1800),
        ageMaxMonths: z.number().finite().int().min(0).max(1800).nullable(),
        sex: z.enum(["all", "male", "female"]),
        lifeStage: z.enum(["general", "pregnancy", "lactation"]),
        notes: z.string().max(300).nullable().optional(),
      }),
      value: z.number().finite().min(0).nullable().optional(),
      minValue: z.number().finite().min(0).nullable().optional(),
      maxValue: z.number().finite().min(0).nullable().optional(),
      unit: z.string().min(1).max(40),
      basis: z
        .enum([
          "per_day",
          "percent_energy",
          "per_kg_body_weight_day",
          "label_reference",
          "other",
        ])
        .optional(),
      sourceId: z.enum([
        "nih_ods_fact_sheets",
        "us_canada_dri_tables",
        "fda_daily_values",
        "icmr_nin_rda_ear_2020",
        "efsa_drv",
        "usda_fooddata_central",
        "fda_nutrition_education",
        "fao_food_energy",
        "nhs_food_education",
      ]),
      status: z.enum([
        "source_verified",
        "manually_verified",
        "pending_review",
        "not_applicable",
      ]),
      notes: z.string().max(600).nullable().optional(),
    }),
  ),
  foodSourceRules: z.array(
    z.strictObject({
      rankingBasis: z.enum([
        "per_100g",
        "per_100kcal",
        "per_verified_portion",
        "qualitative_only",
      ]),
      phase07NutrientId: z.string().nullable(),
      minimumDataStatus: z
        .enum([
          "measured_only",
          "measured_or_calculated",
          "include_imputed",
          "any_verified",
        ])
        .optional(),
      status: z.enum(["enabled", "disabled", "future"]),
      notes: z.string().max(400).nullable().optional(),
    }),
  ),
  absorptionFactors: z.array(
    z.strictObject({
      factorType: z.enum([
        "enhancer",
        "inhibitor",
        "form_difference",
        "meal_context",
        "physiological_state",
        "medication",
        "other",
      ]),
      description: z.string().min(10).max(700),
      direction: z.enum([
        "increase",
        "decrease",
        "variable",
        "context_dependent",
      ]),
      sourceIds: z
        .array(
          z.enum([
            "nih_ods_fact_sheets",
            "us_canada_dri_tables",
            "fda_daily_values",
            "icmr_nin_rda_ear_2020",
            "efsa_drv",
            "usda_fooddata_central",
            "fda_nutrition_education",
            "fao_food_energy",
            "nhs_food_education",
          ]),
        )
        .min(1),
      limitations: z.string().max(500).nullable().optional(),
    }),
  ),
  deficiency: z
    .union([
      z.null(),
      z.strictObject({
        overview: z.string().min(10).max(900),
        riskGroups: z.array(z.string().max(300)),
        signsAndSymptoms: z.array(z.string().max(300)),
        medicalBoundary: z.string().min(10).max(500),
        sourceIds: z
          .array(
            z.enum([
              "nih_ods_fact_sheets",
              "us_canada_dri_tables",
              "fda_daily_values",
              "icmr_nin_rda_ear_2020",
              "efsa_drv",
              "usda_fooddata_central",
              "fda_nutrition_education",
              "fao_food_energy",
              "nhs_food_education",
            ]),
          )
          .min(1),
      }),
    ])
    .optional(),
  excess: z
    .union([
      z.null(),
      z.strictObject({
        overview: z.string().min(10).max(900),
        riskGroups: z.array(z.string().max(300)),
        signsAndSymptoms: z.array(z.string().max(300)),
        medicalBoundary: z.string().min(10).max(500),
        sourceIds: z
          .array(
            z.enum([
              "nih_ods_fact_sheets",
              "us_canada_dri_tables",
              "fda_daily_values",
              "icmr_nin_rda_ear_2020",
              "efsa_drv",
              "usda_fooddata_central",
              "fda_nutrition_education",
              "fao_food_energy",
              "nhs_food_education",
            ]),
          )
          .min(1),
      }),
    ])
    .optional(),
  interactions: z.array(
    z.strictObject({
      type: z.enum([
        "nutrient_nutrient",
        "nutrient_medication",
        "nutrient_condition",
        "supplement_food",
      ]),
      counterparty: z.string().min(2).max(160),
      description: z.string().min(10).max(800),
      severity: z.enum([
        "informational",
        "caution",
        "professional_review",
        "urgent",
      ]),
      sourceIds: z
        .array(
          z.enum([
            "nih_ods_fact_sheets",
            "us_canada_dri_tables",
            "fda_daily_values",
            "icmr_nin_rda_ear_2020",
            "efsa_drv",
            "usda_fooddata_central",
            "fda_nutrition_education",
            "fao_food_energy",
            "nhs_food_education",
          ]),
        )
        .min(1),
      limitations: z.string().max(500).nullable().optional(),
    }),
  ),
  athleticRelevance: z.array(
    z.strictObject({
      context: z.enum([
        "strength",
        "hypertrophy",
        "endurance",
        "power",
        "recovery",
        "hydration",
        "general_training",
      ]),
      description: z.string().min(10).max(700),
      evidenceLevel: z.enum([
        "high",
        "moderate",
        "low",
        "insufficient",
        "context_dependent",
      ]),
      sourceIds: z
        .array(
          z.enum([
            "nih_ods_fact_sheets",
            "us_canada_dri_tables",
            "fda_daily_values",
            "icmr_nin_rda_ear_2020",
            "efsa_drv",
            "usda_fooddata_central",
            "fda_nutrition_education",
            "fao_food_energy",
            "nhs_food_education",
          ]),
        )
        .min(1),
    }),
  ),
  claims: z.array(
    z.strictObject({
      claimId: z.string().regex(new RegExp("^claim_[a-z0-9_]+$")),
      text: z.string().min(10).max(900),
      category: z.enum([
        "function",
        "requirement",
        "food_source",
        "absorption",
        "deficiency",
        "excess",
        "interaction",
        "athletic_relevance",
        "conversion",
        "other",
      ]),
      evidenceLevel: z.enum([
        "authoritative_reference",
        "high",
        "moderate",
        "low",
        "insufficient",
        "not_applicable",
      ]),
      population: z.string().min(2).max(200),
      sourceIds: z
        .array(
          z.enum([
            "nih_ods_fact_sheets",
            "us_canada_dri_tables",
            "fda_daily_values",
            "icmr_nin_rda_ear_2020",
            "efsa_drv",
            "usda_fooddata_central",
            "fda_nutrition_education",
            "fao_food_energy",
            "nhs_food_education",
          ]),
        )
        .min(1),
      limitations: z.string().max(600).nullable().optional(),
      reviewStatus: z.enum(["draft", "reviewed", "approved", "rejected"]),
    }),
  ),
  sources: z.array(
    z.strictObject({
      sourceId: z.enum([
        "nih_ods_fact_sheets",
        "us_canada_dri_tables",
        "fda_daily_values",
        "icmr_nin_rda_ear_2020",
        "efsa_drv",
        "usda_fooddata_central",
        "fda_nutrition_education",
        "fao_food_energy",
        "nhs_food_education",
      ]),
      locator: z.string().min(2).max(500),
      accessedAt: z
        .string()
        .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
      notes: z.string().max(500).nullable().optional(),
    }),
  ),
  editorial: z.strictObject({
    reviewStatus: z.enum([
      "not_started",
      "in_progress",
      "scientific_review",
      "editorial_review",
      "approved",
      "changes_required",
    ]),
    reviewedAt: z
      .string()
      .refine((v) => z.iso.date().safeParse(v).success, "Invalid date")
      .nullable(),
    reviewer: z.string().max(120).nullable(),
    notes: z.string().max(800).nullable(),
  }),
});
export const nutrientFormNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^[a-z0-9_]+$")),
  name: z.string().min(1).max(120),
  relationship: z.enum([
    "active_form",
    "precursor",
    "dietary_form",
    "supplement_form",
    "measurement_equivalent",
    "metabolite",
    "family_member",
  ]),
  conversionRule: z.string().max(500).nullable().optional(),
  sourceIds: z
    .array(
      z.enum([
        "nih_ods_fact_sheets",
        "us_canada_dri_tables",
        "fda_daily_values",
        "icmr_nin_rda_ear_2020",
        "efsa_drv",
        "usda_fooddata_central",
        "fda_nutrition_education",
        "fao_food_energy",
        "nhs_food_education",
      ]),
    )
    .optional(),
});
export const functionClaimNormativeSchema = z.strictObject({
  title: z.string().min(2).max(120),
  description: z.string().min(10).max(700),
  sourceIds: z
    .array(
      z.enum([
        "nih_ods_fact_sheets",
        "us_canada_dri_tables",
        "fda_daily_values",
        "icmr_nin_rda_ear_2020",
        "efsa_drv",
        "usda_fooddata_central",
        "fda_nutrition_education",
        "fao_food_energy",
        "nhs_food_education",
      ]),
    )
    .min(1),
});
export const populationNormativeSchema = z.strictObject({
  ageMinMonths: z.number().finite().int().min(0).max(1800),
  ageMaxMonths: z.number().finite().int().min(0).max(1800).nullable(),
  sex: z.enum(["all", "male", "female"]),
  lifeStage: z.enum(["general", "pregnancy", "lactation"]),
  notes: z.string().max(300).nullable().optional(),
});
export const referenceValueNormativeSchema = z.strictObject({
  frameworkId: z.enum([
    "us_canada_dri",
    "fda_dv_adult_4_plus",
    "icmr_nin_2020",
    "efsa_drv",
  ]),
  valueType: z.enum([
    "RDA",
    "AI",
    "EAR",
    "UL",
    "AMDR",
    "CDRR",
    "DV",
    "PRI",
    "AR",
    "RI",
    "TUL",
    "no_value_established",
  ]),
  population: z.strictObject({
    ageMinMonths: z.number().finite().int().min(0).max(1800),
    ageMaxMonths: z.number().finite().int().min(0).max(1800).nullable(),
    sex: z.enum(["all", "male", "female"]),
    lifeStage: z.enum(["general", "pregnancy", "lactation"]),
    notes: z.string().max(300).nullable().optional(),
  }),
  value: z.number().finite().min(0).nullable().optional(),
  minValue: z.number().finite().min(0).nullable().optional(),
  maxValue: z.number().finite().min(0).nullable().optional(),
  unit: z.string().min(1).max(40),
  basis: z
    .enum([
      "per_day",
      "percent_energy",
      "per_kg_body_weight_day",
      "label_reference",
      "other",
    ])
    .optional(),
  sourceId: z.enum([
    "nih_ods_fact_sheets",
    "us_canada_dri_tables",
    "fda_daily_values",
    "icmr_nin_rda_ear_2020",
    "efsa_drv",
    "usda_fooddata_central",
    "fda_nutrition_education",
    "fao_food_energy",
    "nhs_food_education",
  ]),
  status: z.enum([
    "source_verified",
    "manually_verified",
    "pending_review",
    "not_applicable",
  ]),
  notes: z.string().max(600).nullable().optional(),
});
export const foodSourceRuleNormativeSchema = z.strictObject({
  rankingBasis: z.enum([
    "per_100g",
    "per_100kcal",
    "per_verified_portion",
    "qualitative_only",
  ]),
  phase07NutrientId: z.string().nullable(),
  minimumDataStatus: z
    .enum([
      "measured_only",
      "measured_or_calculated",
      "include_imputed",
      "any_verified",
    ])
    .optional(),
  status: z.enum(["enabled", "disabled", "future"]),
  notes: z.string().max(400).nullable().optional(),
});
export const absorptionFactorNormativeSchema = z.strictObject({
  factorType: z.enum([
    "enhancer",
    "inhibitor",
    "form_difference",
    "meal_context",
    "physiological_state",
    "medication",
    "other",
  ]),
  description: z.string().min(10).max(700),
  direction: z.enum(["increase", "decrease", "variable", "context_dependent"]),
  sourceIds: z
    .array(
      z.enum([
        "nih_ods_fact_sheets",
        "us_canada_dri_tables",
        "fda_daily_values",
        "icmr_nin_rda_ear_2020",
        "efsa_drv",
        "usda_fooddata_central",
        "fda_nutrition_education",
        "fao_food_energy",
        "nhs_food_education",
      ]),
    )
    .min(1),
  limitations: z.string().max(500).nullable().optional(),
});
export const deficiencyExcessNormativeSchema = z.strictObject({
  overview: z.string().min(10).max(900),
  riskGroups: z.array(z.string().max(300)),
  signsAndSymptoms: z.array(z.string().max(300)),
  medicalBoundary: z.string().min(10).max(500),
  sourceIds: z
    .array(
      z.enum([
        "nih_ods_fact_sheets",
        "us_canada_dri_tables",
        "fda_daily_values",
        "icmr_nin_rda_ear_2020",
        "efsa_drv",
        "usda_fooddata_central",
        "fda_nutrition_education",
        "fao_food_energy",
        "nhs_food_education",
      ]),
    )
    .min(1),
});
export const interactionNormativeSchema = z.strictObject({
  type: z.enum([
    "nutrient_nutrient",
    "nutrient_medication",
    "nutrient_condition",
    "supplement_food",
  ]),
  counterparty: z.string().min(2).max(160),
  description: z.string().min(10).max(800),
  severity: z.enum([
    "informational",
    "caution",
    "professional_review",
    "urgent",
  ]),
  sourceIds: z
    .array(
      z.enum([
        "nih_ods_fact_sheets",
        "us_canada_dri_tables",
        "fda_daily_values",
        "icmr_nin_rda_ear_2020",
        "efsa_drv",
        "usda_fooddata_central",
        "fda_nutrition_education",
        "fao_food_energy",
        "nhs_food_education",
      ]),
    )
    .min(1),
  limitations: z.string().max(500).nullable().optional(),
});
export const athleticItemNormativeSchema = z.strictObject({
  context: z.enum([
    "strength",
    "hypertrophy",
    "endurance",
    "power",
    "recovery",
    "hydration",
    "general_training",
  ]),
  description: z.string().min(10).max(700),
  evidenceLevel: z.enum([
    "high",
    "moderate",
    "low",
    "insufficient",
    "context_dependent",
  ]),
  sourceIds: z
    .array(
      z.enum([
        "nih_ods_fact_sheets",
        "us_canada_dri_tables",
        "fda_daily_values",
        "icmr_nin_rda_ear_2020",
        "efsa_drv",
        "usda_fooddata_central",
        "fda_nutrition_education",
        "fao_food_energy",
        "nhs_food_education",
      ]),
    )
    .min(1),
});
export const evidenceClaimNormativeSchema = z.strictObject({
  claimId: z.string().regex(new RegExp("^claim_[a-z0-9_]+$")),
  text: z.string().min(10).max(900),
  category: z.enum([
    "function",
    "requirement",
    "food_source",
    "absorption",
    "deficiency",
    "excess",
    "interaction",
    "athletic_relevance",
    "conversion",
    "other",
  ]),
  evidenceLevel: z.enum([
    "authoritative_reference",
    "high",
    "moderate",
    "low",
    "insufficient",
    "not_applicable",
  ]),
  population: z.string().min(2).max(200),
  sourceIds: z
    .array(
      z.enum([
        "nih_ods_fact_sheets",
        "us_canada_dri_tables",
        "fda_daily_values",
        "icmr_nin_rda_ear_2020",
        "efsa_drv",
        "usda_fooddata_central",
        "fda_nutrition_education",
        "fao_food_energy",
        "nhs_food_education",
      ]),
    )
    .min(1),
  limitations: z.string().max(600).nullable().optional(),
  reviewStatus: z.enum(["draft", "reviewed", "approved", "rejected"]),
});
export const sourceCitationNormativeSchema = z.strictObject({
  sourceId: z.enum([
    "nih_ods_fact_sheets",
    "us_canada_dri_tables",
    "fda_daily_values",
    "icmr_nin_rda_ear_2020",
    "efsa_drv",
    "usda_fooddata_central",
    "fda_nutrition_education",
    "fao_food_energy",
    "nhs_food_education",
  ]),
  locator: z.string().min(2).max(500),
  accessedAt: z
    .string()
    .refine((v) => z.iso.date().safeParse(v).success, "Invalid date"),
  notes: z.string().max(500).nullable().optional(),
});
export const editorialNormativeSchema = z.strictObject({
  reviewStatus: z.enum([
    "not_started",
    "in_progress",
    "scientific_review",
    "editorial_review",
    "approved",
    "changes_required",
  ]),
  reviewedAt: z
    .string()
    .refine((v) => z.iso.date().safeParse(v).success, "Invalid date")
    .nullable(),
  reviewer: z.string().max(120).nullable(),
  notes: z.string().max(800).nullable(),
});
