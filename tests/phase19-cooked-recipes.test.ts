import { expect, it } from "vitest";
import foodRecords from "../src/content/foods/records.json";
import mappings from "../src/content/provenance/food-mappings.json";
import snapshots from "../src/content/provenance/usda-selected.json";
import identities from "../src/content/foods/identities.json";
import sources from "../src/content/provenance/sources.json";
import { foodSchema } from "../src/features/foods/schema";
import { publicRecipes } from "../src/features/recipes-meal-plans/public-records";
import { recalculateRecipe } from "../src/features/recipes-meal-plans/domain";
import { buildUsdaRelease } from "../scripts/content/usda";
import versionPins from "../src/content/provenance/recipe-version-pins.json";
import { validateImmutableVersions } from "../scripts/content/immutable-versions";
it("rejects changing or deleting a pinned recipe version before an import write", () => {
  const versions = publicRecipes.map((recipe) => recipe.version);
  expect(() => validateImmutableVersions(versions, versionPins)).not.toThrow();
  const altered = structuredClone(versions);
  altered[0]!.ingredients[0]!.gramWeight! += 1;
  expect(() => validateImmutableVersions(altered, versionPins)).toThrow(
    /changed/,
  );
  expect(() =>
    validateImmutableVersions(versions.slice(1), versionPins),
  ).toThrow(/Missing/);
  expect(() =>
    validateImmutableVersions(versions, [...versionPins, versionPins[0]]),
  ).toThrow(/Duplicate/);
});
it("keeps cooked source profiles distinct, dated and independent of raw grams", () => {
  const foods = foodSchema.array().parse(foodRecords);
  const beans = foods.find((f) => f.id === "food_kidney_bean")!;
  expect(beans.compositionProfiles.map((p) => p.foodState)).toEqual([
    "raw",
    "boiled",
  ]);
  expect(beans.defaultProfileId).toBe(beans.compositionProfiles[0]!.profileId);
  const cooked = beans.compositionProfiles[1]!;
  expect(cooked.sourceRecords[0]!.externalFoodId).toBe("175194");
  expect(cooked.review.reviewedAt?.startsWith("2026-10-06")).toBe(true);
  expect(cooked.sourceRecords[0]!.accessedAt.startsWith("2026-10-05")).toBe(
    true,
  );
  const rawEnergy = beans.compositionProfiles[0]!.nutrients.find(
    (n) => n.nutrientId === "energy_kcal",
  )!.value;
  expect(
    cooked.nutrients.find((n) => n.nutrientId === "energy_kcal")!.value,
  ).not.toBe(rawEnergy);
  const rice = foods.find((f) => f.id === "food_brown_rice")!;
  expect(rice.compositionProfiles.map((p) => p.foodState)).toEqual([
    "raw",
    "cooked",
  ]);
  expect(rice.compositionProfiles[1]!.label).toContain("cooked");
  expect(() =>
    buildUsdaRelease(
      identities,
      [{ ...mappings[0], verifiedAt: "2099-01-01T00:00:00Z" }],
      snapshots,
      sources[0]!.extractedAt,
    ),
  ).toThrow(/future/);
});
it("replays original prepared-food recipes without raw/cooked conversions, invented yields or retention", () => {
  expect(publicRecipes).toHaveLength(24);
  const additional = publicRecipes.filter((r) =>
    r.sourceRefs.includes("original_recipes_v2"),
  );
  expect(additional).toHaveLength(12);
  for (const recipe of additional) {
    const v = recipe.version;
    expect(v.yieldModel.mode).toBe("estimated_sum_ingredients");
    expect(v.yieldModel.measuredAt).toBeNull();
    expect(v.yieldModel.finalWeightGrams).toBe(
      v.ingredients.reduce((sum, i) => sum + i.gramWeight!, 0),
    );
    expect(v.ingredients.every((i) => !i.retentionAssignments?.length)).toBe(
      true,
    );
    expect(recalculateRecipe(v).calculation.batchNutrients).toEqual(
      v.calculation.batchNutrients,
    );
  }
  const egg = additional.find((r) => r.slug === "egg-potato-bowl")!.version
    .ingredients[0]!;
  expect(egg.canonicalFoodRef?.profileState).toBe("boiled");
  expect(egg.canonicalFoodRef?.sourceRecordId).toBe("usda_fdc_173424");
  expect(egg.gramWeight).toBe(100);
  const oats = additional.find((r) => r.slug === "cooked-oat-banana-bowl")!
    .version.ingredients[0]!;
  expect(oats.canonicalFoodRef?.profileState).toBe("cooked");
  expect(oats.gramWeight).toBe(200);
});
