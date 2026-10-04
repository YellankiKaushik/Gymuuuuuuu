import { foodReference, type NutrientMeasurement } from "./schema";
/** Explicit, reviewed mappings only. Never merges nutrient equivalents or food states. */
export type SourceNutrientMapping = {
  externalNutrientId: string;
  nutrientId: NutrientMeasurement["nutrientId"];
  reviewedBy: string;
  reviewedAt: string;
};
export function normalizeSourceAmount(
  amount: number,
  sourceUnit: string,
  canonicalUnit: string,
): number {
  if (!Number.isFinite(amount) || amount < 0)
    throw Error("Invalid source amount");
  if (sourceUnit === canonicalUnit) return amount;
  const plainMass: Record<string, number> = {
    g: 1,
    mg: 0.001,
    µg: 0.000001,
    ug: 0.000001,
    mcg: 0.000001,
  };
  if (plainMass[sourceUnit] && plainMass[canonicalUnit])
    return (amount * plainMass[sourceUnit]) / plainMass[canonicalUnit];
  throw Error(
    "Unsupported unit conversion; equivalent forms require explicit source-specific methodology.",
  );
}
export function mapSourceNutrient(
  input: {
    externalNutrientId: string;
    amount: number | null;
    unit: string;
    status: NutrientMeasurement["status"];
    sourceRecordId: string;
    methodNote: string | null;
  },
  mapping: SourceNutrientMapping,
): NutrientMeasurement {
  if (
    input.externalNutrientId !== mapping.externalNutrientId ||
    !mapping.reviewedBy.trim() ||
    !mapping.reviewedAt
  )
    throw Error("A reviewed explicit nutrient mapping is required");
  const unit = foodReference.nutrientRegistry.find(
    (r) => r.id === mapping.nutrientId,
  )?.canonicalUnit;
  if (!unit) throw Error("Unknown canonical nutrient");
  return {
    nutrientId: mapping.nutrientId,
    value:
      input.amount === null
        ? null
        : normalizeSourceAmount(input.amount, input.unit, unit),
    unit,
    status: input.status,
    sourceRecordId: input.sourceRecordId,
    methodNote: input.methodNote,
    significantFigures: null,
  };
}
