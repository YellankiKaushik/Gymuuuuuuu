import { z } from "zod";
import type { RankedFood } from "./ranking";

// Lossless repository asset encoding; public rows retain their original semantics.
export const rankedFoodSchema = z.strictObject({
  foodId: z.string(),
  slug: z.string(),
  name: z.string(),
  profileId: z.string(),
  profileLabel: z.string(),
  state: z.string(),
  nutrientId: z.string(),
  amount: z.number().finite().nonnegative(),
  unit: z.string(),
  status: z.enum(["measured", "calculated", "imputed", "estimated"]),
  basis: z.enum(["per_100g", "per_100kcal", "per_verified_portion"]),
  portionLabel: z.string().nullable(),
  grams: z.number().positive().nullable(),
  sourceReleases: z.array(z.string()),
  energyStatus: z.string().nullable(),
  portionStatus: z.string().nullable(),
});
const profileSchema = rankedFoodSchema.pick({
  foodId: true,
  slug: true,
  name: true,
  profileId: true,
  profileLabel: true,
  state: true,
  sourceReleases: true,
});
export const rankingProfilesSchema = profileSchema
  .array()
  .superRefine((rows, ctx) => {
    if (new Set(rows.map((r) => r.profileId)).size !== rows.length)
      ctx.addIssue({
        code: "custom",
        message: "Duplicate ranking profile identity",
      });
  });
export const packedRankingsSchema = z.strictObject({
  schemaVersion: z.literal(1),
  rows: z.array(
    z.tuple([
      z.string(),
      z.string(),
      rankedFoodSchema.shape.amount,
      z.string(),
      rankedFoodSchema.shape.status,
      rankedFoodSchema.shape.basis,
      rankedFoodSchema.shape.portionLabel,
      rankedFoodSchema.shape.grams,
      rankedFoodSchema.shape.energyStatus,
      rankedFoodSchema.shape.portionStatus,
    ]),
  ),
});
export function rankingProfiles(input: RankedFood[]) {
  const profiles = new Map<string, z.infer<typeof profileSchema>>();
  for (const row of rankedFoodSchema.array().parse(input)) {
    const profile = profileSchema.parse({
      foodId: row.foodId,
      slug: row.slug,
      name: row.name,
      profileId: row.profileId,
      profileLabel: row.profileLabel,
      state: row.state,
      sourceReleases: row.sourceReleases,
    });
    const prior = profiles.get(row.profileId);
    if (prior && JSON.stringify(prior) !== JSON.stringify(profile))
      throw Error("Conflicting ranking metadata for the same profile ID");
    profiles.set(row.profileId, profile);
  }
  return rankingProfilesSchema.parse(
    [...profiles.values()].sort((a, b) =>
      a.profileId.localeCompare(b.profileId),
    ),
  );
}
export function packRankings(input: RankedFood[]) {
  return packedRankingsSchema.parse({
    schemaVersion: 1,
    rows: rankedFoodSchema
      .array()
      .parse(input)
      .map((r) => [
        r.profileId,
        r.nutrientId,
        r.amount,
        r.unit,
        r.status,
        r.basis,
        r.portionLabel,
        r.grams,
        r.energyStatus,
        r.portionStatus,
      ]),
  });
}
export function unpackRankings(
  input: unknown,
  profileInput: unknown,
  expectedNutrientId: string,
): RankedFood[] {
  const profiles = new Map(
    rankingProfilesSchema.parse(profileInput).map((r) => [r.profileId, r]),
  );
  return packedRankingsSchema
    .parse(input)
    .rows.map(
      ([
        profileId,
        nutrientId,
        amount,
        unit,
        status,
        basis,
        portionLabel,
        grams,
        energyStatus,
        portionStatus,
      ]) => {
        const profile = profiles.get(profileId);
        if (!profile) throw Error("Unresolved ranking profile identity");
        if (nutrientId !== expectedNutrientId)
          throw Error(
            "Ranking nutrient identity differs from the requested asset",
          );
        return rankedFoodSchema.parse({
          ...profile,
          nutrientId,
          amount,
          unit,
          status,
          basis,
          portionLabel,
          grams,
          energyStatus,
          portionStatus,
        });
      },
    );
}
