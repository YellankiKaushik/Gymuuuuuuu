import { describe, expect, it } from "vitest";
import {
  exerciseMediaSchema,
  exerciseSchema,
  rangeSchema,
} from "../src/features/exercises/schema";
import {
  buildExerciseIndexes,
  exerciseIdentities,
  getExerciseBySlug,
  getPublishedExercises,
  validateExercises,
} from "../src/features/exercises/repository";
import {
  exerciseQuerySearch,
  parseExerciseQuery,
  searchExercises,
} from "../src/features/exercises/query";
import { reviewedEmbedUrl } from "../src/features/exercises/media";
import { reviewedExerciseFixture as fixture } from "./fixtures/exercise";

describe("exercise governance", () => {
  it("imports all stable draft IDs while excluding them publicly", () => {
    expect(exerciseIdentities).toHaveLength(184);
    expect(validateExercises(exerciseIdentities)).toEqual([]);
    expect(getPublishedExercises().map((r) => r.id)).toEqual([
      "exercise_dumbbell_curl",
    ]);
    expect(getExerciseBySlug("barbell-bench-press")).toBeUndefined();
  });
  it("accepts a complete engineering fixture and rejects incomplete publication", () => {
    expect(exerciseSchema.safeParse(fixture).success).toBe(true);
    expect(validateExercises([fixture], "2026-10-04")).toEqual([]);
    expect(
      exerciseSchema.safeParse({
        ...exerciseIdentities[0],
        contentStatus: "published",
      }).success,
    ).toBe(false);
  });
  it("rejects duplicate IDs/slugs, unknown references, source gaps and self links", () => {
    expect(validateExercises([fixture, fixture]).join()).toContain(
      "duplicate ID",
    );
    const invalid = {
      ...fixture,
      movementPatternIds: ["pattern_missing"],
      equipmentIds: ["equipment_missing"],
      muscleRoles: [
        {
          muscleId: "muscle_missing",
          role: "primary" as const,
          sourceIds: ["missing"],
        },
      ],
      relationships: { regressionIds: [fixture.id, "exercise_missing"] },
    };
    const errors = validateExercises([invalid]).join();
    for (const text of [
      "unknown movement",
      "unknown equipment",
      "unknown muscle",
      "unresolved source",
      "invalid relationship",
    ])
      expect(errors).toContain(text);
    expect(exerciseSchema.safeParse(invalid).success).toBe(false);
    expect(
      exerciseSchema.safeParse({
        ...fixture,
        muscleRoles: [...fixture.muscleRoles!, ...fixture.muscleRoles!],
      }).success,
    ).toBe(false);
  });
  it("rejects invalid/unsourced ranges and unreviewed media metadata", () => {
    expect(rangeSchema.safeParse({ min: 8, max: 2 }).success).toBe(false);
    expect(rangeSchema.safeParse({ min: -1, max: 2 }).success).toBe(false);
    expect(
      exerciseSchema.safeParse({
        ...fixture,
        programmingGuidance: [
          {
            context: "strength",
            guidanceStatus: "general-range",
            repRange: { min: 1, max: 5 },
            sourceIds: [],
          },
        ],
      }).success,
    ).toBe(false);
    expect(
      exerciseMediaSchema.safeParse({ ...fixture.media![0], reviewedAt: null })
        .success,
    ).toBe(false);
    expect(
      validateExercises([
        {
          ...fixture,
          review: { ...fixture.review, nextReviewDue: "2025-01-01" },
        },
      ]).join(),
    ).toContain("overdue");
  });
  it("derives muscle and relationship indexes", () => {
    const index = buildExerciseIndexes([fixture]);
    expect(index.muscle.get("muscle_pectoralis_major")?.has(fixture.id)).toBe(
      true,
    );
    expect(index.bySlug.get(fixture.slug)).toBe(fixture);
    expect(index.aliases.get("fixture alias")?.has(fixture.id)).toBe(true);
  });
});
describe("exercise queries and media", () => {
  const other = {
    ...fixture,
    id: "exercise_other",
    slug: "other",
    displayName: "Other fixture",
    equipmentIds: ["equipment_dumbbell"],
    movementPatternIds: ["pattern_vertical_push"],
  };
  const records = [fixture, other];
  it("searches aliases, muscles and equipment", () => {
    for (const q of ["fixture alias", "pectoralis", "bodyweight"])
      expect(
        searchExercises(parseExerciseQuery({ q }), records).some(
          (item) => item.id === fixture.id,
        ),
      ).toBe(true);
  });
  it("uses OR within groups, AND across groups and round-trips URL values", () => {
    const query = parseExerciseQuery({
      equipment: "equipment_bodyweight,equipment_dumbbell",
      movement: "pattern_horizontal_push",
    });
    expect(searchExercises(query, records)).toEqual([fixture]);
    expect(parseExerciseQuery(exerciseQuerySearch(query))).toEqual(query);
    expect(
      parseExerciseQuery({ equipment: "fake", video: "wrong", sort: "fake" })
        .equipment,
    ).toEqual([]);
  });
  it("sorts exact names ahead of partial matches and handles 500 fixture records", () => {
    const many = Array.from({ length: 500 }, (_, index) => ({
      ...fixture,
      id: `exercise_fixture_${index}`,
      slug: `fixture-${index}`,
      displayName: index === 499 ? "Fixture" : `Fixture item ${index}`,
    }));
    const start = performance.now();
    const results = searchExercises(parseExerciseQuery({ q: "Fixture" }), many);
    expect(results[0]?.id).toBe("exercise_fixture_499");
    expect(results).toHaveLength(500);
    expect(performance.now() - start).toBeLessThan(1000);
  });
  it("allows only reviewed provider embeds with no autoplay and captions", () => {
    const media = fixture.media![0]!;
    const url = new URL(reviewedEmbedUrl(media)!);
    expect(url.hostname).toBe("www.youtube-nocookie.com");
    expect(url.searchParams.get("autoplay")).toBe("0");
    expect(url.searchParams.get("cc_load_policy")).toBe("1");
    expect(
      reviewedEmbedUrl({ ...media, reviewStatus: "unavailable" }),
    ).toBeUndefined();
    expect(
      reviewedEmbedUrl({
        ...media,
        url: "https://youtube.com.evil.example/watch?v=M7lc1UVf-VE",
      }),
    ).toBeUndefined();
  });
});
