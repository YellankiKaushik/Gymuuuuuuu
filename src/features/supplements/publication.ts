import { z } from "zod";
import { supplementReference } from "./schema";
const sourced = z.strictObject({
  text: z.string().min(1),
  sourceIds: z.array(z.string()).min(1),
});
const review = z.strictObject({
  reviewer: z.string().min(1),
  reviewedAt: z.iso.date(),
  status: z.literal("approved"),
  rightsReviewed: z.literal(true),
});
export const protocolSchema = z.strictObject({
  id: z.string().min(1),
  label: z.enum(["research protocol", "AIS framework protocol"]),
  amountLower: z.number().finite().nonnegative(),
  amountUpper: z.number().finite().nonnegative().nullable(),
  unit: z.string().min(1),
  basis: z.enum([
    "absolute_per_serving",
    "per_kg_body_mass",
    "per_day",
    "per_hour",
    "concentration",
    "food_equivalent",
    "source_specific_other",
  ]),
  frequency: z.string().min(1),
  timing: z.string().min(1),
  duration: z.string().min(1),
  loadingProtocol: z.string().nullable(),
  maintenanceProtocol: z.string().nullable(),
  formulation: z.string().min(1),
  applicablePopulation: z.string().min(1),
  safetyLimits: z.array(sourced).min(1),
  sourceIds: z.array(z.string()).min(1),
  review,
});
export const claimSchema = z.strictObject({
  id: z.string().min(1),
  ingredientIdentityId: z.string().min(1),
  outcomeId: z.string().min(1),
  outcomeDefinition: z.string().min(1),
  population: z.string().min(1),
  trainingStatus: z.string().min(1),
  ageAndSexLimits: z.string().min(1),
  baselineStatus: z.string().min(1),
  formulation: z.string().min(1),
  protocol: protocolSchema.nullable(),
  comparator: z.string().min(1),
  timeframe: z.string().min(1),
  effectDirection: z.enum([
    "beneficial",
    "no_clear_benefit",
    "harmful",
    "mixed",
    "insufficient_evidence",
    "not_applicable",
  ]),
  evidenceConfidence: z.enum([
    "high",
    "moderate",
    "low",
    "very_low",
    "not_assessed",
  ]),
  assessmentMethod: z.enum(["editorial", "source_formal_grade"]),
  assessmentDocumentation: z.string().min(1),
  magnitude: z.string().nullable(),
  studyTypes: z.array(z.string()).min(1),
  studyCount: z.number().int().nonnegative().nullable(),
  harms: z.array(sourced),
  limitations: z.array(z.string()).min(1),
  sourceIds: z.array(z.string()).min(1),
  review,
});
export const publicEntitySchema = z.strictObject({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  entityType: z.enum([
    "knowledge_topic",
    "ingredient",
    "high_risk_substance",
    "framework",
  ]),
  publicationStatus: z.literal("published"),
  category: z.string(),
  aliases: z.array(z.string()),
  sections: z
    .array(
      z.strictObject({ id: z.string(), heading: z.string(), content: sourced }),
    )
    .min(1),
  claims: z.array(claimSchema),
  safety: z.array(
    z.strictObject({
      id: z.string(),
      severity: z.enum([
        "informational",
        "caution",
        "professional_review",
        "avoid_without_medical_supervision",
        "urgent_stop_signal",
      ]),
      interactionType: z.string().nullable(),
      content: sourced,
    }),
  ),
  antiDoping: z
    .strictObject({
      status: z.string(),
      listYear: z.number().int(),
      sourceIds: z.array(z.string()).min(1),
      review,
    })
    .nullable(),
  sourceIds: z.array(z.string()).min(1),
  review,
});
export type PublicEntity = z.infer<typeof publicEntitySchema>;
export const publicSupplements: readonly PublicEntity[] = [];
export function validateSupplementsRelease(
  entries: readonly PublicEntity[] = publicSupplements,
) {
  const ids = new Set<string>(),
    slugs = new Set<string>();
  for (const input of entries) {
    const e = publicEntitySchema.parse(input);
    if (ids.has(e.id) || slugs.has(e.slug))
      throw Error("Duplicate supplement identity");
    ids.add(e.id);
    slugs.add(e.slug);
    if (
      !supplementReference.seedRecords.some(
        (s) =>
          s.id === e.id && s.slug === e.slug && s.entityType === e.entityType,
      )
    )
      throw Error("Supplement stable identity mismatch");
    const sources = new Set(supplementReference.sources.map((s) => s.id));
    const requireSources = (list: string[]) => {
      if (list.some((s) => !sources.has(s) || !e.sourceIds.includes(s)))
        throw Error("Supplement source unresolved");
    };
    requireSources(e.sourceIds);
    for (const section of e.sections) requireSources(section.content.sourceIds);
    for (const safety of e.safety) requireSources(safety.content.sourceIds);
    for (const claim of e.claims) {
      if (claim.ingredientIdentityId !== e.id)
        throw Error("Claim ingredient mismatch");
      requireSources(claim.sourceIds);
      if (claim.protocol) {
        requireSources(claim.protocol.sourceIds);
        claim.protocol.safetyLimits.forEach((s) => requireSources(s.sourceIds));
        if (
          claim.protocol.amountUpper !== null &&
          claim.protocol.amountUpper < claim.protocol.amountLower
        )
          throw Error("Protocol range reversed");
      }
      if (claim.review.reviewedAt > new Date().toISOString().slice(0, 10))
        throw Error("Future claim review");
    }
    if (e.review.reviewedAt > new Date().toISOString().slice(0, 10))
      throw Error("Future supplement review");
    if (
      e.entityType === "high_risk_substance" &&
      e.claims.some((c) => c.protocol)
    )
      throw Error("High-risk substance protocols are prohibited");
  }
}
export function researchFormula(
  protocol: z.infer<typeof protocolSchema>,
  bodyMassKg: number,
) {
  if (
    protocol.basis !== "per_kg_body_mass" ||
    !Number.isFinite(bodyMassKg) ||
    bodyMassKg <= 0
  )
    throw Error("An explicit reviewed mass-based research formula is required");
  return {
    lower: protocol.amountLower * bodyMassKg,
    upper:
      protocol.amountUpper === null ? null : protocol.amountUpper * bodyMassKg,
    unit: protocol.unit,
    label: protocol.label,
    formula: `source amount per kg × ${bodyMassKg} kg`,
    recommendation: false,
  };
}
