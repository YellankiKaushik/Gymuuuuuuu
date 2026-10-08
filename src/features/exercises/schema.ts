import { z } from "zod";

const text = z.string().trim().min(1);
const nullableText = text.nullable().optional();
const date = z.iso.date();
const nullableDate = date.nullable().optional();
const httpUrl = z
  .url()
  .refine(
    (value) =>
      URL.canParse(value) &&
      ["http:", "https:"].includes(new URL(value).protocol),
    "Use an HTTP(S) URL",
  );
const refs = z
  .array(text)
  .min(1)
  .refine(
    (items) => new Set(items).size === items.length,
    "Duplicate source ID",
  );
const unique = (pattern?: RegExp) =>
  z
    .array(pattern ? text.regex(pattern) : text)
    .refine((items) => new Set(items).size === items.length, "Duplicate value");
export const exerciseTypes = [
  "resistance-compound",
  "resistance-isolation",
  "bodyweight-strength",
  "power",
  "plyometric",
  "conditioning",
  "cardio",
  "mobility",
  "flexibility",
  "warmup",
  "balance-stability",
  "breathing-bracing",
] as const;
export const difficulties = [
  "foundation",
  "beginner",
  "intermediate",
  "advanced",
  "specialist",
  "not-assessed",
] as const;
export const mechanics = [
  "compound",
  "isolation",
  "cyclical",
  "isometric",
  "mixed",
  "not-applicable",
] as const;
export const lateralities = [
  "bilateral",
  "unilateral",
  "alternating",
  "single-side",
  "not-applicable",
] as const;
export const environments = [
  "commercial-gym",
  "home",
  "outdoors",
  "limited-space",
  "rack-required",
  "spotter-recommended",
] as const;
export const goals = [
  "general-fitness",
  "strength",
  "hypertrophy",
  "power",
  "muscular-endurance",
  "conditioning",
  "skill",
  "mobility",
  "warmup",
] as const;
export const rangeSchema = z
  .strictObject({
    min: z.number().finite().nonnegative(),
    max: z.number().finite().nonnegative(),
  })
  .refine((range) => range.min <= range.max, "Minimum exceeds maximum");
export const exerciseMediaSchema = z
  .strictObject({
    id: text,
    kind: z.enum(["video", "image", "diagram", "animation"]),
    provider: text,
    url: z.union([httpUrl, text.regex(/^\/media\/[a-z0-9-]+\.svg$/)]),
    alt: nullableText,
    embedUrl: httpUrl.nullable().optional(),
    embedAllowed: z.boolean().nullable().optional(),
    captionsAvailable: z.boolean().nullable().optional(),
    startSeconds: z.number().int().nonnegative().nullable().optional(),
    endSeconds: z.number().int().nonnegative().nullable().optional(),
    license: nullableText,
    credit: nullableText,
    reviewStatus: z.enum(["unreviewed", "reviewed", "unavailable", "rejected"]),
    reviewedAt: nullableDate,
    whySelected: nullableText,
  })
  .superRefine((media, ctx) => {
    if (media.url.startsWith("/") && (media.kind !== "diagram" || !media.alt))
      ctx.addIssue({
        code: "custom",
        message: "Repository SVG requires diagram kind and alternative text",
      });
    if (
      media.reviewStatus === "reviewed" &&
      (!media.reviewedAt ||
        !media.credit ||
        !media.license ||
        !media.whySelected)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Reviewed media needs date, credit, license and selection rationale",
      });
    if (
      media.startSeconds != null &&
      media.endSeconds != null &&
      media.startSeconds >= media.endSeconds
    )
      ctx.addIssue({ code: "custom", message: "Media end must follow start" });
  });
export type ExerciseMedia = z.infer<typeof exerciseMediaSchema>;
export const exerciseSourceSchema = z.strictObject({
  id: text,
  title: text,
  publisher: text,
  sourceType: z.enum([
    "position-stand",
    "systematic-review",
    "primary-study",
    "textbook",
    "government-guideline",
    "professional-technique-guide",
    "manufacturer-manual",
    "video-review",
    "other",
  ]),
  url: httpUrl,
  doi: nullableText,
  publicationYear: z.number().int().nullable().optional(),
  reviewedAt: date,
  notes: nullableText,
});
const exerciseRefs = unique(/^exercise_[a-z0-9_]+$/);
export const exerciseSchema = z
  .strictObject({
    id: text.regex(/^exercise_[a-z0-9_]+$/),
    slug: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    displayName: text.min(2),
    canonicalName: nullableText,
    aliases: unique().default([]),
    exerciseType: z.enum(exerciseTypes),
    contentStatus: z.enum([
      "draft",
      "review-needed",
      "reviewed",
      "published",
      "deprecated",
    ]),
    reviewRequired: z.boolean().optional(),
    difficulty: z.enum(difficulties).optional(),
    mechanics: z.enum(mechanics).optional(),
    laterality: z.enum(lateralities).optional(),
    kineticChain: z
      .enum(["open", "closed", "mixed", "not-applicable"])
      .optional(),
    movementPatternIds: unique(/^pattern_[a-z0-9_]+$/).refine(
      (items) => items.length > 0,
    ),
    equipmentIds: unique(/^equipment_[a-z0-9_]+$/).refine(
      (items) => items.length > 0,
    ),
    environmentTags: z
      .array(z.enum(environments))
      .refine(
        (items) => new Set(items).size === items.length,
        "Duplicate environment",
      )
      .optional(),
    goalTags: z
      .array(z.enum(goals))
      .refine((items) => new Set(items).size === items.length, "Duplicate goal")
      .optional(),
    summary: text.min(20).nullable().optional(),
    muscleRoles: z
      .array(
        z.strictObject({
          muscleId: text.regex(/^muscle_[a-z0-9_]+$/),
          role: z.enum([
            "primary",
            "secondary",
            "stabilizer",
            "dynamic-stabilizer",
            "context-dependent",
          ]),
          qualifier: nullableText,
          sourceIds: refs,
        }),
      )
      .optional(),
    jointActions: z
      .array(
        z.strictObject({
          joint: text,
          action: text,
          phase: z.enum([
            "concentric",
            "eccentric",
            "isometric",
            "cyclical",
            "multiple",
          ]),
          qualifier: nullableText,
          sourceIds: refs,
        }),
      )
      .optional(),
    technique: z
      .strictObject({
        setup: z.array(text).min(1).optional(),
        executionSteps: z.array(text).min(2).optional(),
        finishOrReset: nullableText,
        breathing: nullableText,
        rangeOfMotion: nullableText,
        tempoNotes: nullableText,
        keyCheckpoints: z.array(text).optional(),
        coachingCues: z.array(text).optional(),
        spottingNotes: nullableText,
      })
      .optional(),
    mistakes: z
      .array(
        z.strictObject({
          mistake: text,
          whyItMatters: text,
          correction: text,
          severity: z.enum(["minor", "performance", "safety"]).optional(),
          sourceIds: refs,
        }),
      )
      .optional(),
    relationships: z
      .strictObject({
        regressionIds: exerciseRefs.optional(),
        progressionIds: exerciseRefs.optional(),
        variationIds: exerciseRefs.optional(),
        substitutionIds: exerciseRefs.optional(),
        prerequisiteExerciseIds: exerciseRefs.optional(),
      })
      .optional(),
    programmingGuidance: z
      .array(
        z
          .strictObject({
            context: z.enum([
              "skill-learning",
              "general-fitness",
              "strength",
              "hypertrophy",
              "power",
              "muscular-endurance",
              "conditioning",
              "warmup",
              "mobility",
            ]),
            guidanceStatus: z.enum([
              "general-range",
              "context-dependent",
              "not-applicable",
              "insufficient-evidence",
            ]),
            setRange: rangeSchema.nullable().optional(),
            repRange: rangeSchema.nullable().optional(),
            durationSeconds: rangeSchema.nullable().optional(),
            restSeconds: rangeSchema.nullable().optional(),
            effortNotes: nullableText,
            loadNotes: nullableText,
            qualifier: nullableText,
            confidence: z.enum(["high", "moderate", "limited"]).optional(),
            sourceIds: refs,
          })
          .superRefine((item, ctx) => {
            if (
              [
                item.setRange,
                item.repRange,
                item.durationSeconds,
                item.restSeconds,
              ].some(Boolean) &&
              !item.confidence
            )
              ctx.addIssue({
                code: "custom",
                message: "Numeric guidance requires confidence",
              });
          }),
      )
      .optional(),
    safety: z
      .strictObject({
        cautionTags: unique().optional(),
        stopSignals: z.array(text).optional(),
        prerequisites: z.array(text).optional(),
        notMedicalAdvice: z.boolean().optional(),
        notes: nullableText,
      })
      .optional(),
    media: z.array(exerciseMediaSchema).optional(),
    sources: z.array(exerciseSourceSchema).optional(),
    review: z
      .strictObject({
        contentReviewer: nullableText,
        techniqueReviewedAt: nullableDate,
        anatomyReviewedAt: nullableDate,
        safetyReviewedAt: nullableDate,
        mediaReviewedAt: nullableDate,
        nextReviewDue: nullableDate,
        notes: nullableText,
      })
      .optional(),
    version: text.regex(/^[0-9]+\.[0-9]+(?:\.[0-9]+)?$/),
  })
  .superRefine((record, ctx) => {
    const roles = record.muscleRoles ?? [];
    if (new Set(roles.map((role) => role.muscleId)).size !== roles.length)
      ctx.addIssue({
        code: "custom",
        path: ["muscleRoles"],
        message: "Duplicate or contradictory muscle roles",
      });
    if (
      Object.values(record.relationships ?? {})
        .flat()
        .includes(record.id)
    )
      ctx.addIssue({
        code: "custom",
        path: ["relationships"],
        message: "Self-reference",
      });
    if (record.contentStatus !== "published") return;
    const require = (condition: unknown, path: string, message: string) => {
      if (!condition) ctx.addIssue({ code: "custom", path: [path], message });
    };
    require(record.reviewRequired ===
      false, "reviewRequired", "Published content cannot require review");
    for (const key of [
      "difficulty",
      "mechanics",
      "laterality",
      "summary",
      "technique",
      "safety",
      "review",
    ] as const)
      require(record[key], key, "Required for publication");
    for (const key of [
      "muscleRoles",
      "mistakes",
      "programmingGuidance",
      "media",
      "sources",
    ] as const)
      require(record[key]?.length, key, "Required for publication");
    require(roles.some((role) =>
      ["primary", "context-dependent"].includes(role.role),
    ), "muscleRoles", "Primary or qualified context-dependent role required");
    require(record.technique?.setup?.length &&
      record.technique.executionSteps?.length &&
      record.technique.finishOrReset &&
      record.technique.keyCheckpoints
        ?.length, "technique", "Complete setup, execution, reset and checkpoints required");
    require(record.safety?.notMedicalAdvice &&
      record.safety.stopSignals
        ?.length, "safety", "Educational scope and stop signals required");
    require(record.difficulty === "foundation" ||
      record.relationships?.regressionIds?.length ||
      record.safety?.prerequisites
        ?.length, "relationships", "Non-foundation exercise needs regression or prerequisites");
    const review = record.review;
    require(review?.contentReviewer &&
      review.techniqueReviewedAt &&
      review.anatomyReviewedAt &&
      review.safetyReviewedAt &&
      review.mediaReviewedAt &&
      review.nextReviewDue, "review", "All critical reviews required");
    require(record.media?.some(
      (media) => media.reviewStatus === "reviewed",
    ), "media", "Reviewed instructional media required");
  });
export type Exercise = z.infer<typeof exerciseSchema>;
