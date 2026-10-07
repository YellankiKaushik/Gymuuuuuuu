import { z } from "zod";
import {
  scienceCategories,
  scienceTypes,
  scienceGoals,
  scienceExperiences,
  confidences,
} from "./constants";
import type { ScienceTopic } from "./schema";
const text = z.string().min(1),
  optionalText = text.nullable().optional(),
  texts = z.array(text);
const framework = z.strictObject({
  solves: texts,
  prioritizeWhen: texts,
  deprioritizeWhen: texts,
  adjustmentLevers: texts,
  watchFor: texts,
  cannotTellYou: texts,
});
export const scienceIndexSchema = z.strictObject({
  id: text.regex(/^science_[a-z0-9_]+$/),
  slug: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  displayName: text,
  shortTitle: optionalText,
  aliases: texts.default([]),
  abbreviations: texts.default([]),
  category: z.enum(scienceCategories),
  contentType: z.enum(scienceTypes),
  goalTags: z.array(z.enum(scienceGoals)).default([]),
  experienceTags: z.array(z.enum(scienceExperiences)).default([]),
  contentStatus: z.enum([
    "draft",
    "review-needed",
    "reviewed",
    "published",
    "deprecated",
  ]),
  definition: optionalText,
  summary: optionalText,
  keyTakeaways: texts.optional(),
  decisionFramework: framework.nullable().optional(),
  claims: z
    .array(
      z.strictObject({
        id: text.regex(/^claim_[a-z0-9_]+$/),
        confidence: z.enum(confidences),
        sourceIds: z.array(text.regex(/^source_[a-z0-9_]+$/)).min(1),
      }),
    )
    .optional(),
  limitations: texts.optional(),
  prerequisiteTopicIds: texts.optional(),
  relatedTopicIds: texts.optional(),
  commonlyConfusedTopicIds: texts.optional(),
  comparedTopicIds: texts.optional(),
  relatedExerciseIds: texts.optional(),
  review: z
    .strictObject({
      subjectReviewerRole: text,
      editorialReviewerRole: text,
      reviewedAt: z.iso.date(),
      nextReviewDue: z.iso.date(),
      claimReviewComplete: z.literal(true),
      notes: optionalText,
    })
    .nullable()
    .optional(),
  deprecation: z
    .strictObject({ replacementTopicId: text, migrationNote: text })
    .nullable()
    .optional(),
  version: text.regex(/^[0-9]+\.[0-9]+\.[0-9]+$/),
  updatedAt: z.iso.date().nullable().optional(),
  learningOrder: z.number().int().min(1).optional(),
});
export type ScienceDiscoveryTopic = z.infer<typeof scienceIndexSchema>;
export function projectScienceIndex(topic: ScienceTopic) {
  const projected: Record<string, unknown> = Object.fromEntries(
    Object.keys(scienceIndexSchema.shape).flatMap((key) => {
      const value = topic[key as keyof ScienceTopic];
      return value === undefined ? [] : [[key, value]];
    }),
  );
  if (topic.claims)
    projected.claims = topic.claims.map((c) => ({
      id: c.id,
      confidence: c.confidence,
      sourceIds: c.sourceIds,
    }));
  return scienceIndexSchema.parse(projected);
}
