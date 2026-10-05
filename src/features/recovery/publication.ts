import { z } from "zod";
import { recoveryReference, routineSchema } from "./schema";
import records from "../../content/recovery/records.json";
export const recoveryArticleSchema = z.strictObject({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  status: z.literal("published"),
  domain: z.enum(["sleep", "recovery", "readiness", "mobility"]),
  population: z.string().min(1),
  context: z.string().min(1),
  definition: z.string().min(1),
  sourceIds: z.array(z.string()).min(1),
  claims: z
    .array(
      z.strictObject({
        id: z.string().min(1),
        text: z.string().min(1),
        outcome: z.enum([
          "soreness",
          "perceived_fatigue",
          "strength_power",
          "range_of_motion",
          "adaptation",
          "sleep",
          "definition",
        ]),
        sourceIds: z.array(z.string()).min(1),
      }),
    )
    .min(1),
  evidenceStrength: z.enum([
    "high",
    "moderate",
    "low",
    "very_low",
    "consensus",
    "not_graded",
  ]),
  limitations: z.array(z.string()).min(1),
  contraindications: z.array(z.string()),
  review: z.strictObject({
    reviewer: z.string().min(1),
    reviewedAt: z.iso.date(),
    status: z.literal("approved"),
    rightsReviewed: z.literal(true),
  }),
  relatedIds: z.array(z.string()),
});
export type RecoveryArticle = z.infer<typeof recoveryArticleSchema>;
export const publicRecoveryArticles: readonly RecoveryArticle[] =
  recoveryArticleSchema.array().parse(records);
export const publicRecoveryRoutines: readonly {
  article: RecoveryArticle;
  routine: z.infer<typeof routineSchema>;
  stepRationales: readonly string[];
}[] = [];
export function validateRecoveryRelease() {
  const sources = new Set(recoveryReference.sources.map((s) => s.id));
  const entries = [
    ...publicRecoveryArticles,
    ...publicRecoveryRoutines.map((r) => r.article),
  ];
  const ids = new Set<string>(),
    slugs = new Set<string>();
  for (const entry of entries) {
    const article = recoveryArticleSchema.parse(entry);
    if (ids.has(article.id) || slugs.has(article.slug))
      throw Error("Duplicate published recovery identity.");
    ids.add(article.id);
    slugs.add(article.slug);
    if (
      !recoveryReference.seedTaxonomy.some(
        (s) => s.id === article.id && s.slug === article.slug,
      )
    )
      throw Error("Recovery identity differs from its stable seed.");
    for (const source of [
      ...article.sourceIds,
      ...article.claims.flatMap((c) => c.sourceIds),
    ])
      if (!sources.has(source)) throw Error("Recovery source is unresolved.");
    if (
      article.claims.some((c) =>
        c.sourceIds.some((id) => !article.sourceIds.includes(id)),
      )
    )
      throw Error("Claim source is absent from article source list.");
    if (article.review.reviewedAt > new Date().toISOString().slice(0, 10))
      throw Error("Future recovery review date.");
  }
  for (const item of publicRecoveryRoutines) {
    routineSchema.parse(item.routine);
    if (
      item.stepRationales.length !== item.routine.steps.length ||
      item.stepRationales.some((v) => !v.trim())
    )
      throw Error("Every published routine step needs an editorial rationale.");
  }
}
