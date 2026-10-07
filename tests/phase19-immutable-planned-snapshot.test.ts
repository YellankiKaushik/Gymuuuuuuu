import { expect, it } from "vitest";
import { canonical } from "./fixtures/nutrition";
import { recipeDraft } from "../src/features/recipes-meal-plans/editor";
import {
  ingredientFromFoodEntry,
  plannedRecipeItem,
} from "../src/features/recipes-meal-plans/domain";
import { plannedItemSchema } from "../src/features/recipes-meal-plans/schema";

function fixture() {
  return recipeDraft(
    "Test-only immutable snapshot",
    [ingredientFromFoodEntry(canonical(100), 0)],
    {
      instructions: "Fixture instruction",
      cookingMethod: "no_cook",
      allowUnadjustedRetention: false,
      reason: "Test fixture",
      yieldModel: {
        mode: "measured_final_weight",
        finalWeightGrams: 100,
        servings: 1,
        servingWeightGrams: 100,
        tolerancePercent: 2,
        measuredAt: "2026-10-04T06:00:00Z",
      },
    },
  );
}
it("shares only validated immutable snapshots while keeping plan quantities independent", () => {
  const recipe = fixture();
  const first = plannedRecipeItem(recipe, 1, "2026-10-04", "meal_lunch");
  const second = plannedRecipeItem(recipe, 2, "2026-10-05", "meal_lunch");
  expect(second.recipeRef).toBe(first.recipeRef);
  expect(
    Object.isFrozen(first.recipeRef!.ingredientRequirements[0]!.nutrients),
  ).toBe(true);
  expect(() => {
    first.recipeRef!.ingredientRequirements[0]!.gramWeight = 1;
  }).toThrow();
  expect(second.gramWeight).toBe(200);
  recipe.ingredients[0]!.gramWeight = 50;
  const changed = plannedRecipeItem(recipe, 1, "2026-10-06", "meal_lunch");
  expect(changed.recipeRef).not.toBe(first.recipeRef);
  expect(changed.recipeRef!.ingredientRequirements[0]!.gramWeight).toBe(50);
  expect(first.recipeRef!.ingredientRequirements[0]!.gramWeight).toBe(100);
});
it("fully validates restored copies and rejects frozen but unowned invalid snapshots", () => {
  const item = plannedRecipeItem(fixture(), 1, "2026-10-04", "meal_lunch");
  const restored = structuredClone(item);
  expect(plannedItemSchema.parse(restored)).toEqual(item);
  restored.recipeRef!.ingredientRequirements[0]!.nutrients[0]!.unit = "wrong";
  Object.freeze(restored.recipeRef);
  expect(plannedItemSchema.safeParse(restored).success).toBe(false);
});
