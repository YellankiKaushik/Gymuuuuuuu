import { expect, it } from "vitest";
import records from "../src/content/foods/records.json";
import mappings from "../src/content/provenance/food-mappings.json";
import { publicRecipes } from "../src/features/recipes-meal-plans/public-records";
import pins from "../src/content/provenance/recipe-version-pins.json";
import { validateImmutableVersions } from "../scripts/content/immutable-versions";
import snapshots from "../src/content/provenance/usda-selected.json";

it("keeps raw and dry-heat milkfish independent and does not invent soy serving conversions", () => {
  const milkfish = records.find((r) => r.id === "food_milkfish")!;
  expect(milkfish.defaultProfileId).toBe("profile_milkfish_fdc_173675");
  expect(
    milkfish.compositionProfiles.map((p) => [p.foodState, p.label]),
  ).toEqual([
    ["raw", "Fish, milkfish, raw"],
    ["cooked", "Fish, milkfish, cooked, dry heat"],
  ]);
  for (const profile of milkfish.compositionProfiles) {
    const id = Number(profile.sourceRecords[0]!.externalFoodId);
    const source = snapshots.find((row) => row.fdcId === id)!;
    expect(
      profile.nutrients.find((row) => row.nutrientId === "protein_g")!.value,
    ).toBe(
      source.foodNutrients.find((row) => row.nutrient.id === 1003)!.amount,
    );
    expect(profile.portions[0]!.grams).toBe(85);
    expect(profile.portions[0]!.status).toBe("source_reported");
  }
  const soy = records.find((r) => r.id === "food_soy_beverage_unsweetened")!
    .compositionProfiles[0]!;
  expect(soy.label).toBe("Soy milk, unsweetened, plain, shelf stable");
  expect(soy.sourceRecords[0]!.externalFoodId).toBe("1999630");
  expect(soy.portions).toEqual([]);
  expect(soy.nutrients.find((r) => r.nutrientId === "omega_3_g")).toMatchObject(
    { value: null, status: "not_available" },
  );
});

it("retains exact edible parts, fortification and preparation for new USDA matches", () => {
  const checked = [
    ["food_chestnut", 169413, "raw", "japanese"],
    [
      "food_skim_milk",
      173432,
      "other",
      "without added vitamin A and vitamin D",
    ],
    ["food_duck_meat", 172410, "raw", "meat only"],
    ["food_chicken_wing", 173632, "raw", "meat only"],
    ["food_tomato_juice_unsalted", 170545, "canned", "without salt added"],
    ["food_orange_juice_unsweetened", 169098, "raw", "Orange juice, raw"],
    ["food_oregano", 171328, "dried", "dried"],
  ] as const;
  for (const [id, fdcId, state, qualifier] of checked) {
    const food = records.find((r) => r.id === id)!;
    const profile = food.compositionProfiles[0]!;
    expect(profile.foodState).toBe(state);
    expect(profile.label).toContain(qualifier);
    expect(profile.sourceRecords[0]!.externalFoodId).toBe(String(fdcId));
    expect(mappings.find((r) => r.foodId === id)!.verifiedAt).toMatch(
      /^2026-10-07T/,
    );
    expect(
      profile.nutrients.find((r) => r.nutrientId === "omega_3_g"),
    ).toMatchObject({ status: "not_available", value: null });
  }
});

it("retains existing recipe version pins after extending the composition library", () => {
  expect(() =>
    validateImmutableVersions(
      publicRecipes.map((r) => r.version),
      pins,
    ),
  ).not.toThrow();
});
