import { foodFixture } from "./food";
import {
  nutritionNutrients,
  customRevisionSchema,
  type CustomFoodRevision,
} from "../../src/features/nutrition-tracker/schema";
import {
  createCanonicalFoodLogSnapshot,
  exactMassAmount,
  type EntryContext,
} from "../../src/features/nutrition-tracker/domain";
const now = "2026-10-05T12:00:00.000Z";
export const nutritionContext: EntryContext = {
  localDate: "2026-10-04",
  timeZone: "Asia/Kolkata",
  localTime: "12:00",
  occurredAtUtc: "2026-10-04T06:30:00.000Z",
  mealSlotId: "meal_lunch",
  mealLabelSnapshot: "Lunch",
  now,
};
export function nutritionFood() {
  const f = structuredClone(foodFixture);
  const p = f.compositionProfiles[0]!;
  p.nutrients = nutritionNutrients.map((n) => ({
    nutrientId: n.id as (typeof p.nutrients)[number]["nutrientId"],
    unit: n.canonicalUnit,
    value: null,
    status: "not_available",
    sourceRecordId: "test-source",
  }));
  for (const [id, value] of [
    ["energy_kcal", 100],
    ["protein_g", 10],
    ["carbohydrate_total_g", 20],
    ["fat_total_g", 2],
    ["fiber_total_g", 5],
  ] as const) {
    const n = p.nutrients.find((n) => n.nutrientId === id)!;
    n.value = value;
    n.status = "measured";
    n.minValue = null;
    n.maxValue = null;
  }
  return f;
}
export function canonical(quantity = 150) {
  const f = nutritionFood();
  return createCanonicalFoodLogSnapshot(
    f,
    f.compositionProfiles[0]!.profileId,
    exactMassAmount(quantity, "g"),
    nutritionContext,
  );
}
export function customRevision(): CustomFoodRevision {
  return customRevisionSchema.parse({
    id: "custom_food_revision_test",
    customFoodId: "custom_food_test",
    revisionNumber: 1,
    basis: "per_serving",
    serving: { description: "Synthetic test portion", gramWeight: 40 },
    nutrients: [
      { nutrientId: "energy_kcal", value: 120, unit: "kcal" },
      { nutrientId: "protein_g", value: 5, unit: "g" },
    ],
    sourceType: "personal_calculation",
    sourceNote: "Arithmetic fixture only.",
    createdAt: now,
  });
}
