import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import definitions from "../src/content/provenance/ods-five-definitions.json";
import snapshot from "../src/content/provenance/ods-five-snapshot.json";
import sources from "../src/content/provenance/ods-five-sources.json";
import publications from "../src/content/provenance/publications.json";
import {
  publicSupplements,
  validateSupplementsRelease,
} from "../src/features/supplements/publication";

it("pins inspected NIH summaries with the actual publisher update and no invented archive, regimen or grade", () => {
  for (const [name, pin] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ] as const)
    expect(
      createHash("sha256")
        .update(readFileSync(`src/content/provenance/ods-five-${name}.json`))
        .digest("hex"),
    ).toBe(pin);
  expect(sources[0]!.sourceDate).toBe("2024-04-01");
  expect(snapshot.moduleSource.year).toBe(2024);
  expect(snapshot.sourceHtmlSha256).toBeNull();
  expect(snapshot.sourceCaptureMethod).toContain(
    "No raw HTML archive retained",
  );
  expect(() => validateSupplementsRelease()).not.toThrow();
  for (const row of definitions) {
    expect(publicSupplements.find((r) => r.id === row.id)).toEqual(row);
    expect(row.antiDoping).toBeNull();
    const claim = row.claims[0]!;
    expect(claim.protocol).toBeNull();
    expect(claim.magnitude).toBeNull();
    expect(claim.studyCount).toBeNull();
    expect(claim.evidenceConfidence).toBe("not_assessed");
    const publication = publications.find(
      (r) => r.module === "supplements" && r.id === row.id,
    )!;
    expect(publication.state).toBe("published_personal_use");
    expect(publication.reviewer.kind).toBe("machine");
    expect(
      publication.fields.find((f) => f.path === `claims.${claim.id}`)
        ?.sourceIds,
    ).toEqual(claim.sourceIds);
    expect(row.review.reviewer).toContain("no human review");
  }
});
it("retains formulation, population, duration and safety boundaries instead of a universal efficacy or safety badge", () => {
  const find = (id: string) => definitions.find((r) => r.id === id)!;
  const glutamine = find("ingredient_glutamine").claims[0]!;
  expect(glutamine.timeframe).toContain("Six-week");
  expect(glutamine.population).toContain("male and female weightlifters");
  expect(glutamine.limitations.join(" ")).toContain(
    "not a universal no-effect verdict",
  );
  const cherry = find("ingredient_tart_cherry");
  expect(cherry.claims[0]!.formulation).toContain("not interchangeable");
  expect(cherry.safety[0]!.content.text).toContain(
    "not been adequately assessed",
  );
  const bicarbonate = find("ingredient_sodium_bicarbonate");
  expect(bicarbonate.claims[0]!.outcomeDefinition).toContain(
    "poorer performance",
  );
  expect(bicarbonate.safety[0]!.content.text).toContain("sodium exposure");
  expect(find("ingredient_betaine").claims[0]!.population).toContain("Men");
  expect(find("ingredient_hmb").claims[0]!.formulation).toContain(
    "no equivalence",
  );
});
