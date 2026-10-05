import {
  foodEntrySchema,
  customRevisionSchema,
  nutritionNutrients,
  type FoodEntry,
  type CustomFoodRevision,
  type TargetSnapshot,
} from "../nutrition-tracker/schema";
import {
  convertMassToGrams,
  resolveVerifiedFoodPortion,
  newNutritionId,
  type EntryContext,
} from "../nutrition-tracker/domain";
import {
  ingredientSchema,
  recipeVersionSchema,
  recipeCalculationSchema,
  plannedItemSchema,
  mealPlanVersionSchema,
  recipeBackupSchema,
  recipeReference,
  type Ingredient,
  type LeafIngredient,
  type RecipeVersion,
  type RecipeNutrient,
  type RetentionFactor,
  type RecipeCalculation,
  type PlannedItem,
  type PlannedNutrient,
  type MealPlanVersion,
  type Batch,
  type GroceryList,
  type RecipeBackup,
} from "./schema";

export const convertExactMassToGrams = convertMassToGrams;
export const resolveVerifiedPortionGrams = resolveVerifiedFoodPortion;
export const approvedRetentionFactors: readonly RetentionFactor[] = [];
export function ingredientFromFoodEntry(
  input: FoodEntry,
  order: number,
  customRevision?: CustomFoodRevision,
  allergenTags?: readonly string[],
): Ingredient {
  const entry = foodEntrySchema.parse(input);
  if (
    !["canonical_food", "custom_food"].includes(entry.sourceKind) ||
    entry.amount.gramWeight === null
  )
    throw Error(
      "Recipes need a resolved food/profile or immutable custom-food revision with known grams.",
    );
  if (
    entry.sourceKind === "custom_food" &&
    (!customRevision || customRevision.id !== entry.customFoodRef?.revisionId)
  )
    throw Error("Include the exact custom revision snapshot.");
  return ingredientSchema.parse({
    id: newNutritionId("ing"),
    order,
    kind: entry.sourceKind,
    displayNameSnapshot: entry.displayNameSnapshot,
    quantity: {
      value: entry.amount.quantity,
      unit: entry.amount.inputUnit,
      portionId: entry.amount.portionId,
      gramsPerUnit: entry.amount.gramsPerUnit,
      conversionKind:
        entry.amount.conversionKind === "verified_source_portion"
          ? "verified_portion"
          : entry.amount.conversionKind === "custom_food_serving"
            ? "measured_serving"
            : "exact_mass",
    },
    gramWeight: entry.amount.gramWeight,
    canonicalFoodRef: entry.canonicalFoodRef
      ? {
          foodId: entry.canonicalFoodRef.foodId,
          profileId: entry.canonicalFoodRef.profileId,
          foodName: entry.canonicalFoodRef.foodName,
          profileState: entry.canonicalFoodRef.profileState,
          sourceRecordId: entry.canonicalFoodRef.sourceRecordId,
          sourceDatabase: entry.canonicalFoodRef.sourceDatabase,
          sourceRelease: entry.canonicalFoodRef.sourceRelease,
          profileReviewedAt: entry.canonicalFoodRef.profileReviewedAt,
        }
      : null,
    customFoodRef: entry.customFoodRef
      ? {
          customFoodId: entry.customFoodRef.customFoodId,
          revisionId: entry.customFoodRef.revisionId,
          displayName: entry.customFoodRef.name,
        }
      : null,
    nutrients: entry.nutrients.map((n) => ({
      nutrientId: n.nutrientId,
      unit: n.unit,
      sourceStatus: n.sourceStatus,
      per100gValue: n.per100gValue,
      preCookingAmount: n.loggedValue,
      retainedAmount: n.loggedValue,
      sourceRecordId: n.sourceRecordId,
    })),
    required: true,
    dataQualityFlags: [
      ...(entry.sourceKind === "custom_food"
        ? ["user_entered_composition"]
        : []),
      ...(allergenTags === undefined ? ["allergen_information_unknown"] : []),
    ],
    sourceSnapshot: {
      sourceKind: entry.sourceKind,
      canonicalFoodRef: entry.canonicalFoodRef,
      customFoodRef: entry.customFoodRef,
      sourceRecords: entry.sourceRecordsSnapshot,
      customRevision: customRevision
        ? customRevisionSchema.parse(customRevision)
        : undefined,
      allergenTags: [...(allergenTags ?? [])],
      foodGroup: entry.foodCategoryIdSnapshot ?? "not_classified",
      profileState: entry.canonicalFoodRef?.profileState ?? "user_entered",
    },
  });
}
export function unresolvedIngredient(
  name: string,
  quantity: number,
  unit: string,
  grams: number | null,
  order: number,
): Ingredient {
  return ingredientSchema.parse({
    id: newNutritionId("ing"),
    order,
    kind: "unresolved_text",
    displayNameSnapshot: name,
    quantity: { value: quantity, unit, conversionKind: "unresolved" },
    gramWeight: grams,
    nutrients: [],
    required: true,
    dataQualityFlags: ["unresolved_material_ingredient"],
  });
}
const cookedStates: Record<string, string[]> = {
  boiled: ["boil", "simmer"],
  steamed: ["steam"],
  baked: ["bake"],
  roasted: ["roast"],
  grilled: ["grill"],
  fried: ["pan_fry", "deep_fry", "saute"],
};
export function applyRetentionFactor(
  amount: number | null,
  factor: RetentionFactor,
  context: { foodGroup: string; cookingMethod: string; profileState: string },
  approved: readonly RetentionFactor[] = approvedRetentionFactors,
) {
  if (amount === null)
    return {
      amount: null,
      applied: false,
      reason: "Nutrient amount unavailable.",
    };
  if (cookedStates[context.profileState]?.includes(context.cookingMethod))
    return {
      amount,
      applied: false,
      reason: "The exact source profile already represents this cooking step.",
    };
  const match = approved.find(
    (f) =>
      f.factorId === factor.factorId &&
      f.factor === factor.factor &&
      f.sourceId === factor.sourceId &&
      f.sourceRelease === factor.sourceRelease &&
      f.foodGroup === context.foodGroup &&
      f.cookingMethod === context.cookingMethod &&
      f.nutrientId === factor.nutrientId &&
      f.approved,
  );
  if (
    !match ||
    !recipeReference.retentionPolicy.approvedSourceIds.includes(factor.sourceId)
  )
    throw Error(
      "Retention needs an approved exact nutrient, food-group, cooking-method and source-release match.",
    );
  return { amount: amount * factor.factor, applied: true, reason: null };
}
export function calculateIngredientNutrients(
  input: Ingredient,
  methodology: RecipeVersion["methodology"],
  approved: readonly RetentionFactor[] = approvedRetentionFactors,
): Ingredient {
  const line = ingredientSchema.parse(input),
    isCooking = methodology.cookingMethod !== "no_cook",
    alreadyCooked = !!cookedStates[
      line.sourceSnapshot?.profileState ?? ""
    ]?.includes(methodology.cookingMethod);
  const assignments = (line.retentionAssignments ?? []).map((f) => ({
    ...f,
    applied: false,
  }));
  const flags = new Set(
    line.dataQualityFlags.filter(
      (f) =>
        !["retention_unavailable", "limited_unadjusted_retention"].includes(f),
    ),
  );
  const nutrients = line.nutrients.map((n) => {
    const pre =
      line.gramWeight !== null && n.per100gValue !== null
        ? (n.per100gValue * line.gramWeight) / 100
        : null;
    let retained = pre;
    const assignment = assignments.find((a) => a.nutrientId === n.nutrientId);
    if (
      isCooking &&
      !alreadyCooked &&
      line.kind !== "component_recipe" &&
      pre !== null
    ) {
      if (assignment) {
        const result = applyRetentionFactor(
          pre,
          assignment,
          {
            foodGroup: line.sourceSnapshot?.foodGroup ?? "not_classified",
            profileState: line.sourceSnapshot?.profileState ?? "unknown",
            cookingMethod: methodology.cookingMethod,
          },
          approved,
        );
        retained = result.amount;
        assignment.applied = result.applied;
        assignment.notAppliedReason = result.reason;
      } else if (methodology.allowUnadjustedRetention) {
        flags.add("limited_unadjusted_retention");
      } else {
        retained = null;
        flags.add("retention_unavailable");
      }
    } else if (assignment)
      assignment.notAppliedReason = alreadyCooked
        ? "Source profile already represents this cooking step."
        : "Retention is not applicable to this line or method.";
    return { ...n, preCookingAmount: pre, retainedAmount: retained };
  });
  return ingredientSchema.parse({
    ...line,
    nutrients,
    retentionAssignments: assignments,
    dataQualityFlags: [...flags],
  });
}
export function calculateYieldFactor(final: number | null, pre: number | null) {
  return final !== null && pre !== null && final > 0 && pre > 0
    ? final / pre
    : null;
}
export function calculateRecipePer100g(
  batch: number | null,
  grams: number | null,
) {
  return batch !== null && grams !== null && grams > 0
    ? (batch / grams) * 100
    : null;
}
export function calculateRecipePerServing(
  batch: number | null,
  yieldModel: RecipeVersion["yieldModel"],
) {
  if (batch === null) return null;
  if (yieldModel.finalWeightGrams && yieldModel.servingWeightGrams)
    return (
      (batch / yieldModel.finalWeightGrams) * yieldModel.servingWeightGrams
    );
  return yieldModel.servings ? batch / yieldModel.servings : null;
}
export function calculateRecipeCompleteness(
  lines: readonly Ingredient[],
  nutrientId: string,
) {
  const material = lines.filter((l) => l.kind !== "non_nutritive"),
    eligibleGrams = material.reduce((sum, l) => sum + (l.gramWeight ?? 0), 0),
    quantified = material.filter((l) =>
      l.nutrients.some(
        (n) => n.nutrientId === nutrientId && n.retainedAmount !== null,
      ),
    ),
    quantifiedGrams = quantified.reduce(
      (sum, l) => sum + (l.gramWeight ?? 0),
      0,
    ),
    unknownMass = material.filter((l) => l.gramWeight === null).length,
    trace = material.filter((l) =>
      l.nutrients.some(
        (n) => n.nutrientId === nutrientId && n.sourceStatus === "trace",
      ),
    ).length;
  return {
    quantifiedIngredients: quantified.length,
    eligibleIngredients: material.length,
    traceIngredients: trace,
    unavailableIngredients: material.length - quantified.length - trace,
    quantifiedGrams,
    eligibleGrams,
    unknownMassIngredients: unknownMass,
    massCoveragePercent: eligibleGrams
      ? (quantifiedGrams / eligibleGrams) * 100
      : 0,
    status: !material.length
      ? ("not_applicable" as const)
      : !quantified.length
        ? ("unavailable" as const)
        : quantified.length === material.length &&
            !unknownMass &&
            !material.some((l) =>
              l.dataQualityFlags.includes(`component_partial_${nutrientId}`),
            )
          ? ("complete" as const)
          : ("partial" as const),
  };
}
export function calculateRecipeBatchTotals(
  lines: readonly Ingredient[],
  yieldModel: RecipeVersion["yieldModel"],
): RecipeNutrient[] {
  return nutritionNutrients.map((def) => {
    const values = lines.flatMap((l) =>
        l.nutrients
          .filter((n) => n.nutrientId === def.id && n.retainedAmount !== null)
          .map((n) => n.retainedAmount!),
      ),
      batch = values.length ? values.reduce((sum, v) => sum + v, 0) : null,
      coverage = calculateRecipeCompleteness(lines, def.id),
      required = lines.filter((l) =>
        l.dataQualityFlags.some((f) =>
          ["limited_unadjusted_retention", "retention_unavailable"].includes(f),
        ),
      ).length,
      applied = lines.filter((l) =>
        l.retentionAssignments?.some(
          (a) => a.nutrientId === def.id && a.applied,
        ),
      ).length;
    return {
      nutrientId: def.id,
      unit: def.canonicalUnit,
      batchValue: batch,
      per100gValue: calculateRecipePer100g(batch, yieldModel.finalWeightGrams),
      perServingValue: calculateRecipePerServing(batch, yieldModel),
      ...coverage,
      retentionCoveragePercent:
        required + applied ? (applied / (required + applied)) * 100 : null,
      qualityFlags: [...new Set(lines.flatMap((l) => l.dataQualityFlags))],
    };
  });
}
export function gradeRecipeCalculation(
  lines: readonly Ingredient[],
  yieldModel: RecipeVersion["yieldModel"],
  cookingMethod: string,
): RecipeCalculation["grade"] {
  if (
    lines.some(
      (l) => l.kind === "unresolved_text" || l.kind === "custom_food",
    ) ||
    yieldModel.mode === "unavailable" ||
    !lines.some((l) =>
      l.nutrients.some(
        (n) => n.nutrientId === "energy_kcal" && n.retainedAmount !== null,
      ),
    )
  )
    return "E";
  if (yieldModel.mode === "analytical_source")
    throw Error(
      "Analysed Grade A needs a reviewed composite source adapter; none is published.",
    );
  if (
    ["estimated_sum_ingredients", "serving_count_only"].includes(
      yieldModel.mode,
    ) ||
    (yieldModel.finalWeightGrams &&
      yieldModel.servings &&
      yieldModel.servingWeightGrams &&
      (Math.abs(
        yieldModel.servings * yieldModel.servingWeightGrams -
          yieldModel.finalWeightGrams,
      ) /
        yieldModel.finalWeightGrams) *
        100 >
        yieldModel.tolerancePercent)
  )
    return "D";
  if (
    cookingMethod !== "no_cook" &&
    lines.some((l) =>
      l.dataQualityFlags.some((f) =>
        ["limited_unadjusted_retention", "retention_unavailable"].includes(f),
      ),
    )
  )
    return "C";
  return "B";
}
export function recalculateRecipe(
  input: RecipeVersion,
  approved: readonly RetentionFactor[] = approvedRetentionFactors,
): RecipeVersion {
  const parsed = recipeVersionSchema.parse(input),
    ingredients = parsed.ingredients.map((l) =>
      calculateIngredientNutrients(l, parsed.methodology, approved),
    ),
    yieldModel = { ...parsed.yieldModel };
  const knownMass = ingredients.reduce(
    (sum, l) => sum + (l.gramWeight ?? 0),
    0,
  );
  if (yieldModel.mode === "estimated_sum_ingredients") {
    if (ingredients.some((l) => l.gramWeight === null))
      throw Error("Ingredient-sum yield requires all ingredient masses.");
    yieldModel.finalWeightGrams = knownMass || null;
  }
  yieldModel.preCookingEdibleWeightGrams = knownMass || null;
  yieldModel.yieldFactor = calculateYieldFactor(
    yieldModel.finalWeightGrams,
    yieldModel.preCookingEdibleWeightGrams,
  );
  if (yieldModel.mode === "serving_count_only") {
    yieldModel.finalWeightGrams = null;
    yieldModel.servingWeightGrams = null;
  }
  if (yieldModel.mode === "unavailable") {
    yieldModel.finalWeightGrams = null;
    yieldModel.servingWeightGrams = null;
    yieldModel.servings = null;
  }
  const rows = calculateRecipeBatchTotals(ingredients, yieldModel),
    status = rows.every((n) => n.batchValue === null)
      ? "unavailable"
      : rows.every(
            (n) => n.status === "complete" || n.status === "not_applicable",
          )
        ? "complete"
        : "partial";
  return recipeVersionSchema.parse({
    ...parsed,
    ingredients,
    yieldModel,
    calculation: recipeCalculationSchema.parse({
      method:
        parsed.methodology.cookingMethod === "no_cook"
          ? "ingredient_sum_no_cook"
          : ingredients.some((i) =>
                i.retentionAssignments?.some((a) => a.applied),
              )
            ? "ingredient_sum_retention_adjusted"
            : yieldModel.mode === "estimated_sum_ingredients"
              ? "ingredient_sum_estimated_yield"
              : "ingredient_sum_measured_yield",
      grade: gradeRecipeCalculation(
        ingredients,
        yieldModel,
        parsed.methodology.cookingMethod,
      ),
      status,
      methodologyVersion: recipeReference.methodologyVersion,
      retentionDataVersion: ingredients.some((i) =>
        i.retentionAssignments?.some((a) => a.applied),
      )
        ? "USDA-6-2007"
        : null,
      batchNutrients: rows,
      calculatedAt: parsed.calculation.calculatedAt,
      warnings: [
        ...new Set(ingredients.flatMap((l) => l.dataQualityFlags)),
        ...(ingredients.some((l) => l.gramWeight === null)
          ? ["Mass coverage is limited to known ingredient masses."]
          : []),
      ],
    }),
  });
}
export function scaleRecipe(recipe: RecipeVersion, desiredServings: number) {
  const original = recipe.yieldModel.servings;
  if (!original || !Number.isFinite(desiredServings) || desiredServings <= 0)
    throw Error("Scaling needs positive original and desired serving counts.");
  const factor = desiredServings / original;
  return {
    factor,
    desiredServings,
    ingredients: recipe.ingredients.map((l) => ({
      id: l.id,
      name: l.displayNameSnapshot,
      quantity: l.quantity.value * factor,
      grams: l.gramWeight === null ? null : l.gramWeight * factor,
      practicalGrams: l.roundManually
        ? "Choose and document a practical amount"
        : null,
    })),
    warning:
      "Cooking time, equipment, leavening and seasoning may not scale linearly.",
  };
}
export function detectCircularRecipeDependency(
  recipeId: string,
  versions: readonly RecipeVersion[],
  path: string[] = [],
  depth = 0,
): boolean {
  if (path.includes(recipeId) || depth > 3) return true;
  const related = versions
    .filter((v) => v.recipeId === recipeId)
    .flatMap((v) =>
      v.ingredients
        .filter((i) => i.kind === "component_recipe")
        .map((i) => i.componentRecipeRef?.recipeId)
        .filter((id): id is string => !!id),
    );
  return related.some((id) =>
    detectCircularRecipeDependency(
      id,
      versions,
      [...path, recipeId],
      depth + 1,
    ),
  );
}
export function componentIngredient(
  component: RecipeVersion,
  grams: number,
  order: number,
  parentRecipeId: string,
  versions: readonly RecipeVersion[],
): Ingredient {
  if (
    !component.yieldModel.finalWeightGrams ||
    component.calculation.batchNutrients.every((n) => n.per100gValue === null)
  )
    throw Error(
      "A component needs a known final mass and calculated per-gram nutrient values.",
    );
  if (
    component.recipeId === parentRecipeId ||
    detectCircularRecipeDependency(component.recipeId, versions, [
      parentRecipeId,
    ])
  )
    throw Error("Circular or more-than-three-level recipe dependency.");
  const depth =
    1 +
    Math.max(
      0,
      ...component.ingredients.map((i) => i.componentSnapshot?.depth ?? 0),
    );
  if (depth > 3) throw Error("Maximum component nesting depth is three.");
  const leafIngredients = flattenRecipeIngredients(component);
  return ingredientSchema.parse({
    id: newNutritionId("ing"),
    order,
    kind: "component_recipe",
    displayNameSnapshot: component.title,
    quantity: {
      value: grams,
      unit: "g",
      gramsPerUnit: 1,
      conversionKind: "exact_mass",
    },
    gramWeight: grams,
    componentRecipeRef: {
      recipeId: component.recipeId,
      recipeVersionId: component.id,
      title: component.title,
      gramsUsed: grams,
    },
    componentSnapshot: {
      recipeId: component.recipeId,
      recipeVersionId: component.id,
      versionNumber: component.versionNumber,
      methodologyVersion: component.calculation.methodologyVersion,
      finalWeightGrams: component.yieldModel.finalWeightGrams,
      calculation: component.calculation,
      leafIngredients,
      dependencyRecipeIds: [
        ...new Set([
          component.recipeId,
          ...component.ingredients.flatMap(
            (i) => i.componentSnapshot?.dependencyRecipeIds ?? [],
          ),
        ]),
      ],
      depth,
    },
    nutrients: component.calculation.batchNutrients.map((n) => ({
      nutrientId: n.nutrientId,
      unit: n.unit,
      sourceStatus: n.per100gValue === null ? "not_available" : "calculated",
      per100gValue: n.per100gValue,
      preCookingAmount:
        n.per100gValue === null ? null : (n.per100gValue * grams) / 100,
      retainedAmount:
        n.per100gValue === null ? null : (n.per100gValue * grams) / 100,
      sourceRecordId: component.id,
    })),
    required: true,
    dataQualityFlags:
      component.calculation.status === "complete"
        ? []
        : [
            "component_calculation_partial",
            ...component.calculation.batchNutrients
              .filter((n) => n.status === "partial")
              .map((n) => `component_partial_${n.nutrientId}`),
          ],
  });
}
export function flattenRecipeIngredients(
  recipe: RecipeVersion,
): LeafIngredient[] {
  return recipe.ingredients.flatMap((line) => {
    if (line.kind !== "component_recipe") {
      const {
        componentRecipeRef: _ref,
        componentSnapshot: _snapshot,
        ...leaf
      } = line;
      void _ref;
      void _snapshot;
      return [leaf as LeafIngredient];
    }
    if (!line.componentSnapshot || line.gramWeight === null)
      throw Error("Missing component snapshot.");
    const factor = line.gramWeight / line.componentSnapshot.finalWeightGrams;
    return line.componentSnapshot.leafIngredients.map((l) => ({
      ...l,
      id: `ing_${line.id}_${l.id}`,
      gramWeight: l.gramWeight === null ? null : l.gramWeight * factor,
      quantity: { ...l.quantity, value: l.quantity.value * factor },
      nutrients: l.nutrients.map((n) => ({
        ...n,
        preCookingAmount:
          n.preCookingAmount === null ? null : n.preCookingAmount * factor,
        retainedAmount:
          n.retainedAmount === null ? null : n.retainedAmount * factor,
      })),
    }));
  });
}
export function plannedRecipeItem(
  recipe: RecipeVersion,
  quantity: number,
  localDate: string,
  mealSlotId: string,
): PlannedItem {
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw Error("Choose a positive serving quantity.");
  const servingWeight =
      recipe.yieldModel.servingWeightGrams ??
      (recipe.yieldModel.finalWeightGrams && recipe.yieldModel.servings
        ? recipe.yieldModel.finalWeightGrams / recipe.yieldModel.servings
        : null),
    nutrients = recipe.calculation.batchNutrients.map((n) => ({
      nutrientId: n.nutrientId,
      unit: n.unit,
      value: n.perServingValue === null ? null : n.perServingValue * quantity,
      status:
        n.status === "not_applicable" ? ("unavailable" as const) : n.status,
    }));
  return plannedItemSchema.parse({
    id: newNutritionId("pitem"),
    localDate,
    mealSlotId,
    kind: "recipe",
    displayNameSnapshot: recipe.title,
    recipeRef: {
      recipeId: recipe.recipeId,
      recipeVersionId: recipe.id,
      versionNumber: recipe.versionNumber,
      originalServings: recipe.yieldModel.servings,
      finalBatchWeightGrams: recipe.yieldModel.finalWeightGrams,
      servingWeightGrams: servingWeight,
      calculation: recipe.calculation,
      ingredientRequirements: flattenRecipeIngredients(recipe),
    },
    quantity,
    quantityUnit: "serving",
    gramWeight: servingWeight === null ? null : servingWeight * quantity,
    nutrients,
    completeness: recipe.calculation.status,
    loggedEntryIds: [],
  });
}
export function plannedFoodItem(
  entry: FoodEntry,
  localDate: string,
  mealSlotId: string,
  customRevision?: CustomFoodRevision,
) {
  const line = ingredientFromFoodEntry(entry, 0, customRevision);
  return plannedItemSchema.parse({
    id: newNutritionId("pitem"),
    localDate,
    mealSlotId,
    kind: line.kind,
    displayNameSnapshot: line.displayNameSnapshot,
    canonicalFoodRef: entry.canonicalFoodRef,
    customFoodRef: entry.customFoodRef,
    sourceSnapshot: line.sourceSnapshot,
    quantity: entry.amount.quantity,
    quantityUnit: entry.amount.inputUnit,
    gramWeight: entry.amount.gramWeight,
    nutrients: line.nutrients.map((n) => ({
      nutrientId: n.nutrientId,
      unit: n.unit,
      value: n.retainedAmount,
      status: n.retainedAmount === null ? "unavailable" : "complete",
    })),
    completeness: line.nutrients.every((n) => n.retainedAmount !== null)
      ? "complete"
      : "partial",
    loggedEntryIds: [],
  });
}
export function calculateMealPlanDayTotals(
  items: readonly PlannedItem[],
  date: string,
) {
  const selected = items.filter((i) => i.localDate === date),
    nutrients: PlannedNutrient[] = nutritionNutrients.map((def) => {
      const values = selected.map((i) =>
          i.nutrients.find((n) => n.nutrientId === def.id),
        ),
        known = values.filter(
          (n): n is PlannedNutrient =>
            n?.value !== undefined && n.value !== null,
        );
      return {
        nutrientId: def.id,
        unit: def.canonicalUnit,
        value: known.length
          ? known.reduce((sum, n) => sum + n.value!, 0)
          : null,
        status: !known.length
          ? "unavailable"
          : known.length === selected.length &&
              known.every((n) => n.status === "complete")
            ? "complete"
            : "partial",
      };
    });
  return {
    localDate: date,
    nutrients,
    itemCount: selected.length,
    unresolvedItems: selected.filter(
      (i) => i.kind === "placeholder" || i.completeness === "unavailable",
    ).length,
    completeness: nutrients.every((n) => n.value === null)
      ? ("unavailable" as const)
      : nutrients.every((n) => n.status === "complete")
        ? ("complete" as const)
        : ("partial" as const),
  };
}
export function planDates(start: string, count: number) {
  return Array.from({ length: count }, (_, i) =>
    new Date(Date.parse(`${start}T00:00:00Z`) + i * 86400000)
      .toISOString()
      .slice(0, 10),
  );
}
export function calculateMealPlanAverage(
  summaries: ReturnType<typeof calculateMealPlanDayTotals>[],
) {
  return nutritionNutrients.map((def) => {
    const values = summaries.map((d) =>
        d.nutrients.find((n) => n.nutrientId === def.id),
      ),
      known = values.filter(
        (n): n is PlannedNutrient => n?.value !== undefined && n.value !== null,
      );
    return {
      nutrientId: def.id,
      unit: def.canonicalUnit,
      value: known.length
        ? known.reduce((sum, n) => sum + n.value!, 0) / known.length
        : null,
      status: !known.length
        ? ("unavailable" as const)
        : known.length === summaries.length &&
            known.every((n) => n.status === "complete")
          ? ("complete" as const)
          : ("partial" as const),
      knownDays: known.length,
      totalDays: summaries.length,
    };
  });
}
export function recalculateMealPlan(plan: MealPlanVersion): MealPlanVersion {
  for (const item of plan.plannedItems) {
    if (item.recipeRef) {
      const original = item.recipeRef.calculation.batchNutrients;
      if (original.length !== item.nutrients.length)
        throw Error(
          "Planned recipe nutrient coverage disagrees with its frozen source.",
        );
      for (const row of original) {
        const actual = item.nutrients.find(
            (n) => n.nutrientId === row.nutrientId,
          ),
          expected =
            row.perServingValue === null
              ? null
              : row.perServingValue * item.quantity;
        if (
          !actual ||
          actual.unit !== row.unit ||
          (expected === null
            ? actual.value !== null
            : actual.value === null ||
              Math.abs(actual.value - expected) > 1e-8) ||
          actual.status !==
            (row.status === "not_applicable" ? "unavailable" : row.status)
        )
          throw Error(
            "Planned recipe nutrients disagree with frozen serving arithmetic.",
          );
      }
    }
    const revision = item.sourceSnapshot?.customRevision;
    if (item.kind === "custom_food" && revision) {
      if (
        revision.id !== item.customFoodRef?.revisionId ||
        revision.customFoodId !== item.customFoodRef?.customFoodId ||
        !item.gramWeight
      )
        throw Error("Planned custom revision mismatch.");
      for (const row of item.nutrients) {
        const source = revision.nutrients.find(
            (n) => n.nutrientId === row.nutrientId,
          ),
          expected = source
            ? (source.value * item.gramWeight) /
              (revision.basis === "per_serving"
                ? revision.serving.gramWeight
                : 100)
            : null;
        if (
          expected === null
            ? row.value !== null
            : row.value === null || Math.abs(row.value - expected) > 1e-8
        )
          throw Error(
            "Planned custom nutrients disagree with frozen composition.",
          );
      }
    }
  }
  const summaries = planDates(plan.startDate, plan.dayCount).map((date) =>
    calculateMealPlanDayTotals(plan.plannedItems, date),
  );
  return mealPlanVersionSchema.parse({
    ...plan,
    summary: {
      dailySummaries: summaries,
      averageNutrients: calculateMealPlanAverage(summaries),
      completeness: summaries.every((d) => d.completeness === "unavailable")
        ? "unavailable"
        : summaries.every((d) => d.completeness === "complete")
          ? "complete"
          : "partial",
      calculatedAt: plan.summary.calculatedAt,
    },
  });
}
export function comparePlanWithTarget(
  summary: ReturnType<typeof calculateMealPlanDayTotals>,
  target: TargetSnapshot | null,
) {
  const ids = [
      "energy_kcal",
      "protein_g",
      "fat_total_g",
      "carbohydrate_total_g",
      "fiber_total_g",
    ],
    targets = target
      ? [
          target.energyKcal,
          target.proteinGrams,
          target.fatGrams,
          target.carbohydrateGrams,
          target.fiberGrams,
        ]
      : [];
  return ids.map((id, i) => {
    const value = summary.nutrients.find((n) => n.nutrientId === id),
      complete = summary.unresolvedItems === 0 && value?.status === "complete";
    return {
      nutrientId: id,
      planned: value?.value ?? null,
      target: targets[i] ?? null,
      difference:
        complete &&
        value?.value !== null &&
        value?.value !== undefined &&
        targets[i] !== null &&
        targets[i] !== undefined
          ? value.value - targets[i]!
          : null,
      valid: complete,
      reason: complete
        ? null
        : "Planned data incomplete; target comparison unavailable.",
    };
  });
}
export function allocateBatchServings(
  available: number,
  amounts: readonly number[],
) {
  if (
    !Number.isFinite(available) ||
    available <= 0 ||
    amounts.some((n) => !Number.isFinite(n) || n <= 0)
  )
    throw Error("Batch and allocations need positive serving equivalents.");
  const used = amounts.reduce((sum, n) => sum + n, 0);
  if (used > available + 1e-8)
    throw Error("Allocation exceeds available servings.");
  return { assigned: used, remaining: Math.max(0, available - used) };
}
export function mealPlanInsights(plan: MealPlanVersion) {
  const energy = plan.summary.dailySummaries.flatMap((d) => {
    const n = d.nutrients.find((n) => n.nutrientId === "energy_kcal");
    return n?.value === null || n?.value === undefined ? [] : [n.value];
  });
  return {
    unresolvedItems: plan.plannedItems.filter(
      (i) => i.kind === "placeholder" || i.completeness === "unavailable",
    ).length,
    distinctSources: new Set(
      plan.plannedItems
        .map(
          (i) =>
            i.recipeRef?.recipeVersionId ??
            i.canonicalFoodRef?.profileId ??
            i.customFoodRef?.revisionId,
        )
        .filter(Boolean),
    ).size,
    knownEnergyDays: energy.length,
    minimumKnownEnergy: energy.length ? Math.min(...energy) : null,
    maximumKnownEnergy: energy.length ? Math.max(...energy) : null,
    contributors: plan.plannedItems
      .flatMap((i) => {
        const n = i.nutrients.find((n) => n.nutrientId === "energy_kcal");
        return n?.value === null || n?.value === undefined
          ? []
          : [
              {
                id: i.id,
                name: i.displayNameSnapshot,
                energyKcal: n.value,
                status: n.status,
              },
            ];
      })
      .sort((a, b) => b.energyKcal - a.energyKcal)
      .slice(0, 5),
  };
}
export function compareMealPlanReferences(plan: MealPlanVersion) {
  return plan.referenceSnapshots.map((reference) => {
    const n = plan.summary.averageNutrients.find(
        (n) => n.nutrientId === reference.nutrientId,
      ),
      compatible =
        n?.unit === reference.unit &&
        n.value !== null &&
        n.status === "complete" &&
        reference.value > 0;
    return {
      reference,
      percent: compatible ? (n!.value! / reference.value) * 100 : null,
      partial: n?.status !== "complete",
      informational: ["UL", "TUL", "DV"].includes(reference.referenceType),
    };
  });
}
type Requirement = {
  key: string;
  name: string;
  grams: number | null;
  source: string;
  section: string;
  flags: string[];
};
export function aggregateGroceryRequirements(
  plan: MealPlanVersion,
  batches: readonly Batch[],
  previous?: GroceryList,
): GroceryList {
  const requirements: Requirement[] = [];
  const add = (line: LeafIngredient, factor: number, source: string) => {
    const ref = line.canonicalFoodRef,
      key = ref
        ? `${ref.foodId}|${ref.profileId}|${ref.profileState}|${line.purchasingRole ?? "edible"}|g`
        : line.kind === "custom_food"
          ? `custom|${line.customFoodRef?.customFoodId}|${line.customFoodRef?.revisionId}|${line.purchasingRole ?? "edible"}|g`
          : `unresolved|${source}|${line.id}`;
    requirements.push({
      key,
      name: line.displayNameSnapshot,
      grams: line.gramWeight === null ? null : line.gramWeight * factor,
      source,
      section: "other",
      flags: line.dataQualityFlags,
    });
  };
  const counted = new Set<string>();
  for (const batch of batches.filter((b) => b.mealPlanVersionId === plan.id)) {
    if (!plan.batchIds.includes(batch.id))
      throw Error("Unowned batch production.");
    const ref = batch.recipeSnapshot;
    if (!ref.originalServings)
      throw Error("Batch production requires original serving count.");
    allocateBatchServings(
      batch.totalServingEquivalents,
      batch.allocations.map((a) => a.servingEquivalents),
    );
    ref.ingredientRequirements.forEach((line) =>
      add(
        line,
        batch.totalServingEquivalents / ref.originalServings!,
        batch.recipeVersionId,
      ),
    );
    counted.add(batch.id);
  }
  for (const item of plan.plannedItems) {
    if (item.kind === "placeholder") {
      requirements.push({
        key: `placeholder|${item.id}`,
        name: item.displayNameSnapshot,
        grams: null,
        source: item.id,
        section: "other",
        flags: ["unresolved_planned_item"],
      });
      continue;
    }
    if (item.kind === "recipe" && item.recipeRef) {
      let quantity = item.quantity;
      if (item.batchAllocationId) {
        const batch = batches.find(
          (b) =>
            b.mealPlanVersionId === plan.id &&
            b.allocations.some((a) => a.id === item.batchAllocationId),
        );
        if (!batch) throw Error("Missing batch allocation.");
        if (counted.has(batch.id)) continue;
        allocateBatchServings(
          batch.totalServingEquivalents,
          batch.allocations.map((a) => a.servingEquivalents),
        );
        counted.add(batch.id);
        quantity = batch.totalServingEquivalents;
      }
      const servings = item.recipeRef.originalServings;
      if (!servings)
        throw Error("Grocery generation needs original recipe serving count.");
      item.recipeRef.ingredientRequirements.forEach((l) =>
        add(l, quantity / servings, item.recipeRef!.recipeVersionId),
      );
    } else {
      const grams = item.gramWeight ?? null,
        ref = item.canonicalFoodRef,
        key = ref
          ? `${ref.foodId}|${ref.profileId}|${ref.profileState}|${item.purchasingRole ?? "edible"}|g`
          : `custom|${item.customFoodRef?.customFoodId}|${item.customFoodRef?.revisionId}|g`;
      requirements.push({
        key,
        name: item.displayNameSnapshot,
        grams,
        source: item.id,
        section: "other",
        flags:
          item.completeness === "complete" ? [] : ["partial_food_composition"],
      });
    }
  }
  const groups = new Map<string, Requirement[]>();
  requirements.forEach((r) =>
    groups.set(r.key, [...(groups.get(r.key) ?? []), r]),
  );
  return {
    id: newNutritionId("glist"),
    schemaVersion: 1,
    mealPlanVersionId: plan.id,
    generatedAt: new Date().toISOString(),
    status: "active",
    items: [...groups].map(([key, rows]) => {
      const required = rows.every((r) => r.grams !== null)
          ? rows.reduce((sum, r) => sum + r.grams!, 0)
          : null,
        old = previous?.items.find((i) => i.mergeKey === key),
        onHand = old?.onHandGrams ?? 0;
      return {
        id: newNutritionId("gitem"),
        mergeKey: key,
        displayName: rows[0]!.name,
        requiredGrams: required,
        onHandGrams: onHand,
        remainingGrams:
          required === null ? null : Math.max(0, required - onHand),
        sourceRefs: [...new Set(rows.map((r) => r.source))],
        storeSection: old?.storeSection ?? "other",
        purchased: old?.purchased ?? false,
        practicalPurchaseQuantity: old?.practicalPurchaseQuantity ?? null,
        note: old?.note ?? null,
        qualityFlags: [...new Set(rows.flatMap((r) => r.flags))],
      };
    }),
  };
}
export function validateRecipeBackup(value: unknown): RecipeBackup {
  const parsed = recipeBackupSchema.parse(
    typeof value === "string" ? JSON.parse(value) : value,
  );
  for (const recipe of parsed.recipeVersions) {
    if (detectCircularRecipeDependency(recipe.recipeId, parsed.recipeVersions))
      throw Error("Circular or excessive recipe dependency in backup.");
    const calculated = recalculateRecipe(recipe);
    if (
      JSON.stringify(calculated.calculation) !==
        JSON.stringify(recipe.calculation) ||
      JSON.stringify(calculated.yieldModel) !==
        JSON.stringify(recipe.yieldModel) ||
      JSON.stringify(calculated.ingredients) !==
        JSON.stringify(recipe.ingredients)
    )
      throw Error(
        `Recipe ${recipe.id} cached totals disagree with its immutable inputs.`,
      );
  }
  for (const plan of parsed.mealPlanVersions)
    if (
      JSON.stringify(recalculateMealPlan(plan).summary) !==
      JSON.stringify(plan.summary)
    )
      throw Error(
        `Plan ${plan.id} summaries disagree with its immutable items.`,
      );
  for (const list of parsed.groceryLists) {
    const plan = parsed.mealPlanVersions.find(
      (p) => p.id === list.mealPlanVersionId,
    )!;
    const expected = aggregateGroceryRequirements(
      plan,
      parsed.batchInstances,
      list,
    ).items;
    if (
      expected.length !== list.items.length ||
      expected.some((i) => {
        const stored = list.items.find((s) => s.mergeKey === i.mergeKey);
        return (
          !stored ||
          (i.requiredGrams === null
            ? stored.requiredGrams !== null
            : stored.requiredGrams === null ||
              Math.abs(stored.requiredGrams - i.requiredGrams) > 1e-8)
        );
      })
    )
      throw Error(
        "Grocery requirements disagree with immutable production quantities.",
      );
  }
  return parsed;
}
export function planRecipeRestoreConflicts(
  current: RecipeBackup,
  incoming: RecipeBackup,
) {
  const keys = [
    "recipeIdentities",
    "recipeVersions",
    "mealPlanIdentities",
    "mealPlanVersions",
    "batchInstances",
    "groceryLists",
    "favourites",
    "auditLog",
  ] as const;
  return keys.map((key) => {
    const old = new Map(current[key].map((r) => [r.id, JSON.stringify(r)]));
    let added = 0,
      identical = 0,
      conflicts = 0;
    incoming[key].forEach((r) => {
      if (!old.has(r.id)) added++;
      else if (old.get(r.id) === JSON.stringify(r)) identical++;
      else conflicts++;
    });
    return { collection: key, added, identical, conflicts };
  });
}
export function buildRecipeLogSnapshot(
  recipe: RecipeVersion,
  servings: number,
  context: EntryContext,
  plannedItemRef?: { planVersionId: string; plannedItemId: string },
): FoodEntry {
  const r = recipeVersionSchema.parse(recipe),
    servingWeight =
      r.yieldModel.servingWeightGrams ??
      (r.yieldModel.finalWeightGrams && r.yieldModel.servings
        ? r.yieldModel.finalWeightGrams / r.yieldModel.servings
        : null);
  if (
    !servingWeight ||
    !Number.isFinite(servings) ||
    servings <= 0 ||
    r.calculation.batchNutrients.every((n) => n.per100gValue === null)
  )
    throw Error(
      "Recipe logging needs known serving grams and usable per-gram nutrition. Record a measured yield first.",
    );
  const now = context.now ?? new Date().toISOString(),
    { now: _now, ...event } = context;
  void _now;
  if (Date.parse(event.occurredAtUtc) > Date.parse(now))
    throw Error("Consumed time cannot be in the future.");
  const grams = servingWeight * servings;
  return foodEntrySchema.parse({
    id: newNutritionId("nentry"),
    schemaVersion: 1,
    sourceKind: "recipe",
    ...event,
    displayNameSnapshot: r.title,
    recipeRef: {
      recipeId: r.recipeId,
      recipeVersionId: r.id,
      versionNumber: r.versionNumber,
      title: r.title,
      calculationGrade: r.calculation.grade,
      methodologyVersion: r.calculation.methodologyVersion,
      retentionDataVersion: r.calculation.retentionDataVersion,
      sourceMetadata: r.source,
      ingredientSources: flattenRecipeIngredients(r).flatMap((line) =>
        line.sourceSnapshot
          ? [
              {
                ingredientId: line.id,
                sourceKind: line.sourceSnapshot.sourceKind,
                sourceRecords: line.sourceSnapshot.sourceRecords ?? [],
                customRevision: line.sourceSnapshot.customRevision,
              },
            ]
          : [],
      ),
      sourceRecordIds: [
        ...new Set(
          r.ingredients.flatMap((l) =>
            l.nutrients
              .map((n) => n.sourceRecordId)
              .filter((id): id is string => !!id),
          ),
        ),
      ],
      nutrientQuality: r.calculation.batchNutrients.map((n) => ({
        nutrientId: n.nutrientId,
        status: n.status,
        massCoveragePercent: n.massCoveragePercent,
      })),
      plannedItemRef,
    },
    amount: {
      quantity: servings,
      inputUnit: "recipe_serving",
      gramsPerUnit: servingWeight,
      gramWeight: grams,
      conversionKind: "manual_grams",
      portionDescription: `Serving of recipe version ${r.versionNumber}`,
    },
    nutrients: r.calculation.batchNutrients.map((n) => ({
      nutrientId: n.nutrientId,
      unit: n.unit,
      sourceStatus: n.per100gValue === null ? "not_available" : "calculated",
      per100gValue: n.per100gValue,
      loggedValue:
        n.per100gValue === null ? null : (n.per100gValue * grams) / 100,
      sourceRecordId: r.id,
      dataCompleteness:
        n.status === "not_applicable" ? "unavailable" : n.status,
      methodNote: `Recipe grade ${r.calculation.grade}; ${n.status}; ${n.massCoveragePercent.toFixed(1)}% known ingredient mass coverage.`,
    })),
    dataQualityFlags: [
      `recipe_grade_${r.calculation.grade}`,
      ...(r.calculation.status !== "complete"
        ? ["partial_recipe_calculation"]
        : []),
    ],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    revision: 1,
  });
}
