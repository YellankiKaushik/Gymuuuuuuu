import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { foodSchema } from "../src/features/foods/schema";
import { nutrientSchema } from "../src/features/nutrients/schema";
import { rankVerifiedFoodSources } from "../src/features/nutrients/ranking";
import {
  packRankings,
  rankingProfiles,
  unpackRankings,
} from "../src/features/nutrients/ranking-codec";
import { loadFoodRankings } from "../src/features/nutrients/repository";

const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const foods = foodSchema.array().parse(read("src/content/foods/records.json"));
const nutrients = nutrientSchema
  .array()
  .parse(read("src/content/nutrients/records.json"))
  .filter((row) => row.status === "published");
const profiles = read("src/content/nutrients/ranking-profiles.json");

it("loads every nutrient ranking without changing source-derived numbers, order, units or provenance", async () => {
  let rows = 0;
  for (const nutrient of nutrients) {
    const canonical = nutrient.foodSourceRules
      .filter(
        (rule) =>
          rule.status === "enabled" &&
          rule.phase07NutrientId &&
          rule.rankingBasis !== "qualitative_only",
      )
      .flatMap((rule) =>
        rankVerifiedFoodSources(
          foods,
          rule.phase07NutrientId!,
          rule.rankingBasis as
            "per_100g" | "per_100kcal" | "per_verified_portion",
          {
            unit:
              nutrient.id === "vitamin_e_mg" ? "mg" : nutrient.canonicalUnit,
            minimumDataStatus: rule.minimumDataStatus,
          },
        ).map((row) =>
          nutrient.id === "vitamin_e_mg"
            ? { ...row, unit: nutrient.canonicalUnit }
            : row,
        ),
      );
    const packed = read(`src/content/nutrients/rankings/${nutrient.id}.json`);
    expect(unpackRankings(packed, profiles, nutrient.id)).toEqual(canonical);
    expect(await loadFoodRankings(nutrient.id)).toEqual(canonical);
    rows += canonical.length;
  }
  expect(rows).toBeGreaterThan(3500);
  expect(await loadFoodRankings("not_a_published_nutrient")).toEqual([]);
});

it("preserves source zero and nullable contexts and rejects damaged or unresolved assets", () => {
  const rows = rankVerifiedFoodSources(foods, "protein_g", "per_100g");
  expect(rows.some((row) => row.amount === 0)).toBe(true);
  const dictionary = rankingProfiles(rows);
  const packed = packRankings(rows);
  expect(unpackRankings(packed, dictionary, "protein_g")).toEqual(rows);
  expect(unpackRankings(packRankings([]), dictionary, "protein_g")).toEqual([]);
  expect(() => unpackRankings(packed, [], "protein_g")).toThrow(/Unresolved/);
  expect(() => unpackRankings(packed, dictionary, "energy_kcal")).toThrow(
    /nutrient identity/,
  );
  expect(() =>
    unpackRankings(packed, [...dictionary, dictionary[0]], "protein_g"),
  ).toThrow(/Duplicate/);
  expect(() =>
    rankingProfiles([rows[0]!, { ...rows[0]!, name: "Changed metadata" }]),
  ).toThrow(/Conflicting/);
  for (const amount of [NaN, Infinity, -1]) {
    const damaged = structuredClone(packed);
    damaged.rows[0]![2] = amount;
    expect(() => unpackRankings(damaged, dictionary, "protein_g")).toThrow();
  }
  expect(() =>
    unpackRankings({ ...packed, schemaVersion: 2 }, dictionary, "protein_g"),
  ).toThrow();
  expect(() =>
    unpackRankings({ ...packed, unexpected: true }, dictionary, "protein_g"),
  ).toThrow();
});
