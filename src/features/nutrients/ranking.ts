import type { Food } from "../foods/schema";
import { numericValue } from "../foods/domain";
export type RankingBasis = "per_100g" | "per_100kcal" | "per_verified_portion";
export type RankedFood = {
  foodId: string;
  slug: string;
  name: string;
  profileId: string;
  profileLabel: string;
  state: string;
  nutrientId: string;
  amount: number;
  unit: string;
  status: string;
  basis: RankingBasis;
  portionLabel: string | null;
  grams: number | null;
  sourceReleases: string[];
  energyStatus: string | null;
  portionStatus: string | null;
};
export function rankVerifiedFoodSources(
  foods: Food[],
  nutrientId: string,
  basis: RankingBasis,
  options: {
    includeEstimates?: boolean;
    unit?: string;
    minimumDataStatus?:
      | "measured_only"
      | "measured_or_calculated"
      | "include_imputed"
      | "any_verified";
  } = {},
): RankedFood[] {
  const result: RankedFood[] = [];
  for (const f of foods.filter((f) => f.status === "published"))
    for (const p of f.compositionProfiles.filter(
      (p) => p.review.status === "approved",
    )) {
      const n = p.nutrients.find((n) => n.nutrientId === nutrientId),
        amount = numericValue(n, options.includeEstimates ?? true);
      if (amount === null || !n || (options.unit && n.unit !== options.unit))
        continue;
      const permitted = {
        measured_only: ["measured"],
        measured_or_calculated: ["measured", "calculated"],
        include_imputed: ["measured", "calculated", "imputed"],
        any_verified: ["measured", "calculated", "imputed", "estimated"],
      }[options.minimumDataStatus ?? "any_verified"];
      if (!permitted.includes(n.status)) continue;
      const common = {
        foodId: f.id,
        slug: f.slug,
        name: f.canonicalName,
        profileId: p.profileId,
        profileLabel: p.label,
        state: p.foodState,
        nutrientId,
        unit: n.unit,
        status: n.status,
        basis,
        sourceReleases: p.sourceRecords.map((s) => s.release),
      };
      if (basis === "per_100g")
        result.push({
          ...common,
          amount,
          portionLabel: null,
          grams: 100,
          energyStatus: null,
          portionStatus: null,
        });
      else if (basis === "per_100kcal") {
        const energy = p.nutrients.find((n) => n.nutrientId === "energy_kcal"),
          kcal = numericValue(energy, options.includeEstimates ?? true);
        if (kcal !== null && kcal > 0 && energy?.unit === "kcal")
          result.push({
            ...common,
            amount: (amount / kcal) * 100,
            portionLabel: null,
            grams: (100 / kcal) * 100,
            energyStatus: energy.status,
            portionStatus: null,
          });
      } else
        for (const portion of p.portions) {
          if (
            options.includeEstimates === false &&
            portion.status === "estimated"
          )
            continue;
          result.push({
            ...common,
            amount: (amount * portion.grams) / 100,
            portionLabel: portion.label,
            grams: portion.grams,
            energyStatus: null,
            portionStatus: portion.status,
          });
        }
    }
  return result.sort(
    (a, b) =>
      b.amount - a.amount ||
      a.name.localeCompare(b.name, "en") ||
      a.profileId.localeCompare(b.profileId) ||
      String(a.portionLabel).localeCompare(String(b.portionLabel)),
  );
}
