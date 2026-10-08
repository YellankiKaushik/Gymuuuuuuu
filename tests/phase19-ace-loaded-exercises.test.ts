import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import definitions from "../src/content/provenance/ace-loaded-exercise-definitions.json";
import sources from "../src/content/provenance/ace-loaded-exercise-sources.json";
import snapshot from "../src/content/provenance/ace-loaded-exercise-snapshot.json";
import reviews from "../src/content/provenance/publications.json";
import {
  exerciseRecords,
  exerciseIdentities,
  validateExercises,
} from "../src/features/exercises/repository";
import { exerciseSchema } from "../src/features/exercises/schema";
const records = exerciseSchema.array().parse(definitions);

test("new techniques retain exact source pins, stable identities and original media attribution", () => {
  expect(records).toHaveLength(3);
  for (const [name, digest] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ]) {
    const bytes = readFileSync(
      `src/content/provenance/ace-loaded-exercise-${name}.json`,
    );
    expect(bytes.toString()).not.toContain("\r");
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(digest);
  }
  expect(records.map((r) => r.id)).toEqual(snapshot.recordIds);
  expect(validateExercises(exerciseRecords)).toEqual([]);
  for (const record of records) {
    expect(exerciseRecords.find((r) => r.id === record.id)).toEqual(record);
    const seed = exerciseIdentities.find((r) => r.id === record.id)!;
    expect([record.slug, record.displayName]).toEqual([
      seed.slug,
      seed.displayName,
    ]);
    expect(
      record.sources?.some((r) =>
        sources.some((s) => s.id === r.id && s.url === r.url),
      ),
    ).toBe(true);
    expect(record.review?.contentReviewer).toContain("no human review");
    expect(
      reviews
        .find((r) => r.id === record.id)
        ?.fields.find((f) => f.path === "media")?.sourceIds,
    ).toEqual(["original_ace_loaded_diagrams_v1"]);
    for (const media of record.media ?? []) {
      const bytes = readFileSync(`public${media.url}`);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        snapshot.mediaHashes[media.url as keyof typeof snapshot.mediaHashes],
      );
      expect(bytes.toString()).not.toMatch(
        /<script|<image|(?:href|src)=["']https?:\/\//,
      );
    }
  }
});

test("loaded techniques disclose source-specific depth and grip without invented programming", () => {
  for (const record of records) {
    expect(record.technique?.breathing).toBeNull();
    for (const row of record.programmingGuidance ?? []) {
      expect(row.setRange).toBeNull();
      expect(row.repRange).toBeNull();
      expect(row.restSeconds).toBeNull();
      expect(row.qualifier).toContain("not universal requirements");
    }
    expect(
      record.muscleRoles?.every((role) => role.role === "context-dependent"),
    ).toBe(true);
  }
  const deadlift = records.find(
    (r) => r.id === "exercise_conventional_deadlift",
  )!;
  expect(deadlift.technique?.setup?.join(" ")).toContain(
    "guide's over-under grip",
  );
  const goblet = records.find((r) => r.id === "exercise_goblet_squat")!;
  expect(goblet.equipmentIds).toEqual(["equipment_dumbbell"]);
  expect(goblet.technique?.setup?.join(" ")).toMatch(/vertical/);
});
