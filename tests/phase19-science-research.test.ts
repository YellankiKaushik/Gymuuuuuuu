import { expect, it } from "vitest";
import {
  getScienceBySlug,
  validateScience,
} from "../src/features/workout-science/repository";
import sources from "../src/content/provenance/verified-sources.json";
it("keeps the matched-volume condition and abstract appraisal limit for split comparisons", () => {
  const split = getScienceBySlug("training-split")!;
  expect(split.claims![0]!.claimText).toContain("volume was matched");
  expect(split.claims![0]!.direction).toBe("no-consistent-difference");
  expect(split.limitations!.join()).toContain("published abstract");
  expect(split.sources![0]!.pmid).toBe("38595233");
  expect(split.practicalGuidance![0]!.numericValue).toBeNull();
  expect(split.review!.subjectReviewerRole).toContain("no independent");
});
it("does not turn heterogeneous rest comparisons into personal dosing or a guaranteed winner", () => {
  const rest = getScienceBySlug("rest-intervals")!;
  expect(rest.claims![0]!.confidence).toBe("limited");
  expect(rest.claims![0]!.claimText).toContain("substantial overlap");
  expect(rest.claims![0]!.population).toEqual(["healthy-adults"]);
  expect(rest.practicalGuidance![0]!.numericValue).toBeNull();
  expect(rest.sources![0]!.pmid).toBe("39205815");
  expect(rest.limitations!.join()).toContain("five to ten weeks");
  expect(validateScience([rest])).toEqual([]);
  for (const source of rest.sources!)
    expect(sources.find((s) => s.id === source.id)?.url).toBe(source.url);
  const damaged = structuredClone(rest);
  damaged.claims![0]!.sourceIds = ["source_unknown"];
  expect(validateScience([damaged]).join()).toMatch(/source/i);
});
