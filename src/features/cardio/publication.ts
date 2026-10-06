import { z } from "zod";
import { cardioReference } from "./schema";
import records from "../../content/cardio/records.json";
import { publicPlanSchema } from "./public-plan";
export const publishedCardioSchema = z.strictObject({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  entityType: z.enum([
    "knowledge_topic",
    "cardio_modality",
    "cardio_plan_template",
    "conditioning_routine",
  ]),
  publicationStatus: z.literal("published"),
  population: z.string().min(1),
  prerequisites: z.array(z.string()),
  limitations: z.array(z.string()).min(1),
  stopRules: z.array(z.string()).min(1),
  claims: z
    .array(
      z.strictObject({
        id: z.string().min(1),
        text: z.string().min(1),
        sourceIds: z.array(z.string()).min(1),
        evidenceStrength: z.enum([
          "high",
          "moderate",
          "low",
          "very_low",
          "consensus",
          "not_graded",
        ]),
      }),
    )
    .min(1),
  sourceIds: z.array(z.string()).min(1),
  relatedIds: z.array(z.string()),
  plan: publicPlanSchema.optional(),
  review: z.strictObject({
    reviewer: z.string().min(1),
    reviewedAt: z.iso.date(),
    status: z.literal("approved"),
    rightsReviewed: z.literal(true),
  }),
});
export type PublicCardioEntity = z.infer<typeof publishedCardioSchema>;
export const publicCardioEntities: readonly PublicCardioEntity[] =
  publishedCardioSchema.array().parse(records);
export function validateCardioRelease(
  entries: readonly PublicCardioEntity[] = publicCardioEntities,
) {
  const ids = new Set<string>(),
    slugs = new Set<string>();
  for (const value of entries) {
    const e = publishedCardioSchema.parse(value);
    if ((e.entityType === "cardio_plan_template") !== Boolean(e.plan))
      throw Error(
        "A published plan must contain its complete source schedule; other entities cannot masquerade as plans.",
      );
    if (
      e.plan &&
      (!e.sourceIds.includes(e.plan.sourceId) ||
        !e.claims.some((claim) => claim.sourceIds.includes(e.plan!.sourceId)))
    )
      throw Error(
        "The numeric plan schedule must resolve to its approved claim source.",
      );
    if (ids.has(e.id) || slugs.has(e.slug))
      throw Error("Duplicate public cardio identity.");
    ids.add(e.id);
    slugs.add(e.slug);
    if (
      !cardioReference.seedTaxonomy.some(
        (seed) =>
          seed.id === e.id &&
          seed.slug === e.slug &&
          seed.entityType === e.entityType,
      )
    )
      throw Error("Public cardio identity differs from its stable seed.");
    if (
      e.claims.some((c) =>
        c.sourceIds.some((id) => !e.sourceIds.includes(id)),
      ) ||
      e.sourceIds.some(
        (id) => !cardioReference.sources.some((s) => s.id === id),
      )
    )
      throw Error("Cardio claim source is unresolved.");
    if (e.review.reviewedAt > new Date().toISOString().slice(0, 10))
      throw Error("Cardio review date is in the future.");
    for (const related of e.relatedIds)
      if (!entries.some((other) => other.id === related))
        throw Error("Related public cardio entity is unavailable.");
  }
}
