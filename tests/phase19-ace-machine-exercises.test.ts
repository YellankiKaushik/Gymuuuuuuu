import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import definitions from "../src/content/provenance/ace-machine-exercise-definitions.json";
import sources from "../src/content/provenance/ace-machine-exercise-sources.json";
import snapshot from "../src/content/provenance/ace-machine-exercise-snapshot.json";
import reviews from "../src/content/provenance/publications.json";
import {
  exerciseRecords,
  exerciseIdentities,
  validateExercises,
} from "../src/features/exercises/repository";
import { exerciseSchema } from "../src/features/exercises/schema";
const records = exerciseSchema.array().parse(definitions);
test("machine and curl techniques retain source pins, identities and independent original attribution", () => {
  expect(records).toHaveLength(5);
  for (const [name, digest] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ] as const)
    expect(
      createHash("sha256")
        .update(
          readFileSync(
            `src/content/provenance/ace-machine-exercise-${name}.json`,
          ),
        )
        .digest("hex"),
    ).toBe(digest);
  expect(records.map((r) => r.id)).toEqual(snapshot.recordIds);
  expect(validateExercises(exerciseRecords)).toEqual([]);
  for (const record of records) {
    expect(exerciseRecords.find((r) => r.id === record.id)).toEqual(record);
    const seed = exerciseIdentities.find((r) => r.id === record.id)!;
    expect([record.slug, record.displayName, record.equipmentIds]).toEqual([
      seed.slug,
      seed.displayName,
      seed.equipmentIds,
    ]);
    expect(
      reviews
        .find((r) => r.id === record.id)
        ?.fields.find((f) => f.path === "media")?.sourceIds,
    ).toEqual(["original_ace_machine_diagrams_v1"]);
    expect(record.review?.contentReviewer).toContain("no human review");
    for (const media of record.media ?? [])
      expect(
        createHash("sha256")
          .update(readFileSync(`public${media.url}`))
          .digest("hex"),
      ).toBe(
        snapshot.mediaHashes[media.url as keyof typeof snapshot.mediaHashes],
      );
  }
});
test("separates source-specific techniques from unmeasured activation, unsupplied breathing and personal programming", () => {
  for (const record of records) {
    for (const row of record.programmingGuidance ?? []) {
      expect(row.setRange).toBeNull();
      expect(row.repRange).toBeNull();
      expect(row.restSeconds).toBeNull();
    }
    expect(
      record.muscleRoles?.every(
        (r) =>
          r.role === "context-dependent" &&
          r.qualifier?.includes("not measured"),
      ),
    ).toBe(true);
  }
  const studyRecords = records.filter((r) =>
    r.sources?.some((s) => s.id === "ace_hamstrings_2018_techniques"),
  );
  expect(studyRecords).toHaveLength(2);
  for (const record of studyRecords) {
    expect(record.technique?.breathing).toBeNull();
    expect(record.programmingGuidance?.[0]?.qualifier).toContain(
      "16 resistance-experienced adults aged 20-25",
    );
    expect(record.programmingGuidance?.[0]?.qualifier).toContain(
      "no EMG winner",
    );
  }
  expect(
    records.find((r) => r.id === "exercise_seated_cable_row")?.technique
      ?.breathing,
  ).toBeNull();
  expect(
    records.find((r) => r.id === "exercise_lying_leg_curl")?.technique
      ?.breathing,
  ).toContain("Exhale");
  expect(
    records.find((r) => r.id === "exercise_machine_chest_press")?.technique
      ?.breathing,
  ).toContain("Exhale");
  expect(sources.every((s) => s.extractedAt === snapshot.extractedAt)).toBe(
    true,
  );
  expect(
    sources.find((s) => s.id === "ace_hamstrings_2018_techniques")?.sourceDate,
  ).toBeNull();
});
