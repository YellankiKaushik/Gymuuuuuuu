import { expect, test } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import definitions from "../src/content/provenance/ods-ingredient-definitions.json";
import snapshot from "../src/content/provenance/ods-ingredient-snapshot.json";
import publications from "../src/content/provenance/publications.json";
import {
  publicSupplements,
  validateSupplementsRelease,
} from "../src/features/supplements/publication";
test("NIH ingredient observations are pinned without pretending a raw source archive exists", () => {
  for (const [name, expected] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ])
    expect(
      createHash("sha256")
        .update(
          readFileSync(`src/content/provenance/ods-ingredient-${name}.json`),
        )
        .digest("hex"),
    ).toBe(expected);
  expect(snapshot.sourceHtmlSha256).toBeNull();
  expect(snapshot.sourceCaptureMethod).toContain("HTTP 403");
  for (const row of definitions) {
    expect(publicSupplements.find((entry) => entry.id === row.id)).toEqual(row);
    expect(row.antiDoping).toBeNull();
    for (const claim of row.claims) {
      expect(claim.protocol).toBeNull();
      expect(claim.magnitude).toBeNull();
      expect(claim.studyCount).toBeNull();
      expect(claim.evidenceConfidence).toBe("not_assessed");
    }
  }
  expect(() => validateSupplementsRelease()).not.toThrow();
});
test("juice and dietary-protein boundaries remain explicit and every outcome and safety item has provenance", () => {
  const nitrate = definitions.find(
    (row) => row.id === "ingredient_dietary_nitrate",
  )!;
  expect(nitrate.sections[0]!.content.text).toContain(
    "do not automatically apply to powders",
  );
  expect(nitrate.claims[0]!.formulation).toBe("Beetroot juice or concentrate");
  const bcaa = definitions.find(
    (row) => row.id === "ingredient_branched_chain_amino_acids",
  )!;
  expect(bcaa.claims[0]!.outcomeDefinition).toContain(
    "sufficient high-quality dietary protein",
  );
  for (const row of publicSupplements) {
    const review = publications.find(
      (entry) => entry.module === "supplements" && entry.id === row.id,
    )!;
    for (const claim of row.claims)
      expect(
        review.fields.find((field) => field.path === `claims.${claim.id}`)
          ?.sourceIds,
      ).toEqual(claim.sourceIds);
    for (const safety of row.safety)
      expect(
        review.fields.find((field) => field.path === `safety.${safety.id}`)
          ?.sourceIds,
      ).toEqual(
        safety.content.sourceIds.map((id) =>
          id === "src_nih_ods_faq" ? "nih_ods_faq" : id,
        ),
      );
    expect(review.state).toBe("published_personal_use");
    expect(review.reviewer.kind).toBe("machine");
  }
});
