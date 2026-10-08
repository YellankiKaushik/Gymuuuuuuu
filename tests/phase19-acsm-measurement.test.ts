import { expect, test } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import definitions from "../src/content/provenance/acsm-measurement-definitions.json";
import observations from "../src/content/provenance/acsm-measurement-observations.json";
import snapshot from "../src/content/provenance/acsm-measurement-snapshot.json";
import sources from "../src/content/provenance/acsm-measurement-sources.json";
import {
  scienceRecords,
  scienceIdentities,
} from "../src/features/workout-science/repository";

test("progression and measurement records retain exact primary-source observations and stable identities", () => {
  expect(definitions).toHaveLength(8);
  for (const [name, pin] of [
    ["definitions", snapshot.definitionSha256],
    ["observations", snapshot.observationsSha256],
    ["sources", snapshot.sourcesSha256],
  ] as const)
    expect(
      createHash("sha256")
        .update(
          readFileSync(`src/content/provenance/acsm-measurement-${name}.json`),
        )
        .digest("hex"),
    ).toBe(pin);
  expect(sources[0]!.sourceDate).toBe("2026-03-05");
  expect(snapshot.sourceXmlSha256).toBe(
    "0f92699661a50164bbd97e7db21587f920da3055914327436b0947081ed2c082",
  );
  for (const record of definitions) {
    expect(scienceRecords.find((row) => row.id === record.id)).toEqual(record);
    expect(scienceIdentities.find((row) => row.id === record.id)?.slug).toBe(
      record.slug,
    );
    for (const claim of record.claims)
      expect(
        observations.find((row) => row.sourceId === claim.sourceIds[0])
          ?.observations,
      ).toContain(claim.claimText);
  }
});
test("keeps measured strength, qualitative progression and unpooled tonnage distinct from personal algorithms", () => {
  for (const record of definitions) {
    expect(
      record.practicalGuidance.every((row) => row.numericValue === null),
    ).toBe(true);
    expect(
      record.claims.every(
        (row) =>
          row.confidence === "limited" &&
          row.population.join(",") === "healthy-adults",
      ),
    ).toBe(true);
    expect(record.limitations.join(" ")).toContain("not a new formal GRADE");
  }
  expect(
    definitions.find((row) => row.id === "science_one_repetition_maximum")!
      .summary,
  ).toContain("same mode as the training");
  expect(
    definitions.find((row) => row.id === "science_tonnage_limitations")!
      .summary,
  ).toContain("rarely considered");
  expect(
    definitions
      .find((row) => row.id === "science_load_progression")!
      .keyTakeaways.join(" "),
  ).toContain("not required for every beneficial outcome");
  expect(
    definitions.find((row) => row.id === "science_set_progression")!.summary,
  ).toContain("could not be determined");
});
