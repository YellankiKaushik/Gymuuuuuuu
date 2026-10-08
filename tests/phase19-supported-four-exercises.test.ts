import { expect, test } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import definitions from "../src/content/provenance/supported-four-exercise-definitions.json";
import snapshot from "../src/content/provenance/supported-four-exercise-snapshot.json";
import sources from "../src/content/provenance/supported-four-exercise-sources.json";
import {
  exerciseRecords,
  exerciseIdentities,
} from "../src/features/exercises/repository";
import reviews from "../src/content/provenance/publications.json";
import {
  parseExerciseQuery,
  searchExercises,
} from "../src/features/exercises/query";
test("supports four stable exercise identities with exact source and original-media pins", () => {
  expect(definitions).toHaveLength(4);
  for (const [name, pin] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ] as const)
    expect(
      createHash("sha256")
        .update(
          readFileSync(
            `src/content/provenance/supported-four-exercise-${name}.json`,
          ),
        )
        .digest("hex"),
    ).toBe(pin);
  for (const record of definitions) {
    expect(exerciseRecords.find((row) => row.id === record.id)).toEqual(record);
    const seed = exerciseIdentities.find((row) => row.id === record.id)!;
    expect([record.slug, record.displayName, record.equipmentIds]).toEqual([
      seed.slug,
      seed.displayName,
      seed.equipmentIds,
    ]);
    expect(
      reviews
        .find((row) => row.id === record.id)
        ?.fields.find((row) => row.path === "media")?.sourceIds,
    ).toEqual(["original_supporting_exercise_diagrams_v1"]);
    for (const media of record.media)
      expect(
        createHash("sha256")
          .update(readFileSync("public" + media.url))
          .digest("hex"),
      ).toBe(
        snapshot.mediaHashes[media.url as keyof typeof snapshot.mediaHashes],
      );
  }
});
test("retains source-specific grip, unknown breathing, conservative programming and dated spotter context", () => {
  for (const record of definitions) {
    expect(
      record.programmingGuidance.every(
        (row) =>
          row.setRange === null &&
          row.repRange === null &&
          row.restSeconds === null,
      ),
    ).toBe(true);
    expect(
      record.muscleRoles.every((row) => row.role === "context-dependent"),
    ).toBe(true);
  }
  expect(
    definitions
      .find((row) => row.id === "exercise_close_grip_bench_press")!
      .technique.setup.join(" "),
  ).toContain("in line with the shoulders");
  expect(
    definitions
      .find((row) => row.id === "exercise_close_grip_bench_press")!
      .safety.prerequisites.join(" "),
  ).toContain("spotter");
  expect(
    definitions.find((row) => row.id === "exercise_leg_extension")!.technique
      .breathing,
  ).toBeNull();
  expect(
    definitions.find((row) => row.id === "exercise_leg_extension")!.difficulty,
  ).toBe("not-assessed");
  expect(
    definitions.find((row) => row.id === "exercise_dumbbell_shrug")!.technique
      .breathing,
  ).toContain("Exhale");
  expect(
    sources.find((row) => row.id === "ace_bench_spotter_context_2025")!
      .sourceDate,
  ).toBe("2025-02-14");
  expect(
    sources.find((row) => row.id === "hph_leg_extension_guide")!.sourceDate,
  ).toBeNull();
});
test("keeps an unassessed difficulty separate from beginner filtering and assessed sorting", () => {
  expect(
    searchExercises(parseExerciseQuery({ difficulty: "not-assessed" })).map(
      (row) => row.id,
    ),
  ).toEqual(["exercise_leg_extension"]);
  expect(
    searchExercises(parseExerciseQuery({ difficulty: "beginner" })).some(
      (row) => row.id === "exercise_leg_extension",
    ),
  ).toBe(false);
  expect(
    searchExercises(parseExerciseQuery({ sort: "difficulty" })).at(-1)?.id,
  ).toBe("exercise_leg_extension");
});
