import { z } from "zod";
import * as n from "./schema.generated";
import reference from "../../content/recipes/reference.json";
import {
  foodEntrySchema,
  nutritionDaySchema,
  customRevisionSchema,
  targetSnapshotSchema,
  referenceSnapshotSchema,
  nutritionNutrients,
  validTimeZone,
} from "../nutrition-tracker/schema";
export const recipeReference = reference;
const version = z.literal(1),
  unique = (ids: readonly string[]) => new Set(ids).size === ids.length;
export const cookingMethodSchema = z.enum([
  "no_cook",
  "boil",
  "steam",
  "simmer",
  "bake",
  "roast",
  "grill",
  "pan_fry",
  "deep_fry",
  "pressure_cook",
  "microwave",
  "saute",
  "stew",
  "other",
]);
export const sourceSnapshotSchema = z.strictObject({
  sourceKind: z.enum(["canonical_food", "custom_food"]),
  canonicalFoodRef: foodEntrySchema.shape.canonicalFoodRef,
  customFoodRef: foodEntrySchema.shape.customFoodRef,
  sourceRecords: foodEntrySchema.shape.sourceRecordsSnapshot,
  customRevision: customRevisionSchema.optional(),
  allergenTags: z.array(z.string().max(80)),
  foodGroup: z.string().min(1).max(120),
  profileState: z.string().min(1).max(120),
});
export const retentionFactorSchema =
  n.retentionAssignmentNormativeSchema.extend({
    factorId: z.string().min(1).max(120),
    reviewedAt: z.iso.datetime({ offset: true }),
    reviewer: z.string().min(1).max(120),
    approved: z.literal(true),
  });
export const ingredientNutrientSchema =
  n.ingredientNutrientNormativeSchema.superRefine((value, ctx) => {
    const definition = nutritionNutrients.find(
      (n) => n.id === value.nutrientId,
    );
    if (!definition || definition.canonicalUnit !== value.unit)
      ctx.addIssue({
        code: "custom",
        message:
          "Ingredient nutrient needs a known ID and compatible canonical unit.",
      });
    if (
      [
        "measured",
        "calculated",
        "estimated",
        "user_entered",
        "assumed_zero",
      ].includes(value.sourceStatus) &&
      (value.per100gValue === null || value.preCookingAmount === null)
    )
      ctx.addIssue({
        code: "custom",
        message: "Quantified source status requires a numeric source amount.",
      });
    if (
      ["trace", "not_available"].includes(value.sourceStatus) &&
      (value.per100gValue !== null ||
        value.preCookingAmount !== null ||
        value.retainedAmount !== null)
    )
      ctx.addIssue({
        code: "custom",
        message: "Trace and missing ingredient values must remain null.",
      });
    if (
      value.sourceStatus === "not_detected" &&
      [value.per100gValue, value.preCookingAmount, value.retainedAmount].some(
        (v) => v !== null && v !== 0,
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "Not-detected is unquantified or explicit zero.",
      });
  });
export const recipeNutrientSchema = n.recipeNutrientNormativeSchema
  .extend({
    quantifiedIngredients: z.number().int().nonnegative(),
    eligibleIngredients: z.number().int().nonnegative(),
    traceIngredients: z.number().int().nonnegative(),
    unavailableIngredients: z.number().int().nonnegative(),
    quantifiedGrams: z.number().nonnegative(),
    eligibleGrams: z.number().nonnegative(),
    unknownMassIngredients: z.number().int().nonnegative(),
  })
  .superRefine((r, ctx) => {
    if (
      !nutritionNutrients.some(
        (n) => n.id === r.nutrientId && n.canonicalUnit === r.unit,
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "Unknown recipe nutrient/unit.",
      });
    if (
      r.quantifiedIngredients > r.eligibleIngredients ||
      r.quantifiedGrams > r.eligibleGrams + 1e-8
    )
      ctx.addIssue({
        code: "custom",
        message: "Invalid quantified ingredient coverage.",
      });
    if (
      ["unavailable", "not_applicable"].includes(r.status) &&
      r.batchValue !== null
    )
      ctx.addIssue({
        code: "custom",
        message: "Unavailable totals must not become numeric zero.",
      });
  });
export const recipeCalculationSchema = n.recipeCalculationNormativeSchema
  .extend({ batchNutrients: z.array(recipeNutrientSchema) })
  .refine(
    (c) => unique(c.batchNutrients.map((n) => n.nutrientId)),
    "Duplicate recipe nutrients",
  );
export const leafIngredientSchema = n.ingredientLineNormativeSchema.extend({
  kind: z.enum([
    "canonical_food",
    "custom_food",
    "unresolved_text",
    "non_nutritive",
  ]),
  nutrients: z.array(ingredientNutrientSchema),
  retentionAssignments: z.array(retentionFactorSchema).optional(),
  sourceSnapshot: sourceSnapshotSchema.optional(),
  purchasingRole: z.string().max(100).optional(),
  roundManually: z.boolean().optional(),
});
export const componentSnapshotSchema = z.strictObject({
  recipeId: z.string().regex(/^recipe_/),
  recipeVersionId: z.string().regex(/^rver_/),
  versionNumber: z.number().int().positive(),
  methodologyVersion: z.string().min(1),
  finalWeightGrams: z.number().positive(),
  calculation: recipeCalculationSchema,
  leafIngredients: z.array(leafIngredientSchema),
  dependencyRecipeIds: z.array(z.string().regex(/^recipe_/)),
  depth: z.number().int().min(1).max(3),
});
export const ingredientSchema = n.ingredientLineNormativeSchema
  .extend({
    nutrients: z.array(ingredientNutrientSchema),
    retentionAssignments: z.array(retentionFactorSchema).optional(),
    sourceSnapshot: sourceSnapshotSchema.optional(),
    componentSnapshot: componentSnapshotSchema.optional(),
    purchasingRole: z.string().max(100).optional(),
    roundManually: z.boolean().optional(),
  })
  .superRefine((line, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    if (!unique(line.nutrients.map((n) => n.nutrientId)))
      issue("Duplicate ingredient nutrients.");
    if (
      ["canonical_food", "custom_food"].includes(line.kind) &&
      (!line.sourceSnapshot ||
        line.sourceSnapshot.sourceKind !== line.kind ||
        line.gramWeight === null)
    )
      issue(
        "Resolved ingredients need known edible grams and a full matching source snapshot.",
      );
    if (
      line.kind === "unresolved_text" &&
      (line.nutrients.length || line.sourceSnapshot || line.componentSnapshot)
    )
      issue("Unresolved ingredients cannot supply inferred nutrients.");
    if (line.kind === "non_nutritive" && line.nutrients.length)
      issue("A non-nutritive line cannot also contribute nutrition.");
    if (
      line.kind === "component_recipe" &&
      (!line.componentRecipeRef ||
        !line.componentSnapshot ||
        line.gramWeight === null)
    )
      issue("Components need an explicit frozen version and known grams.");
    if (
      line.gramWeight !== null &&
      line.quantity.gramsPerUnit != null &&
      Math.abs(
        line.quantity.value * line.quantity.gramsPerUnit - line.gramWeight,
      ) > 1e-8
    )
      issue("Ingredient quantity and mass disagree.");
    for (const nutrient of line.nutrients)
      if (
        nutrient.per100gValue !== null &&
        line.gramWeight !== null &&
        Math.abs(
          (nutrient.per100gValue * line.gramWeight) / 100 -
            (nutrient.preCookingAmount ?? -1),
        ) > 1e-8
      )
        issue("Pre-cooking nutrient disagrees with its input mass.");
    if (
      line.kind === "canonical_food" &&
      (!line.canonicalFoodRef ||
        !line.sourceSnapshot?.canonicalFoodRef ||
        JSON.stringify(line.canonicalFoodRef.foodId) !==
          JSON.stringify(line.sourceSnapshot.canonicalFoodRef.foodId))
    )
      issue("Canonical ingredient source reference disagrees.");
    if (
      line.kind === "custom_food" &&
      (!line.customFoodRef ||
        !line.sourceSnapshot?.customRevision ||
        line.customFoodRef.revisionId !== line.sourceSnapshot.customRevision.id)
    )
      issue("Custom ingredient revision snapshot disagrees.");
    if (line.kind === "custom_food" && line.sourceSnapshot?.customRevision) {
      const revision = line.sourceSnapshot.customRevision;
      if (revision.customFoodId !== line.customFoodRef?.customFoodId)
        issue("Custom food owner disagrees.");
      for (const nutrient of line.nutrients) {
        const original = revision.nutrients.find(
          (n) => n.nutrientId === nutrient.nutrientId,
        );
        const value = original
          ? (original.value * 100) /
            (revision.basis === "per_serving"
              ? revision.serving.gramWeight
              : 100)
          : null;
        if (value !== nutrient.per100gValue)
          issue("Custom ingredient values disagree with frozen revision.");
      }
    }
  });
export const recipeVersionSchema = n.recipeVersionNormativeSchema
  .extend({
    schemaVersion: version,
    ingredients: z.array(ingredientSchema).min(1).max(250),
    calculation: recipeCalculationSchema,
    methodology: z.strictObject({
      cookingMethod: cookingMethodSchema,
      allowUnadjustedRetention: z.boolean(),
      analyticalProfileId: z.string().nullable().optional(),
    }),
    source: n.sourceMetadataNormativeSchema.extend({
      reviewer: z.string().min(1).max(120).nullable().optional(),
      attribution: z.string().max(1000).nullable().optional(),
    }),
    media: z
      .array(
        z.strictObject({
          id: z.string().min(1),
          path: z.string().min(1),
          sourceUrl: z.url(),
          licence: z.string().min(1),
          attribution: z.string().min(1),
          reviewedAt: z.iso.datetime({ offset: true }),
          reviewer: z.string().min(1),
        }),
      )
      .optional(),
  })
  .superRefine((recipe, ctx) => {
    if (
      !unique(recipe.ingredients.map((i) => i.id)) ||
      !unique(recipe.ingredients.map((i) => String(i.order))) ||
      !unique(recipe.instructions.map((s) => s.id))
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Recipe lines and instruction identities/order must be unique.",
      });
    const yieldModel = recipe.yieldModel;
    if (
      yieldModel.mode === "estimated_sum_ingredients" &&
      recipe.methodology.cookingMethod !== "no_cook"
    )
      ctx.addIssue({
        code: "custom",
        message: "Cooked recipes cannot assume ingredient-sum final yield.",
      });
    if (
      ["measured_final_weight", "measured_servings"].includes(
        yieldModel.mode,
      ) &&
      (!yieldModel.finalWeightGrams || !yieldModel.measuredAt)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Measured yield needs final edible mass and a reported measurement time.",
      });
    if (
      yieldModel.finalWeightGrams &&
      yieldModel.servings &&
      yieldModel.servingWeightGrams &&
      (Math.abs(
        yieldModel.servings * yieldModel.servingWeightGrams -
          yieldModel.finalWeightGrams,
      ) /
        yieldModel.finalWeightGrams) *
        100 >
        yieldModel.tolerancePercent &&
      !yieldModel.note?.trim()
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Serving weights do not reconcile. Record a reason before saving.",
      });
  });
export const recipeIdentitySchema = n.recipeIdentityNormativeSchema.extend({
  schemaVersion: version,
});
export const plannedNutrientSchema = n.plannedNutrientNormativeSchema
  .extend({
    knownDays: z.number().int().min(0).max(28).optional(),
    totalDays: z.number().int().min(1).max(28).optional(),
  })
  .refine(
    (v) =>
      nutritionNutrients.some(
        (n) => n.id === v.nutrientId && n.canonicalUnit === v.unit,
      ),
    "Unknown planned nutrient/unit",
  );
export const plannedItemSchema = n.plannedItemNormativeSchema
  .extend({
    recipeRef: z
      .strictObject({
        recipeId: z.string().regex(/^recipe_/),
        recipeVersionId: z.string().regex(/^rver_/),
        versionNumber: z.number().int().positive(),
        originalServings: z.number().positive().nullable(),
        finalBatchWeightGrams: z.number().positive().nullable(),
        servingWeightGrams: z.number().positive().nullable(),
        calculation: recipeCalculationSchema,
        ingredientRequirements: z.array(leafIngredientSchema),
      })
      .nullable()
      .optional(),
    canonicalFoodRef: foodEntrySchema.shape.canonicalFoodRef,
    customFoodRef: foodEntrySchema.shape.customFoodRef,
    sourceSnapshot: sourceSnapshotSchema.optional(),
    nutrients: z.array(plannedNutrientSchema),
    purchasingRole: z.string().max(100).optional(),
  })
  .superRefine((item, ctx) => {
    if (!unique(item.nutrients.map((n) => n.nutrientId)))
      ctx.addIssue({ code: "custom", message: "Duplicate planned nutrients." });
    if (
      item.kind === "placeholder" &&
      (item.nutrients.length || item.completeness !== "unavailable")
    )
      ctx.addIssue({
        code: "custom",
        message: "Placeholders cannot be quantified as nutrition.",
      });
    if (item.kind === "recipe" && !item.recipeRef)
      ctx.addIssue({
        code: "custom",
        message: "Planned recipe needs an exact version snapshot.",
      });
    if (
      ["canonical_food", "custom_food"].includes(item.kind) &&
      (!item.sourceSnapshot || item.gramWeight === null)
    )
      ctx.addIssue({
        code: "custom",
        message: "Planned food needs grams and source snapshots.",
      });
  });
export const daySummarySchema = z.strictObject({
  localDate: z.iso.date(),
  nutrients: z.array(plannedNutrientSchema),
  itemCount: z.number().int().nonnegative(),
  unresolvedItems: z.number().int().nonnegative(),
  completeness: z.enum(["complete", "partial", "unavailable"]),
});
export const planSummarySchema = n.planSummaryNormativeSchema.extend({
  dailySummaries: z.array(daySummarySchema),
  averageNutrients: z.array(plannedNutrientSchema),
});
export const mealPlanVersionSchema = n.mealPlanVersionNormativeSchema
  .extend({
    schemaVersion: version,
    timeZone: z.string().refine(validTimeZone, "Invalid time zone"),
    targetSnapshot: targetSnapshotSchema.nullable(),
    referenceSnapshots: z.array(referenceSnapshotSchema),
    plannedItems: z.array(plannedItemSchema),
    summary: planSummarySchema,
  })
  .superRefine((plan, ctx) => {
    const end =
      Date.parse(`${plan.startDate}T00:00:00Z`) +
      (plan.dayCount - 1) * 86400000;
    if (!unique(plan.plannedItems.map((i) => i.id)) || !unique(plan.mealSlots))
      ctx.addIssue({
        code: "custom",
        message: "Plan item and meal-slot IDs must be unique.",
      });
    for (const item of plan.plannedItems)
      if (
        item.localDate < plan.startDate ||
        Date.parse(`${item.localDate}T00:00:00Z`) > end ||
        !plan.mealSlots.includes(item.mealSlotId)
      )
        ctx.addIssue({
          code: "custom",
          message: "An item is outside the plan date or meal-slot range.",
        });
  });
export const mealPlanIdentitySchema = n.mealPlanIdentityNormativeSchema.extend({
  schemaVersion: version,
});
export const batchSchema = n.batchInstanceNormativeSchema
  .extend({
    recipeSnapshot: plannedItemSchema.shape.recipeRef.unwrap().unwrap(),
  })
  .superRefine((batch, ctx) => {
    if (
      batch.allocations.reduce((sum, a) => sum + a.servingEquivalents, 0) >
      batch.totalServingEquivalents + 1e-8
    )
      ctx.addIssue({
        code: "custom",
        message: "Batch allocations exceed available servings.",
      });
    if (
      !unique(batch.allocations.map((a) => a.id)) ||
      !unique(batch.allocations.map((a) => a.plannedItemId))
    )
      ctx.addIssue({ code: "custom", message: "Duplicate batch allocations." });
  });
export const grocerySchema = n.groceryListNormativeSchema
  .extend({ schemaVersion: version })
  .superRefine((list, ctx) => {
    if (
      !unique(list.items.map((i) => i.id)) ||
      !unique(list.items.map((i) => i.mergeKey))
    )
      ctx.addIssue({
        code: "custom",
        message: "Duplicate grocery identities/merge keys.",
      });
    for (const item of list.items)
      if (
        item.requiredGrams !== null &&
        item.onHandGrams !== null &&
        item.remainingGrams !==
          Math.max(0, item.requiredGrams - item.onHandGrams)
      )
        ctx.addIssue({
          code: "custom",
          message:
            "Grocery remaining mass disagrees with known required/on-hand mass.",
        });
  });
export const preferencesSchema = n.preferencesNormativeSchema.extend({
  schemaVersion: version,
});
export const consumptionIntentSchema = z.strictObject({
  id: z.string().regex(/^intent_[a-zA-Z0-9_-]+$/),
  kind: z.literal("consumption_intent"),
  schemaVersion: version,
  recipeVersionId: z.string().regex(/^rver_/),
  planVersionId: z
    .string()
    .regex(/^mpver_/)
    .nullable(),
  plannedItemId: z
    .string()
    .regex(/^pitem_/)
    .nullable(),
  entry: foodEntrySchema,
  day: nutritionDaySchema,
  stage: z.enum(["pending", "committed"]),
  requestedAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  error: z.string().max(500).nullable(),
});
export const recipeBackupSchema = n.backupNormativeSchema
  .extend({
    schemaVersion: version,
    consumptionIntents: z.array(consumptionIntentSchema).default([]),
    preferences: preferencesSchema,
    recipeIdentities: z.array(recipeIdentitySchema),
    recipeVersions: z.array(recipeVersionSchema),
    mealPlanIdentities: z.array(mealPlanIdentitySchema),
    mealPlanVersions: z.array(mealPlanVersionSchema),
    batchInstances: z.array(batchSchema),
    groceryLists: z.array(grocerySchema),
  })
  .superRefine((b, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    for (const key of [
      "recipeIdentities",
      "recipeVersions",
      "mealPlanIdentities",
      "mealPlanVersions",
      "batchInstances",
      "groceryLists",
      "favourites",
      "auditLog",
      "consumptionIntents",
    ] as const)
      if (!unique(b[key].map((r) => r.id))) issue(`Duplicate ${key} IDs.`);
    const recipes = new Map(b.recipeIdentities.map((r) => [r.id, r])),
      versions = new Map(b.recipeVersions.map((r) => [r.id, r])),
      plans = new Map(b.mealPlanIdentities.map((p) => [p.id, p])),
      planVersions = new Map(b.mealPlanVersions.map((p) => [p.id, p]));
    for (const r of b.recipeIdentities)
      if (versions.get(r.currentVersionId)?.recipeId !== r.id)
        issue("Missing current recipe version.");
    for (const v of b.recipeVersions)
      if (!recipes.has(v.recipeId)) issue("Orphan recipe version.");
    for (const p of b.mealPlanIdentities)
      if (planVersions.get(p.currentVersionId)?.mealPlanId !== p.id)
        issue("Missing current meal-plan version.");
    for (const v of b.mealPlanVersions)
      if (!plans.has(v.mealPlanId)) issue("Orphan meal-plan version.");
    if (
      !unique(
        b.recipeVersions.map((v) => `${v.recipeId}:${v.versionNumber}`),
      ) ||
      !unique(
        b.mealPlanVersions.map((v) => `${v.mealPlanId}:${v.versionNumber}`),
      )
    )
      issue("Duplicate immutable version numbers.");
    for (const batch of b.batchInstances) {
      if (batch.recipeSnapshot.recipeVersionId !== batch.recipeVersionId)
        issue("Batch production snapshot disagrees with recipe version.");
      const plan = planVersions.get(batch.mealPlanVersionId);
      if (!plan || !plan.batchIds.includes(batch.id))
        issue("Batch has no owning plan version.");
      if (!versions.has(batch.recipeVersionId))
        issue("Batch recipe version is unavailable.");
      for (const a of batch.allocations) {
        const item = plan?.plannedItems.find((i) => i.id === a.plannedItemId);
        if (
          !item ||
          item.batchAllocationId !== a.id ||
          item.recipeRef?.recipeVersionId !== batch.recipeVersionId ||
          Math.abs(item.quantity - a.servingEquivalents) > 1e-8
        )
          issue("Batch allocation disagrees with its planned item.");
        if (item && item.localDate < batch.productionDate)
          issue("A leftover cannot precede its production date.");
      }
    }
    for (const list of b.groceryLists)
      if (!planVersions.has(list.mealPlanVersionId))
        issue("Grocery list has no owning plan version.");
    for (const plan of b.mealPlanVersions) {
      if (
        plan.batchIds.some(
          (id) =>
            !b.batchInstances.some(
              (batch) => batch.id === id && batch.mealPlanVersionId === plan.id,
            ),
        )
      )
        issue("Plan references an unavailable production batch.");
      for (const item of plan.plannedItems)
        if (
          item.batchAllocationId &&
          !b.batchInstances.some(
            (batch) =>
              batch.mealPlanVersionId === plan.id &&
              batch.allocations.some(
                (a) =>
                  a.id === item.batchAllocationId &&
                  a.plannedItemId === item.id,
              ),
          )
        )
          issue("Planned item references an unavailable batch allocation.");
    }
    for (const intent of b.consumptionIntents) {
      if (
        !versions.has(intent.recipeVersionId) ||
        intent.entry.recipeRef?.recipeVersionId !== intent.recipeVersionId
      )
        issue("Consumption journal recipe reference disagrees.");
      if (
        intent.planVersionId &&
        !planVersions
          .get(intent.planVersionId)
          ?.plannedItems.some(
            (i) =>
              i.id === intent.plannedItemId &&
              i.recipeRef?.recipeVersionId === intent.recipeVersionId,
          )
      )
        issue("Consumption journal planned-item reference disagrees.");
    }
  });
export type Ingredient = z.infer<typeof ingredientSchema>;
export type LeafIngredient = z.infer<typeof leafIngredientSchema>;
export type RecipeVersion = z.infer<typeof recipeVersionSchema>;
export type RecipeIdentity = z.infer<typeof recipeIdentitySchema>;
export type RecipeNutrient = z.infer<typeof recipeNutrientSchema>;
export type RecipeCalculation = z.infer<typeof recipeCalculationSchema>;
export type RetentionFactor = z.infer<typeof retentionFactorSchema>;
export type PlannedItem = z.infer<typeof plannedItemSchema>;
export type PlannedNutrient = z.infer<typeof plannedNutrientSchema>;
export type MealPlanVersion = z.infer<typeof mealPlanVersionSchema>;
export type MealPlanIdentity = z.infer<typeof mealPlanIdentitySchema>;
export type Batch = z.infer<typeof batchSchema>;
export type GroceryList = z.infer<typeof grocerySchema>;
export type RecipeBackup = z.infer<typeof recipeBackupSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;

export type ConsumptionIntent = z.infer<typeof consumptionIntentSchema>;
