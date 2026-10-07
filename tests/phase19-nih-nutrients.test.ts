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
  expect(parsed.filter((r) => r.status === "published")).toHaveLength(51);
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

it("retains new mineral and fat-soluble vitamin source dates without importing doses or form conversions", () => {
  const parsed = nutrientSchema.array().parse(records);
  for (const id of [
    "phosphorus_mg",
    "copper_mg",
    "manganese_mg",
    "selenium_ug",
    "vitamin_e_mg",
    "vitamin_k_ug",
  ]) {
    const record = parsed.find((row) => row.id === id)!;
    const source = verifiedSources.find(
      (row) => row.url === record.sources[0]!.locator,
    )!;
    expect(source.extractedAt.slice(0, 10)).toBe("2026-10-07");
    expect(record.editorial.reviewedAt).toBe("2026-10-07");
    expect(record.referenceValues).toEqual([]);
    expect(record.forms.every((form) => !form.conversionRule)).toBe(true);
    expect(record.deficiency!.medicalBoundary).toContain("cannot diagnose");
    expect(reviews.find((row) => row.id === id)?.reviewer.kind).toBe("machine");
  }
  const vitaminK = parsed.find((row) => row.id === "vitamin_k_ug")!;
  expect(vitaminK.interactions[0]!.description).toContain(
    "sudden intake changes",
  );
  const selenium = parsed.find((row) => row.id === "selenium_ug")!;
  expect(selenium.excess!.overview).toContain("frameworks differ");
  expect(selenium.interactions[0]!.description).toContain(
    "effect on the body is unclear",
  );
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

it("keeps natural food folate, source-reported DFE and medication safety contexts separate", () => {
  const parsed = nutrientSchema.array().parse(records);
  const foodFolate = parsed.find((r) => r.id === "folate_food_ug")!;
  const dfe = parsed.find((r) => r.id === "folate_dfe_ug")!;
  expect(foodFolate.canonicalUnit).toBe("µg");
  expect(dfe.canonicalUnit).toBe("µg DFE");
  expect(foodFolate.foodSourceRules[0]!.phase07NutrientId).toBe(
    "folate_food_ug",
  );
  expect(dfe.foodSourceRules[0]!.phase07NutrientId).toBe("folate_dfe_ug");
  expect(dfe.absorptionFactors[0]!.description).toContain(
    "No intake conversion",
  );
  expect(dfe.forms.map((f) => f.id)).toContain("methylfolate_5_mthf");
  expect(dfe.forms.every((f) => !f.conversionRule)).toBe(true);
  for (const id of [
    "folate_food_ug",
    "folate_dfe_ug",
    "choline_mg",
    "iodine_ug",
    "potassium_mg",
  ]) {
    const record = parsed.find((r) => r.id === id)!;
    const source = verifiedSources.find(
      (s) => s.url === record.sources[0]!.locator,
    )!;
    expect(source.extractedAt).toBe("2026-10-06T06:37:25Z");
    expect(record.referenceValues).toEqual([]);
    expect(record.deficiency!.medicalBoundary).toContain("cannot diagnose");
    expect(
      reviews
        .find((r) => r.module === "nutrients" && r.id === id)!
        .fields.flatMap((f) => f.sourceIds),
    ).toContain(source.id);
  }
  const potassium = parsed.find((r) => r.id === "potassium_mg")!;
  expect(potassium.excess!.overview).toContain("Kidney disease");
  expect(potassium.interactions[0]!.description).toContain("potassium-sparing");
  expect(dfe.excess!.overview).toContain("vitamin B12");
});

it("preserves source-specific vitamin A, folate and omega-3 concepts without inventing intake rows", () => {
  const parsed = nutrientSchema.array().parse(records);
  const ids = [
    "chromium_ug",
    "fluoride_mg",
    "molybdenum_ug",
    "pantothenic_acid_mg",
    "biotin_ug",
    "omega_3_g",
    "vitamin_a_rae_ug",
    "beta_carotene_ug",
    "retinol_ug",
    "folic_acid_ug",
  ];
  for (const id of ids) {
    const article = parsed.find((r) => r.id === id)!;
    const seed = identities.find((r) => r.id === id)!;
    expect(article.status).toBe("published");
    expect([
      article.slug,
      article.canonicalUnit,
      article.foodDataNutrientIds,
    ]).toEqual([seed.slug, seed.canonicalUnit, seed.foodDataNutrientIds]);
    expect(article.referenceValues).toEqual([]);
    expect(article.editorial.reviewedAt).toBe("2026-10-07");
    expect(article.claims.every((claim) => claim.sourceIds.length > 0)).toBe(
      true,
    );
    expect(article.deficiency!.medicalBoundary).toContain("cannot diagnose");
    expect(
      reviews.find((r) => r.module === "nutrients" && r.id === id)?.reviewer
        .kind,
    ).toBe("machine");
  }
  for (const id of [
    "chromium_ug",
    "fluoride_mg",
    "molybdenum_ug",
    "omega_3_g",
  ]) {
    expect(
      parsed
        .find((r) => r.id === id)!
        .foodSourceRules.every(
          (r) => r.status === "disabled" && r.phase07NutrientId === null,
        ),
    ).toBe(true);
  }
  expect(
    parsed.find((r) => r.id === "retinol_ug")!.sources[0]!.locator,
  ).toContain("VitaminA-HealthProfessional");
  expect(parsed.find((r) => r.id === "vitamin_a_rae_ug")!.canonicalUnit).toBe(
    "µg RAE",
  );
  expect(parsed.find((r) => r.id === "folic_acid_ug")!.canonicalUnit).toBe(
    "µg",
  );
  expect(
    JSON.stringify(parsed.find((r) => r.id === "biotin_ug")!.excess),
  ).toMatch(/laboratory|lab test/i);
  expect(
    JSON.stringify(parsed.find((r) => r.id === "chromium_ug")!.functions),
  ).toMatch(/uncertain|unclear|no longer/i);
});
