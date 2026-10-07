import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import snapshot from "../src/content/provenance/cardio-education-snapshot.json";
import definitions from "../src/content/provenance/cardio-education-definitions.json";
import {
  publishedCardioSchema,
  publicCardioEntities,
  validateCardioRelease,
} from "../src/features/cardio/publication";
const additions = publishedCardioSchema.array().parse(definitions);
it("pins source-scoped guidance and retains publisher dates without a fabricated raw HTML capture", () => {
  for (const [name, digest] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ])
    expect(
      createHash("sha256")
        .update(
          readFileSync(`src/content/provenance/cardio-education-${name}.json`),
        )
        .digest("hex"),
    ).toBe(digest);
  expect(snapshot.sourceHtmlSha256).toBeNull();
  expect(snapshot.sourceCaptureMethod).toContain("403");
  expect(additions.map((r) => r.id)).toEqual(snapshot.recordIds);
  for (const record of additions)
    expect(publicCardioEntities.find((r) => r.id === record.id)).toEqual(
      record,
    );
  expect(() => validateCardioRelease()).not.toThrow();
  expect(
    additions
      .find((r) => r.id === "modality_walking_outdoor")
      ?.limitations.join(" "),
  ).toContain("2025 review-due date is past");
});
it("keeps relative effort, absolute METs and public-health equivalence separate from personal estimates", () => {
  const get = (id: string) => additions.find((r) => r.id === id)!;
  expect(get("topic_perceived_exertion_0_10").claims[0]?.text).toContain(
    "5 or 6",
  );
  expect(get("topic_perceived_exertion_0_10").limitations.join(" ")).toContain(
    "not resistance-training RIR",
  );
  expect(get("topic_met_definition").limitations.join(" ")).toContain(
    "No personal MET or VO2max estimate",
  );
  expect(
    get("topic_moderate_vigorous_equivalence").limitations.join(" "),
  ).toContain("not equal training load");
  expect(get("modality_cycling_outdoor").limitations.join(" ")).toContain(
    "name alone does not classify",
  );
  for (const r of additions) {
    expect(r.plan).toBeUndefined();
    expect(r.claims.every((c) => c.evidenceStrength === "not_graded")).toBe(
      true,
    );
  }
});
it("rejects duplicated claim IDs and unresolved educational source references", () => {
  const duplicated = structuredClone(publicCardioEntities[0]!);
  duplicated.claims.push(structuredClone(duplicated.claims[0]!));
  expect(() => validateCardioRelease([duplicated])).toThrow(
    /source is unresolved/,
  );
  const changed = structuredClone(additions[0]!);
  changed.claims[0]!.sourceIds = ["uninspected"];
  expect(() => validateCardioRelease([changed])).toThrow(
    /source is unresolved/,
  );
});
