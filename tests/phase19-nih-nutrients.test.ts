import { expect, it } from "vitest";
import records from "../src/content/nutrients/records.json";
import identities from "../src/content/nutrients/identities.json";
import verifiedSources from "../src/content/provenance/verified-sources.json";
import reviews from "../src/content/provenance/publications.json";
import { nutrientSchema } from "../src/features/nutrients/schema";
import { foodSchema } from "../src/features/foods/schema";
import { rankVerifiedFoodSources } from "../src/features/nutrients/ranking";
import foods from "../src/content/foods/records.json";
const additions = ["thiamin_mg", "riboflavin_mg", "niacin_mg", "vitamin_b6_mg"];
it("keeps every new nutrient's stable identity, exact NIH page and honest dated publication", () => {
  const parsed = nutrientSchema.array().parse(records);
  expect(parsed.filter((r) => r.status === "published")).toHaveLength(11);
  expect(parsed.flatMap((r) => r.referenceValues)).toHaveLength(7);
  for (const id of additions) {
    const record = parsed.find((r) => r.id === id)!,
      seed = identities.find((r) => r.id === id)!;
    expect([
      record.slug,
      record.canonicalUnit,
      record.foodDataNutrientIds,
    ]).toEqual([seed.slug, seed.canonicalUnit, seed.foodDataNutrientIds]);
    expect(record.referenceValues).toEqual([]);
    expect(record.claims.map((c) => c.category)).toEqual([
      "function",
      "food_source",
      "deficiency",
      "excess",
      "interaction",
    ]);
    const source = verifiedSources.find(
      (s) => s.url === record.sources[0]!.locator,
    )!;
    expect(source.evidenceType).toBe("government_reference");
    expect(source.sourceDate).toMatch(/^202[123]-/);
    expect(source.extractedAt.startsWith("2026-10-06")).toBe(true);
    const review = reviews.find(
      (r) => r.module === "nutrients" && r.id === id,
    )!;
    expect(review.state).toBe("published_personal_use");
    expect(review.reviewer.kind).toBe("machine");
    expect(review.fields.flatMap((f) => f.sourceIds)).toContain(source.id);
  }
});
it("never ranks niacin mass as niacin equivalents or diagnoses from a deficiency page", () => {
  const niacin = nutrientSchema.parse(
    records.find((r) => r.id === "niacin_mg"),
  );
  expect(niacin.canonicalUnit).toBe("mg NE");
  expect(
    niacin.foodSourceRules.every(
      (r) => r.status === "disabled" && r.phase07NutrientId === null,
    ),
  ).toBe(true);
  expect(
    rankVerifiedFoodSources(
      foodSchema.array().parse(foods),
      "niacin_mg",
      "per_100g",
      { unit: "mg NE" },
    ),
  ).toEqual([]);
  for (const id of additions) {
    const record = nutrientSchema.parse(records.find((r) => r.id === id));
    expect(record.deficiency!.medicalBoundary).toContain("cannot diagnose");
    const tampered = structuredClone(record);
    tampered.functions[0]!.description = "An unsupported performance guarantee";
    expect(() => nutrientSchema.parse(tampered)).toThrow(/approved claim/);
  }
});
