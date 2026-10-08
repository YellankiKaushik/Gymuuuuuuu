import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import definitions from "../src/content/provenance/cdc-sleep-definitions.json";
import snapshot from "../src/content/provenance/cdc-sleep-snapshot.json";
import sources from "../src/content/provenance/verified-sources.json";
import reviews from "../src/content/provenance/publications.json";
import {
  publicRecoveryArticles,
  publicRecoveryRoutines,
  validateRecoveryRelease,
} from "../src/features/recovery/publication";

test("CDC sleep education retains canonical source pins and explicit machine publication fields", () => {
  for (const [name, digest] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ]) {
    const bytes = readFileSync(`src/content/provenance/cdc-sleep-${name}.json`);
    expect(bytes.toString()).not.toContain("\r");
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(digest);
  }
  expect(definitions.map((r) => r.id)).toEqual(snapshot.recordIds);
  expect(definitions).toHaveLength(7);
  expect(snapshot.sourceHtmlSha256).toBeNull();
  expect(snapshot.sourceCaptureMethod).toContain("Access Denied");
  const source = sources.find((s) => s.id === snapshot.moduleSource.id)!;
  expect(source.sourceDate).toBe("2024-05-15");
  expect(source.extractedAt).toBe(snapshot.extractedAt);
  for (const article of definitions) {
    expect(publicRecoveryArticles.find((r) => r.id === article.id)).toEqual(
      article,
    );
    expect(article.evidenceStrength).toBe("not_graded");
    const review = reviews.find(
      (r) => r.module === "recovery" && r.id === article.id,
    )!;
    expect(review.state).toBe("published_personal_use");
    expect(review.reviewer.kind).toBe("machine");
    expect(
      review.fields.find((f) => f.path === "definition")?.sourceIds,
    ).toEqual(article.sourceIds);
    for (const claim of article.claims)
      expect(
        review.fields.find((f) => f.path === `claims.${claim.id}`)?.sourceIds,
      ).toEqual(claim.sourceIds);
  }
});

test("sleep relationships resolve without adding a score, diagnosis or medication protocol", () => {
  expect(() => validateRecoveryRelease()).not.toThrow();
  const known = new Set(
    [
      ...publicRecoveryArticles,
      ...publicRecoveryRoutines.map((r) => r.article),
    ].map((r) => r.id),
  );
  for (const article of definitions) {
    expect(
      article.relatedIds.every((id) => known.has(id) && id !== article.id),
    ).toBe(true);
    expect(article.context).toContain("not a sleep-disorder treatment");
    expect(article.contraindications.join(" ")).toContain(
      "do not change medicines",
    );
  }
  expect(
    definitions.find((r) => r.id === "wind_down_routine")?.claims[0]?.text,
  ).toContain("at least 30 minutes");
  expect(
    definitions.find((r) => r.id === "caffeine_and_sleep")?.claims[0]?.text,
  ).not.toMatch(/\d/);
});
