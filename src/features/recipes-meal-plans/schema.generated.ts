// Generated from DOCS_for_entire_apppliaction/GYM/Phase_11_Recipes_Meal_Plans_Data_Schema.json. Conditional recipe/plan snapshots are enforced in schema.ts.
import { z } from "zod";
export const backupNormativeSchema = z.strictObject({
  format: z.literal("fitness-os-recipes-meal-plans-backup"),
  schemaVersion: z.number().finite().int().min(1),
  module: z.literal("recipes-meal-plans"),
  exportedAt: z.iso.datetime({ offset: true }),
  appVersion: z.string().nullable().optional(),
  preferences: z.strictObject({
    id: z.literal("recipe-meal-preferences"),
    schemaVersion: z.number().finite().int().min(1),
    massUnit: z.enum(["g", "oz"]),
    energyUnit: z.enum(["kcal", "kJ"]),
    defaultPlanDays: z.number().finite().int().min(1).max(28),
    defaultMealSlots: z
      .array(z.string().regex(new RegExp("^meal_[a-z0-9_]+$")))
      .min(1)
      .max(12),
    dietaryPreferences: z
      .array(z.string().max(80))
      .refine(
        (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
        "Duplicate array value",
      )
      .optional(),
    excludedIngredientIds: z
      .array(z.string().max(120))
      .refine(
        (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
        "Duplicate array value",
      )
      .optional(),
    excludedAllergenTags: z
      .array(z.string().max(80))
      .refine(
        (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
        "Duplicate array value",
      )
      .optional(),
    requestPersistentStorage: z.boolean().optional(),
    updatedAt: z.iso.datetime({ offset: true }),
  }),
  recipeIdentities: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^recipe_[a-zA-Z0-9_-]+$")),
      schemaVersion: z.number().finite().int().min(1),
      visibility: z.enum(["local", "published_reference"]),
      title: z.string().min(1).max(200),
      slug: z
        .string()
        .regex(new RegExp("^[a-z0-9]+(?:-[a-z0-9]+)*$"))
        .nullable()
        .optional(),
      currentVersionId: z.string().regex(new RegExp("^rver_[a-zA-Z0-9_-]+$")),
      status: z.enum(["active", "archived"]),
      createdAt: z.iso.datetime({ offset: true }),
      updatedAt: z.iso.datetime({ offset: true }),
    }),
  ),
  recipeVersions: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^rver_[a-zA-Z0-9_-]+$")),
      schemaVersion: z.number().finite().int().min(1),
      recipeId: z.string().regex(new RegExp("^recipe_[a-zA-Z0-9_-]+$")),
      versionNumber: z.number().finite().int().min(1),
      title: z.string().min(1).max(200),
      description: z.string().max(3000).nullable().optional(),
      source: z.strictObject({
        kind: z.enum([
          "user_created",
          "original_project_recipe",
          "public_domain_government_recipe",
          "licensed_recipe",
          "adapted_with_permission",
        ]),
        title: z.string().min(1).max(300),
        authorOrPublisher: z.string().max(200).nullable().optional(),
        url: z.string().nullable().optional(),
        sourceId: z.string().max(150).nullable().optional(),
        licenceStatus: z.enum([
          "user_owned",
          "public_domain",
          "licensed",
          "permission_documented",
          "not_for_publication",
        ]),
        licenceText: z.string().max(1000).nullable().optional(),
        adapted: z.boolean().optional(),
        reviewedAt: z.iso.datetime({ offset: true }).nullable().optional(),
      }),
      ingredients: z
        .array(
          z.strictObject({
            id: z.string().regex(new RegExp("^ing_[a-zA-Z0-9_-]+$")),
            order: z.number().finite().int().min(0).max(500),
            kind: z.enum([
              "canonical_food",
              "custom_food",
              "component_recipe",
              "unresolved_text",
              "non_nutritive",
            ]),
            displayNameSnapshot: z.string().min(1).max(200),
            quantity: z.strictObject({
              value: z.number().finite().gt(0),
              unit: z.string().min(1).max(30),
              portionId: z.string().max(120).nullable().optional(),
              gramsPerUnit: z.number().finite().gt(0).nullable().optional(),
              conversionKind: z.enum([
                "exact_mass",
                "verified_portion",
                "measured_serving",
                "not_applicable",
                "unresolved",
              ]),
            }),
            gramWeight: z.number().finite().gt(0).nullable(),
            canonicalFoodRef: z
              .union([
                z.strictObject({
                  foodId: z.string().min(1),
                  profileId: z.string().min(1),
                  foodName: z.string().min(1).max(200),
                  profileState: z.string().min(1).max(100),
                  sourceRecordId: z.string().min(1).max(160),
                  sourceDatabase: z.string().min(1).max(160),
                  sourceRelease: z.string().min(1).max(100),
                  profileReviewedAt: z.iso
                    .datetime({ offset: true })
                    .nullable()
                    .optional(),
                }),
                z.null(),
              ])
              .optional(),
            customFoodRef: z
              .union([
                z.strictObject({
                  customFoodId: z.string().min(1),
                  revisionId: z.string().min(1),
                  displayName: z.string().min(1).max(200),
                }),
                z.null(),
              ])
              .optional(),
            componentRecipeRef: z
              .union([
                z.strictObject({
                  recipeId: z
                    .string()
                    .regex(new RegExp("^recipe_[a-zA-Z0-9_-]+$")),
                  recipeVersionId: z
                    .string()
                    .regex(new RegExp("^rver_[a-zA-Z0-9_-]+$")),
                  title: z.string().min(1).max(200),
                  gramsUsed: z.number().finite().gt(0),
                }),
                z.null(),
              ])
              .optional(),
            nutrients: z.array(
              z.strictObject({
                nutrientId: z.string().min(1),
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
                preCookingAmount: z.number().finite().min(0).nullable(),
                retainedAmount: z.number().finite().min(0).nullable(),
                sourceRecordId: z.string().max(160).nullable().optional(),
              }),
            ),
            retentionAssignments: z
              .array(
                z.strictObject({
                  nutrientId: z.string().min(1),
                  factor: z.number().finite().min(0).max(2),
                  sourceId: z.string().min(1),
                  sourceRelease: z.string().min(1),
                  foodGroup: z.string().min(1).max(120),
                  cookingMethod: z.string().min(1).max(120),
                  applied: z.boolean(),
                  notAppliedReason: z.string().max(500).nullable().optional(),
                }),
              )
              .optional(),
            preparationNote: z.string().max(500).nullable().optional(),
            required: z.boolean(),
            dataQualityFlags: z
              .array(z.string().max(100))
              .refine(
                (v) =>
                  new Set(v.map((i) => JSON.stringify(i))).size === v.length,
                "Duplicate array value",
              ),
          }),
        )
        .min(1)
        .max(250),
      instructions: z
        .array(
          z.strictObject({
            id: z.string().regex(new RegExp("^step_[a-zA-Z0-9_-]+$")),
            order: z.number().finite().int().min(1).max(200),
            text: z.string().min(1).max(2000),
            timerSeconds: z
              .number()
              .finite()
              .int()
              .min(0)
              .max(604800)
              .nullable()
              .optional(),
            equipment: z
              .array(z.string().max(100))
              .refine(
                (v) =>
                  new Set(v.map((i) => JSON.stringify(i))).size === v.length,
                "Duplicate array value",
              )
              .optional(),
            temperatureC: z
              .number()
              .finite()
              .min(-50)
              .max(400)
              .nullable()
              .optional(),
            safetySourceId: z.string().max(150).nullable().optional(),
          }),
        )
        .max(100),
      yieldModel: z.strictObject({
        mode: z.enum([
          "analytical_source",
          "measured_final_weight",
          "measured_servings",
          "estimated_sum_ingredients",
          "serving_count_only",
          "unavailable",
        ]),
        preCookingEdibleWeightGrams: z
          .number()
          .finite()
          .gt(0)
          .nullable()
          .optional(),
        finalWeightGrams: z.number().finite().gt(0).nullable(),
        servings: z.number().finite().gt(0).nullable(),
        servingWeightGrams: z.number().finite().gt(0).nullable(),
        yieldFactor: z.number().finite().gt(0).nullable().optional(),
        tolerancePercent: z.number().finite().min(0).max(25),
        measuredAt: z.iso.datetime({ offset: true }).nullable(),
        note: z.string().max(1000).nullable().optional(),
      }),
      calculation: z.strictObject({
        method: z.enum([
          "analytical",
          "ingredient_sum_no_cook",
          "ingredient_sum_measured_yield",
          "ingredient_sum_retention_adjusted",
          "ingredient_sum_estimated_yield",
          "unavailable",
        ]),
        grade: z.enum(["A", "B", "C", "D", "E"]),
        status: z.enum(["complete", "partial", "unavailable"]),
        methodologyVersion: z.string().min(1),
        retentionDataVersion: z.string().nullable(),
        batchNutrients: z.array(
          z.strictObject({
            nutrientId: z.string().min(1),
            unit: z.string().min(1).max(20),
            batchValue: z.number().finite().min(0).nullable(),
            per100gValue: z.number().finite().min(0).nullable(),
            perServingValue: z.number().finite().min(0).nullable(),
            massCoveragePercent: z.number().finite().min(0).max(100),
            retentionCoveragePercent: z
              .number()
              .finite()
              .min(0)
              .max(100)
              .nullable()
              .optional(),
            status: z.enum([
              "complete",
              "partial",
              "unavailable",
              "not_applicable",
            ]),
            qualityFlags: z
              .array(z.string().max(100))
              .refine(
                (v) =>
                  new Set(v.map((i) => JSON.stringify(i))).size === v.length,
                "Duplicate array value",
              )
              .optional(),
          }),
        ),
        calculatedAt: z.iso.datetime({ offset: true }),
        warnings: z.array(z.string().max(500)).optional(),
      }),
      tags: z.strictObject({
        mealTypes: z
          .array(z.string().max(80))
          .refine(
            (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
            "Duplicate array value",
          ),
        cuisines: z
          .array(z.string().max(80))
          .refine(
            (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
            "Duplicate array value",
          ),
        dietary: z
          .array(z.string().max(80))
          .refine(
            (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
            "Duplicate array value",
          ),
        equipment: z
          .array(z.string().max(80))
          .refine(
            (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
            "Duplicate array value",
          ),
        budget: z.string().max(50).nullable().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
      }),
      allergenInfo: z.array(
        z.strictObject({
          tag: z.string().min(1).max(80),
          state: z.enum([
            "contains",
            "may_contain_or_uncertain",
            "not_declared",
            "unknown",
          ]),
          basis: z.string().min(1).max(500),
        }),
      ),
      prepMinutes: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(10080)
        .nullable()
        .optional(),
      cookMinutes: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(10080)
        .nullable()
        .optional(),
      equipment: z
        .array(z.string().max(100))
        .refine(
          (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
          "Duplicate array value",
        )
        .optional(),
      storageNotes: z.string().max(2000).nullable().optional(),
      safetyNotes: z
        .array(
          z.strictObject({
            text: z.string().min(1).max(1000),
            sourceId: z.string().min(1).max(150),
          }),
        )
        .optional(),
      createdAt: z.iso.datetime({ offset: true }),
      revisionReason: z.string().min(1).max(500),
    }),
  ),
  mealPlanIdentities: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^mplan_[a-zA-Z0-9_-]+$")),
      schemaVersion: z.number().finite().int().min(1),
      title: z.string().min(1).max(200),
      currentVersionId: z.string().regex(new RegExp("^mpver_[a-zA-Z0-9_-]+$")),
      status: z.enum(["active", "archived"]),
      createdAt: z.iso.datetime({ offset: true }),
      updatedAt: z.iso.datetime({ offset: true }),
    }),
  ),
  mealPlanVersions: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^mpver_[a-zA-Z0-9_-]+$")),
      schemaVersion: z.number().finite().int().min(1),
      mealPlanId: z.string().regex(new RegExp("^mplan_[a-zA-Z0-9_-]+$")),
      versionNumber: z.number().finite().int().min(1),
      title: z.string().min(1).max(200),
      startDate: z.iso.date(),
      dayCount: z.number().finite().int().min(1).max(28),
      timeZone: z.string().min(1).max(80),
      targetSnapshot: z.record(z.string(), z.json()).nullable(),
      referenceSnapshots: z.array(z.record(z.string(), z.json())),
      mealSlots: z
        .array(z.string().regex(new RegExp("^meal_[a-z0-9_]+$")))
        .min(1)
        .max(12),
      dietaryPreferences: z
        .array(z.string().max(80))
        .refine(
          (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
          "Duplicate array value",
        )
        .optional(),
      exclusions: z
        .array(z.string().max(120))
        .refine(
          (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
          "Duplicate array value",
        )
        .optional(),
      plannedItems: z.array(
        z.strictObject({
          id: z.string().regex(new RegExp("^pitem_[a-zA-Z0-9_-]+$")),
          localDate: z.iso.date(),
          mealSlotId: z.string().regex(new RegExp("^meal_[a-z0-9_]+$")),
          kind: z.enum([
            "recipe",
            "canonical_food",
            "custom_food",
            "placeholder",
          ]),
          displayNameSnapshot: z.string().min(1).max(200),
          recipeRef: z.record(z.string(), z.json()).nullable().optional(),
          canonicalFoodRef: z
            .record(z.string(), z.json())
            .nullable()
            .optional(),
          customFoodRef: z.record(z.string(), z.json()).nullable().optional(),
          quantity: z.number().finite().gt(0),
          quantityUnit: z.string().min(1).max(30).optional(),
          gramWeight: z.number().finite().gt(0).nullable().optional(),
          nutrients: z.array(
            z.strictObject({
              nutrientId: z.string().min(1),
              unit: z.string().min(1).max(20),
              value: z.number().finite().min(0).nullable(),
              status: z.enum(["complete", "partial", "unavailable"]),
            }),
          ),
          completeness: z.enum(["complete", "partial", "unavailable"]),
          batchAllocationId: z
            .string()
            .regex(new RegExp("^alloc_[a-zA-Z0-9_-]+$"))
            .nullable()
            .optional(),
          note: z.string().max(1000).nullable().optional(),
          loggedEntryIds: z
            .array(z.string().max(120))
            .refine(
              (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
              "Duplicate array value",
            ),
        }),
      ),
      batchIds: z
        .array(z.string().regex(new RegExp("^batch_[a-zA-Z0-9_-]+$")))
        .refine(
          (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
          "Duplicate array value",
        ),
      summary: z.strictObject({
        dailySummaries: z.array(z.record(z.string(), z.json())),
        averageNutrients: z.array(
          z.strictObject({
            nutrientId: z.string().min(1),
            unit: z.string().min(1).max(20),
            value: z.number().finite().min(0).nullable(),
            status: z.enum(["complete", "partial", "unavailable"]),
          }),
        ),
        completeness: z.enum(["complete", "partial", "unavailable"]),
        calculatedAt: z.iso.datetime({ offset: true }),
      }),
      groceryListId: z
        .string()
        .regex(new RegExp("^glist_[a-zA-Z0-9_-]+$"))
        .nullable()
        .optional(),
      createdAt: z.iso.datetime({ offset: true }),
      revisionReason: z.string().min(1).max(500),
    }),
  ),
  batchInstances: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^batch_[a-zA-Z0-9_-]+$")),
      mealPlanVersionId: z.string().regex(new RegExp("^mpver_[a-zA-Z0-9_-]+$")),
      recipeVersionId: z.string().regex(new RegExp("^rver_[a-zA-Z0-9_-]+$")),
      productionDate: z.iso.date(),
      totalServingEquivalents: z.number().finite().gt(0),
      allocations: z.array(
        z.strictObject({
          id: z.string().regex(new RegExp("^alloc_[a-zA-Z0-9_-]+$")),
          plannedItemId: z.string().regex(new RegExp("^pitem_[a-zA-Z0-9_-]+$")),
          servingEquivalents: z.number().finite().gt(0),
        }),
      ),
      storageNote: z.string().max(1000).nullable().optional(),
    }),
  ),
  groceryLists: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^glist_[a-zA-Z0-9_-]+$")),
      schemaVersion: z.number().finite().int().min(1),
      mealPlanVersionId: z.string().regex(new RegExp("^mpver_[a-zA-Z0-9_-]+$")),
      generatedAt: z.iso.datetime({ offset: true }),
      items: z.array(
        z.strictObject({
          id: z.string().regex(new RegExp("^gitem_[a-zA-Z0-9_-]+$")),
          mergeKey: z.string().min(1).max(400),
          displayName: z.string().min(1).max(200),
          requiredGrams: z.number().finite().min(0).nullable(),
          onHandGrams: z.number().finite().min(0).nullable(),
          remainingGrams: z.number().finite().min(0).nullable(),
          practicalPurchaseQuantity: z.string().max(200).nullable().optional(),
          sourceRefs: z.array(z.string().max(150)),
          storeSection: z.string().min(1).max(80),
          purchased: z.boolean(),
          note: z.string().max(500).nullable().optional(),
          qualityFlags: z
            .array(z.string().max(100))
            .refine(
              (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
              "Duplicate array value",
            )
            .optional(),
        }),
      ),
      status: z.enum(["active", "archived"]),
    }),
  ),
  favourites: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^fav_[a-zA-Z0-9_-]+$")),
      kind: z.enum(["recipe", "meal_plan_template"]),
      referenceId: z.string().min(1),
      createdAt: z.iso.datetime({ offset: true }),
    }),
  ),
  auditLog: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^audit_[a-zA-Z0-9_-]+$")),
      action: z.string().min(1).max(100),
      entityType: z.string().min(1).max(100),
      entityId: z.string().min(1).max(160),
      detail: z.string().max(2000).nullable().optional(),
      occurredAt: z.iso.datetime({ offset: true }),
    }),
  ),
});
export const preferencesNormativeSchema = z.strictObject({
  id: z.literal("recipe-meal-preferences"),
  schemaVersion: z.number().finite().int().min(1),
  massUnit: z.enum(["g", "oz"]),
  energyUnit: z.enum(["kcal", "kJ"]),
  defaultPlanDays: z.number().finite().int().min(1).max(28),
  defaultMealSlots: z
    .array(z.string().regex(new RegExp("^meal_[a-z0-9_]+$")))
    .min(1)
    .max(12),
  dietaryPreferences: z
    .array(z.string().max(80))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
  excludedIngredientIds: z
    .array(z.string().max(120))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
  excludedAllergenTags: z
    .array(z.string().max(80))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
  requestPersistentStorage: z.boolean().optional(),
  updatedAt: z.iso.datetime({ offset: true }),
});
export const recipeIdentityNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^recipe_[a-zA-Z0-9_-]+$")),
  schemaVersion: z.number().finite().int().min(1),
  visibility: z.enum(["local", "published_reference"]),
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(new RegExp("^[a-z0-9]+(?:-[a-z0-9]+)*$"))
    .nullable()
    .optional(),
  currentVersionId: z.string().regex(new RegExp("^rver_[a-zA-Z0-9_-]+$")),
  status: z.enum(["active", "archived"]),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});
export const recipeVersionNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^rver_[a-zA-Z0-9_-]+$")),
  schemaVersion: z.number().finite().int().min(1),
  recipeId: z.string().regex(new RegExp("^recipe_[a-zA-Z0-9_-]+$")),
  versionNumber: z.number().finite().int().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(3000).nullable().optional(),
  source: z.strictObject({
    kind: z.enum([
      "user_created",
      "original_project_recipe",
      "public_domain_government_recipe",
      "licensed_recipe",
      "adapted_with_permission",
    ]),
    title: z.string().min(1).max(300),
    authorOrPublisher: z.string().max(200).nullable().optional(),
    url: z.string().nullable().optional(),
    sourceId: z.string().max(150).nullable().optional(),
    licenceStatus: z.enum([
      "user_owned",
      "public_domain",
      "licensed",
      "permission_documented",
      "not_for_publication",
    ]),
    licenceText: z.string().max(1000).nullable().optional(),
    adapted: z.boolean().optional(),
    reviewedAt: z.iso.datetime({ offset: true }).nullable().optional(),
  }),
  ingredients: z
    .array(
      z.strictObject({
        id: z.string().regex(new RegExp("^ing_[a-zA-Z0-9_-]+$")),
        order: z.number().finite().int().min(0).max(500),
        kind: z.enum([
          "canonical_food",
          "custom_food",
          "component_recipe",
          "unresolved_text",
          "non_nutritive",
        ]),
        displayNameSnapshot: z.string().min(1).max(200),
        quantity: z.strictObject({
          value: z.number().finite().gt(0),
          unit: z.string().min(1).max(30),
          portionId: z.string().max(120).nullable().optional(),
          gramsPerUnit: z.number().finite().gt(0).nullable().optional(),
          conversionKind: z.enum([
            "exact_mass",
            "verified_portion",
            "measured_serving",
            "not_applicable",
            "unresolved",
          ]),
        }),
        gramWeight: z.number().finite().gt(0).nullable(),
        canonicalFoodRef: z
          .union([
            z.strictObject({
              foodId: z.string().min(1),
              profileId: z.string().min(1),
              foodName: z.string().min(1).max(200),
              profileState: z.string().min(1).max(100),
              sourceRecordId: z.string().min(1).max(160),
              sourceDatabase: z.string().min(1).max(160),
              sourceRelease: z.string().min(1).max(100),
              profileReviewedAt: z.iso
                .datetime({ offset: true })
                .nullable()
                .optional(),
            }),
            z.null(),
          ])
          .optional(),
        customFoodRef: z
          .union([
            z.strictObject({
              customFoodId: z.string().min(1),
              revisionId: z.string().min(1),
              displayName: z.string().min(1).max(200),
            }),
            z.null(),
          ])
          .optional(),
        componentRecipeRef: z
          .union([
            z.strictObject({
              recipeId: z.string().regex(new RegExp("^recipe_[a-zA-Z0-9_-]+$")),
              recipeVersionId: z
                .string()
                .regex(new RegExp("^rver_[a-zA-Z0-9_-]+$")),
              title: z.string().min(1).max(200),
              gramsUsed: z.number().finite().gt(0),
            }),
            z.null(),
          ])
          .optional(),
        nutrients: z.array(
          z.strictObject({
            nutrientId: z.string().min(1),
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
            preCookingAmount: z.number().finite().min(0).nullable(),
            retainedAmount: z.number().finite().min(0).nullable(),
            sourceRecordId: z.string().max(160).nullable().optional(),
          }),
        ),
        retentionAssignments: z
          .array(
            z.strictObject({
              nutrientId: z.string().min(1),
              factor: z.number().finite().min(0).max(2),
              sourceId: z.string().min(1),
              sourceRelease: z.string().min(1),
              foodGroup: z.string().min(1).max(120),
              cookingMethod: z.string().min(1).max(120),
              applied: z.boolean(),
              notAppliedReason: z.string().max(500).nullable().optional(),
            }),
          )
          .optional(),
        preparationNote: z.string().max(500).nullable().optional(),
        required: z.boolean(),
        dataQualityFlags: z
          .array(z.string().max(100))
          .refine(
            (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
            "Duplicate array value",
          ),
      }),
    )
    .min(1)
    .max(250),
  instructions: z
    .array(
      z.strictObject({
        id: z.string().regex(new RegExp("^step_[a-zA-Z0-9_-]+$")),
        order: z.number().finite().int().min(1).max(200),
        text: z.string().min(1).max(2000),
        timerSeconds: z
          .number()
          .finite()
          .int()
          .min(0)
          .max(604800)
          .nullable()
          .optional(),
        equipment: z
          .array(z.string().max(100))
          .refine(
            (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
            "Duplicate array value",
          )
          .optional(),
        temperatureC: z
          .number()
          .finite()
          .min(-50)
          .max(400)
          .nullable()
          .optional(),
        safetySourceId: z.string().max(150).nullable().optional(),
      }),
    )
    .max(100),
  yieldModel: z.strictObject({
    mode: z.enum([
      "analytical_source",
      "measured_final_weight",
      "measured_servings",
      "estimated_sum_ingredients",
      "serving_count_only",
      "unavailable",
    ]),
    preCookingEdibleWeightGrams: z
      .number()
      .finite()
      .gt(0)
      .nullable()
      .optional(),
    finalWeightGrams: z.number().finite().gt(0).nullable(),
    servings: z.number().finite().gt(0).nullable(),
    servingWeightGrams: z.number().finite().gt(0).nullable(),
    yieldFactor: z.number().finite().gt(0).nullable().optional(),
    tolerancePercent: z.number().finite().min(0).max(25),
    measuredAt: z.iso.datetime({ offset: true }).nullable(),
    note: z.string().max(1000).nullable().optional(),
  }),
  calculation: z.strictObject({
    method: z.enum([
      "analytical",
      "ingredient_sum_no_cook",
      "ingredient_sum_measured_yield",
      "ingredient_sum_retention_adjusted",
      "ingredient_sum_estimated_yield",
      "unavailable",
    ]),
    grade: z.enum(["A", "B", "C", "D", "E"]),
    status: z.enum(["complete", "partial", "unavailable"]),
    methodologyVersion: z.string().min(1),
    retentionDataVersion: z.string().nullable(),
    batchNutrients: z.array(
      z.strictObject({
        nutrientId: z.string().min(1),
        unit: z.string().min(1).max(20),
        batchValue: z.number().finite().min(0).nullable(),
        per100gValue: z.number().finite().min(0).nullable(),
        perServingValue: z.number().finite().min(0).nullable(),
        massCoveragePercent: z.number().finite().min(0).max(100),
        retentionCoveragePercent: z
          .number()
          .finite()
          .min(0)
          .max(100)
          .nullable()
          .optional(),
        status: z.enum([
          "complete",
          "partial",
          "unavailable",
          "not_applicable",
        ]),
        qualityFlags: z
          .array(z.string().max(100))
          .refine(
            (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
            "Duplicate array value",
          )
          .optional(),
      }),
    ),
    calculatedAt: z.iso.datetime({ offset: true }),
    warnings: z.array(z.string().max(500)).optional(),
  }),
  tags: z.strictObject({
    mealTypes: z
      .array(z.string().max(80))
      .refine(
        (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
        "Duplicate array value",
      ),
    cuisines: z
      .array(z.string().max(80))
      .refine(
        (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
        "Duplicate array value",
      ),
    dietary: z
      .array(z.string().max(80))
      .refine(
        (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
        "Duplicate array value",
      ),
    equipment: z
      .array(z.string().max(80))
      .refine(
        (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
        "Duplicate array value",
      ),
    budget: z.string().max(50).nullable().optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  }),
  allergenInfo: z.array(
    z.strictObject({
      tag: z.string().min(1).max(80),
      state: z.enum([
        "contains",
        "may_contain_or_uncertain",
        "not_declared",
        "unknown",
      ]),
      basis: z.string().min(1).max(500),
    }),
  ),
  prepMinutes: z
    .number()
    .finite()
    .int()
    .min(0)
    .max(10080)
    .nullable()
    .optional(),
  cookMinutes: z
    .number()
    .finite()
    .int()
    .min(0)
    .max(10080)
    .nullable()
    .optional(),
  equipment: z
    .array(z.string().max(100))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
  storageNotes: z.string().max(2000).nullable().optional(),
  safetyNotes: z
    .array(
      z.strictObject({
        text: z.string().min(1).max(1000),
        sourceId: z.string().min(1).max(150),
      }),
    )
    .optional(),
  createdAt: z.iso.datetime({ offset: true }),
  revisionReason: z.string().min(1).max(500),
});
export const sourceMetadataNormativeSchema = z.strictObject({
  kind: z.enum([
    "user_created",
    "original_project_recipe",
    "public_domain_government_recipe",
    "licensed_recipe",
    "adapted_with_permission",
  ]),
  title: z.string().min(1).max(300),
  authorOrPublisher: z.string().max(200).nullable().optional(),
  url: z.string().nullable().optional(),
  sourceId: z.string().max(150).nullable().optional(),
  licenceStatus: z.enum([
    "user_owned",
    "public_domain",
    "licensed",
    "permission_documented",
    "not_for_publication",
  ]),
  licenceText: z.string().max(1000).nullable().optional(),
  adapted: z.boolean().optional(),
  reviewedAt: z.iso.datetime({ offset: true }).nullable().optional(),
});
export const ingredientLineNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^ing_[a-zA-Z0-9_-]+$")),
  order: z.number().finite().int().min(0).max(500),
  kind: z.enum([
    "canonical_food",
    "custom_food",
    "component_recipe",
    "unresolved_text",
    "non_nutritive",
  ]),
  displayNameSnapshot: z.string().min(1).max(200),
  quantity: z.strictObject({
    value: z.number().finite().gt(0),
    unit: z.string().min(1).max(30),
    portionId: z.string().max(120).nullable().optional(),
    gramsPerUnit: z.number().finite().gt(0).nullable().optional(),
    conversionKind: z.enum([
      "exact_mass",
      "verified_portion",
      "measured_serving",
      "not_applicable",
      "unresolved",
    ]),
  }),
  gramWeight: z.number().finite().gt(0).nullable(),
  canonicalFoodRef: z
    .union([
      z.strictObject({
        foodId: z.string().min(1),
        profileId: z.string().min(1),
        foodName: z.string().min(1).max(200),
        profileState: z.string().min(1).max(100),
        sourceRecordId: z.string().min(1).max(160),
        sourceDatabase: z.string().min(1).max(160),
        sourceRelease: z.string().min(1).max(100),
        profileReviewedAt: z.iso
          .datetime({ offset: true })
          .nullable()
          .optional(),
      }),
      z.null(),
    ])
    .optional(),
  customFoodRef: z
    .union([
      z.strictObject({
        customFoodId: z.string().min(1),
        revisionId: z.string().min(1),
        displayName: z.string().min(1).max(200),
      }),
      z.null(),
    ])
    .optional(),
  componentRecipeRef: z
    .union([
      z.strictObject({
        recipeId: z.string().regex(new RegExp("^recipe_[a-zA-Z0-9_-]+$")),
        recipeVersionId: z.string().regex(new RegExp("^rver_[a-zA-Z0-9_-]+$")),
        title: z.string().min(1).max(200),
        gramsUsed: z.number().finite().gt(0),
      }),
      z.null(),
    ])
    .optional(),
  nutrients: z.array(
    z.strictObject({
      nutrientId: z.string().min(1),
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
      preCookingAmount: z.number().finite().min(0).nullable(),
      retainedAmount: z.number().finite().min(0).nullable(),
      sourceRecordId: z.string().max(160).nullable().optional(),
    }),
  ),
  retentionAssignments: z
    .array(
      z.strictObject({
        nutrientId: z.string().min(1),
        factor: z.number().finite().min(0).max(2),
        sourceId: z.string().min(1),
        sourceRelease: z.string().min(1),
        foodGroup: z.string().min(1).max(120),
        cookingMethod: z.string().min(1).max(120),
        applied: z.boolean(),
        notAppliedReason: z.string().max(500).nullable().optional(),
      }),
    )
    .optional(),
  preparationNote: z.string().max(500).nullable().optional(),
  required: z.boolean(),
  dataQualityFlags: z
    .array(z.string().max(100))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    ),
});
export const quantityNormativeSchema = z.strictObject({
  value: z.number().finite().gt(0),
  unit: z.string().min(1).max(30),
  portionId: z.string().max(120).nullable().optional(),
  gramsPerUnit: z.number().finite().gt(0).nullable().optional(),
  conversionKind: z.enum([
    "exact_mass",
    "verified_portion",
    "measured_serving",
    "not_applicable",
    "unresolved",
  ]),
});
export const canonicalFoodRefNormativeSchema = z.strictObject({
  foodId: z.string().min(1),
  profileId: z.string().min(1),
  foodName: z.string().min(1).max(200),
  profileState: z.string().min(1).max(100),
  sourceRecordId: z.string().min(1).max(160),
  sourceDatabase: z.string().min(1).max(160),
  sourceRelease: z.string().min(1).max(100),
  profileReviewedAt: z.iso.datetime({ offset: true }).nullable().optional(),
});
export const customFoodRefNormativeSchema = z.strictObject({
  customFoodId: z.string().min(1),
  revisionId: z.string().min(1),
  displayName: z.string().min(1).max(200),
});
export const componentRecipeRefNormativeSchema = z.strictObject({
  recipeId: z.string().regex(new RegExp("^recipe_[a-zA-Z0-9_-]+$")),
  recipeVersionId: z.string().regex(new RegExp("^rver_[a-zA-Z0-9_-]+$")),
  title: z.string().min(1).max(200),
  gramsUsed: z.number().finite().gt(0),
});
export const ingredientNutrientNormativeSchema = z.strictObject({
  nutrientId: z.string().min(1),
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
  preCookingAmount: z.number().finite().min(0).nullable(),
  retainedAmount: z.number().finite().min(0).nullable(),
  sourceRecordId: z.string().max(160).nullable().optional(),
});
export const retentionAssignmentNormativeSchema = z.strictObject({
  nutrientId: z.string().min(1),
  factor: z.number().finite().min(0).max(2),
  sourceId: z.string().min(1),
  sourceRelease: z.string().min(1),
  foodGroup: z.string().min(1).max(120),
  cookingMethod: z.string().min(1).max(120),
  applied: z.boolean(),
  notAppliedReason: z.string().max(500).nullable().optional(),
});
export const instructionStepNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^step_[a-zA-Z0-9_-]+$")),
  order: z.number().finite().int().min(1).max(200),
  text: z.string().min(1).max(2000),
  timerSeconds: z
    .number()
    .finite()
    .int()
    .min(0)
    .max(604800)
    .nullable()
    .optional(),
  equipment: z
    .array(z.string().max(100))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
  temperatureC: z.number().finite().min(-50).max(400).nullable().optional(),
  safetySourceId: z.string().max(150).nullable().optional(),
});
export const yieldModelNormativeSchema = z.strictObject({
  mode: z.enum([
    "analytical_source",
    "measured_final_weight",
    "measured_servings",
    "estimated_sum_ingredients",
    "serving_count_only",
    "unavailable",
  ]),
  preCookingEdibleWeightGrams: z.number().finite().gt(0).nullable().optional(),
  finalWeightGrams: z.number().finite().gt(0).nullable(),
  servings: z.number().finite().gt(0).nullable(),
  servingWeightGrams: z.number().finite().gt(0).nullable(),
  yieldFactor: z.number().finite().gt(0).nullable().optional(),
  tolerancePercent: z.number().finite().min(0).max(25),
  measuredAt: z.iso.datetime({ offset: true }).nullable(),
  note: z.string().max(1000).nullable().optional(),
});
export const recipeCalculationNormativeSchema = z.strictObject({
  method: z.enum([
    "analytical",
    "ingredient_sum_no_cook",
    "ingredient_sum_measured_yield",
    "ingredient_sum_retention_adjusted",
    "ingredient_sum_estimated_yield",
    "unavailable",
  ]),
  grade: z.enum(["A", "B", "C", "D", "E"]),
  status: z.enum(["complete", "partial", "unavailable"]),
  methodologyVersion: z.string().min(1),
  retentionDataVersion: z.string().nullable(),
  batchNutrients: z.array(
    z.strictObject({
      nutrientId: z.string().min(1),
      unit: z.string().min(1).max(20),
      batchValue: z.number().finite().min(0).nullable(),
      per100gValue: z.number().finite().min(0).nullable(),
      perServingValue: z.number().finite().min(0).nullable(),
      massCoveragePercent: z.number().finite().min(0).max(100),
      retentionCoveragePercent: z
        .number()
        .finite()
        .min(0)
        .max(100)
        .nullable()
        .optional(),
      status: z.enum(["complete", "partial", "unavailable", "not_applicable"]),
      qualityFlags: z
        .array(z.string().max(100))
        .refine(
          (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
          "Duplicate array value",
        )
        .optional(),
    }),
  ),
  calculatedAt: z.iso.datetime({ offset: true }),
  warnings: z.array(z.string().max(500)).optional(),
});
export const recipeNutrientNormativeSchema = z.strictObject({
  nutrientId: z.string().min(1),
  unit: z.string().min(1).max(20),
  batchValue: z.number().finite().min(0).nullable(),
  per100gValue: z.number().finite().min(0).nullable(),
  perServingValue: z.number().finite().min(0).nullable(),
  massCoveragePercent: z.number().finite().min(0).max(100),
  retentionCoveragePercent: z
    .number()
    .finite()
    .min(0)
    .max(100)
    .nullable()
    .optional(),
  status: z.enum(["complete", "partial", "unavailable", "not_applicable"]),
  qualityFlags: z
    .array(z.string().max(100))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
});
export const recipeTagsNormativeSchema = z.strictObject({
  mealTypes: z
    .array(z.string().max(80))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    ),
  cuisines: z
    .array(z.string().max(80))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    ),
  dietary: z
    .array(z.string().max(80))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    ),
  equipment: z
    .array(z.string().max(80))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    ),
  budget: z.string().max(50).nullable().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});
export const allergenRecordNormativeSchema = z.strictObject({
  tag: z.string().min(1).max(80),
  state: z.enum([
    "contains",
    "may_contain_or_uncertain",
    "not_declared",
    "unknown",
  ]),
  basis: z.string().min(1).max(500),
});
export const safetyNoteNormativeSchema = z.strictObject({
  text: z.string().min(1).max(1000),
  sourceId: z.string().min(1).max(150),
});
export const mealPlanIdentityNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^mplan_[a-zA-Z0-9_-]+$")),
  schemaVersion: z.number().finite().int().min(1),
  title: z.string().min(1).max(200),
  currentVersionId: z.string().regex(new RegExp("^mpver_[a-zA-Z0-9_-]+$")),
  status: z.enum(["active", "archived"]),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});
export const mealPlanVersionNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^mpver_[a-zA-Z0-9_-]+$")),
  schemaVersion: z.number().finite().int().min(1),
  mealPlanId: z.string().regex(new RegExp("^mplan_[a-zA-Z0-9_-]+$")),
  versionNumber: z.number().finite().int().min(1),
  title: z.string().min(1).max(200),
  startDate: z.iso.date(),
  dayCount: z.number().finite().int().min(1).max(28),
  timeZone: z.string().min(1).max(80),
  targetSnapshot: z.record(z.string(), z.json()).nullable(),
  referenceSnapshots: z.array(z.record(z.string(), z.json())),
  mealSlots: z
    .array(z.string().regex(new RegExp("^meal_[a-z0-9_]+$")))
    .min(1)
    .max(12),
  dietaryPreferences: z
    .array(z.string().max(80))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
  exclusions: z
    .array(z.string().max(120))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
  plannedItems: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^pitem_[a-zA-Z0-9_-]+$")),
      localDate: z.iso.date(),
      mealSlotId: z.string().regex(new RegExp("^meal_[a-z0-9_]+$")),
      kind: z.enum(["recipe", "canonical_food", "custom_food", "placeholder"]),
      displayNameSnapshot: z.string().min(1).max(200),
      recipeRef: z.record(z.string(), z.json()).nullable().optional(),
      canonicalFoodRef: z.record(z.string(), z.json()).nullable().optional(),
      customFoodRef: z.record(z.string(), z.json()).nullable().optional(),
      quantity: z.number().finite().gt(0),
      quantityUnit: z.string().min(1).max(30).optional(),
      gramWeight: z.number().finite().gt(0).nullable().optional(),
      nutrients: z.array(
        z.strictObject({
          nutrientId: z.string().min(1),
          unit: z.string().min(1).max(20),
          value: z.number().finite().min(0).nullable(),
          status: z.enum(["complete", "partial", "unavailable"]),
        }),
      ),
      completeness: z.enum(["complete", "partial", "unavailable"]),
      batchAllocationId: z
        .string()
        .regex(new RegExp("^alloc_[a-zA-Z0-9_-]+$"))
        .nullable()
        .optional(),
      note: z.string().max(1000).nullable().optional(),
      loggedEntryIds: z
        .array(z.string().max(120))
        .refine(
          (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
          "Duplicate array value",
        ),
    }),
  ),
  batchIds: z
    .array(z.string().regex(new RegExp("^batch_[a-zA-Z0-9_-]+$")))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    ),
  summary: z.strictObject({
    dailySummaries: z.array(z.record(z.string(), z.json())),
    averageNutrients: z.array(
      z.strictObject({
        nutrientId: z.string().min(1),
        unit: z.string().min(1).max(20),
        value: z.number().finite().min(0).nullable(),
        status: z.enum(["complete", "partial", "unavailable"]),
      }),
    ),
    completeness: z.enum(["complete", "partial", "unavailable"]),
    calculatedAt: z.iso.datetime({ offset: true }),
  }),
  groceryListId: z
    .string()
    .regex(new RegExp("^glist_[a-zA-Z0-9_-]+$"))
    .nullable()
    .optional(),
  createdAt: z.iso.datetime({ offset: true }),
  revisionReason: z.string().min(1).max(500),
});
export const plannedItemNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^pitem_[a-zA-Z0-9_-]+$")),
  localDate: z.iso.date(),
  mealSlotId: z.string().regex(new RegExp("^meal_[a-z0-9_]+$")),
  kind: z.enum(["recipe", "canonical_food", "custom_food", "placeholder"]),
  displayNameSnapshot: z.string().min(1).max(200),
  recipeRef: z.record(z.string(), z.json()).nullable().optional(),
  canonicalFoodRef: z.record(z.string(), z.json()).nullable().optional(),
  customFoodRef: z.record(z.string(), z.json()).nullable().optional(),
  quantity: z.number().finite().gt(0),
  quantityUnit: z.string().min(1).max(30).optional(),
  gramWeight: z.number().finite().gt(0).nullable().optional(),
  nutrients: z.array(
    z.strictObject({
      nutrientId: z.string().min(1),
      unit: z.string().min(1).max(20),
      value: z.number().finite().min(0).nullable(),
      status: z.enum(["complete", "partial", "unavailable"]),
    }),
  ),
  completeness: z.enum(["complete", "partial", "unavailable"]),
  batchAllocationId: z
    .string()
    .regex(new RegExp("^alloc_[a-zA-Z0-9_-]+$"))
    .nullable()
    .optional(),
  note: z.string().max(1000).nullable().optional(),
  loggedEntryIds: z
    .array(z.string().max(120))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    ),
});
export const plannedNutrientNormativeSchema = z.strictObject({
  nutrientId: z.string().min(1),
  unit: z.string().min(1).max(20),
  value: z.number().finite().min(0).nullable(),
  status: z.enum(["complete", "partial", "unavailable"]),
});
export const planSummaryNormativeSchema = z.strictObject({
  dailySummaries: z.array(z.record(z.string(), z.json())),
  averageNutrients: z.array(
    z.strictObject({
      nutrientId: z.string().min(1),
      unit: z.string().min(1).max(20),
      value: z.number().finite().min(0).nullable(),
      status: z.enum(["complete", "partial", "unavailable"]),
    }),
  ),
  completeness: z.enum(["complete", "partial", "unavailable"]),
  calculatedAt: z.iso.datetime({ offset: true }),
});
export const batchInstanceNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^batch_[a-zA-Z0-9_-]+$")),
  mealPlanVersionId: z.string().regex(new RegExp("^mpver_[a-zA-Z0-9_-]+$")),
  recipeVersionId: z.string().regex(new RegExp("^rver_[a-zA-Z0-9_-]+$")),
  productionDate: z.iso.date(),
  totalServingEquivalents: z.number().finite().gt(0),
  allocations: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^alloc_[a-zA-Z0-9_-]+$")),
      plannedItemId: z.string().regex(new RegExp("^pitem_[a-zA-Z0-9_-]+$")),
      servingEquivalents: z.number().finite().gt(0),
    }),
  ),
  storageNote: z.string().max(1000).nullable().optional(),
});
export const batchAllocationNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^alloc_[a-zA-Z0-9_-]+$")),
  plannedItemId: z.string().regex(new RegExp("^pitem_[a-zA-Z0-9_-]+$")),
  servingEquivalents: z.number().finite().gt(0),
});
export const groceryListNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^glist_[a-zA-Z0-9_-]+$")),
  schemaVersion: z.number().finite().int().min(1),
  mealPlanVersionId: z.string().regex(new RegExp("^mpver_[a-zA-Z0-9_-]+$")),
  generatedAt: z.iso.datetime({ offset: true }),
  items: z.array(
    z.strictObject({
      id: z.string().regex(new RegExp("^gitem_[a-zA-Z0-9_-]+$")),
      mergeKey: z.string().min(1).max(400),
      displayName: z.string().min(1).max(200),
      requiredGrams: z.number().finite().min(0).nullable(),
      onHandGrams: z.number().finite().min(0).nullable(),
      remainingGrams: z.number().finite().min(0).nullable(),
      practicalPurchaseQuantity: z.string().max(200).nullable().optional(),
      sourceRefs: z.array(z.string().max(150)),
      storeSection: z.string().min(1).max(80),
      purchased: z.boolean(),
      note: z.string().max(500).nullable().optional(),
      qualityFlags: z
        .array(z.string().max(100))
        .refine(
          (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
          "Duplicate array value",
        )
        .optional(),
    }),
  ),
  status: z.enum(["active", "archived"]),
});
export const groceryItemNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^gitem_[a-zA-Z0-9_-]+$")),
  mergeKey: z.string().min(1).max(400),
  displayName: z.string().min(1).max(200),
  requiredGrams: z.number().finite().min(0).nullable(),
  onHandGrams: z.number().finite().min(0).nullable(),
  remainingGrams: z.number().finite().min(0).nullable(),
  practicalPurchaseQuantity: z.string().max(200).nullable().optional(),
  sourceRefs: z.array(z.string().max(150)),
  storeSection: z.string().min(1).max(80),
  purchased: z.boolean(),
  note: z.string().max(500).nullable().optional(),
  qualityFlags: z
    .array(z.string().max(100))
    .refine(
      (v) => new Set(v.map((i) => JSON.stringify(i))).size === v.length,
      "Duplicate array value",
    )
    .optional(),
});
export const favouriteNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^fav_[a-zA-Z0-9_-]+$")),
  kind: z.enum(["recipe", "meal_plan_template"]),
  referenceId: z.string().min(1),
  createdAt: z.iso.datetime({ offset: true }),
});
export const auditRecordNormativeSchema = z.strictObject({
  id: z.string().regex(new RegExp("^audit_[a-zA-Z0-9_-]+$")),
  action: z.string().min(1).max(100),
  entityType: z.string().min(1).max(100),
  entityId: z.string().min(1).max(160),
  detail: z.string().max(2000).nullable().optional(),
  occurredAt: z.iso.datetime({ offset: true }),
});
