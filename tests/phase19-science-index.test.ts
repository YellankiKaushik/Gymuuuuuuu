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
  expect(scienceIndexes.published).toHaveLength(5);
  expect(scienceIndexes.bySlug.has("training-volume")).toBe(false);
  const results = searchScience(
    parseScienceQuery({
      category: "training-variables",
      confidence: "limited",
    }),
  );
  expect(results.map((r) => r.id)).toEqual(["science_rest_intervals"]);
  expect(
    scienceIndexes.bySlug.get("training-split")!.limitations!.join(),
  ).toContain("matched volume");
  expect(
    scienceIndexes.bySlug
      .get("training-split")!
      .decisionFramework!.cannotTellYou.join(),
  ).toContain("expected gains");
});
