import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import snapshot from "../src/content/provenance/gray-1918-remaining-snapshot.json";
import {
  anatomyTaxonomy,
  getPublishedMuscles,
  getMuscleBySlug,
  validateAnatomy,
} from "../src/features/muscles/repository";

it("covers all stable anatomy identities while retaining source locators and honest review", () => {
  expect(
    createHash("sha256")
      .update(readFileSync(snapshot.extractPath))
      .digest("hex"),
  ).toBe(snapshot.sha256);
  const records = getPublishedMuscles();
  expect(records).toHaveLength(70);
  expect(new Set(records.map((row) => row.id))).toEqual(
    new Set(anatomyTaxonomy.records.map((row) => row.id)),
  );
  expect(validateAnatomy(records)).toEqual([]);
  for (const id of snapshot.recordIds) {
    const row = records.find((record) => record.id === id)!;
    expect(row.reviewedBy).toContain("no human review");
    expect(row.sources).toEqual([snapshot.sourceId]);
    expect(
      snapshot.recordLocators[id as keyof typeof snapshot.recordLocators]
        .length,
    ).toBeGreaterThan(0);
    expect(row.cautions.join(" ")).toContain("historical anatomy from 1918");
  }
});

it("does not infer head-specific actions from whole-muscle descriptions", () => {
  for (const slug of [
    "biceps-brachii-long-head",
    "biceps-brachii-short-head",
    "pectoralis-major-clavicular-portion",
    "pectoralis-major-sternocostal-portion",
    "middle-deltoid",
    "triceps-brachii-lateral-head",
    "triceps-brachii-medial-head",
  ]) {
    const row = getMuscleBySlug(slug)!;
    expect(row).toBeDefined();
    expect(row.entityType).toBe("subdivision");
    expect(row.parentIds).toHaveLength(1);
    expect(row.jointActions).toEqual([]);
    expect(row.cautions.join(" ")).toContain("head-specific");
  }
});

it("keeps historical gaps and group/action context visible", () => {
  expect(
    getMuscleBySlug("external-oblique")?.structure?.proximalAttachmentSummary,
  ).toContain("unavailable");
  const group = getMuscleBySlug("fibularis-muscles")!;
  expect(
    group.jointActions.find((action) => action.joint === "ankle")?.qualifier,
  ).toContain("tertius");
  expect(
    getMuscleBySlug("sartorius")?.jointActions.find(
      (action) => action.motion === "internal rotation",
    )?.qualifier,
  ).toContain("bent knee");
});
