import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import definitions from "../src/content/provenance/ace-four-exercise-definitions.json";
import sources from "../src/content/provenance/ace-four-exercise-sources.json";
import snapshot from "../src/content/provenance/ace-four-exercise-snapshot.json";
import reviews from "../src/content/provenance/publications.json";
import {
  exerciseRecords,
  exerciseIdentities,
  validateExercises,
} from "../src/features/exercises/repository";
import { exerciseSchema } from "../src/features/exercises/schema";
const records = exerciseSchema.array().parse(definitions);

test("new techniques retain exact source pins, stable identities and original media attribution", () => {
  expect(records).toHaveLength(4);
  for (const [name, digest] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ]) {
    const bytes = readFileSync(
      `src/content/provenance/ace-four-exercise-${name}.json`,
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
    ).toEqual(["original_ace_four_diagrams_v1"]);
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

test("anatomical inference, distinct bridge variants and absent numeric programming remain explicit", () => {
  for (const record of records) {
    for (const role of record.muscleRoles ?? []) {
      expect(role.role).toBe("context-dependent");
      expect(role.qualifier).toContain("Anatomy-based");
      expect(role.sourceIds).toHaveLength(2);
    }
    for (const row of record.programmingGuidance ?? []) {
      expect(row.setRange).toBeNull();
      expect(row.repRange).toBeNull();
      expect(row.durationSeconds).toBeUndefined();
      expect(row.restSeconds).toBeNull();
    }
  }
  expect(
    records.find((r) => r.id === "exercise_bird_dog")?.technique?.breathing,
  ).toBeNull();
  const single = records.find(
    (r) => r.id === "exercise_single_leg_glute_bridge",
  )!;
  expect(single.technique?.setup?.join(" ")).toContain("Hold behind one thigh");
  expect(single.relationships).toEqual({
    variationIds: ["exercise_glute_bridge"],
  });
  expect(single.review?.notes).toContain("not the straight-leg progression");
  const pulldown = records.find((r) => r.id === "exercise_lat_pulldown")!;
  expect(pulldown.equipmentIds).toContain("equipment_machine_selectorized");
  expect(pulldown.technique?.setup?.join(" ")).toContain(
    "no more than 30 degrees",
  );
});
