import { expect, test } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import definitions from "../src/content/provenance/supplement-evidence-definitions.json";
import snapshot from "../src/content/provenance/supplement-evidence-snapshot.json";
import {
  publicEntitySchema,
  publicSupplements,
  validateSupplementsRelease,
} from "../src/features/supplements/publication";
test("supplement publication matches byte-pinned source extraction without a dosing prescription", () => {
  for (const [name, hash] of [
    ["definitions", snapshot.definitionsSha256],
    ["sources", snapshot.sourcesSha256],
  ])
    expect(
      createHash("sha256")
        .update(
          readFileSync(
            `src/content/provenance/supplement-evidence-${name}.json`,
          ),
        )
        .digest("hex"),
    ).toBe(hash);
  for (const definition of definitions) {
    expect(publicSupplements.find((row) => row.id === definition.id)).toEqual(
      definition,
    );
    expect(definition.antiDoping).toBeNull();
    expect(
      definition.claims.every(
        (claim) =>
          claim.protocol === null &&
          claim.magnitude === null &&
          claim.assessmentMethod === "editorial",
      ),
    ).toBe(true);
  }
  expect(() => validateSupplementsRelease()).not.toThrow();
});
test("outcomes, forms and unknown per-outcome study counts remain separate", () => {
  const beta = publicSupplements.find(
    (row) => row.id === "ingredient_beta_alanine",
  )!;
  expect(beta.claims.map((claim) => claim.effectDirection)).toEqual([
    "beneficial",
    "no_clear_benefit",
  ]);
  expect(beta.claims[0]!.ageAndSexLimits).toContain("18–40");
  expect(beta.claims[1]!.outcomeDefinition).toContain("Repeated sprint");
  const citrulline = publicSupplements.find(
    (row) => row.id === "ingredient_citrulline_malate",
  )!;
  expect(citrulline.claims[1]!.studyCount).toBeNull();
  expect(
    citrulline.claims.every(
      (claim) => claim.formulation === "Citrulline malate",
    ),
  ).toBe(true);
  expect(
    publicSupplements.some((row) => row.id === "ingredient_citrulline"),
  ).toBe(false);
});
test("unresolved harm sources and duplicate claim identities cannot pass release validation", () => {
  const entity = publicEntitySchema.parse(definitions[0]);
  const duplicate = structuredClone(entity);
  duplicate.claims.push(structuredClone(duplicate.claims[0]!));
  expect(() => validateSupplementsRelease([duplicate])).toThrow(
    /Duplicate supplement claim/,
  );
  entity.claims[0]!.harms.push({
    text: "Synthetic invalid source",
    sourceIds: ["missing_source"],
  });
  expect(() => validateSupplementsRelease([entity])).toThrow(
    /source unresolved/,
  );
});
