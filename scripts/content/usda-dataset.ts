import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { mappingSchema, snapshotHash } from "./usda";
import dictionaryInput from "../../src/content/provenance/usda-nutrient-unit-dictionary.json";
if (
  createHash("sha256")
    .update(
      readFileSync("src/content/provenance/usda-nutrient-unit-dictionary.json"),
    )
    .digest("hex") !==
  "6eccaad42b67e45eb4fc22c8ccecc633d076078de7267438b20b70737a9140ad"
)
  throw Error("Official USDA nutrient-unit dictionary snapshot changed.");
const dictionary = z
  .object({
    units: z
      .object({ id: z.number().int(), name: z.string(), unit: z.string() })
      .array(),
  })
  .parse(dictionaryInput);
const unitById = new Map(dictionary.units.map((row) => [row.id, row.unit]));
// Earlier selected snapshots have a UTF-8 mojibake prefix on some microgram labels.
// The original JSON and separately retained official nutrient.csv establish the unit.
export function normalizeUsdaSnapshot(input: unknown): Record<string, unknown> {
  const row = structuredClone(z.record(z.string(), z.unknown()).parse(input));
  row.foodNutrients = z
    .record(z.string(), z.unknown())
    .array()
    .parse(row.foodNutrients)
    .map((value) => {
      const nutrient = z
        .object({ id: z.number().int(), unitName: z.string() })
        .passthrough()
        .parse(value.nutrient);
      if (nutrient.unitName === "\u00c2\u00b5g") {
        if (unitById.get(nutrient.id) !== "UG")
          throw Error(
            "Corrupt unit cannot be repaired without its official nutrient-dictionary entry.",
          );
        nutrient.unitName = "\u00b5g";
      }
      return { ...value, nutrient };
    });
  return row;
}
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  return value;
}
export const datasetDescriptorSchema = z.object({
  sourceId: z.enum(["usda_fdc_foundation_2026_04", "usda_fdc_sr_legacy_2018"]),
  datasetSha256: z.string().regex(/^[a-f0-9]{64}$/),
});
export function verifySelectedAgainstDataset(
  bytes: Uint8Array,
  descriptorInput: unknown,
  selectedInputs: unknown[],
  mappingInputs: unknown[],
) {
  const descriptor = datasetDescriptorSchema.parse(descriptorInput);
  if (
    createHash("sha256").update(bytes).digest("hex") !==
    descriptor.datasetSha256
  )
    throw Error("Downloaded USDA JSON does not match the pinned dataset hash.");
  const key =
    descriptor.sourceId === "usda_fdc_sr_legacy_2018"
      ? "SRLegacyFoods"
      : "FoundationFoods";
  const dataset: unknown = JSON.parse(Buffer.from(bytes).toString("utf8"));
  const rows = z.record(z.string(), z.unknown()).parse(dataset)[key];
  const sourceRows = z.unknown().array().parse(rows);
  const identity = z.object({ fdcId: z.number().int() });
  const sourceById = new Map<number, unknown>();
  for (const row of sourceRows) {
    // Pinned Foundation JSON includes null placeholders; they are not food records.
    if (row === null) continue;
    const id = identity.parse(row).fdcId;
    if (sourceById.has(id))
      throw Error("Duplicate FDC identity in downloaded dataset.");
    sourceById.set(id, row);
  }
  const selectedById = new Map(
    selectedInputs.map((row) => [identity.parse(row).fdcId, row]),
  );
  const mappings = mappingSchema
    .array()
    .parse(mappingInputs)
    .filter((row) => row.sourceId === descriptor.sourceId);
  const ids = new Set(mappings.map((row) => row.fdcId));
  for (const id of ids) {
    const original = sourceById.get(id),
      selected = selectedById.get(id);
    if (!original || !selected)
      throw Error(
        `Mapped FDC ${id} is missing from its dataset or selected snapshots.`,
      );
    const selectedObject = z.record(z.string(), z.unknown()).parse(selected);
    for (const key of [
      "fdcId",
      "description",
      "foodNutrients",
      "foodPortions",
      "dataType",
      "publicationDate",
    ])
      if (!(key in selectedObject))
        throw Error(
          "A selected source snapshot is missing a required factual field.",
        );
    const normalized = normalizeUsdaSnapshot(original);
    const projected = Object.fromEntries(
      Object.keys(selectedObject).map((key) => {
        if (!(key in normalized))
          throw Error(
            "Selected snapshot contains a field absent from its original dataset.",
          );
        return [key, normalized[key]];
      }),
    );
    if (
      snapshotHash(canonical(projected)) !==
      snapshotHash(canonical(normalizeUsdaSnapshot(selected)))
    )
      throw Error(
        `Selected FDC ${id} differs from the pinned original dataset.`,
      );
  }
  return { sourceId: descriptor.sourceId, verifiedSourceRecords: ids.size };
}
