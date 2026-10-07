import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import snapshot from "../src/content/provenance/gray-1918-lower-limb-snapshot.json";
import {
  anatomyTaxonomy,
  getPublishedMuscles,
  validateAnatomy,
} from "../src/features/muscles/repository";
import reviews from "../src/content/provenance/publications.json";

it("retains the lower-limb source and stable identities with limited machine-only publication", () => {
  expect(
    createHash("sha256")
      .update(readFileSync(snapshot.extractPath))
      .digest("hex"),
  ).toBe(snapshot.sha256);
  expect(snapshot.recordIds).toHaveLength(17);
  const records = getPublishedMuscles();
  expect(records).toHaveLength(70);
  expect(validateAnatomy(records)).toEqual([]);
  for (const id of snapshot.recordIds) {
    const record = records.find((r) => r.id === id)!;
    const identity = anatomyTaxonomy.records.find((r) => r.id === id)!;
    expect([record.slug, record.displayName, record.entityType]).toEqual([
      identity.slug,
      identity.displayName,
      identity.entityType,
    ]);
    expect(record.visibility.length).toBeGreaterThan(0);
    expect(record.structure?.proximalAttachmentSummary).toBeTruthy();
    expect(record.structure?.distalAttachmentSummary).toBeTruthy();
    expect(record.confidence).toBe("limited");
    expect(record.reviewedAt).toBe("2026-10-07");
    expect(record.reviewedBy).toContain("no human review");
    expect(
      record.jointActions.every((a) => a.sourceIds.includes(snapshot.sourceId)),
    ).toBe(true);
    const review = reviews.find((r) => r.module === "muscles" && r.id === id)!;
    expect(review.state).toBe("published_personal_use");
    expect(review.reviewer.kind).toBe("machine");
  }
});

it("preserves head relationships without transferring whole-muscle actions or inventing isolation", () => {
  const records = getPublishedMuscles();
  const short = records.find(
    (r) => r.id === "muscle_biceps_femoris_short_head",
  )!;
  expect(short.parentIds).toEqual(["muscle_biceps_femoris"]);
  expect(short.jointActions.map((a) => a.joint)).toEqual(["knee"]);
  const parent = records.find((r) => r.id === "muscle_biceps_femoris")!;
  expect(parent.childIds).toContain(short.id);
  const soleus = records.find((r) => r.id === "muscle_soleus")!;
  expect(soleus.jointActions.map((a) => a.joint)).toEqual(["ankle"]);
  const rectus = records.find((r) => r.id === "muscle_rectus_femoris")!;
  expect(rectus.jointActions.map((a) => a.joint)).toEqual(["knee", "hip"]);
  for (const id of [
    "muscle_gastrocnemius_medial_head",
    "muscle_gastrocnemius_lateral_head",
  ]) {
    const head = records.find((r) => r.id === id)!;
    expect(head.parentIds).toEqual(["muscle_gastrocnemius"]);
    expect(head.jointActions[0]!.qualifier).toContain(
      "no unique head-specific activation",
    );
  }
});

it("keeps the additional medial thigh and ankle actions tied to the retained historical extract", () => {
  const records = getPublishedMuscles();
  for (const name of [
    "adductor_magnus",
    "adductor_longus",
    "adductor_brevis",
    "gracilis",
    "pectineus",
    "tibialis_anterior",
    "deep_hip_rotator_group",
  ]) {
    const record = records.find((r) => r.id === `muscle_${name}`)!;
    expect(record.sources).toEqual([snapshot.sourceId]);
    expect(
      record.jointActions.every((r) => r.sourceIds[0] === snapshot.sourceId),
    ).toBe(true);
    expect(record.confidence).toBe("limited");
  }
  const magnus = records.find((r) => r.id === "muscle_adductor_magnus")!;
  expect(magnus.jointActions.map((r) => r.motion)).toEqual(["adduction"]);
  const tibialis = records.find((r) => r.id === "muscle_tibialis_anterior")!;
  expect(tibialis.jointActions.map((r) => r.motion)).toEqual([
    "dorsiflexion",
    "inversion",
  ]);
  const group = records.find((r) => r.id === "muscle_deep_hip_rotator_group")!;
  expect(group.entityType).toBe("anatomical-group");
  expect(
    group.jointActions.find((r) => r.motion === "abduction")!.qualifier,
  ).toContain("except obturator externus");
});
