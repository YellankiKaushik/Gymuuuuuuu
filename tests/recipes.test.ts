import { publicTemplates } from "../src/features/recipes-meal-plans/public-templates-records";
import { publicRecipes } from "../src/features/recipes-meal-plans/public-records";
import { describe, it, expect } from "vitest";
import { dietPlanFixture } from "./fixtures/diet";
import { bindDayTargetSnapshot } from "../src/features/nutrition-tracker/domain";
import {
  comparePlanWithTarget,
  plannedFoodItem,
  calculateMealPlanDayTotals,
  recalculateRecipe,
} from "../src/features/recipes-meal-plans/domain";
import {
  matchReviewedTemplates,
  validatePublicRelease,
  recipeExclusionWarnings,
} from "../src/features/recipes-meal-plans/publication";
import { canonical, nutritionContext } from "./fixtures/nutrition";
import {
  recipeDraft,
  mealPlanDraft,
} from "../src/features/recipes-meal-plans/editor";
import {
  ingredientFromFoodEntry,
  calculateRecipePer100g,
  applyRetentionFactor,
  scaleRecipe,
  plannedRecipeItem,
  recalculateMealPlan,
  aggregateGroceryRequirements,
  allocateBatchServings,
  componentIngredient,
  buildRecipeLogSnapshot,
  validateRecipeBackup,
} from "../src/features/recipes-meal-plans/domain";
import { aggregateNutritionDay } from "../src/features/nutrition-tracker/domain";
import { emptyRecipeBackup } from "../src/features/recipes-meal-plans/storage";
import type {
  Ingredient,
  RetentionFactor,
} from "../src/features/recipes-meal-plans/schema";
const time = "2026-10-04T06:00:00.000Z";
function ingredient(
  grams: number,
  energy: number,
  protein: number,
  order: number,
): Ingredient {
  const entry = canonical(grams);
  for (const [id, value] of [
    ["energy_kcal", energy],
    ["protein_g", protein],
  ] as const) {
    const n = entry.nutrients.find((n) => n.nutrientId === id)!;
    n.per100gValue = value;
    n.loggedValue = (value * grams) / 100;
  }
  return ingredientFromFoodEntry(entry, order);
}
function recipe(
  lines = [ingredient(100, 100, 10, 0), ingredient(50, 200, 4, 1)],
) {
  return recipeDraft("Synthetic arithmetic fixture", lines, {
    instructions: "Test-only instruction",
    cookingMethod: "no_cook",
    allowUnadjustedRetention: false,
    reason: "Test only",
    yieldModel: {
      mode: "measured_final_weight",
      finalWeightGrams: 150,
      servings: 3,
      servingWeightGrams: 50,
      tolerancePercent: 2,
      measuredAt: time,
    },
  });
}
describe("Phase 11 independent recipe vectors", () => {
  it("matches exact 500 + 250 g grocery merging and separates cooking state", () => {
    const p = mealPlanDraft("Test merge", "2026-10-04", 1, "UTC", [
      "meal_lunch",
    ]);
    p.plannedItems = [
      plannedFoodItem(canonical(500), p.startDate, "meal_lunch"),
      plannedFoodItem(canonical(250), p.startDate, "meal_lunch"),
    ];
    expect(aggregateGroceryRequirements(p, []).items[0]?.requiredGrams).toBe(
      750,
    );
    p.plannedItems[1]!.canonicalFoodRef!.profileState = "boiled";
    expect(aggregateGroceryRequirements(p, []).items).toHaveLength(2);
  });
  it("compares 2100 planned kcal with 2200 target as -100 and disables incomplete comparisons", () => {
    const p = mealPlanDraft("Test target", "2026-10-04", 1, "UTC", [
      "meal_lunch",
    ]);
    p.plannedItems = [
      plannedRecipeItem(recipe(), 31.5, p.startDate, "meal_lunch"),
    ];
    const target = bindDayTargetSnapshot(dietPlanFixture())!;
    target.energyKcal = 2200;
    const rows = calculateMealPlanDayTotals(p.plannedItems, p.startDate);
    expect(
      comparePlanWithTarget(rows, target).find(
        (n) => n.nutrientId === "energy_kcal",
      )?.difference,
    ).toBeCloseTo(-100, 8);
    rows.unresolvedItems = 1;
    expect(
      comparePlanWithTarget(rows, target).find(
        (n) => n.nutrientId === "energy_kcal",
      )?.difference,
    ).toBeNull();
  });
  it("keeps unpublished content gated and exposes conservative exclusion warnings", () => {
    expect(() =>
      validatePublicRelease(publicRecipes, publicTemplates),
    ).not.toThrow();
    expect(matchReviewedTemplates({ energyKcal: 2200, days: 7 })).toEqual([]);
    expect(recipeExclusionWarnings(recipe(), [], []).join(" ")).toContain(
      "unknown",
    );
  });
  it("handles 100 measured ingredient lines and a 28-day 12-item calendar", () => {
    const lines = Array.from({ length: 100 }, (_, i) =>
      ingredient(1, 100, 10, i),
    );
    const r = recipe(lines);
    r.yieldModel.finalWeightGrams = 100;
    r.yieldModel.servingWeightGrams = null;
    recalculateRecipe(r);
    const started = performance.now();
    const computed = recalculateRecipe(r);
    const elapsed = performance.now() - started;
    expect(
      computed.calculation.batchNutrients.find(
        (n) => n.nutrientId === "energy_kcal",
      )?.batchValue,
    ).toBe(100);
    // Coverage instrumentation and concurrent test workers add overhead; keep
    // this a catastrophic-regression guard instead of a machine-speed benchmark.
    expect(elapsed).toBeLessThan(1000);
    const p = mealPlanDraft("28-day stress fixture", "2026-10-04", 28, "UTC", [
      "meal_lunch",
    ]);
    for (let day = 0; day < 28; day++)
      for (let item = 0; item < 12; item++)
        p.plannedItems.push(
          plannedRecipeItem(
            computed,
            1,
            new Date(Date.parse(`${p.startDate}T00:00:00Z`) + day * 86400000)
              .toISOString()
              .slice(0, 10),
            "meal_lunch",
          ),
        );
    const calculated = recalculateMealPlan(p);
    expect(calculated.plannedItems).toHaveLength(336);
    expect(calculated.summary.dailySummaries).toHaveLength(28);
  }, 15_000);
  it("calculates batch, measured density and serving values without macro-derived calories", () => {
    const rows = recipe().calculation.batchNutrients;
    const energy = rows.find((n) => n.nutrientId === "energy_kcal")!;
    const protein = rows.find((n) => n.nutrientId === "protein_g")!;
    expect(energy.batchValue).toBe(200);
    expect(energy.per100gValue).toBeCloseTo(133.333333);
    expect(energy.perServingValue).toBeCloseTo(66.666667);
    expect(protein.batchValue).toBe(12);
    expect(protein.per100gValue).toBe(8);
    expect(protein.perServingValue).toBe(4);
    expect(calculateRecipePer100g(500, 400)).toBe(125);
  });
  it("uses only explicitly approved exact retention assignments and blocks double cooking", () => {
    const factor: RetentionFactor = {
      nutrientId: "vitamin_c_mg",
      sourceId: "usda_retention_6",
      sourceRelease: "6 (2007)",
      foodGroup: "test",
      cookingMethod: "boil",
      factor: 0.6,
      applied: false,
      factorId: "test-factor",
      reviewer: "Synthetic test reviewer",
      reviewedAt: time,
      approved: true,
    };
    const ctx = {
      foodGroup: "test",
      cookingMethod: "boil",
      profileState: "raw",
    };
    expect(() => applyRetentionFactor(100, factor, ctx)).toThrow();
    const retained = applyRetentionFactor(100, factor, ctx, [factor]);
    expect(retained.amount).toBe(60);
    expect(calculateRecipePer100g(retained.amount, 300)).toBe(20);
    expect(
      applyRetentionFactor(
        50,
        { ...factor, factor: 0.7 },
        { ...ctx, profileState: "boiled" },
      ).amount,
    ).toBe(50);
  });
  it("preserves missing data and partial coverage through component recipes and consumed logs", () => {
    const a = ingredient(100, 100, 10, 0),
      b = ingredient(100, 100, 10, 1);
    const an = a.nutrients.find((n) => n.nutrientId === "iron_mg")!;
    Object.assign(an, {
      sourceStatus: "measured",
      per100gValue: 2,
      preCookingAmount: 2,
      retainedAmount: 2,
    });
    const r = recipe([a, b]);
    const iron = r.calculation.batchNutrients.find(
      (n) => n.nutrientId === "iron_mg",
    )!;
    expect(iron.batchValue).toBe(2);
    expect(iron.massCoveragePercent).toBe(50);
    expect(iron.status).toBe("partial");
    const component = componentIngredient(r, 100, 0, "recipe_parent", [r]);
    const parent = recipe([component]);
    expect(
      parent.calculation.batchNutrients.find((n) => n.nutrientId === "iron_mg")
        ?.status,
    ).toBe("partial");
    const logged = buildRecipeLogSnapshot(r, 1, nutritionContext);
    expect(
      aggregateNutritionDay([logged]).find((n) => n.nutrientId === "iron_mg")
        ?.completeness,
    ).toBe("partial");
    expect(logged.recipeRef?.ingredientSources).toHaveLength(2);
  });
  it("scales line quantities precisely and rejects cyclic components", () => {
    const r = recipe([ingredient(200, 100, 10, 0)]);
    r.yieldModel.servings = 4;
    r.yieldModel.servingWeightGrams = null;
    expect(scaleRecipe(r, 6).ingredients[0]?.grams).toBe(300);
    expect(() => componentIngredient(r, 20, 0, r.recipeId, [r])).toThrow();
  });
  it("merges exact grocery keys, separates raw/cooked profiles and counts production once", () => {
    const r = recipe();
    const p = mealPlanDraft("Test plan", "2026-10-04", 2, "UTC", [
      "meal_lunch",
    ]);
    const item = plannedRecipeItem(r, 3, p.startDate, "meal_lunch");
    p.plannedItems = [item];
    const list = aggregateGroceryRequirements(p, []);
    expect(list.items).toHaveLength(1);
    expect(list.items[0]?.requiredGrams).toBe(150);
    item.batchAllocationId = "alloc_test";
    p.batchIds = ["batch_test"];
    const batches = [
      {
        id: "batch_test",
        mealPlanVersionId: p.id,
        recipeVersionId: r.id,
        productionDate: p.startDate,
        totalServingEquivalents: 6,
        allocations: [
          { id: "alloc_test", plannedItemId: item.id, servingEquivalents: 3 },
        ],
        recipeSnapshot: item.recipeRef!,
      },
    ];
    expect(
      aggregateGroceryRequirements(p, batches).items[0]?.requiredGrams,
    ).toBe(300);
    p.plannedItems = [];
    batches[0]!.allocations = [];
    expect(
      aggregateGroceryRequirements(p, batches).items[0]?.requiredGrams,
    ).toBe(300);
    expect(allocateBatchServings(6, [4, 2]).remaining).toBe(0);
    expect(() => allocateBatchServings(6, [4, 2, 1])).toThrow();
  });
  it("freezes a recipe version in plans and excludes unknown days from numeric averages", () => {
    const r = recipe(),
      p = mealPlanDraft("Test", "2026-10-04", 2, "UTC", ["meal_lunch"]);
    p.plannedItems.push(plannedRecipeItem(r, 1, p.startDate, "meal_lunch"));
    const calculated = recalculateMealPlan(p),
      old = calculated.plannedItems[0]!.recipeRef!.calculation;
    r.ingredients[0]!.nutrients[0]!.per100gValue = 999;
    expect(
      old.batchNutrients.find((n) => n.nutrientId === "energy_kcal")
        ?.batchValue,
    ).toBe(200);
    const n = calculated.summary.averageNutrients.find(
      (n) => n.nutrientId === "energy_kcal",
    )!;
    expect(n.knownDays).toBe(1);
    expect(n.totalDays).toBe(2);
    expect(n.status).toBe("partial");
  });
  it("rejects altered calculated caches before restore writes", () => {
    const r = recipe(),
      backup = emptyRecipeBackup();
    backup.recipeVersions.push(r);
    backup.recipeIdentities.push({
      id: r.recipeId,
      schemaVersion: 1,
      visibility: "local",
      title: r.title,
      currentVersionId: r.id,
      status: "active",
      createdAt: time,
      updatedAt: time,
    });
    expect(validateRecipeBackup(backup).recipeVersions).toHaveLength(1);
    backup.recipeVersions[0]!.calculation.batchNutrients[0]!.batchValue = 999;
    expect(() => validateRecipeBackup(backup)).toThrow();
  });
});
