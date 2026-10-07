import { z } from "zod";
import type { Food } from "../../src/features/foods/schema";
import { numericValue } from "../../src/features/foods/domain";
import { mappingSchema, snapshotHash } from "./usda";

// A compound qualifier is not a mass conversion. Only the exact USDA
// alpha-tocopherol measurement can supply this compound-specific ranking.
export function verifyAlphaTocopherolRankings(
  foods: readonly Food[],
  mappingInputs: unknown,
  snapshotInputs: unknown,
) {
  const mappings = mappingSchema.array().parse(mappingInputs);
  const snapshots = z.array(z.unknown()).parse(snapshotInputs);
  const sourceSchema = z.object({
    fdcId: z.number().int(),
    foodNutrients: z.array(
      z.object({
        nutrient: z.object({
          id: z.number(),
          name: z.string(),
          unitName: z.string(),
        }),
        amount: z.number().optional(),
      }),
    ),
  });
  const sources = snapshots.map((raw) => ({
    raw,
    parsed: sourceSchema.parse(raw),
  }));
  for (const food of foods)
    for (const profile of food.compositionProfiles) {
      const value = profile.nutrients.find(
        (row) => row.nutrientId === "vitamin_e_mg",
      );
      const amount = numericValue(value, true);
      if (amount === null) continue;
      const mapping = mappings.find(
        (row) =>
          row.foodId === food.id &&
          profile.profileId === `profile_${food.id.slice(5)}_fdc_${row.fdcId}`,
      );
      const source = sources.find((row) => row.parsed.fdcId === mapping?.fdcId);
      const nutrient = source?.parsed.foodNutrients.find(
        (row) => row.nutrient.id === 1109,
      );
      if (
        !mapping ||
        !source ||
        snapshotHash(source.raw) !== mapping.sourceSnapshotSha256 ||
        value?.unit !== "mg" ||
        nutrient?.nutrient.name !== "Vitamin E (alpha-tocopherol)" ||
        nutrient.nutrient.unitName !== "mg" ||
        nutrient.amount !== amount
      )
        throw Error(
          `Unverified alpha-tocopherol ranking: ${food.id}:${profile.profileId}`,
        );
    }
}
