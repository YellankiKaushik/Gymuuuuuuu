import { expect, it } from "vitest";
import identities from "../src/content/foods/identities.json";
import identityIds from "../src/content/foods/identity-ids.json";
import { dietPlanSchema } from "../src/features/diet-planning/domain";
import { dietPlanFixture } from "./fixtures/diet";

it("the compact relationship index preserves every seed ID without publishing factual records", () => {
  expect(identityIds).toEqual(identities.map((record) => record.id));
  expect(identityIds).toHaveLength(342);
  expect(new Set(identityIds).size).toBe(identityIds.length);
});

it("legacy diet exclusions retain the complete identity universe and reject unknown IDs", () => {
  const plan = dietPlanFixture();
  const candidate = {
    ...plan,
    dietPreferences: { ...plan.dietPreferences, excludedFoodIds: identityIds },
  };
  expect(dietPlanSchema.safeParse(candidate).success).toBe(true);
  expect(
    dietPlanSchema.safeParse({
      ...candidate,
      dietPreferences: {
        ...candidate.dietPreferences,
        excludedFoodIds: ["food_unknown_release_identity"],
      },
    }).success,
  ).toBe(false);
});
