import { createHash } from "node:crypto";
import { z } from "zod";
import {
  foodSchema,
  foodReference,
  type Food,
} from "../../src/features/foods/schema";

export const mappingSchema = z.strictObject({
  foodId: z.string().regex(/^food_/),
  fdcId: z.number().int().positive(),
  sourceId: z.enum(["usda_fdc_foundation_2026_04", "usda_fdc_sr_legacy_2018"]),
  description: z.string().min(1),
  foodState: foodSchema.shape.compositionProfiles.element.shape.foodState,
  reviewLevel: z.literal("published_personal_use"),
  matchRationale: z.string().min(20),
  sourceSnapshotSha256: z.string().regex(/^[a-f0-9]{64}$/),
  verifiedAt: z.iso.datetime().optional(),
});
export const snapshotSchema = z
  .object({
    fdcId: z.number().int(),
    description: z.string(),
    dataType: z.string(),
    foodNutrients: z.array(
      z
        .object({
          nutrient: z.object({ id: z.number(), unitName: z.string() }),
          amount: z.number().finite().nonnegative().optional(),
          dataPoints: z.number().optional(),
          foodNutrientDerivation: z
            .object({
              code: z.string().optional(),
              description: z.string().optional(),
            })
            .passthrough()
            .optional(),
        })
        .passthrough(),
    ),
    foodPortions: z.array(
      z
        .object({
          id: z.number(),
          amount: z.number().optional(),
          gramWeight: z.number(),
          modifier: z.string().optional(),
          measureUnit: z.object({ name: z.string() }),
        })
        .passthrough(),
    ),
  })
  .passthrough();
export const snapshotHash = (input: unknown) =>
  createHash("sha256").update(JSON.stringify(input)).digest("hex");
// USDA nutrient IDs refer to specific forms. No omega totals, IU conversions or food-folate inference.
const nutrientIds: Readonly<Record<string, readonly number[]>> = {
  energy_kcal: [2048, 1008, 2047],
  energy_kj: [1062],
  water_g: [1051],
  protein_g: [1003],
  carbohydrate_total_g: [1005],
  fiber_total_g: [1079],
  sugars_total_g: [1063, 2000],
  fat_total_g: [1004],
  fat_saturated_g: [1258],
  fat_monounsaturated_g: [1292],
  fat_polyunsaturated_g: [1293],
  cholesterol_mg: [1253],
  sodium_mg: [1093],
  potassium_mg: [1092],
  calcium_mg: [1087],
  iron_mg: [1089],
  magnesium_mg: [1090],
  phosphorus_mg: [1091],
  zinc_mg: [1095],
  copper_mg: [1098],
  manganese_mg: [1101],
  selenium_ug: [1103],
  iodine_ug: [1100],
  vitamin_a_rae_ug: [1106],
  retinol_ug: [1105],
  beta_carotene_ug: [1107],
  thiamin_mg: [1165],
  riboflavin_mg: [1166],
  niacin_mg: [1167],
  pantothenic_acid_mg: [1170],
  vitamin_b6_mg: [1175],
  biotin_ug: [1176],
  folate_food_ug: [1187],
  folic_acid_ug: [1186],
  folate_dfe_ug: [1190],
  vitamin_b12_ug: [1178],
  vitamin_c_mg: [1162],
  vitamin_d_ug: [1114],
  vitamin_e_mg: [1109],
  vitamin_k_ug: [1185],
  choline_mg: [1180],
};
function unit(value: string) {
  return value.replaceAll("Â", "").replaceAll("μ", "µ").toLowerCase();
}
export function buildUsdaRelease(
  identityInputs: unknown[],
  mappingInputs: unknown[],
  snapshotInputs: unknown[],
  extractedAt: string,
): Food[] {
  z.iso.datetime().parse(extractedAt);
  const identities = foodSchema.array().parse(identityInputs),
    mappings = mappingSchema.array().parse(mappingInputs);
  const snapshots = snapshotInputs.map((input) => ({
    raw: input,
    record: snapshotSchema.parse(input),
  }));
  if (new Set(snapshots.map((s) => s.record.fdcId)).size !== snapshots.length)
    throw Error("Duplicate USDA snapshot");
  if (
    new Set(mappings.map((m) => `${m.foodId}:${m.fdcId}`)).size !==
    mappings.length
  )
    throw Error("Duplicate mapping");
  const output: Food[] = [];
  for (const mapping of mappings) {
    if (
      mapping.verifiedAt &&
      (Date.parse(mapping.verifiedAt) < Date.parse(extractedAt) ||
        Date.parse(mapping.verifiedAt) > Date.now())
    )
      throw Error(
        "Mapping verification must follow extraction and cannot be future-dated.",
      );
    const identity = identities.find((i) => i.id === mapping.foodId),
      snapshot = snapshots.find((s) => s.record.fdcId === mapping.fdcId);
    if (!identity || !snapshot)
      throw Error(`Unresolved mapping ${mapping.foodId}:${mapping.fdcId}`);
    const record = snapshot.record;
    if (
      record.description !== mapping.description ||
      snapshotHash(snapshot.raw) !== mapping.sourceSnapshotSha256
    )
      throw Error(`Source drift ${mapping.fdcId}`);
    if (
      record.dataType !==
      (mapping.sourceId.includes("foundation") ? "Foundation" : "SR Legacy")
    )
      throw Error(`Dataset mismatch ${mapping.fdcId}`);
    const sourceRecordId = `usda_fdc_${record.fdcId}`,
      profileId = `profile_${identity.id.slice(5)}_fdc_${record.fdcId}`;
    const nutrients = foodReference.nutrientRegistry.map((n) => {
      const original = nutrientIds[n.id]
        ?.map((id) =>
          record.foodNutrients.find((row) => row.nutrient.id === id),
        )
        .find((row) => row?.amount !== undefined);
      const canonical = n.canonicalUnit.replace(/ (RAE|DFE)$/, "");
      if (original && unit(original.nutrient.unitName) !== unit(canonical))
        throw Error(`Unit mismatch ${record.fdcId}:${n.id}`);
      const derivation = original?.foodNutrientDerivation,
        code = derivation?.code;
      const status = !original
        ? "not_available"
        : code === "A"
          ? "measured"
          : code === "NC" || code === "AS"
            ? "calculated"
            : "estimated";
      return {
        nutrientId: n.id,
        unit: n.canonicalUnit,
        value: original?.amount ?? null,
        status,
        sourceRecordId,
        methodNote: original
          ? `USDA nutrient ${original.nutrient.id}; ${derivation?.description ?? "Derivation not supplied; retained as estimated, not measured"}.`
          : "This source record does not supply this nutrient/form; no zero or conversion inferred.",
      };
    });
    const profile = {
      profileId,
      label: record.description,
      foodState: mapping.foodState,
      processingLevel: "not_classified",
      preparationNotes:
        "Use this exact source-described state. Do not convert raw and cooked masses or infer suitability for eating raw.",
      basis: "per_100g_edible_portion",
      ediblePortion: { percent: null, status: "not_available" },
      nutrients,
      portions: record.foodPortions
        .filter((p) => p.gramWeight > 0)
        .map((p) => ({
          portionId: `portion_fdc_${record.fdcId}_${p.id}`,
          label: `${p.amount ?? 1} ${p.modifier || p.measureUnit.name}`.slice(
            0,
            100,
          ),
          grams: p.gramWeight,
          status: "source_reported",
          sourceRecordId,
          notes:
            "Dataset portion weight; household measures vary. Weight refers to this profile only.",
        })),
      sourceRecords: [
        {
          sourceRecordId,
          sourceId: mapping.sourceId,
          externalFoodId: String(record.fdcId),
          externalDescription: record.description,
          release: foodReference.sourceRegistry.find(
            (s) => s.id === mapping.sourceId,
          )!.release,
          accessedAt: extractedAt,
          matchType: "exact",
          licenseNote:
            "USDA FoodData Central public-domain/CC0 data; USDA attribution retained.",
          citation: `USDA Agricultural Research Service. FoodData Central. ${record.dataType}, FDC ${record.fdcId}. https://fdc.nal.usda.gov/food-details/${record.fdcId}/nutrients`,
        },
      ],
      review: {
        status: "approved",
        reviewedAt: mapping.verifiedAt ?? extractedAt,
        reviewer: "Codex machine validation; personal use; no human review",
        qualityNotes: [
          mapping.matchRationale,
          "Energy retains the USDA method (specific factors preferred where supplied). Missing values remain unavailable.",
          "Values describe the source sample, not your food. Historical SR Legacy profiles are labelled by release.",
        ],
      },
    };
    let food = output.find((f) => f.id === identity.id);
    if (!food) {
      food = {
        ...identity,
        status: "published",
        compositionStatus: "partial",
        defaultProfileId: profileId,
        compositionProfiles: [],
        editorial: {
          reviewStatus: "approved",
          reviewedAt: extractedAt,
          reviewer: "Codex machine validation; personal use; no human review",
          notes:
            "published_personal_use: exact source mapping and automated validation. No independent human/clinical review.",
        },
      };
      output.push(food);
    }
    food.compositionProfiles.push(
      foodSchema.shape.compositionProfiles.element.parse(profile),
    );
  }
  // Validate the entire proposed release before the caller writes any file.
  return foodSchema.array().parse(output);
}
