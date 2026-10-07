import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import snapshot from "../src/content/provenance/nia-calf-snapshot.json";
import { exerciseRecords } from "../src/features/exercises/repository";
import { muscleRecords } from "../src/features/muscles/repository";

it("keeps the source one-leg progression separate from the two-leg set prescription", () => {
  const record = exerciseRecords.find((row) => row.id === snapshot.exerciseId)!;
  const guidance = record.programmingGuidance![0]!;
  expect(guidance.setRange).toBeNull();
  expect(guidance.restSeconds).toBeNull();
  expect(guidance.repRange).toEqual({ min: 10, max: 15 });
  expect(guidance.qualifier).toContain(
    "two-leg two-set prescription is not transferred",
  );
  expect(record.equipmentIds).toContain("equipment_sturdy_chair");
  expect(record.summary).toContain("older-adult");
  for (const role of record.muscleRoles!) {
    expect(role.role).toBe("context-dependent");
    expect(
      muscleRecords.find((row) => row.id === role.muscleId)?.contentStatus,
    ).toBe("published");
  }
  const media = record.media!.find((row) => row.id === snapshot.mediaId)!;
  const svg = readFileSync(`public${media.url}`);
  expect(createHash("sha256").update(svg).digest("hex")).toBe(
    snapshot.mediaSha256,
  );
  expect(svg.toString()).not.toMatch(/<script|<image|href=/);
});
