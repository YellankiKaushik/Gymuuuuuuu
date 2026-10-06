import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import snapshot from "../src/content/provenance/gray-1918-shoulder-snapshot.json";
import {
  anatomyTaxonomy,
  getPublishedMuscles,
  validateAnatomy,
} from "../src/features/muscles/repository";
import { sourceRegistry } from "../src/data/sources";

it("retains the extracted historical source and the original stable anatomy identities", () => {
  const text = readFileSync(snapshot.extractPath, "utf8");
  expect(createHash("sha256").update(text).digest("hex")).toBe(snapshot.sha256);
  expect(snapshot.sourceYear).toBe(1918);
  const source = sourceRegistry.find(
    (row) => row.sourceId === snapshot.sourceId,
  );
  expect(source?.quality).toBe("limited");
  expect(source?.limitations).toContain("Historical edition");
  const published = getPublishedMuscles();
  expect(validateAnatomy(published)).toEqual([]);
  for (const id of snapshot.recordIds) {
    const record = published.find((row) => row.id === id);
    const identity = anatomyTaxonomy.records.find((row) => row.id === id);
    expect(record?.slug).toBe(identity?.slug);
    expect(record?.reviewedBy).toContain("no human review");
    expect(record?.sources).toContain(snapshot.sourceId);
    expect(
      record?.jointActions.every((action) =>
        action.sourceIds.includes(snapshot.sourceId),
      ),
    ).toBe(true);
  }
});
