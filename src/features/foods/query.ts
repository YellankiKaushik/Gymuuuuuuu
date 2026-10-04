import { z } from "zod";
import { normalizeFoodTerm } from "./schema";
import { numericValue, type FoodIndexEntry } from "./domain";
const text = z.string().max(160).catch(""),
  positive = z.coerce.number().int().min(1).max(1000).catch(1);
const foodQuerySchema = z.object({
  q: text.default(""),
  category: text.default(""),
  subgroup: text.default(""),
  state: text.default(""),
  tag: text.default(""),
  allergen: text.default(""),
  source: text.default(""),
  complete: z.coerce.number().int().min(0).max(44).catch(0).default(0),
  sort: z
    .enum([
      "relevance",
      "az",
      "energy_kcal",
      "protein_g",
      "carbohydrate_total_g",
      "fat_total_g",
      "fiber_total_g",
    ])
    .catch("relevance")
    .default("relevance"),
  nutrient: z
    .enum([
      "",
      "energy_kcal",
      "protein_g",
      "carbohydrate_total_g",
      "fat_total_g",
      "fiber_total_g",
    ])
    .catch("")
    .default(""),
  minimum: text.default(""),
  maximum: text.default(""),
  estimates: z.enum(["include", "exclude"]).catch("include").default("include"),
  page: positive.default(1),
});
export type FoodQuery = z.infer<typeof foodQuerySchema>;
export const parseFoodQuery = (input: unknown): FoodQuery =>
  foodQuerySchema.parse(input);
function distance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const next = [i + 1];
    for (let j = 0; j < b.length; j++)
      next.push(
        Math.min(
          (next[j] ?? 0) + 1,
          (prev[j + 1] ?? 0) + 1,
          (prev[j] ?? 0) + (a[i] === b[j] ? 0 : 1),
        ),
      );
    prev = next;
  }
  return prev[b.length] ?? 2;
}
export function searchFoods(query: FoodQuery, entries: FoodIndexEntry[]) {
  const words = normalizeFoodTerm(query.q).split(" ").filter(Boolean),
    estimate = query.estimates === "include";
  const bounds = [query.minimum, query.maximum].map((v) =>
    v.trim() !== "" && Number.isFinite(Number(v)) && Number(v) >= 0
      ? Number(v)
      : null,
  );
  const rows = entries
    .flatMap((f) => f.profiles.map((p) => ({ food: f, profile: p })))
    .filter(
      ({ food: f, profile: p }) =>
        words.every(
          (w) =>
            f.terms.includes(w) ||
            (w.length >= 4 &&
              f.terms.split(" ").some((t) => distance(t, w) <= 1)),
        ) &&
        (!query.category || f.category === query.category) &&
        (!query.subgroup || f.subgroup === query.subgroup) &&
        (!query.state || p.state === query.state) &&
        (!query.tag || f.tags.includes(query.tag)) &&
        (!query.allergen || f.allergens.includes(query.allergen)) &&
        (!query.source || p.sources.includes(query.source)) &&
        p.completeness >= query.complete &&
        (["relevance", "az"].includes(query.sort) ||
          numericValue(p.summary[query.sort], estimate) !== null) &&
        (!query.nutrient ||
          (() => {
            const v = numericValue(p.summary[query.nutrient], estimate);
            return (
              v !== null &&
              (bounds[0] == null || v >= bounds[0]) &&
              (bounds[1] == null || v <= bounds[1])
            );
          })()),
    );
  rows.sort((a, b) => {
    if (!["az", "relevance"].includes(query.sort)) {
      const av = numericValue(a.profile.summary[query.sort], estimate),
        bv = numericValue(b.profile.summary[query.sort], estimate);
      if (av === null && bv !== null) return 1;
      if (bv === null && av !== null) return -1;
      if (av !== null && bv !== null && av !== bv) return bv - av;
    }
    if (query.sort === "relevance" && words.length) {
      const exactA =
          normalizeFoodTerm(a.food.name) === normalizeFoodTerm(query.q),
        exactB = normalizeFoodTerm(b.food.name) === normalizeFoodTerm(query.q);
      if (exactA !== exactB) return exactA ? -1 : 1;
    }
    return (
      a.food.name.localeCompare(b.food.name, "en") ||
      a.profile.id.localeCompare(b.profile.id)
    );
  });
  return {
    total: rows.length,
    rows: rows.slice((query.page - 1) * 30, query.page * 30),
  };
}
