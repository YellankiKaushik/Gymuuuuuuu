import { z } from "zod";
import type { Nutrient } from "../../src/features/nutrients/schema";

export const fdaSnapshotSchema = z.strictObject({
  sourceId: z.literal("fda_daily_values"),
  url: z.literal(
    "https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels",
  ),
  locator: z.literal("Reference Guide: Daily Values for Nutrients"),
  sourceVersion: z.string().nullable(),
  sourceDate: z.iso.date().nullable(),
  extractedAt: z.iso.datetime(),
  reviewMethod: z.string().min(1),
  rows: z
    .array(
      z.strictObject({
        nutrientId: z.string(),
        sourceName: z.string().min(1),
        value: z.number().finite().positive(),
        sourceUnit: z.enum(["g", "mg", "mcg"]),
      }),
    )
    .refine(
      (rows) => new Set(rows.map((r) => r.nutrientId)).size === rows.length,
      "Duplicate FDA nutrient IDs",
    ),
});

export function verifyFdaReferenceValues(
  records: readonly Nutrient[],
  input: unknown,
) {
  const snapshot = fdaSnapshotSchema.parse(input);
  for (const nutrient of records) {
    for (const reference of nutrient.referenceValues.filter(
      (r) => r.sourceId === snapshot.sourceId,
    )) {
      const row = snapshot.rows.find((r) => r.nutrientId === nutrient.id);
      if (
        !row ||
        reference.frameworkId !== "fda_dv_adult_4_plus" ||
        reference.valueType !== "DV" ||
        reference.value !== row.value ||
        reference.unit !== (row.sourceUnit === "mcg" ? "µg" : row.sourceUnit) ||
        reference.population.ageMinMonths !== 48 ||
        reference.population.ageMaxMonths !== null ||
        reference.population.sex !== "all" ||
        reference.population.lifeStage !== "general" ||
        reference.basis !== "label_reference"
      )
        throw Error(
          `${nutrient.id}: FDA label reference differs from the source snapshot or population.`,
        );
    }
  }
  return snapshot;
}
