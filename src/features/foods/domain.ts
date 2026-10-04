import {
  foodReference,
  normalizeFoodTerm,
  numericStatuses,
  type CompositionProfile,
  type Food,
  type NutrientMeasurement,
} from "./schema";
export function scaleNutrients(profile: CompositionProfile, grams: number) {
  if (!Number.isFinite(grams) || grams <= 0 || grams > 10000)
    throw new Error("Choose a serving above 0 and at most 10,000 grams.");
  return profile.nutrients.map((n) => ({
    ...n,
    value: n.value === null ? null : (n.value * grams) / 100,
    minValue: n.minValue == null ? n.minValue : (n.minValue * grams) / 100,
    maxValue: n.maxValue == null ? n.maxValue : (n.maxValue * grams) / 100,
  }));
}
export function formatNutrient(n: NutrientMeasurement | undefined) {
  if (!n || n.value === null)
    return n
      ? ({
          trace: "Trace",
          not_detected: "Not detected",
          not_available: "Not available",
        }[n.status as "trace" | "not_detected" | "not_available"] ??
          "Not available")
      : "Not available";
  const digits = Math.min(6, Math.max(1, n.significantFigures ?? 3));
  return `${new Intl.NumberFormat("en", { maximumSignificantDigits: digits }).format(n.value)} ${n.unit}`;
}
export const sourceBadge = (p: CompositionProfile) =>
  p.sourceRecords
    .map(
      (s) =>
        `${foodReference.sourceRegistry.find((r) => r.id === s.sourceId)?.name ?? s.sourceId} · ${s.release}`,
    )
    .join("; ");
export const dataCompleteness = (p: CompositionProfile) => ({
  numeric: p.nutrients.filter((n) => n.value !== null).length,
  reported: p.nutrients.length,
  total: foodReference.nutrientRegistry.length,
});
export function compareProfiles(
  profiles: CompositionProfile[],
  grams?: number[],
) {
  if (profiles.length < 2 || profiles.length > 4)
    throw Error("Select two to four profiles.");
  if (grams && grams.length !== profiles.length)
    throw Error("Each profile needs a serving.");
  const columns = profiles.map((p, i) => scaleNutrients(p, grams?.[i] ?? 100));
  return foodReference.nutrientRegistry.map((r) => {
    const values = columns.map((col) => col.find((n) => n.nutrientId === r.id));
    const first = values[0];
    return {
      ...r,
      values,
      differences: values.map((n) =>
        n?.value != null && first?.value != null && n.unit === first.unit
          ? n.value - first.value
          : null,
      ),
    };
  });
}
export type FoodIndexEntry = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subgroup: string;
  tags: string[];
  allergens: string[];
  terms: string;
  profiles: {
    id: string;
    label: string;
    state: string;
    sources: string[];
    completeness: number;
    summary: Record<
      string,
      { value: number | null; status: string; unit: string }
    >;
  }[];
};
export function buildFoodSearchIndex(foods: Food[]): FoodIndexEntry[] {
  return foods
    .filter((f) => f.status === "published")
    .map((f) => ({
      id: f.id,
      slug: f.slug,
      name: f.canonicalName,
      category: f.categoryId,
      subgroup: f.subgroupId,
      tags: f.dietaryTags ?? [],
      allergens: f.allergenTags ?? [],
      terms: normalizeFoodTerm(
        [
          f.canonicalName,
          ...f.aliases,
          ...(f.regionalNames ?? []).map((n) => n.name),
          ...f.compositionProfiles
            .filter((p) => p.review.status === "approved")
            .flatMap((p) =>
              p.sourceRecords.map((s) => s.externalDescription ?? ""),
            ),
        ].join(" "),
      ),
      profiles: f.compositionProfiles
        .filter((p) => p.review.status === "approved")
        .map((p) => ({
          id: p.profileId,
          label: p.label,
          state: p.foodState,
          sources: p.sourceRecords.map((s) => s.sourceId),
          completeness: dataCompleteness(p).numeric,
          summary: Object.fromEntries(
            p.nutrients
              .filter((n) =>
                [
                  "energy_kcal",
                  "protein_g",
                  "carbohydrate_total_g",
                  "fat_total_g",
                  "fiber_total_g",
                ].includes(n.nutrientId),
              )
              .map((n) => [
                n.nutrientId,
                { value: n.value, status: n.status, unit: n.unit },
              ]),
          ),
        })),
    }));
}
export function resolveFoodAlias(term: string, entries: FoodIndexEntry[]) {
  const q = normalizeFoodTerm(term);
  return entries.filter(
    (f) => normalizeFoodTerm(f.name) === q || f.terms.includes(q),
  );
}
export function numericValue(
  n: { value: number | null; status: string } | undefined,
  includeEstimates: boolean,
) {
  return n &&
    n.value !== null &&
    numericStatuses.some((s) => s === n.status) &&
    (includeEstimates || !["imputed", "estimated"].includes(n.status))
    ? n.value
    : null;
}
