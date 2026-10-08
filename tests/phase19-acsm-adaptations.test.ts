import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  scienceRecords,
  scienceIdentities,
  validateScience,
} from "../src/features/workout-science/repository";
import snapshot from "../src/content/provenance/acsm-adaptations-snapshot.json";
import sources from "../src/content/provenance/acsm-adaptations-sources.json";
import originalResearch from "../src/content/provenance/training-research-definitions.json";

it("publishes endurance with explicit population, uncertain variable comparisons and no individual numeric prescription", () => {
  expect(scienceIdentities).toHaveLength(98);
  expect(validateScience(scienceRecords)).toEqual([]);
  const record = scienceRecords.find(
    (r) => r.id === "science_muscular_endurance_adaptation",
  )!;
  expect(record.contentStatus).toBe("published");
  expect(record.claims).toHaveLength(2);
  expect(record.claims![0]!.direction).toBe("benefit");
  expect(record.claims![1]!.claimText).toContain("insufficient data");
  expect(record.claims![1]!.direction).not.toBe("no-consistent-difference");
  expect(record.limitations!.join(" ")).toContain(
    "do not establish equivalence",
  );
  expect(record.practicalGuidance!.every((g) => g.numericValue === null)).toBe(
    true,
  );
  expect(
    record.claims!.every((c) => c.population.join(",") === "healthy-adults"),
  ).toBe(true);
  expect(record.review?.notes).toContain("no independent human");
  const originalPower = originalResearch.find(
    (r) => r.id === "science_power_adaptation",
  )!;
  expect(scienceRecords.find((r) => r.id === originalPower.id)).toEqual(
    originalPower,
  );
});
it("retains exact source transcription pins, source date and named full-text extraction sections", () => {
  for (const [name, digest] of [
    ["definitions", snapshot.definitionSha256],
    ["sources", snapshot.sourcesSha256],
    ["observations", snapshot.observationsSha256],
  ] as const)
    expect(
      createHash("sha256")
        .update(
          readFileSync(`src/content/provenance/acsm-adaptations-${name}.json`),
        )
        .digest("hex"),
    ).toBe(digest);
  expect(sources[0]!.sourceDate).toBe("2026-03-05");
  expect(sources[0]!.sourceVersion).toContain("10.1249/MSS.0000000000003897");
  expect(sources[0]!.rightsReference).toContain("CC BY-NC-ND 4.0");
  expect(snapshot.inspectedSections.join(" ")).toContain("Muscular Endurance");
  expect(snapshot.sourceXmlSha256).toBe(
    "0f92699661a50164bbd97e7db21587f920da3055914327436b0947081ed2c082",
  );
});
