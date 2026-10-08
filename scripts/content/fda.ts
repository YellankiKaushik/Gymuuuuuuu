import { z } from "zod";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
        sourceUnit: z.enum([
          "g",
          "mg",
          "mcg",
          "mcg DFE",
          "mcg RAE",
          "mg NE",
          "mg alpha-tocopherol",
        ]),
      }),
    )
    .refine(
      (rows) => new Set(rows.map((r) => r.nutrientId)).size === rows.length,
      "Duplicate FDA nutrient IDs",
    ),
});

export function readVerifiedFdaSnapshot() {
  const bytes = readFileSync("src/content/provenance/fda-daily-values.json");
  if (
    createHash("sha256").update(bytes).digest("hex") !==
    "31700368548a803df43b8f5ba60ea5d44a0b15f1540ae84dffa84177aabe8040"
  )
    throw Error(
      "FDA transcription changed; explicitly verify a new source revision before publication.",
    );
  return fdaSnapshotSchema.parse(JSON.parse(bytes.toString("utf8")));
}

type Snapshot = z.infer<typeof fdaSnapshotSchema>;
const canonicalUnit = (unit: Snapshot["rows"][number]["sourceUnit"]) =>
  unit.replace("mcg", "µg");

// Add only exact table concepts. No nutrient-form, activity or mass conversion.
export function withVerifiedFdaReferences(
  record: Nutrient,
  snapshot: Snapshot,
): Nutrient {
  const row = snapshot.rows.find((r) => r.nutrientId === record.id);
  if (!row) return record;
  if (canonicalUnit(row.sourceUnit) !== record.canonicalUnit)
    throw Error(
      `${record.id}: FDA source form/unit differs from the stable nutrient concept.`,
    );
  const existing = record.referenceValues.filter(
    (r) => r.sourceId === snapshot.sourceId,
  );
  if (existing.length > 1)
    throw Error(`${record.id}: duplicate FDA reference.`);
  verifyFdaReferenceValues([record], snapshot);
  const reference = existing[0] ?? {
    frameworkId: "fda_dv_adult_4_plus" as const,
    valueType: "DV" as const,
    population: {
      ageMinMonths: 48,
      ageMaxMonths: null,
      sex: "all" as const,
      lifeStage: "general" as const,
    },
    value: row.value,
    unit: record.canonicalUnit,
    basis: "label_reference" as const,
    sourceId: "fda_daily_values" as const,
    status: "source_verified" as const,
    notes:
      "FDA adult/children 4+ label reference. Not a personal target, EAR, RDA or UL. Exact source form; no conversion inferred.",
  };
  return {
    ...record,
    referenceValues: [
      ...record.referenceValues.filter((r) => r.sourceId !== snapshot.sourceId),
      reference,
    ],
    sources: [
      ...record.sources.filter((s) => s.sourceId !== snapshot.sourceId),
      {
        sourceId: "fda_daily_values",
        locator: snapshot.url,
        accessedAt: snapshot.extractedAt.slice(0, 10),
        notes: `${snapshot.sourceVersion}; repository transcription, not an official FDA release number. Exact Current Daily Value table; adult/children 4+ labeling scope. Original seven-row October 5 snapshot retained separately.`,
      },
    ],
  };
}

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
        reference.unit !== canonicalUnit(row.sourceUnit) ||
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
