import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import fda from "../src/content/provenance/fda-daily-values.json";
import records from "../src/content/nutrients/records.json";
import definitions from "../src/content/provenance/component-nutrient-definitions.json";
import snapshot from "../src/content/provenance/component-nutrient-snapshot.json";
import sources from "../src/content/provenance/verified-sources.json";
import { nutrientSchema } from "../src/features/nutrients/schema";
import { validatePublicationReviews } from "../src/features/content-review/schema";
import reviews from "../src/content/provenance/publications.json";

test("all 51 nutrient identities have bounded source education and exact source provenance", () => {
  const published = nutrientSchema
    .array()
    .parse(records)
    .filter((r) => r.status === "published");
  expect(published).toHaveLength(51);
  expect(new Set(published.map((r) => r.id)).size).toBe(51);
  expect(
    createHash("sha256")
      .update(
        readFileSync(
          "src/content/provenance/component-nutrient-definitions.json",
        ),
      )
      .digest("hex"),
  ).toBe(snapshot.definitionsSha256);
  expect(snapshot.recordIds).toEqual(definitions.map((d) => d.id));
  expect(definitions).toHaveLength(19);
  for (const d of definitions) {
    const record = published.find((r) => r.id === d.id)!;
    expect(record.summary).toBe(d.role);
    expect(record.sources[0]?.locator).toBe(d.source.url);
    const row = fda.rows.find((r) => r.nutrientId === record.id);
    if (row) {
      expect(record.referenceValues).toHaveLength(1);
      expect(record.referenceValues[0]).toMatchObject({
        frameworkId: "fda_dv_adult_4_plus",
        valueType: "DV",
        value: row.value,
        unit: record.canonicalUnit,
      });
    } else expect(record.referenceValues).toEqual([]);
    expect(record.athleticRelevance).toEqual([]);
    expect(record.editorial.reviewer).toContain("no human review");
    const source = sources.find((s) => s.id === d.source.verifiedSourceId)!;
    expect(source).toEqual(snapshot.sources.find((s) => s.id === source.id));
    expect(source.url).toBe(d.source.url);
    expect(source.sourceVersion).toBe(d.source.version);
    expect(source.sourceDate).toBe(d.source.sourceDate);
  }
  expect(published.flatMap((r) => r.referenceValues)).toHaveLength(35);
});

test("missing measurements, energy methods, source age and scope remain explicit", () => {
  for (const id of [
    "carbohydrate_available_g",
    "alcohol_g",
    "omega_6_g",
    "chloride_mg",
  ]) {
    const record = records.find((r) => r.id === id)!;
    expect(record.foodSourceRules[0]?.status).toBe("disabled");
    expect(record.foodSourceRules[0]?.phase07NutrientId).toBeNull();
  }
  expect(
    records
      .find((r) => r.id === "energy_kj")
      ?.claims.some(
        (c) =>
          c.category === "conversion" &&
          c.text.includes("1 kcal equals 4.184 kJ"),
      ),
  ).toBe(true);
  expect(
    records
      .find((r) => r.id === "carbohydrate_available_g")
      ?.claims.some((c) => c.text.includes("Missing fiber")),
  ).toBe(true);
  expect(
    records
      .find((r) => r.id === "sugars_total_g")
      ?.claims.some((c) =>
        c.text.includes("does not reveal the added-sugar amount"),
      ),
  ).toBe(true);
  const water = sources.find((s) => s.id === "nhs_water_drinks_2023")!;
  expect(water.sourceDate).toBe("2023-05-17");
  expect(water.limitations.some((s) => s.includes("past"))).toBe(true);
  const validated = validatePublicationReviews(
    reviews,
    sources,
    new Date().toISOString().slice(0, 10),
  );
  for (const d of definitions)
    expect(
      validated
        .find((r) => r.module === "nutrients" && r.id === d.id)
        ?.fields.flatMap((f) => f.sourceIds),
    ).toContain(d.source.verifiedSourceId);
});

test("new education authorities cannot authorize numeric intake rows", () => {
  const protein = records.find((r) => r.id === "protein_g")!;
  const reference = records.find((r) => r.id === "iron_mg")!
    .referenceValues[0]!;
  expect(
    nutrientSchema.safeParse({
      ...protein,
      referenceValues: [
        {
          ...reference,
          sourceId: "fda_nutrition_education",
          unit: protein.canonicalUnit,
        },
      ],
    }).success,
  ).toBe(false);
  expect(
    nutrientSchema.safeParse({
      ...protein,
      sources: [{ ...protein.sources[0], sourceId: "unapproved_source" }],
    }).success,
  ).toBe(false);
});
