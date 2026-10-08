import { expect, it } from "vitest";
import { scienceRecords } from "../src/features/workout-science/repository";
import index from "../src/content/workout-science/index.json";
import { projectScienceIndex } from "../src/features/workout-science/index-schema";
import { scienceIndexes } from "../src/features/workout-science/public-repository";
import {
  searchScience,
  parseScienceQuery,
} from "../src/features/workout-science/query";
it("projects every published science identity and preserves filters, comparisons and source-specific confidence", () => {
  expect(index).toEqual(
    scienceRecords
      .filter((r) => ["published", "deprecated"].includes(r.contentStatus))
      .map(projectScienceIndex),
  );
  expect(scienceIndexes.published).toHaveLength(32);
  expect(scienceIndexes.bySlug.has("training-volume")).toBe(true);
  expect(scienceIndexes.bySlug.has("single-progression")).toBe(false);
  const results = searchScience(
    parseScienceQuery({
      category: "training-variables",
      confidence: "limited",
    }),
  );
  expect(results.map((r) => r.id)).toEqual([
    "science_training_volume",
    "science_volume_load",
    "science_load_relative_intensity",
    "science_repetitions_rep_ranges",
    "science_training_frequency",
    "science_rest_intervals",
    "science_range_of_motion",
    "science_tempo_repetition_duration",
    "science_exercise_order",
  ]);
  expect(
    scienceIndexes.bySlug.get("training-split")!.limitations!.join(),
  ).toContain("matched volume");
  expect(
    scienceIndexes.bySlug
      .get("training-split")!
      .decisionFramework!.cannotTellYou.join(),
  ).toContain("expected gains");
});
