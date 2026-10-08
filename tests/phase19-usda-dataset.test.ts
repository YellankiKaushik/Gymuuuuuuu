import { expect, test } from "vitest";
import { createHash } from "node:crypto";
import selected from "../src/content/provenance/usda-selected.json";
import mappings from "../src/content/provenance/food-mappings.json";
import {
  normalizeUsdaSnapshot,
  verifySelectedAgainstDataset,
} from "../scripts/content/usda-dataset";
const mapping = mappings.find((row) => row.foodId === "food_pear")!;
const snapshot = selected.find((row) => row.fdcId === mapping.fdcId)!;
const original = normalizeUsdaSnapshot(snapshot);
const bytes = Buffer.from(JSON.stringify({ SRLegacyFoods: [null, original] }));
const descriptor = {
  sourceId: mapping.sourceId,
  datasetSha256: createHash("sha256").update(bytes).digest("hex"),
};
test("dataset verification checks the entire payload and exact projected factual values", () => {
  expect(
    verifySelectedAgainstDataset(bytes, descriptor, [snapshot], [mapping])
      .verifiedSourceRecords,
  ).toBe(1);
  expect(() =>
    verifySelectedAgainstDataset(
      Buffer.from("{}"),
      descriptor,
      [snapshot],
      [mapping],
    ),
  ).toThrow(/pinned dataset hash/);
  const changed = structuredClone(snapshot);
  changed.foodNutrients[0]!.amount = 999999;
  expect(() =>
    verifySelectedAgainstDataset(bytes, descriptor, [changed], [mapping]),
  ).toThrow(/differs from the pinned original/);
  expect(() =>
    verifySelectedAgainstDataset(bytes, descriptor, [], [mapping]),
  ).toThrow(/missing/);
});
test("microgram encoding repair requires the official nutrient ID and never changes quantities", () => {
  const repaired = normalizeUsdaSnapshot({
    ...original,
    foodNutrients: [
      { nutrient: { id: 1103, unitName: "\u00c2\u00b5g" }, amount: 0 },
    ],
  });
  expect(repaired.foodNutrients).toEqual([
    { nutrient: { id: 1103, unitName: "\u00b5g" }, amount: 0 },
  ]);
  expect(() =>
    normalizeUsdaSnapshot({
      ...original,
      foodNutrients: [
        { nutrient: { id: 1003, unitName: "\u00c2\u00b5g" }, amount: 1 },
      ],
    }),
  ).toThrow(/official nutrient-dictionary/);
  const changed = structuredClone(snapshot);
  changed.foodNutrients[0]!.nutrient.unitName = "mg";
  expect(() =>
    verifySelectedAgainstDataset(bytes, descriptor, [changed], [mapping]),
  ).toThrow(/differs from the pinned original/);
});
