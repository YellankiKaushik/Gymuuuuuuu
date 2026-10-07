import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import snapshot from "../src/content/provenance/ace-pushup-snapshot.json";
import definitions from "../src/content/provenance/ace-pushup-definitions.json";
import {
  exerciseRecords,
  validateExercises,
} from "../src/features/exercises/repository";
import { exerciseSchema } from "../src/features/exercises/schema";
const additions = exerciseSchema.array().parse(definitions);
it("preserves the source-specific full and knee-supported progression examples without swapping doses", () => {
  for (const [name, digest] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ])
    expect(
      createHash("sha256")
        .update(readFileSync(`src/content/provenance/ace-pushup-${name}.json`))
        .digest("hex"),
    ).toBe(digest);
  expect(validateExercises(exerciseRecords)).toEqual([]);
  for (const record of additions) {
    expect(exerciseRecords.find((r) => r.id === record.id)).toEqual(record);
    const g = record.programmingGuidance![0]!;
    expect(g.context).toBe("skill-learning");
    expect(g.guidanceStatus).toBe("context-dependent");
    expect(g.setRange).toEqual({ min: 2, max: 2 });
    expect(g.restSeconds).toEqual({ min: 60, max: 60 });
    expect(g.sourceIds).toEqual(["ace_pushup_progression_2019"]);
    expect(g.repRange).toEqual(
      record.id === "exercise_knee_push_up"
        ? { min: 6, max: 8 }
        : { min: 5, max: 6 },
    );
    expect(g.qualifier).toContain("not a universally validated schedule");
    expect(record.technique?.breathing).toBeNull();
  }
});
it("resolves both progression directions and attributes only original SVG cues", () => {
  const full = additions.find((r) => r.id === "exercise_push_up")!,
    knee = additions.find((r) => r.id === "exercise_knee_push_up")!;
  expect(full.relationships?.regressionIds).toEqual([knee.id]);
  expect(knee.relationships?.progressionIds).toEqual([full.id]);
  for (const r of additions)
    for (const media of r.media ?? []) {
      const bytes = readFileSync(`public${media.url}`);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        snapshot.mediaHashes[media.url as keyof typeof snapshot.mediaHashes],
      );
      expect(bytes.toString()).not.toMatch(
        /<script|<image|(?:href|src)=["']https?:\/\//,
      );
      expect(media.whySelected).toContain("no independent human review");
    }
});
