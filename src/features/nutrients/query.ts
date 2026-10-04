import { z } from "zod";
import { normalizeFoodTerm } from "../foods/schema";
import type { NutrientIndexEntry } from "./repository";
const text = z.string().max(160).catch("");
const querySchema = z.object({
  q: text.default(""),
  group: text.default(""),
  kind: text.default(""),
  essentiality: text.default(""),
  framework: text.default(""),
  food: z.enum(["all", "available", "unavailable"]).catch("all").default("all"),
  sort: z.enum(["az", "group"]).catch("az").default("az"),
});
export type NutrientQuery = z.infer<typeof querySchema>;
export const parseNutrientQuery = (input: unknown) => querySchema.parse(input);
function near(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const next = [i + 1];
    for (let j = 0; j < b.length; j++)
      next.push(
        Math.min(
          next[j]! + 1,
          previous[j + 1]! + 1,
          previous[j]! + (a[i] === b[j] ? 0 : 1),
        ),
      );
    previous = next;
  }
  return previous[b.length]! <= 1;
}
export function searchNutrients(
  query: NutrientQuery,
  entries: NutrientIndexEntry[],
) {
  const words = normalizeFoodTerm(query.q).split(" ").filter(Boolean);
  return entries
    .filter(
      (n) =>
        words.every(
          (w) =>
            n.terms.includes(w) ||
            (w.length >= 4 && n.terms.split(" ").some((t) => near(t, w))),
        ) &&
        (!query.group || n.group === query.group) &&
        (!query.kind || n.displayKind === query.kind) &&
        (!query.essentiality || n.essentiality === query.essentiality) &&
        (!query.framework || n.frameworks.includes(query.framework)) &&
        (query.food === "all" ||
          (query.food === "available") === n.foodCoverage > 0),
    )
    .sort(
      (a, b) =>
        (query.sort === "group" ? a.group.localeCompare(b.group) : 0) ||
        a.name.localeCompare(b.name, "en") ||
        a.id.localeCompare(b.id),
    );
}
