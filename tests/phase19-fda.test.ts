import { expect, it } from "vitest";
import { verifyFdaReferenceValues } from "../scripts/content/fda";
import { nutrientSchema } from "../src/features/nutrients/schema";
import records from "../src/content/nutrients/records.json";
import snapshot from "../src/content/provenance/fda-daily-values.json";

it("checks numerical FDA values and framework population against the retained table extraction", () => {
  const parsed = nutrientSchema.array().parse(records);
  expect(verifyFdaReferenceValues(parsed, snapshot).rows).toHaveLength(7);
  const changed = structuredClone(parsed);
  changed.find((r) => r.id === "magnesium_mg")!.referenceValues[0]!.value = 400;
  expect(() => verifyFdaReferenceValues(changed, snapshot)).toThrow(
    "differs from the source snapshot",
  );
  const wrongPopulation = structuredClone(parsed);
  wrongPopulation[0]!.referenceValues[0]!.population.ageMinMonths = 12;
  expect(() => verifyFdaReferenceValues(wrongPopulation, snapshot)).toThrow(
    "population",
  );
});
