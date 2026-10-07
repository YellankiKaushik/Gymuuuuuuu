// Generated from DOCS_for_entire_apppliaction/GYM/Phase_05_Workout_Program_Data_Schema.json. Regenerate with node scripts/generate-program-schema.mjs.
import { z } from "zod";

export const normativeProgramObjectSchema = z.strictObject({
  id: z.string().regex(new RegExp("^program_[a-z0-9_]+$")),
  slug: z.string().regex(new RegExp("^[a-z0-9]+(?:-[a-z0-9]+)*$")),
  displayName: z.string().min(3),
  shortName: z.string().nullable().optional(),
  aliases: z
    .array(z.string())
    .refine(
      (items) =>
        new Set(items.map((item) => JSON.stringify(item))).size ===
        items.length,
      "Duplicate array value",
    )
    .optional(),
  category: z.enum([
    "general-fitness",
    "strength",
    "hypertrophy",
    "strength-hypertrophy",
    "power",
    "muscular-endurance",
    "home-minimal",
    "time-efficient",
    "return-maintenance",
    "body-composition-support",
    "specialization",
  ]),
  programType: z.enum([
    "template",
    "educational-example",
    "starter-plan",
    "maintenance-plan",
    "specialization-plan",
    "conditioning-plan",
    "power-plan",
  ]),
  contentStatus: z.enum([
    "draft",
    "review-needed",
    "reviewed",
    "published",
    "deprecated",
  ]),
  contentStatusNote: z.string().nullable().optional(),
  primaryGoal: z.enum([
    "general-fitness",
    "strength",
    "hypertrophy",
    "strength-hypertrophy",
    "power",
    "muscular-endurance",
    "body-composition-support",
    "maintenance",
    "skill",
  ]),
  secondaryGoals: z
    .array(
      z.enum([
        "general-fitness",
        "strength",
        "hypertrophy",
        "strength-hypertrophy",
        "power",
        "muscular-endurance",
        "body-composition-support",
        "maintenance",
        "skill",
      ]),
    )
    .refine(
      (items) =>
        new Set(items.map((item) => JSON.stringify(item))).size ===
        items.length,
      "Duplicate array value",
    )
    .optional(),
  experienceLevels: z
    .array(
      z.enum([
        "foundation",
        "beginner",
        "intermediate",
        "advanced",
        "specialist",
      ]),
    )
    .min(1)
    .refine(
      (items) =>
        new Set(items.map((item) => JSON.stringify(item))).size ===
        items.length,
      "Duplicate array value",
    ),
  populationScope: z
    .array(
      z.enum([
        "healthy-adults",
        "resistance-trained-adults",
        "untrained-adults",
        "older-adults-general",
        "mixed-healthy-adults",
      ]),
    )
    .refine(
      (items) =>
        new Set(items.map((item) => JSON.stringify(item))).size ===
        items.length,
      "Duplicate array value",
    )
    .optional(),
  routineStyle: z.enum([
    "full-body",
    "upper-lower",
    "push-pull-legs",
    "upper-lower-ppl",
    "body-part-split",
    "alternating-a-b",
    "circuit",
    "specialization",
    "mixed",
  ]),
  trainingDaysPerWeek: z.number().finite().int().min(1).max(7),
  sessionDurationMinutes: z
    .union([
      z.strictObject({
        min: z.number().finite().int().min(0),
        max: z.number().finite().int().min(0),
      }),
      z.null(),
    ])
    .optional(),
  durationMode: z.enum(["fixed-weeks", "open-ended", "block-based"]),
  durationWeeks: z.number().finite().int().min(1).max(52).nullable().optional(),
  equipmentProfileId: z
    .string()
    .regex(new RegExp("^equipment_profile_[a-z0-9_]+$")),
  requiredEquipmentIds: z
    .array(z.string().regex(new RegExp("^equipment_[a-z0-9_]+$")))
    .refine(
      (items) =>
        new Set(items.map((item) => JSON.stringify(item))).size ===
        items.length,
      "Duplicate array value",
    )
    .optional(),
  optionalEquipmentIds: z
    .array(z.string().regex(new RegExp("^equipment_[a-z0-9_]+$")))
    .refine(
      (items) =>
        new Set(items.map((item) => JSON.stringify(item))).size ===
        items.length,
      "Duplicate array value",
    )
    .optional(),
  environmentTags: z
    .array(
      z.enum(["gym", "home", "outdoors", "travel", "limited-space", "mixed"]),
    )
    .refine(
      (items) =>
        new Set(items.map((item) => JSON.stringify(item))).size ===
        items.length,
      "Duplicate array value",
    )
    .optional(),
  summary: z.string().min(40).nullable().optional(),
  outcomesAndLimits: z
    .strictObject({
      designedToSupport: z.array(z.string().min(10)).min(1),
      doesNotGuarantee: z.array(z.string().min(10)).min(1),
      notDesignedFor: z.array(z.string().min(10)).min(1),
    })
    .nullable()
    .optional(),
  audience: z
    .strictObject({
      bestFor: z.array(z.string().min(8)).min(1),
      notFor: z.array(z.string().min(8)).min(1),
      prerequisites: z.array(z.string().min(5)),
      assumptions: z.array(z.string().min(8)).min(1),
    })
    .nullable()
    .optional(),
  scheduleModel: z
    .strictObject({
      mode: z.enum([
        "fixed-week",
        "rotating-sequence",
        "flexible-week",
        "block-calendar",
      ]),
      sessions: z
        .array(
          z.strictObject({
            id: z.string().regex(new RegExp("^session_[a-z0-9_]+$")),
            displayName: z.string().min(3),
            shortLabel: z.string().nullable().optional(),
            focusTags: z
              .array(z.string())
              .min(1)
              .refine(
                (items) =>
                  new Set(items.map((item) => JSON.stringify(item))).size ===
                  items.length,
                "Duplicate array value",
              ),
            estimatedDurationMinutes: z.strictObject({
              min: z.number().finite().int().min(0),
              max: z.number().finite().int().min(0),
            }),
            exerciseBlocks: z
              .array(
                z.strictObject({
                  id: z.string().regex(new RegExp("^block_[a-z0-9_]+$")),
                  blockType: z.enum([
                    "warmup",
                    "power",
                    "primary",
                    "secondary",
                    "accessory",
                    "superset",
                    "circuit",
                    "conditioning",
                    "mobility",
                    "cooldown",
                  ]),
                  order: z.number().finite().int().min(1),
                  scienceTopicIds: z
                    .array(z.string().regex(new RegExp("^science_[a-z0-9_]+$")))
                    .refine(
                      (items) =>
                        new Set(items.map((item) => JSON.stringify(item)))
                          .size === items.length,
                      "Duplicate array value",
                    )
                    .optional(),
                  prescriptions: z
                    .array(
                      z.strictObject({
                        exerciseId: z
                          .string()
                          .regex(new RegExp("^exercise_[a-z0-9_]+$")),
                        role: z.enum([
                          "skill",
                          "power",
                          "primary",
                          "secondary",
                          "accessory",
                          "isolation",
                          "conditioning",
                          "warmup",
                          "mobility",
                        ]),
                        sets: z.strictObject({
                          min: z.number().finite().int().min(0),
                          max: z.number().finite().int().min(0),
                        }),
                        repetitionTarget: z.strictObject({
                          type: z.enum([
                            "repetitions",
                            "seconds",
                            "distance",
                            "technical-quality",
                            "amrap-capped",
                          ]),
                          range: z
                            .union([
                              z.strictObject({
                                min: z.number().finite().int().min(0),
                                max: z.number().finite().int().min(0),
                              }),
                              z.null(),
                            ])
                            .optional(),
                          unit: z.string().nullable().optional(),
                          cap: z
                            .number()
                            .finite()
                            .int()
                            .min(1)
                            .nullable()
                            .optional(),
                        }),
                        effortTarget: z.strictObject({
                          method: z.enum([
                            "rir",
                            "rpe",
                            "percent-1rm",
                            "velocity-intent",
                            "technical-stop",
                            "comfortable-effort",
                            "not-applicable",
                          ]),
                          target: z.union([
                            z.strictObject({
                              min: z.number().finite(),
                              max: z.number().finite(),
                            }),
                            z.string(),
                          ]),
                          qualifier: z.string().nullable().optional(),
                          scienceTopicIds: z
                            .array(
                              z
                                .string()
                                .regex(new RegExp("^science_[a-z0-9_]+$")),
                            )
                            .refine(
                              (items) =>
                                new Set(
                                  items.map((item) => JSON.stringify(item)),
                                ).size === items.length,
                              "Duplicate array value",
                            )
                            .optional(),
                        }),
                        restSeconds: z.strictObject({
                          min: z.number().finite().int().min(0),
                          max: z.number().finite().int().min(0),
                        }),
                        tempo: z
                          .string()
                          .regex(
                            new RegExp(
                              "^(controlled|explosive|self-selected|[0-9Xx]{4})$",
                            ),
                          )
                          .nullable()
                          .optional(),
                        progressionRuleId: z
                          .string()
                          .regex(new RegExp("^progression_[a-z0-9_]+$")),
                        substitutionGroupId: z
                          .string()
                          .regex(new RegExp("^substitution_[a-z0-9_]+$"))
                          .nullable()
                          .optional(),
                        optional: z.boolean().optional(),
                        notes: z.array(z.string().min(5)).optional(),
                      }),
                    )
                    .min(1),
                  rounds: z
                    .number()
                    .finite()
                    .int()
                    .min(1)
                    .nullable()
                    .optional(),
                  betweenExerciseRestSeconds: z
                    .number()
                    .finite()
                    .int()
                    .min(0)
                    .nullable()
                    .optional(),
                  betweenRoundRestSeconds: z
                    .number()
                    .finite()
                    .int()
                    .min(0)
                    .nullable()
                    .optional(),
                }),
              )
              .min(1),
            sessionNotes: z.array(z.string().min(5)).optional(),
          }),
        )
        .min(1),
      restDayGuidance: z.array(z.string().min(8)).min(1),
      calendarExamples: z
        .array(
          z.strictObject({
            label: z.string().min(3),
            days: z
              .array(
                z.strictObject({
                  day: z.enum([
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ]),
                  sessionId: z
                    .string()
                    .regex(new RegExp("^session_[a-z0-9_]+$"))
                    .nullable(),
                }),
              )
              .min(7)
              .max(7),
          }),
        )
        .optional(),
    })
    .nullable()
    .optional(),
  blocks: z
    .array(
      z.strictObject({
        id: z.string().regex(new RegExp("^program_block_[a-z0-9_]+$")),
        displayName: z.string().min(3),
        weekRange: z.strictObject({
          min: z.number().finite().int().min(0),
          max: z.number().finite().int().min(0),
        }),
        purpose: z.string().min(15),
        scheduleSessionIds: z
          .array(z.string().regex(new RegExp("^session_[a-z0-9_]+$")))
          .min(1)
          .refine(
            (items) =>
              new Set(items.map((item) => JSON.stringify(item))).size ===
              items.length,
            "Duplicate array value",
          ),
        transitionRules: z.array(z.string().min(10)).min(1),
        scienceTopicIds: z
          .array(z.string().regex(new RegExp("^science_[a-z0-9_]+$")))
          .min(1)
          .refine(
            (items) =>
              new Set(items.map((item) => JSON.stringify(item))).size ===
              items.length,
            "Duplicate array value",
          ),
        sourceIds: z
          .array(z.string().regex(new RegExp("^source_[a-z0-9_]+$")))
          .min(1)
          .refine(
            (items) =>
              new Set(items.map((item) => JSON.stringify(item))).size ===
              items.length,
            "Duplicate array value",
          ),
      }),
    )
    .optional(),
  progressionRules: z
    .array(
      z.strictObject({
        id: z.string().regex(new RegExp("^progression_[a-z0-9_]+$")),
        displayName: z.string().min(3),
        type: z.enum([
          "double-progression",
          "load-progression",
          "repetition-progression",
          "set-progression",
          "density-progression",
          "technical-progression",
          "autoregulated-progression",
          "block-transition",
          "maintenance",
        ]),
        trigger: z.array(z.string().min(10)).min(1),
        action: z.array(z.string().min(10)).min(1),
        ceiling: z.array(z.string().min(8)).optional(),
        floor: z.array(z.string().min(8)).optional(),
        stallResponse: z.array(z.string().min(10)).min(1),
        scienceTopicIds: z
          .array(z.string().regex(new RegExp("^science_[a-z0-9_]+$")))
          .min(1)
          .refine(
            (items) =>
              new Set(items.map((item) => JSON.stringify(item))).size ===
              items.length,
            "Duplicate array value",
          ),
        sourceIds: z
          .array(z.string().regex(new RegExp("^source_[a-z0-9_]+$")))
          .min(1)
          .refine(
            (items) =>
              new Set(items.map((item) => JSON.stringify(item))).size ===
              items.length,
            "Duplicate array value",
          ),
      }),
    )
    .optional(),
  deloadStrategy: z
    .strictObject({
      triggerType: z.enum([
        "scheduled",
        "readiness-guided",
        "performance-guided",
        "none",
        "context-dependent",
      ]),
      implementation: z.array(z.string().min(10)),
      limitations: z.array(z.string().min(10)),
      scienceTopicIds: z
        .array(z.string().regex(new RegExp("^science_[a-z0-9_]+$")))
        .min(1)
        .refine(
          (items) =>
            new Set(items.map((item) => JSON.stringify(item))).size ===
            items.length,
          "Duplicate array value",
        ),
      sourceIds: z
        .array(z.string().regex(new RegExp("^source_[a-z0-9_]+$")))
        .min(1)
        .refine(
          (items) =>
            new Set(items.map((item) => JSON.stringify(item))).size ===
            items.length,
          "Duplicate array value",
        ),
    })
    .nullable()
    .optional(),
  substitutionGroups: z
    .array(
      z.strictObject({
        id: z.string().regex(new RegExp("^substitution_[a-z0-9_]+$")),
        displayName: z.string().min(3),
        originalExerciseIds: z
          .array(z.string().regex(new RegExp("^exercise_[a-z0-9_]+$")))
          .min(1)
          .refine(
            (items) =>
              new Set(items.map((item) => JSON.stringify(item))).size ===
              items.length,
            "Duplicate array value",
          ),
        candidateExerciseIds: z
          .array(z.string().regex(new RegExp("^exercise_[a-z0-9_]+$")))
          .min(1)
          .refine(
            (items) =>
              new Set(items.map((item) => JSON.stringify(item))).size ===
              items.length,
            "Duplicate array value",
          ),
        matchingRules: z.array(z.string().min(8)).min(1),
        disallowedChanges: z.array(z.string().min(8)).min(1),
        reviewRequired: z.literal(true),
      }),
    )
    .optional(),
  weeklySummary: z
    .strictObject({
      sessionCount: z.number().finite().int().min(1).max(14).optional(),
      estimatedWeeklyMinutes: z
        .union([
          z.strictObject({
            min: z.number().finite().int().min(0),
            max: z.number().finite().int().min(0),
          }),
          z.null(),
        ])
        .optional(),
      movementPatternExposure: z
        .array(
          z.strictObject({
            movementPatternId: z
              .string()
              .regex(new RegExp("^pattern_[a-z0-9_]+$")),
            sessionCount: z.number().finite().int().min(0),
          }),
        )
        .optional(),
      muscleSetEstimates: z
        .array(
          z.strictObject({
            muscleId: z.string().regex(new RegExp("^muscle_[a-z0-9_]+$")),
            directSetRange: z.strictObject({
              min: z.number().finite().int().min(0),
              max: z.number().finite().int().min(0),
            }),
            method: z.enum([
              "direct-only",
              "fractional-estimate",
              "not-calculated",
            ]),
          }),
        )
        .optional(),
    })
    .nullable()
    .optional(),
  scienceRationale: z
    .array(
      z.strictObject({
        decision: z.string().min(15),
        scienceTopicIds: z
          .array(z.string().regex(new RegExp("^science_[a-z0-9_]+$")))
          .min(1)
          .refine(
            (items) =>
              new Set(items.map((item) => JSON.stringify(item))).size ===
              items.length,
            "Duplicate array value",
          ),
        sourceIds: z
          .array(z.string().regex(new RegExp("^source_[a-z0-9_]+$")))
          .min(1)
          .refine(
            (items) =>
              new Set(items.map((item) => JSON.stringify(item))).size ===
              items.length,
            "Duplicate array value",
          ),
        qualifiers: z.array(z.string().min(8)),
      }),
    )
    .optional(),
  measurementGuidance: z
    .array(
      z.strictObject({
        metric: z.enum([
          "completed-sessions",
          "load-repetitions",
          "estimated-1rm",
          "repetition-quality",
          "rir-rpe",
          "body-mass",
          "circumference",
          "subjective-readiness",
          "other",
        ]),
        howToUse: z.string().min(15),
        limitations: z.array(z.string().min(8)).min(1),
        scienceTopicIds: z
          .array(z.string().regex(new RegExp("^science_[a-z0-9_]+$")))
          .min(1)
          .refine(
            (items) =>
              new Set(items.map((item) => JSON.stringify(item))).size ===
              items.length,
            "Duplicate array value",
          ),
      }),
    )
    .optional(),
  safety: z
    .strictObject({
      generalBoundaries: z.array(z.string().min(10)).min(1),
      stopSignals: z.array(z.string().min(8)).min(1),
      professionalReviewTriggers: z.array(z.string().min(8)).min(1),
      notMedicalAdvice: z.literal(true),
    })
    .nullable()
    .optional(),
  relatedProgramIds: z
    .array(z.string().regex(new RegExp("^program_[a-z0-9_]+$")))
    .refine(
      (items) =>
        new Set(items.map((item) => JSON.stringify(item))).size ===
        items.length,
      "Duplicate array value",
    )
    .optional(),
  sources: z
    .array(
      z.strictObject({
        id: z.string().regex(new RegExp("^source_[a-z0-9_]+$")),
        title: z.string().min(8),
        authorsOrOrganization: z.string().nullable().optional(),
        sourceType: z.enum([
          "position-stand",
          "guideline",
          "umbrella-review",
          "systematic-review-meta-analysis",
          "systematic-review",
          "randomized-trial",
          "controlled-trial",
          "consensus-statement",
          "practice-framework",
        ]),
        year: z.number().finite().int().min(1900).max(2100),
        doi: z.string().nullable().optional(),
        pmid: z.string().regex(new RegExp("^[0-9]+$")).nullable().optional(),
        url: z
          .string()
          .refine(
            (value) =>
              z.url().safeParse(value).success &&
              ["http:", "https:"].includes(new URL(value).protocol),
            "Invalid HTTP(S) URL",
          ),
        accessedAt: z
          .string()
          .refine(
            (value) => z.iso.date().safeParse(value).success,
            "Invalid date",
          ),
        notes: z.string().nullable().optional(),
      }),
    )
    .optional(),
  review: z
    .strictObject({
      programReviewerRole: z.string().min(3),
      scienceReviewerRole: z.string().min(3),
      editorialReviewerRole: z.string().min(3),
      reviewedAt: z
        .string()
        .refine(
          (value) => z.iso.date().safeParse(value).success,
          "Invalid date",
        ),
      nextReviewDue: z
        .string()
        .refine(
          (value) => z.iso.date().safeParse(value).success,
          "Invalid date",
        ),
      crossReferenceReviewComplete: z.literal(true),
      notes: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  deprecation: z
    .strictObject({
      replacementProgramId: z
        .string()
        .regex(new RegExp("^program_[a-z0-9_]+$")),
      migrationNote: z.string().min(10),
    })
    .nullable()
    .optional(),
  version: z.string().regex(new RegExp("^[0-9]+\\.[0-9]+\\.[0-9]+$")),
  updatedAt: z
    .string()
    .refine((value) => z.iso.date().safeParse(value).success, "Invalid date")
    .nullable()
    .optional(),
  learningOrder: z.number().finite().int().min(1).optional(),
});
export function validateProgramConditionals(
  record: {
    contentStatus?: unknown;
    populationScope?: unknown;
    sessionDurationMinutes?: unknown;
    summary?: unknown;
    outcomesAndLimits?: unknown;
    audience?: unknown;
    scheduleModel?: unknown;
    progressionRules?: unknown;
    substitutionGroups?: unknown;
    scienceRationale?: unknown;
    measurementGuidance?: unknown;
    safety?: unknown;
    sources?: unknown;
    review?: unknown;
    updatedAt?: unknown;
    durationMode?: unknown;
    durationWeeks?: unknown;
    blocks?: unknown;
    deprecation?: unknown;
  },
  ctx: z.RefinementCtx,
) {
  if (record["contentStatus"] === "published") {
    if (record["populationScope"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["populationScope"],
        message: "Required by conditional schema",
      });
    if (record["sessionDurationMinutes"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["sessionDurationMinutes"],
        message: "Required by conditional schema",
      });
    if (record["summary"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["summary"],
        message: "Required by conditional schema",
      });
    if (record["outcomesAndLimits"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["outcomesAndLimits"],
        message: "Required by conditional schema",
      });
    if (record["audience"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["audience"],
        message: "Required by conditional schema",
      });
    if (record["scheduleModel"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["scheduleModel"],
        message: "Required by conditional schema",
      });
    if (record["progressionRules"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["progressionRules"],
        message: "Required by conditional schema",
      });
    if (record["substitutionGroups"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["substitutionGroups"],
        message: "Required by conditional schema",
      });
    if (record["scienceRationale"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["scienceRationale"],
        message: "Required by conditional schema",
      });
    if (record["measurementGuidance"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["measurementGuidance"],
        message: "Required by conditional schema",
      });
    if (record["safety"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["safety"],
        message: "Required by conditional schema",
      });
    if (record["sources"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["sources"],
        message: "Required by conditional schema",
      });
    if (record["review"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["review"],
        message: "Required by conditional schema",
      });
    if (record["updatedAt"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["updatedAt"],
        message: "Required by conditional schema",
      });
    if (
      Array.isArray(record["populationScope"]) &&
      record["populationScope"]!.length < 1
    )
      ctx.addIssue({
        code: "custom",
        path: ["populationScope"],
        message: "Insufficient publication items",
      });
    if (
      Array.isArray(record["progressionRules"]) &&
      record["progressionRules"]!.length < 1
    )
      ctx.addIssue({
        code: "custom",
        path: ["progressionRules"],
        message: "Insufficient publication items",
      });
    if (
      Array.isArray(record["substitutionGroups"]) &&
      record["substitutionGroups"]!.length < 1
    )
      ctx.addIssue({
        code: "custom",
        path: ["substitutionGroups"],
        message: "Insufficient publication items",
      });
    if (
      Array.isArray(record["scienceRationale"]) &&
      record["scienceRationale"]!.length < 1
    )
      ctx.addIssue({
        code: "custom",
        path: ["scienceRationale"],
        message: "Insufficient publication items",
      });
    if (
      Array.isArray(record["measurementGuidance"]) &&
      record["measurementGuidance"]!.length < 1
    )
      ctx.addIssue({
        code: "custom",
        path: ["measurementGuidance"],
        message: "Insufficient publication items",
      });
    if (Array.isArray(record["sources"]) && record["sources"]!.length < 1)
      ctx.addIssue({
        code: "custom",
        path: ["sources"],
        message: "Insufficient publication items",
      });
  }
  if (
    record["contentStatus"] === "published" &&
    record["durationMode"] === "fixed-weeks"
  ) {
    if (record["durationWeeks"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["durationWeeks"],
        message: "Required by conditional schema",
      });
  }
  if (
    record["contentStatus"] === "published" &&
    record["durationMode"] === "block-based"
  ) {
    if (record["blocks"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["blocks"],
        message: "Required by conditional schema",
      });
    if (Array.isArray(record["blocks"]) && record["blocks"]!.length < 1)
      ctx.addIssue({
        code: "custom",
        path: ["blocks"],
        message: "Insufficient publication items",
      });
  }
  if (record["contentStatus"] === "deprecated") {
    if (record["deprecation"] === undefined)
      ctx.addIssue({
        code: "custom",
        path: ["deprecation"],
        message: "Required by conditional schema",
      });
  }
}
export const normativeProgramSchema = normativeProgramObjectSchema.superRefine(
  validateProgramConditionals,
);
export type Program = z.infer<typeof normativeProgramSchema>;
