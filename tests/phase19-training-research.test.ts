import { expect, test } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import definitions from "../src/content/provenance/training-research-definitions.json";
import snapshot from "../src/content/provenance/training-research-snapshot.json";
import sources from "../src/content/provenance/training-research-sources.json";
import { scienceSchema } from "../src/features/workout-science/schema";
import {
  scienceIdentities,
  scienceRecords,
  validateScience,
} from "../src/features/workout-science/repository";
import { verifiedSourceSchema } from "../src/features/content-review/schema";

test("training research is byte-pinned, identity-preserving and schema-valid", () => {
  for (const [name, expected] of [
    ["definitions", snapshot.definitionSha256],
    ["sources", snapshot.sourcesSha256],
    ["observations", snapshot.observationsSha256],
  ])
    expect(
      createHash("sha256")
        .update(
          readFileSync(`src/content/provenance/training-research-${name}.json`),
        )
        .digest("hex"),
    ).toBe(expected);
  const records = scienceSchema.array().parse(definitions);
  expect(records).toHaveLength(13);
  expect(records.map((row) => row.id)).toEqual(snapshot.identityIds);
  for (const row of records) {
    expect(scienceIdentities.find((seed) => seed.id === row.id)?.slug).toBe(
      row.slug,
    );
    expect(row.review?.subjectReviewerRole).toContain("no independent");
    expect(
      row.claims?.every(
        (claim) =>
          claim.confidence === "limited" && claim.limitations.length >= 3,
      ),
    ).toBe(true);
    expect(
      row.practicalGuidance?.every(
        (guidance) => guidance.numericValue === null,
      ),
    ).toBe(true);
  }
  expect(
    validateScience([
      ...scienceRecords.filter(
        (row) => !records.some((addition) => addition.id === row.id),
      ),
      ...records,
    ]),
  ).toEqual([]);
  expect(verifiedSourceSchema.array().parse(sources)).toHaveLength(9);
});

test("deload consensus stays distinct from the complete-cessation trial", () => {
  const deload = scienceSchema.parse(
    definitions.find((row) => row.id === "science_deload"),
  );
  expect(deload.claims).toHaveLength(2);
  expect(deload.claims?.[0]?.evidenceLevel).toBe("consensus-practice");
  expect(deload.claims?.[0]?.sourceIds).toEqual([
    "source_deload_consensus_2023",
  ]);
  expect(deload.claims?.[1]?.sourceIds).toEqual(["source_deload_trial_2024"]);
  expect(deload.claims?.[1]?.claimText).toContain(
    "complete one-week cessation",
  );
  expect(deload.claims?.[1]?.outcome).toBe("strength");
  expect(deload.limitations?.join(" ")).toContain("not all ways");
});

test("acute advanced-method demands never become superiority or personal recovery claims", () => {
  const drop = scienceSchema.parse(
    definitions.find((row) => row.id === "science_drop_set"),
  );
  const superset = scienceSchema.parse(
    definitions.find((row) => row.id === "science_superset"),
  );
  expect(drop.summary).toContain("acute perceived exertion");
  expect(drop.summary).toContain("without a clear chronic");
  expect(drop.limitations?.join(" ")).toContain("not a recommendation");
  expect(superset.limitations?.join(" ")).toContain("does not prove identical");
  expect(drop.claims?.every((claim) => claim.direction !== "benefit")).toBe(
    true,
  );
});

test("load, frequency, volume and RIR retain distinct definitions and source limits", () => {
  const byId = new Map(definitions.map((row) => [row.id, row]));
  expect(byId.get("science_load_relative_intensity")?.definition).toContain(
    "percentage of one-repetition maximum",
  );
  expect(byId.get("science_repetitions_in_reserve")?.definition).toContain(
    "estimate",
  );
  expect(byId.get("science_training_volume")?.definition).toContain("sets");
  expect(byId.get("science_training_frequency")?.definition).toContain(
    "sessions",
  );
  expect(
    sources.find((row) => row.id === "source_acsm_rt_2026")?.sourceDate,
  ).toBe("2026-03-05");
  expect(byId.get("science_training_volume")?.limitations.join(" ")).toContain(
    "October 2024",
  );
});
