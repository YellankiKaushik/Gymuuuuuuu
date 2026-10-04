import { z } from "zod";
import reference from "../../content/nutrients/reference.json";
import identities from "../../content/nutrients/identities.json";
import { foodReference } from "../foods/schema";
import {
  nutrientNormativeSchema,
  referenceValueNormativeSchema,
} from "./schema.generated";
export type Nutrient = z.infer<typeof nutrientNormativeSchema>;
export type ReferenceValue = z.infer<typeof referenceValueNormativeSchema>;
export type FrameworkId = ReferenceValue["frameworkId"];
export const nutrientReference = reference;
export const deficiencyBoundary =
  "Symptoms are nonspecific and cannot diagnose a nutrient deficiency. Diagnosis may require clinical evaluation and appropriate laboratory testing.";
export const referenceValueTypes =
  referenceValueNormativeSchema.shape.valueType.options;
export const verifiedReference = (r: ReferenceValue) =>
  ["source_verified", "manually_verified", "not_applicable"].includes(r.status);
export function validateClaimSources(record: Nutrient) {
  const errors: string[] = [],
    available = new Set(record.sources.map((s) => s.sourceId));
  for (const claim of record.claims)
    for (const sourceId of claim.sourceIds)
      if (!available.has(sourceId))
        errors.push(`${claim.claimId}: missing citation ${sourceId}`);
  for (const item of [
    ...record.functions,
    ...record.forms,
    ...record.absorptionFactors,
    ...record.interactions,
    ...record.athleticRelevance,
    ...[record.deficiency, record.excess].filter(
      (s): s is NonNullable<typeof s> => !!s,
    ),
  ])
    for (const id of item.sourceIds ?? [])
      if (!available.has(id)) errors.push(`Missing section citation ${id}`);
  for (const r of record.referenceValues)
    if (!available.has(r.sourceId))
      errors.push(`Missing reference citation ${r.sourceId}`);
  return errors;
}
export const nutrientSchema = nutrientNormativeSchema.superRefine((n, ctx) => {
  const error = (message: string) => ctx.addIssue({ code: "custom", message });
  const seed = identities.find((r) => r.id === n.id);
  if (
    seed &&
    (seed.groupId !== n.groupId ||
      seed.canonicalUnit !== n.canonicalUnit ||
      JSON.stringify(seed.foodDataNutrientIds) !==
        JSON.stringify(n.foodDataNutrientIds))
  )
    error(
      "Stable identity group, units and Phase 07 mapping must match reviewed taxonomy",
    );
  for (const id of n.foodDataNutrientIds)
    if (!foodReference.nutrientRegistry.some((r) => r.id === id))
      error(`Unknown Phase 07 ID ${id}`);
  for (const message of validateClaimSources(n)) error(message);
  if (new Set(n.claims.map((c) => c.claimId)).size !== n.claims.length)
    error("Duplicate claim IDs");
  for (const r of n.referenceValues) {
    const framework = reference.referenceFrameworks.find(
      (f) => f.id === r.frameworkId,
    );
    const allowedSources: Record<string, string[]> = {
      us_canada_dri: ["us_canada_dri_tables", "nih_ods_fact_sheets"],
      fda_dv_adult_4_plus: ["fda_daily_values"],
      icmr_nin_2020: ["icmr_nin_rda_ear_2020"],
      efsa_drv: ["efsa_drv"],
    };
    if (!allowedSources[r.frameworkId]?.includes(r.sourceId))
      error(
        "Reference source does not belong to the selected framework authority",
      );
    if (
      r.valueType !== "no_value_established" &&
      !framework?.valueTypes.includes(r.valueType)
    )
      error(
        `Reference type ${r.valueType} does not belong to ${r.frameworkId}`,
      );
    if (
      r.population.ageMaxMonths !== null &&
      r.population.ageMaxMonths < r.population.ageMinMonths
    )
      error("Reversed population age band");
    if (r.population.lifeStage !== "general" && r.population.sex === "male")
      error("Incompatible life stage/sex");
    if (r.minValue != null && r.maxValue != null && r.minValue > r.maxValue)
      error("Reversed reference range");
    const range = r.minValue != null || r.maxValue != null;
    if (
      range &&
      (!["AMDR", "RI"].includes(r.valueType) ||
        r.minValue == null ||
        r.maxValue == null ||
        r.value != null)
    )
      error("Reference range needs a range-compatible type and two bounds");
    if (
      ["AMDR", "RI"].includes(r.valueType) &&
      (!range ||
        r.basis !== "percent_energy" ||
        r.unit !== "% energy" ||
        (r.maxValue ?? 0) > 100)
    )
      error("Energy range needs explicit percent-energy basis");
    if (r.basis === "percent_energy" && !["AMDR", "RI"].includes(r.valueType))
      error("Percent-energy basis incompatible with reference type");
    if (r.basis !== "percent_energy" && r.unit !== n.canonicalUnit)
      error(
        "Reference unit differs from canonical nutrient concept; record requires an approved specific conversion before publication",
      );
    if (r.valueType === "DV" && r.basis !== "label_reference")
      error("Daily Value requires label-reference basis");
    if (r.valueType === "no_value_established" && (r.value != null || range))
      error("No-established-value cannot carry numbers");
    if (verifiedReference(r) && r.value == null && !range && !r.notes?.trim())
      error("Nonnumeric reference needs a documented absence");
    if (verifiedReference(r) && !r.basis)
      error("Verified reference requires basis");
    if (r.status === "not_applicable" && (r.value != null || range))
      error("Not-applicable reference cannot carry numbers");
  }
  const rows = n.referenceValues.filter(verifiedReference);
  for (let i = 0; i < rows.length; i++)
    for (const b of rows.slice(i + 1)) {
      const a = rows[i]!;
      if (
        a.frameworkId !== b.frameworkId ||
        a.valueType !== b.valueType ||
        a.population.lifeStage !== b.population.lifeStage
      )
        continue;
      const sexOverlap =
        a.population.sex === b.population.sex ||
        a.population.sex === "all" ||
        b.population.sex === "all";
      if (
        sexOverlap &&
        a.population.ageMinMonths <= (b.population.ageMaxMonths ?? Infinity) &&
        b.population.ageMinMonths <= (a.population.ageMaxMonths ?? Infinity)
      )
        error("Overlapping reference population rows");
    }
  for (const rule of n.foodSourceRules)
    if (
      rule.phase07NutrientId &&
      !n.foodDataNutrientIds.includes(rule.phase07NutrientId)
    )
      error("Food rule must reference the same nutrient concept");
  if (n.status === "published") {
    if (
      n.contentStatus !== "complete_for_mvp" ||
      n.editorial.reviewStatus !== "approved" ||
      !n.editorial.reviewedAt ||
      !n.editorial.reviewer?.trim()
    )
      error(
        "Published nutrient needs complete content and editorial/scientific signoff",
      );
    if (!n.summary?.trim() || !n.functions.length || !n.sources.length)
      error("Published nutrient needs summary, functions and citations");
    if (n.claims.some((c) => c.reviewStatus !== "approved"))
      error("All published claims require approval");
    const covered = (text: string, category: string) =>
      n.claims.some(
        (c) =>
          c.reviewStatus === "approved" &&
          c.text === text &&
          (c.category === category || c.category === "other"),
      );
    if (n.summary && !covered(n.summary, "function"))
      error("Summary requires an exact approved evidence claim");
    for (const f of n.functions)
      if (!covered(f.description, "function"))
        error("Function requires approved claim");
    for (const f of n.absorptionFactors)
      if (!covered(f.description, "absorption"))
        error("Absorption factor requires approved claim");
    for (const f of n.interactions)
      if (!covered(f.description, "interaction"))
        error("Interaction requires approved claim");
    for (const f of n.athleticRelevance)
      if (!covered(f.description, "athletic_relevance"))
        error("Training statement requires approved claim and population");
    for (const f of n.forms)
      if (f.conversionRule && !covered(f.conversionRule, "conversion"))
        error("Conversion rule requires approved claim");
    if (
      ![
        "energy",
        "energy_equivalent",
        "dietary_component",
        "food_component",
      ].includes(n.displayKind) &&
      (!n.deficiency || !n.excess)
    )
      error("Published nutrient requires deficiency and excess education");
    if (
      n.deficiency &&
      !n.deficiency.medicalBoundary.includes(deficiencyBoundary)
    )
      error("Deficiency requires mandatory medical boundary");
    if (
      n.excess &&
      !/no.*(?:UL|upper limit)|clinical|professional|medical/i.test(
        n.excess.medicalBoundary,
      )
    )
      error("Excess requires a professional/medical boundary");
    for (const section of [n.deficiency, n.excess])
      if (
        section &&
        !covered(
          section.overview,
          section === n.deficiency ? "deficiency" : "excess",
        )
      )
        error("Risk overview requires approved claim");
    if (n.referenceValues.some((r) => r.status === "pending_review"))
      error("Public reference rows cannot be pending review");
    for (const citation of n.sources) {
      const source = reference.sourceRegistry.find(
        (s) => s.id === citation.sourceId,
      );
      if (!source) error("Unknown source authority");
      if (!citation.locator.trim()) error("Citation requires locator");
    }
  }
});
export const validateNutrientRecord = (input: unknown) =>
  nutrientSchema.parse(input);
export const getNutrientPublicationStatus = (input: unknown) => {
  const r = nutrientSchema.safeParse(input);
  return r.success && r.data.status === "published"
    ? "publishable"
    : r.success
      ? "draft_or_partial"
      : "invalid";
};
