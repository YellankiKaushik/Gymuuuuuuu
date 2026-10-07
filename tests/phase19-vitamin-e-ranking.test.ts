import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { z } from "zod";
import { foodSchema } from "../src/features/foods/schema";
import { numericValue } from "../src/features/foods/domain";
import { mappingSchema, snapshotHash } from "../scripts/content/usda";
import { verifyAlphaTocopherolRankings } from "../scripts/content/vitamin-e-ranking";

const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const foods = foodSchema.array().parse(read("src/content/foods/records.json"));
const mappings = mappingSchema
  .array()
  .parse(read("src/content/provenance/food-mappings.json"));
const snapshots = z
  .array(z.unknown())
  .parse(read("src/content/provenance/usda-selected.json"));
const food = foods.find((row) =>
  row.compositionProfiles.some(
    (profile) =>
      (numericValue(
        profile.nutrients.find((value) => value.nutrientId === "vitamin_e_mg"),
        true,
      ) ?? 0) > 0,
  ),
)!;

it("uses the exact alpha-tocopherol mass without an IU or activity conversion", () => {
  expect(() =>
    verifyAlphaTocopherolRankings(foods, mappings, snapshots),
  ).not.toThrow();
  const rankings = z
    .array(z.object({ unit: z.string(), amount: z.number() }))
    .parse(read("src/content/nutrients/rankings/vitamin_e_mg.json"));
  expect(rankings.length).toBeGreaterThan(0);
  expect(rankings.every((row) => row.unit === "mg alpha-tocopherol")).toBe(
    true,
  );
});

it("rejects changed composition or missing provenance", () => {
  const tampered = structuredClone(food);
  const value = tampered.compositionProfiles
    .flatMap((profile) => profile.nutrients)
    .find(
      (row) =>
        row.nutrientId === "vitamin_e_mg" && (numericValue(row, true) ?? 0) > 0,
    )!;
  value.value = value.value! + 1;
  expect(() =>
    verifyAlphaTocopherolRankings([tampered], mappings, snapshots),
  ).toThrow(/Unverified alpha-tocopherol/);
  expect(() => verifyAlphaTocopherolRankings([food], [], snapshots)).toThrow(
    /Unverified alpha-tocopherol/,
  );
});

it("does not accept a different tocopherol form merely because its unit is also mg", () => {
  const profile = food.compositionProfiles.find(
    (row) =>
      (numericValue(
        row.nutrients.find((value) => value.nutrientId === "vitamin_e_mg"),
        true,
      ) ?? 0) > 0,
  )!;
  const mapping = mappings.find(
    (row) =>
      row.foodId === food.id && profile.profileId.endsWith(`_fdc_${row.fdcId}`),
  )!;
  const shape = z
    .object({
      fdcId: z.number(),
      foodNutrients: z.array(
        z
          .object({
            nutrient: z
              .object({
                id: z.number(),
                name: z.string(),
                unitName: z.string(),
              })
              .passthrough(),
          })
          .passthrough(),
      ),
    })
    .passthrough();
  const source = shape.parse(
    snapshots.find(
      (row) =>
        z.object({ fdcId: z.number() }).parse(row).fdcId === mapping.fdcId,
    ),
  );
  source.foodNutrients.find((row) => row.nutrient.id === 1109)!.nutrient.name =
    "Vitamin E (gamma-tocopherol)";
  const otherMappings = mappings.map((row) =>
    row === mapping
      ? { ...row, sourceSnapshotSha256: snapshotHash(source) }
      : row,
  );
  const otherSources = snapshots.map((row) =>
    z.object({ fdcId: z.number() }).parse(row).fdcId === mapping.fdcId
      ? source
      : row,
  );
  expect(() =>
    verifyAlphaTocopherolRankings([food], otherMappings, otherSources),
  ).toThrow(/Unverified alpha-tocopherol/);
});
