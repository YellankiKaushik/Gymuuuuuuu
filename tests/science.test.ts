import { expect, it } from "vitest";
import {
  numericGuidanceSchema,
  scienceClaimSchema,
  scienceSchema,
} from "../src/features/workout-science/schema";
import {
  buildScienceIndexes,
  getScienceBySlug,
  scienceIdentities,
  scienceIndexes,
  validateScience,
} from "../src/features/workout-science/repository";
import {
  parseScienceQuery,
  scienceQueryParams,
  searchScience,
} from "../src/features/workout-science/query";
import { scienceFixture as fixture } from "./fixtures/science";
it("validates all draft science identities and hides unpublished articles", () => {
  expect(scienceIdentities).toHaveLength(98);
  expect(validateScience(scienceIdentities)).toEqual([]);
  expect(scienceIndexes.published).toHaveLength(24);
  expect(scienceIndexes.published.slice(0, 5).map((r) => r.id)).toEqual([
    "science_consistency_adherence",
    "science_hypertrophy_adaptation",
    "science_muscular_failure",
    "science_rest_intervals",
    "science_training_split",
  ]);
  expect(getScienceBySlug("training-volume")?.id).toBe(
    "science_training_volume",
  );
  expect(getScienceBySlug("single-progression")).toBeUndefined();
});
it("requires claims, population, evidence, reviewer, source and decision context", () => {
  expect(validateScience([fixture])).toEqual([]);
  for (const key of [
    "sources",
    "review",
    "decisionFramework",
    "claims",
  ] as const)
    expect(
      scienceSchema.safeParse({ ...fixture, [key]: undefined }).success,
    ).toBe(false);
  expect(
    scienceClaimSchema.safeParse({ ...fixture.claims![0], population: [] })
      .success,
  ).toBe(false);
  expect(
    scienceClaimSchema.safeParse({
      ...fixture.claims![0],
      evidenceLevel: "excellent",
    }).success,
  ).toBe(false);
  expect(
    numericGuidanceSchema.safeParse({
      valueType: "range",
      minimum: 9,
      maximum: 1,
      unit: "sets",
    }).success,
  ).toBe(false);
  expect(
    numericGuidanceSchema.safeParse({ valueType: "range", unit: "sets" })
      .success,
  ).toBe(false);
  expect(
    scienceSchema.safeParse({
      ...fixture,
      practicalGuidance: [
        {
          context: "",
          guidanceText: "Synthetic testing guidance",
          qualifiers: [],
          sourceIds: [],
        },
      ],
    }).success,
  ).toBe(false);
});
it("rejects duplicates, unknown links, self/circular prerequisites and unsourced claims", () => {
  expect(validateScience([fixture, fixture]).join()).toContain("Duplicate ID");
  const invalid = {
    ...fixture,
    relatedExerciseIds: ["exercise_missing"],
    relatedMuscleIds: ["muscle_missing"],
    relatedTopicIds: [fixture.id, "science_missing"],
    claims: [{ ...fixture.claims![0]!, sourceIds: ["source_missing"] }],
  };
  const errors = validateScience([invalid]).join();
  for (const term of [
    "Unknown exercise",
    "Unknown muscle",
    "Invalid topic",
    "Unknown source",
  ])
    expect(errors).toContain(term);
  const other = {
    ...fixture,
    id: "science_other",
    slug: "other",
    claims: [{ ...fixture.claims![0]!, id: "claim_other" }],
    prerequisiteTopicIds: [fixture.id],
  };
  expect(
    validateScience([
      { ...fixture, prerequisiteTopicIds: [other.id] },
      other,
    ]).join(),
  ).toContain("Circular prerequisite");
});
it("blocks universal and medical claims, while requiring deprecation metadata", () => {
  expect(
    validateScience([
      {
        ...fixture,
        claims: [
          {
            ...fixture.claims![0]!,
            claimText:
              "This always works for everyone with guaranteed results.",
          },
        ],
      },
    ]).join(),
  ).toContain("Universal language");
  expect(
    validateScience([
      {
        ...fixture,
        claims: [
          {
            ...fixture.claims![0]!,
            claimText: "This method cures disease in every population.",
          },
        ],
      },
    ]).join(),
  ).toContain("Medical diagnosis");
  expect(
    scienceSchema.safeParse({
      ...fixture,
      contentStatus: "deprecated",
      deprecation: null,
    }).success,
  ).toBe(false);
  expect(
    scienceSchema.safeParse({
      ...fixture,
      contentStatus: "deprecated",
      deprecation: {
        replacementTopicId: "science_specificity",
        migrationNote: "Synthetic migration fixture only",
      },
    }).success,
  ).toBe(true);
});
it("generates aliases, source claims, glossary and exercise reverse links", () => {
  const index = buildScienceIndexes([
    { ...fixture, relatedExerciseIds: ["exercise_push_up"] },
  ]);
  expect(index.alias.get("fx")?.has(fixture.id)).toBe(true);
  expect(index.exercises.get("exercise_push_up")?.has(fixture.id)).toBe(true);
  expect(index.sourceClaims.get("source_fixture")?.has("claim_fixture")).toBe(
    true,
  );
  expect(index.glossary).toHaveLength(3);
});
it("searches names, aliases, abbreviations and definitions with URL OR/AND filters", () => {
  const other = {
    ...fixture,
    id: "science_other",
    slug: "other",
    category: "advanced-methods" as const,
    goalTags: ["strength" as const],
    displayName: "Other fixture",
  };
  const records = [fixture, other];
  for (const q of ["FX", "Fixture alias", "Synthetic definition"])
    expect(searchScience(parseScienceQuery({ q }), records)).toHaveLength(2);
  const query = parseScienceQuery({
    category: "foundations,advanced-methods",
    goal: "strength",
  });
  expect(searchScience(query, records)).toEqual([other]);
  expect(parseScienceQuery(scienceQueryParams(query))).toEqual(query);
  expect(scienceQueryParams(parseScienceQuery({}))).toEqual({});
  expect(parseScienceQuery({ category: "fake", sort: "best" }).sort).toBe(
    "learning",
  );
});
it("keeps search responsive with 500 fixture topics", () => {
  const records = Array.from({ length: 500 }, (_, index) => ({
    ...fixture,
    id: `science_fixture_${index}`,
    slug: `fixture-${index}`,
    learningOrder: index + 1,
  }));
  const start = performance.now();
  expect(searchScience(parseScienceQuery({ q: "FX" }), records)).toHaveLength(
    500,
  );
  expect(performance.now() - start).toBeLessThan(1000);
});
