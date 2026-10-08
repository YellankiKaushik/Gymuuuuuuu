import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import snapshot from "../src/content/provenance/cdc-heat-snapshot.json";
import sources from "../src/content/provenance/cdc-heat-sources.json";
import definitions from "../src/content/provenance/cdc-heat-definitions.json";
import {
  publicCardioEntities,
  publishedCardioSchema,
  validateCardioRelease,
} from "../src/features/cardio/publication";

it("retains the inspected CDC version and stable heat-safety identity without fabricated capture or review", () => {
  for (const [name, expected] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ])
    expect(
      createHash("sha256")
        .update(readFileSync(`src/content/provenance/cdc-heat-${name}.json`))
        .digest("hex"),
    ).toBe(expected);
  expect(sources[0]?.sourceDate).toBe("2024-06-25");
  expect(snapshot.sourceHtmlSha256).toBeNull();
  const record = publishedCardioSchema.parse(definitions[0]);
  expect(record.id).toBe("topic_heat_safety");
  expect(publicCardioEntities.find((entry) => entry.id === record.id)).toEqual(
    record,
  );
  expect(() => validateCardioRelease()).not.toThrow();
  expect(record.review.reviewer).toContain("no independent human review");
});

it("keeps stop signals distinct from training prescriptions, diagnosis and physiological scores", () => {
  const record = publishedCardioSchema.parse(definitions[0]);
  expect(record.stopRules.join(" ")).toContain("faint or weak");
  expect(record.stopRules.join(" ")).toContain("medical care immediately");
  expect(record.plan).toBeUndefined();
  expect(
    record.claims.every((claim) => claim.evidenceStrength === "not_graded"),
  ).toBe(true);
  expect(record.limitations.join(" ")).toContain("No individual water dose");
  expect(record.limitations.join(" ")).toContain(
    "does not interpret heart-rate or effort logs",
  );
  expect(record.claims.flatMap((claim) => claim.sourceIds)).toEqual([
    "cdc_heat_athletes_2024",
    "cdc_heat_athletes_2024",
  ]);
});
