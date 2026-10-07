import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import snapshot from "../src/content/provenance/acsm-principles-snapshot.json";
import definitions from "../src/content/provenance/acsm-principles-definitions.json";
import sources from "../src/content/provenance/acsm-principles-sources.json";
import {
  scienceRecords,
  validateScience,
} from "../src/features/workout-science/repository";
import { scienceSchema } from "../src/features/workout-science/schema";
const additions = scienceSchema.array().parse(definitions);
it("pins inspected discussion observations and preserves immutable earlier articles", () => {
  for (const [file, digest] of [
    ["definitions", snapshot.definitionSha256],
    ["sources", snapshot.sourcesSha256],
    ["observations", snapshot.observationsSha256],
  ])
    expect(
      createHash("sha256")
        .update(
          readFileSync(`src/content/provenance/acsm-principles-${file}.json`),
        )
        .digest("hex"),
    ).toBe(digest);
  expect(additions.map((r) => r.id)).toEqual(snapshot.identityIds);
  expect(validateScience(scienceRecords)).toEqual([]);
  for (const record of additions)
    expect(scienceRecords.find((r) => r.id === record.id)).toEqual(record);
  expect(sources[0]?.rightsReference).toContain("CC BY-NC-ND");
  expect(snapshot.inspectedSections.join(" ")).toContain("Discussion");
});
it("retains qualifications for overload, periodization and proposed proximity to failure", () => {
  const get = (id: string) => additions.find((r) => r.id === id)!;
  expect(get("science_progressive_overload").claims![0]?.claimText).toContain(
    "not a prerequisite for every initial benefit",
  );
  expect(get("science_periodization").claims![0]?.direction).toBe("mixed");
  expect(get("science_proximity_to_failure").claims![0]?.claimText).toContain(
    "authors propose",
  );
  for (const r of additions) {
    expect(r.practicalGuidance?.every((g) => g.numericValue === null)).toBe(
      true,
    );
    expect(r.claims?.every((c) => c.confidence === "limited")).toBe(true);
    expect(r.limitations?.join(" ")).toContain("not individual predictions");
  }
});
