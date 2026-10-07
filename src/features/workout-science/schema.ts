import {
  scienceCategories,
  scienceTypes,
  scienceGoals,
  scienceExperiences,
  evidenceLevels,
  confidences,
} from "./constants";
export {
  scienceCategories,
  scienceTypes,
  scienceGoals,
  scienceExperiences,
  evidenceLevels,
  confidences,
} from "./constants";
import { z } from "zod";
const text = z.string().trim().min(1);
const nullableText = text.nullable().optional();
const date = z.iso.date();
const unique = <T extends z.ZodType>(schema: T) =>
  z
    .array(schema)
    .refine((items) => new Set(items).size === items.length, "Duplicate value");
const sourceId = text.regex(/^source_[a-z0-9_]+$/);
const sourceIds = unique(sourceId).refine(
  (items) => items.length > 0,
  "At least one source required",
);
const topicIds = unique(text.regex(/^science_[a-z0-9_]+$/));
const exerciseIds = unique(text.regex(/^exercise_[a-z0-9_]+$/));

const statements = z.array(text.min(8)).min(1);
export const decisionFrameworkSchema = z.strictObject({
  solves: statements,
  prioritizeWhen: statements,
  deprioritizeWhen: statements,
  adjustmentLevers: z.array(text.min(3)).min(1),
  watchFor: statements,
  cannotTellYou: statements,
});
export const numericGuidanceSchema = z
  .strictObject({
    valueType: z.enum(["single", "range", "upper-bound", "lower-bound"]),
    minimum: z.number().finite().nullable().optional(),
    maximum: z.number().finite().nullable().optional(),
    unit: text,
  })
  .superRefine((value, ctx) => {
    const add = (message: string) => ctx.addIssue({ code: "custom", message });
    if (
      value.minimum != null &&
      value.maximum != null &&
      value.minimum > value.maximum
    )
      add("Minimum exceeds maximum");
    if (
      value.valueType === "range" &&
      (value.minimum == null || value.maximum == null)
    )
      add("Range needs both bounds");
    if (
      value.valueType === "single" &&
      (value.minimum == null ||
        (value.maximum != null && value.maximum !== value.minimum))
    )
      add("Single value needs one consistent value");
    if (value.valueType === "upper-bound" && value.maximum == null)
      add("Upper bound required");
    if (value.valueType === "lower-bound" && value.minimum == null)
      add("Lower bound required");
  });
export const scienceClaimSchema = z.strictObject({
  id: text.regex(/^claim_[a-z0-9_]+$/),
  claimText: text.min(20),
  claimType: z.enum([
    "definition",
    "association",
    "comparative-effect",
    "dose-response",
    "null-or-inconsistent",
    "safety-boundary",
    "practice-framework",
  ]),
  outcome: z.enum([
    "strength",
    "hypertrophy",
    "power",
    "muscular-endurance",
    "physical-function",
    "fatigue",
    "adherence",
    "skill",
    "safety",
    "mixed",
    "not-applicable",
  ]),
  population: unique(
    z.enum([
      "healthy-adults",
      "resistance-trained-adults",
      "untrained-adults",
      "older-adults",
      "youth-athletes",
      "clinical-rehabilitation",
      "mixed-population",
      "not-applicable",
    ]),
  ).refine((items) => items.length > 0),
  evidenceLevel: z.enum(evidenceLevels),
  confidence: z.enum(confidences),
  direction: z.enum([
    "benefit",
    "harm-or-cost",
    "no-consistent-difference",
    "mixed",
    "context-dependent",
    "not-applicable",
  ]),
  effectQualifier: nullableText,
  sourceIds,
  limitations: statements,
  lastVerified: date,
});
export const scienceSourceSchema = z.strictObject({
  id: sourceId,
  title: text.min(8),
  authorsOrOrganization: nullableText,
  sourceType: z.enum([
    "position-stand",
    "guideline",
    "umbrella-review",
    "systematic-review-meta-analysis",
    "systematic-review",
    "randomized-trial",
    "controlled-trial",
    "consensus-statement",
    "textbook-definition",
    "mechanistic-study",
    "practice-interpretation",
  ]),
  year: z.number().int().min(1900).max(2100),
  doi: nullableText,
  pmid: text
    .regex(/^[0-9]+$/)
    .nullable()
    .optional(),
  url: z
    .url()
    .refine((value) => ["http:", "https:"].includes(new URL(value).protocol)),
  accessedAt: date,
  notes: nullableText,
});
export const scienceSchema = z
  .strictObject({
    id: text.regex(/^science_[a-z0-9_]+$/),
    slug: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    displayName: text.min(2),
    shortTitle: nullableText,
    aliases: unique(text).default([]),
    abbreviations: unique(text).default([]),
    category: z.enum(scienceCategories),
    contentType: z.enum(scienceTypes),
    goalTags: unique(z.enum(scienceGoals)).default([]),
    experienceTags: unique(z.enum(scienceExperiences)).default([]),
    contentStatus: z.enum([
      "draft",
      "review-needed",
      "reviewed",
      "published",
      "deprecated",
    ]),
    definition: text.min(20).nullable().optional(),
    summary: text.min(30).nullable().optional(),
    whyItMatters: text.min(30).nullable().optional(),
    keyTakeaways: unique(text.min(10)).optional(),
    howItWorks: z.array(text.min(15)).optional(),
    goalContexts: z
      .array(
        z.strictObject({
          goal: z.enum(scienceGoals),
          interpretation: text.min(20),
          qualifiers: z.array(text.min(8)),
          sourceIds,
        }),
      )
      .optional(),
    decisionFramework: decisionFrameworkSchema.nullable().optional(),
    claims: z.array(scienceClaimSchema).optional(),
    practicalGuidance: z
      .array(
        z.strictObject({
          context: text.min(8),
          guidanceText: text.min(15),
          numericValue: numericGuidanceSchema.nullable().optional(),
          qualifiers: statements,
          sourceIds,
        }),
      )
      .optional(),
    examples: z
      .array(
        z.strictObject({
          title: text.min(3),
          scenario: text.min(15),
          steps: statements,
          relatedExerciseIds: exerciseIds.optional(),
          nonPrescriptionNotice: z.literal(true),
        }),
      )
      .optional(),
    commonMistakes: z
      .array(
        z.strictObject({
          mistake: text.min(8),
          whyItMatters: text.min(15),
          correction: text.min(15),
          sourceIds,
        }),
      )
      .optional(),
    myths: z
      .array(
        z.strictObject({
          myth: text.min(8),
          correction: text.min(20),
          evidenceLevel: z.enum(evidenceLevels),
          sourceIds,
          limitations: statements,
        }),
      )
      .optional(),
    limitations: z.array(text.min(10)).optional(),
    prerequisiteTopicIds: topicIds.optional(),
    relatedTopicIds: topicIds.optional(),
    commonlyConfusedTopicIds: topicIds.optional(),
    comparedTopicIds: topicIds.optional(),
    relatedExerciseIds: exerciseIds.optional(),
    relatedMuscleIds: unique(text.regex(/^muscle_[a-z0-9_]+$/)).optional(),
    futureProgramIds: unique(text.regex(/^program_[a-z0-9_]+$/)).optional(),
    sources: z.array(scienceSourceSchema).optional(),
    review: z
      .strictObject({
        subjectReviewerRole: text.min(3),
        editorialReviewerRole: text.min(3),
        reviewedAt: date,
        nextReviewDue: date,
        claimReviewComplete: z.literal(true),
        notes: nullableText,
      })
      .nullable()
      .optional(),
    deprecation: z
      .strictObject({
        replacementTopicId: text.regex(/^science_[a-z0-9_]+$/),
        migrationNote: text.min(10),
      })
      .nullable()
      .optional(),
    version: text.regex(/^[0-9]+\.[0-9]+\.[0-9]+$/),
    updatedAt: date.nullable().optional(),
    learningOrder: z.number().int().min(1).optional(),
  })
  .superRefine((record, ctx) => {
    const require = (value: unknown, path: string, message: string) => {
      if (!value) ctx.addIssue({ code: "custom", path: [path], message });
    };
    if (record.contentStatus === "deprecated")
      require(record.deprecation, "deprecation", "Replacement and migration note required");
    if (record.contentStatus !== "published") return;
    for (const key of [
      "definition",
      "summary",
      "whyItMatters",
      "decisionFramework",
      "review",
      "updatedAt",
    ] as const)
      require(record[key], key, "Required for publication");
    require(record.keyTakeaways &&
      record.keyTakeaways.length >= 3 &&
      record.keyTakeaways.length <=
        6, "keyTakeaways", "Three to six takeaways required");
    for (const key of ["claims", "limitations", "sources"] as const)
      require(record[key]?.length, key, "Required for publication");
    if (record.category === "training-variables")
      require(record.goalContexts
        ?.length, "goalContexts", "Variables require qualified goal interpretation");
  });
export type ScienceTopic = z.infer<typeof scienceSchema>;
