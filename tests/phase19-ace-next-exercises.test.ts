import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import definitions from "../src/content/provenance/ace-next-exercise-definitions.json";
import sources from "../src/content/provenance/ace-next-exercise-sources.json";
import snapshot from "../src/content/provenance/ace-next-exercise-snapshot.json";
import {
  exerciseRecords,
  exerciseIdentities,
  validateExercises,
} from "../src/features/exercises/repository";
import { exerciseSchema } from "../src/features/exercises/schema";
const additions = exerciseSchema.array().parse(definitions);
it("pins the inspected technique definitions, references and original media", () => {
  for (const [name, digest] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ])
    expect(
      createHash("sha256")
        .update(
          readFileSync(`src/content/provenance/ace-next-exercise-${name}.json`),
        )
        .digest("hex"),
    ).toBe(digest);
  expect(additions.map((r) => r.id)).toEqual(snapshot.recordIds);
  expect(validateExercises(exerciseRecords)).toEqual([]);
  for (const record of additions) {
    expect(exerciseRecords.find((r) => r.id === record.id)).toEqual(record);
    expect(record.slug).toBe(
      exerciseIdentities.find((r) => r.id === record.id)?.slug,
    );
    expect(record.review?.techniqueReviewedAt).toBe(
      snapshot.extractedAt.slice(0, 10),
    );
    expect(
      record.sources?.some((r) =>
        sources.some((s) => s.id === r.id && s.url === r.url),
      ),
    ).toBe(true);
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
it("keeps technique education separate from numerical prescriptions and unknown breathing timing", () => {
  for (const r of additions) {
    for (const g of r.programmingGuidance ?? []) {
      expect(g.setRange).toBeNull();
      expect(g.repRange).toBeNull();
      expect(g.restSeconds).toBeNull();
      expect(g.guidanceStatus).toBe("insufficient-evidence");
    }
    expect(r.review?.contentReviewer).toContain("no human review");
  }
  expect(
    additions.find((r) => r.id === "exercise_dumbbell_bench_press")?.technique
      ?.breathing,
  ).toBe("Inhale down; exhale up.");
  for (const id of [
    "exercise_forward_lunge",
    "exercise_dumbbell_romanian_deadlift",
  ])
    expect(additions.find((r) => r.id === id)?.technique?.breathing).toBeNull();
  expect(
    additions.find((r) => r.id === "exercise_dumbbell_romanian_deadlift")
      ?.difficulty,
  ).toBe("advanced");
  expect(
    additions
      .find((r) => r.id === "exercise_forward_lunge")
      ?.safety?.prerequisites?.join(" "),
  ).toContain("single-leg stand");
});
