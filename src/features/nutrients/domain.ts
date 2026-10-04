export {
  frameworkDatasetSchema,
  populationSelectionSchema,
  resolveReferenceValue,
  formatReferenceValue,
  populationLabel,
  type FrameworkDataset,
  type PopulationSelection,
} from "./frameworks";
export {
  calculatePercentReference,
  convertEquivalentUnit,
  type EquivalentRule,
} from "./calculations";
export { getFrameworkGlossary } from "./public-index";
import { normalizeFoodTerm } from "../foods/schema";
import type { Nutrient } from "./schema";
import type { NutrientIndexEntry } from "./public-index";
export function buildNutrientIndex(
  records: Nutrient[],
  coverage: Record<string, number> = {},
): NutrientIndexEntry[] {
  return records
    .filter((n) => n.status === "published")
    .map((n) => ({
      id: n.id,
      slug: n.slug,
      name: n.canonicalName,
      aliases: n.aliases,
      group: n.groupId,
      essentiality: n.essentiality,
      unit: n.canonicalUnit,
      displayKind: n.displayKind,
      frameworks: [
        ...new Set(
          n.referenceValues
            .filter((r) => r.status !== "pending_review")
            .map((r) => r.frameworkId),
        ),
      ],
      foodCoverage: coverage[n.id] ?? 0,
      terms: normalizeFoodTerm(
        [n.canonicalName, ...n.aliases, n.groupId].join(" "),
      ),
    }));
}
