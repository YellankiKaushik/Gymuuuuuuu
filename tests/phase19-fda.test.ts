import { expect, it } from "vitest";
import {
  readVerifiedFdaSnapshot,
  verifyFdaReferenceValues,
  withVerifiedFdaReferences,
} from "../scripts/content/fda";
import { nutrientSchema } from "../src/features/nutrients/schema";
import records from "../src/content/nutrients/records.json";
import snapshot from "../src/content/provenance/fda-daily-values.json";
import original from "../src/content/provenance/fda-daily-values-2026-10-05.json";

it("retains the original seven values while publishing only 35 exact label concepts", () => {
  expect(readVerifiedFdaSnapshot()).toEqual(snapshot);
  for (const row of original.rows)
    expect(snapshot.rows.find((r) => r.nutrientId === row.nutrientId)).toEqual(
      row,
    );
  const parsed = nutrientSchema.array().parse(records);
  expect(parsed.flatMap((r) => r.referenceValues)).toHaveLength(35);
  for (const row of snapshot.rows) {
    const record = parsed.find((r) => r.id === row.nutrientId)!;
    expect(record.referenceValues).toHaveLength(1);
    expect(
      withVerifiedFdaReferences(record, readVerifiedFdaSnapshot()),
    ).toEqual(record);
    expect(record.referenceValues[0]?.notes).toMatch(
      /(?:personal|personalised).*target/,
    );
  }
  for (const id of [
    "folate_food_ug",
    "folic_acid_ug",
    "retinol_ug",
    "beta_carotene_ug",
    "sugars_total_g",
    "trans_fat_g",
    "omega_3_g",
    "water_g",
    "energy_kcal",
  ])
    expect(parsed.find((r) => r.id === id)!.referenceValues).toEqual([]);
});

it("rejects dropping equivalence/form units without deriving conversions", () => {
  const parsed = nutrientSchema.array().parse(records);
  for (const [id, incorrect] of [
    ["niacin_mg", "mg"],
    ["folate_dfe_ug", "µg"],
    ["vitamin_a_rae_ug", "µg"],
    ["vitamin_e_mg", "mg"],
  ]) {
    const changed = structuredClone(parsed);
    changed.find((r) => r.id === id)!.referenceValues[0]!.unit = incorrect!;
    expect(() => verifyFdaReferenceValues(changed, snapshot)).toThrow(
      "differs",
    );
  }
  const changed = structuredClone(parsed.find((r) => r.id === "niacin_mg")!);
  changed.canonicalUnit = "mg";
  expect(() =>
    withVerifiedFdaReferences(changed, readVerifiedFdaSnapshot()),
  ).toThrow("form/unit");
});

it("checks numerical FDA values and framework population against the retained table extraction", () => {
  const parsed = nutrientSchema.array().parse(records);
  expect(verifyFdaReferenceValues(parsed, snapshot).rows).toHaveLength(35);
  const changed = structuredClone(parsed);
  changed.find((r) => r.id === "magnesium_mg")!.referenceValues[0]!.value = 400;
  expect(() => verifyFdaReferenceValues(changed, snapshot)).toThrow(
    "differs from the source snapshot",
  );
  const wrongPopulation = structuredClone(parsed);
  wrongPopulation[0]!.referenceValues[0]!.population.ageMinMonths = 12;
  expect(() => verifyFdaReferenceValues(wrongPopulation, snapshot)).toThrow(
    "population",
  );
});
