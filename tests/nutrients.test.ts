import { it, expect } from "vitest";
import identities from "../src/content/nutrients/identities.json";
import {
  nutrientSchema,
  getNutrientPublicationStatus,
  validateClaimSources,
  type ReferenceValue,
} from "../src/features/nutrients/schema";
import {
  resolveReferenceValue,
  formatReferenceValue,
  type PopulationSelection,
  type ReferenceRow,
} from "../src/features/nutrients/frameworks";
import {
  calculatePercentReference,
  convertEquivalentUnit,
  type EquivalentRule,
} from "../src/features/nutrients/calculations";
import { rankVerifiedFoodSources } from "../src/features/nutrients/ranking";
import {
  searchNutrients,
  parseNutrientQuery,
} from "../src/features/nutrients/query";
import {
  nutrientFixture,
  nutrientFrameworkFixture,
  referenceFixture,
} from "./fixtures/nutrient";
import { foodFixture } from "./fixtures/food";
const rows: ReferenceRow[] = [
    {
      nutrientId: "protein_g",
      nutrientName: "Synthetic protein",
      reference: referenceFixture,
    },
  ],
  selection: PopulationSelection = {
    frameworkId: "us_canada_dri",
    frameworkVersion: "test-only-v1",
    ageMonths: 228,
    sex: "female",
    lifeStage: "general",
  };
it("validates all 51 stable identities with 44 Phase 07 IDs without publishing drafts", () => {
  const parsed = nutrientSchema.array().parse(identities);
  expect(parsed).toHaveLength(51);
  expect(parsed.filter((n) => n.foodDataNutrientIds.length)).toHaveLength(44);
  expect(
    parsed.every((n) => getNutrientPublicationStatus(n) === "draft_or_partial"),
  ).toBe(true);
  expect(nutrientSchema.safeParse(nutrientFixture).success).toBe(true);
});
it("requires exact approved claim coverage, citations, medical boundaries and signoff", () => {
  for (const mutate of [
    (n: typeof nutrientFixture) => (n.editorial.reviewer = null),
    (n: typeof nutrientFixture) => (n.claims[0]!.reviewStatus = "draft"),
    (n: typeof nutrientFixture) =>
      (n.functions[0]!.description = "Different unsupported function"),
    (n: typeof nutrientFixture) => (n.sources = []),
    (n: typeof nutrientFixture) =>
      (n.deficiency!.medicalBoundary = "Unverified replacement boundary"),
  ]) {
    const n = structuredClone(nutrientFixture);
    mutate(n);
    expect(nutrientSchema.safeParse(n).success).toBe(false);
  }
  expect(validateClaimSources(nutrientFixture)).toEqual([]);
});
it("rejects overlapping age bands, backwards ranges and incompatible framework types", () => {
  for (const row of [
    {
      ...referenceFixture,
      population: {
        ...referenceFixture.population,
        ageMinMonths: 599,
        ageMaxMonths: 900,
      },
    },
    { ...referenceFixture, frameworkId: "fda_dv_adult_4_plus" as const },
    {
      ...referenceFixture,
      valueType: "AMDR" as const,
      value: null,
      minValue: 50,
      maxValue: 10,
      unit: "% energy",
      basis: "percent_energy" as const,
    },
  ]) {
    const n = structuredClone(nutrientFixture);
    n.referenceValues.push(row);
    expect(nutrientSchema.safeParse(n).success).toBe(false);
  }
});
it("resolves inclusive boundary months and keeps frameworks/populations isolated", () => {
  for (const ageMonths of [228, 599])
    expect(
      resolveReferenceValue(
        "protein_g",
        "RDA",
        rows,
        { ...selection, ageMonths },
        [nutrientFrameworkFixture],
      ).status,
    ).toBe("value");
  for (const ageMonths of [227, 600])
    expect(
      resolveReferenceValue(
        "protein_g",
        "RDA",
        rows,
        { ...selection, ageMonths },
        [nutrientFrameworkFixture],
      ).status,
    ).toBe("unavailable");
  expect(
    resolveReferenceValue(
      "protein_g",
      "RDA",
      rows,
      { ...selection, sex: "male" },
      [nutrientFrameworkFixture],
    ).status,
  ).toBe("unavailable");
  expect(
    resolveReferenceValue(
      "protein_g",
      "RDA",
      rows,
      { ...selection, frameworkVersion: "unknown" },
      [nutrientFrameworkFixture],
    ).status,
  ).toBe("unsupported_framework");
  expect(
    resolveReferenceValue("protein_g", "RDA", [...rows, ...rows], selection, [
      nutrientFrameworkFixture,
    ]).status,
  ).toBe("ambiguous");
});
it("resolves pregnancy and lactation only when explicitly selected and sourced", () => {
  for (const lifeStage of ["pregnancy", "lactation"] as const) {
    const specific = [
      {
        ...rows[0]!,
        reference: {
          ...referenceFixture,
          population: { ...referenceFixture.population, lifeStage },
        },
      },
    ];
    expect(
      resolveReferenceValue(
        "protein_g",
        "RDA",
        specific,
        { ...selection, lifeStage },
        [nutrientFrameworkFixture],
      ).status,
    ).toBe("value");
    expect(
      resolveReferenceValue("protein_g", "RDA", specific, selection, [
        nutrientFrameworkFixture,
      ]).status,
    ).toBe("unavailable");
  }
});
it("keeps explicit no-established values distinct from missing and zero", () => {
  const r: ReferenceValue = {
    ...referenceFixture,
    valueType: "no_value_established",
    value: null,
    status: "not_applicable",
    notes: "Synthetic source establishes no value for this population.",
  };
  expect(formatReferenceValue(r)).toContain("No value established");
  expect(
    resolveReferenceValue(
      "protein_g",
      "no_value_established",
      [{ ...rows[0]!, reference: r }],
      selection,
      [nutrientFrameworkFixture],
    ).status,
  ).toBe("value");
  expect(formatReferenceValue({ ...referenceFixture, value: 0 })).toBe("0 g");
});
it("calculates compatible percentages and marks UL percentages as information, never goals", () => {
  const resolved = resolveReferenceValue("protein_g", "RDA", rows, selection, [
    nutrientFrameworkFixture,
  ]);
  const result = calculatePercentReference(
    { nutrientId: "protein_g", value: 25000, unit: "mg", status: "measured" },
    resolved,
  );
  expect(result.percent).toBe(50);
  expect(result.frameworkVersion).toBe("test-only-v1");
  const upper = resolveReferenceValue(
    "protein_g",
    "UL",
    [
      {
        ...rows[0]!,
        reference: { ...referenceFixture, valueType: "UL", value: 100 },
      },
    ],
    selection,
    [nutrientFrameworkFixture],
  );
  expect(
    calculatePercentReference(
      { nutrientId: "protein_g", value: 50, unit: "g", status: "measured" },
      upper,
    ).kind,
  ).toBe("upper_limit_information");
  for (const input of [
    { nutrientId: "iron_mg", value: 25, unit: "g", status: "measured" },
    {
      nutrientId: "protein_g",
      value: null,
      unit: "g",
      status: "not_available",
    },
  ])
    expect(() => calculatePercentReference(input, resolved)).toThrow();
});
it("requires form/framework/version-scoped equivalent conversions", () => {
  const context = {
      nutrientId: "vitamin_d_ug",
      frameworkId: "us_canada_dri",
      frameworkVersion: "test-only-v1",
      form: "synthetic-form",
    },
    rule: EquivalentRule = {
      id: "test-rule",
      ...context,
      fromUnit: "test-unit",
      toUnit: "µg",
      factor: 2,
      sourceUrl: "https://example.invalid/synthetic",
      sourceLocator: "Synthetic test only",
      reviewStatus: "approved",
    };
  expect(convertEquivalentUnit(1, "mg", "g", context)).toBe(0.001);
  expect(() => convertEquivalentUnit(1, "mg", "mg NE", context)).toThrow();
  expect(convertEquivalentUnit(1, "test-unit", "µg", context, rule)).toBe(2);
  expect(() =>
    convertEquivalentUnit(
      1,
      "test-unit",
      "µg",
      { ...context, frameworkVersion: "wrong" },
      rule,
    ),
  ).toThrow();
  expect(() => convertEquivalentUnit(-1, "g", "g", context)).toThrow();
});
it("ranks only approved numeric compatible food profiles and retains state/source metadata", () => {
  const food = structuredClone(foodFixture);
  food.compositionProfiles[0]!.nutrients[1]!.value = 5;
  const p = food.compositionProfiles[0]!;
  expect(
    rankVerifiedFoodSources([food], "protein_g", "per_100g")[0]?.amount,
  ).toBe(5);
  expect(
    rankVerifiedFoodSources([food], "protein_g", "per_verified_portion")[0]
      ?.amount,
  ).toBe(1.875);
  expect(rankVerifiedFoodSources([food], "iron_mg", "per_100g")).toEqual([]);
  expect(
    rankVerifiedFoodSources([food], "protein_g", "per_100g", { unit: "mg NE" }),
  ).toEqual([]);
  p.nutrients[0]!.value = 0;
  expect(rankVerifiedFoodSources([food], "protein_g", "per_100kcal")).toEqual(
    [],
  );
  p.nutrients[1]!.status = "estimated";
  p.nutrients[1]!.methodNote = "Synthetic estimate";
  expect(
    rankVerifiedFoodSources([food], "protein_g", "per_100g", {
      includeEstimates: false,
    }),
  ).toEqual([]);
  expect(
    rankVerifiedFoodSources([food], "protein_g", "per_100g")[0]?.state,
  ).toBe("raw");
});
it("searches aliases/abbreviations and supports a compact 250-topic future index", () => {
  const index = Array.from({ length: 250 }, (_, i) => ({
    id: `future_${i}`,
    slug: `future-${i}`,
    name: `Synthetic ${i}`,
    aliases: ["MUFA"],
    group: "macronutrients",
    essentiality: "nonessential",
    unit: "g",
    displayKind: "fat_component",
    frameworks: ["us_canada_dri"],
    foodCoverage: i % 2,
    terms: `synthetic ${i} mufa`,
  }));
  expect(
    searchNutrients(
      parseNutrientQuery({
        q: "MUFA",
        food: "available",
        framework: "us_canada_dri",
      }),
      index,
    ),
  ).toHaveLength(125);
  expect(
    searchNutrients(parseNutrientQuery({ q: "synthetiv" }), index),
  ).toHaveLength(250);
});
