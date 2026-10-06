import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import snapshot from "../src/content/provenance/nia-strength-snapshot.json";
import {
  exerciseRecords,
  exerciseIdentities,
  validateExercises,
} from "../src/features/exercises/repository";

it("retains NIA source instructions without converting unspecified rest into a numeric prescription", () => {
  expect(validateExercises(exerciseRecords)).toEqual([]);
  for (const original of snapshot.records) {
    const record = exerciseRecords.find(
      (row) => row.id === original.exerciseId,
    )!;
    expect(record.slug).toBe(
      exerciseIdentities.find((row) => row.id === original.exerciseId)?.slug,
    );
    const guidance = record.programmingGuidance![0]!;
    expect(guidance.setRange).toEqual({ min: 2, max: 2 });
    expect(guidance.repRange).toEqual({ min: 10, max: 15 });
    expect(guidance.restSeconds).toBeNull();
    expect(guidance.sourceIds).toContain(snapshot.sourceId);
    expect(record.summary).toContain("older-adult");
    expect(record.review?.contentReviewer).toContain("no human review");
    const media = record.media!.find((row) => row.id === original.mediaId)!;
    const artwork = readFileSync(`public${media.url}`, "utf8");
    expect(createHash("sha256").update(artwork).digest("hex")).toBe(
      original.mediaSha256,
    );
    expect(artwork).not.toMatch(
      /<script|<image|https?:\/\/[^\s"<>]+\.(?:png|jpg)/,
    );
    expect(media.license).toContain("Original project");
  }
});
