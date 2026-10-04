import { describe, it, expect } from "vitest";
import {
  foodSchema,
  compositionProfileSchema,
} from "../src/features/foods/schema";
import {
  buildFoodSearchIndex,
  compareProfiles,
  formatNutrient,
  scaleNutrients,
} from "../src/features/foods/domain";
import { parseFoodQuery, searchFoods } from "../src/features/foods/query";
import { foodFixture } from "./fixtures/food";
import identities from "../src/content/foods/identities.json";
import {
  mapSourceNutrient,
  normalizeSourceAmount,
} from "../src/features/foods/ingestion";
const profile = foodFixture.compositionProfiles[0]!;
describe("food composition integrity", () => {
  it("converts plain mass units through an explicit reviewed mapping without converting equivalents", () => {
    expect(normalizeSourceAmount(250, "mg", "g")).toBe(0.25);
    expect(() => normalizeSourceAmount(10, "µg", "µg RAE")).toThrow();
    expect(() => normalizeSourceAmount(-1, "g", "g")).toThrow();
    expect(
      mapSourceNutrient(
        {
          externalNutrientId: "fixture",
          amount: 250,
          unit: "mg",
          status: "measured",
          sourceRecordId: "test-source",
          methodNote: null,
        },
        {
          externalNutrientId: "fixture",
          nutrientId: "protein_g",
          reviewedBy: "Test",
          reviewedAt: "2026-08-05",
        },
      ).value,
    ).toBe(0.25);
  });
  it("accepts every supplied draft but never publishes identities", () => {
    expect(foodSchema.array().parse(identities)).toHaveLength(342);
    expect(buildFoodSearchIndex(foodSchema.array().parse(identities))).toEqual(
      [],
    );
    expect(foodSchema.parse(foodFixture)).toEqual(foodFixture);
  });
  it("requires review, approved default profiles, rights and distributable provenance", () => {
    for (const mutate of [
      (f: typeof foodFixture) => (f.editorial.reviewer = null),
      (f: typeof foodFixture) => (f.defaultProfileId = null),
      (f: typeof foodFixture) =>
        (f.compositionProfiles[0]!.review.status = "not_started"),
      (f: typeof foodFixture) =>
        (f.compositionProfiles[0]!.sourceRecords[0]!.sourceId =
          "fao_infoods_guidelines"),
      (f: typeof foodFixture) =>
        (f.compositionProfiles[0]!.sourceRecords[0]!.citation = ""),
    ]) {
      const f = structuredClone(foodFixture);
      mutate(f);
      expect(foodSchema.safeParse(f).success).toBe(false);
    }
  });
  it("rejects zero-sized portions, missing sources, duplicate nutrients and wrong units", () => {
    for (const mutate of [
      (p: typeof profile) => (p.portions[0]!.grams = 0),
      (p: typeof profile) => (p.nutrients[0]!.sourceRecordId = "missing"),
      (p: typeof profile) => p.nutrients.push(p.nutrients[0]!),
      (p: typeof profile) => (p.nutrients[0]!.unit = "g"),
    ]) {
      const p = structuredClone(profile);
      mutate(p);
      expect(compositionProfileSchema.safeParse(p).success).toBe(false);
    }
  });
  it("preserves null, trace and genuine zero while scaling full precision", () => {
    const scaled = scaleNutrients(profile, 37.5);
    expect(scaled[0]!.value).toBeCloseTo(123.456 * 0.375, 12);
    expect(scaled[1]!.value).toBe(0);
    expect(scaled[2]!.value).toBeNull();
    expect(scaled[2]!.maxValue).toBeCloseTo(0.0375, 12);
    expect(formatNutrient(scaled[1])).toBe("0 g");
    expect(formatNutrient(scaled[2])).toBe("Trace");
    expect(formatNutrient(undefined)).toBe("Not available");
    for (const grams of [0, -1, NaN, Infinity, 10001])
      expect(() => scaleNutrients(profile, grams)).toThrow();
  });
  it("rejects nonnumeric values presented as numeric and reversed bounds", () => {
    const p = structuredClone(profile);
    p.nutrients[2]!.value = 0;
    expect(compositionProfileSchema.safeParse(p).success).toBe(false);
    p.nutrients[2]!.value = null;
    p.nutrients[2]!.minValue = 1;
    expect(compositionProfileSchema.safeParse(p).success).toBe(false);
  });
  it("compares common bases and leaves missing differences nonnumeric", () => {
    const p = structuredClone(profile);
    p.profileId = "profile_second";
    p.nutrients[0]!.value = 200;
    const row = compareProfiles([profile, p]).find(
      (r) => r.id === "energy_kcal",
    )!;
    expect(row.differences[1]).toBeCloseTo(200 - 123.456);
    expect(
      compareProfiles([profile, p]).find((r) => r.id === "iron_mg")!
        .differences,
    ).toEqual([null, null]);
    expect(() => compareProfiles([profile])).toThrow();
  });
});
describe("compact food discovery", () => {
  const index = buildFoodSearchIndex([foodFixture]);
  it("supports alias, accents, deterministic typo matching and combined filters", () => {
    expect(
      searchFoods(
        parseFoodQuery({
          q: "fíxture álias",
          category: "fruits",
          state: "raw",
        }),
        index,
      ).total,
    ).toBe(1);
    expect(searchFoods(parseFoodQuery({ q: "synthetiq" }), index).total).toBe(
      1,
    );
    expect(searchFoods(parseFoodQuery({ state: "boiled" }), index).total).toBe(
      0,
    );
  });
  it("excludes missing numeric data and handles genuine zero and estimates explicitly", () => {
    expect(
      searchFoods(
        parseFoodQuery({ nutrient: "protein_g", minimum: "0", maximum: "0" }),
        index,
      ).total,
    ).toBe(1);
    expect(
      searchFoods(
        parseFoodQuery({ nutrient: "fat_total_g", minimum: "0" }),
        index,
      ).total,
    ).toBe(0);
    const modified = structuredClone(index);
    modified[0]!.profiles[0]!.summary.protein_g!.status = "estimated";
    expect(
      searchFoods(
        parseFoodQuery({ nutrient: "protein_g", estimates: "exclude" }),
        modified,
      ).total,
    ).toBe(0);
  });
  it("searches a 10,000-food / 30,000-profile compact index with bounded pages", () => {
    const large = Array.from({ length: 10000 }, (_, i) => ({
      ...index[0]!,
      id: `food_fixture_${i}`,
      slug: `fixture-${i}`,
      name: `Fixture ${String(i).padStart(5, "0")}`,
      terms: `fixture ${i}`,
      profiles: Array.from({ length: 3 }, (_, j) => ({
        ...index[0]!.profiles[0]!,
        id: `profile_fixture_${i}_${j}`,
      })),
    }));
    const start = performance.now(),
      r = searchFoods(parseFoodQuery({ q: "fixture", page: 100 }), large);
    expect(r.total).toBe(30000);
    expect(r.rows).toHaveLength(30);
    expect(performance.now() - start).toBeLessThan(3000);
  });
});
