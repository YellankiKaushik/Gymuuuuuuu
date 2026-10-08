import { expect, it } from "vitest";
import matches from "../src/content/provenance/food-identity-matches.json";
import mappings from "../src/content/provenance/food-mappings.json";
import sources from "../src/content/provenance/verified-sources.json";
import foodJson from "../src/content/foods/records.json";
import reviews from "../src/content/provenance/publications.json";
import { foodSchema } from "../src/features/foods/schema";
import { verifyFoodIdentityMatches } from "../scripts/content/food-identity-matches";

it("retains independent naming evidence and exact raw composition for gourd identities", () => {
  expect(
    verifyFoodIdentityMatches(
      matches,
      mappings,
      sources,
      new Date().toISOString(),
    ),
  ).toEqual(matches);
  const foods = foodSchema.array().parse(foodJson);
  for (const match of matches) {
    const food = foods.find((row) => row.id === match.foodId)!;
    const profile = food.compositionProfiles[0]!;
    expect(profile.foodState).toBe("raw");
    expect(profile.sourceRecords[0]!.externalFoodId).toBe(String(match.fdcId));
    expect(profile.label).toBe(match.description);
    expect(
      reviews
        .find((row) => row.id === food.id)
        ?.fields.find((field) => field.path === `identity.fdc_${match.fdcId}`)
        ?.sourceIds,
    ).toEqual(match.sourceIds);
    expect(profile.review.qualityNotes.join(" ")).toContain(
      "Naming reference only",
    );
    expect(
      profile.nutrients.find((row) => row.nutrientId === "omega_3_g"),
    ).toMatchObject({ value: null, status: "not_available" });
  }
  const onion = foods.find((row) => row.id === "food_red_onion")!
    .compositionProfiles[0]!;
  expect(onion.sourceRecords[0]!.externalFoodId).toBe("790577");
  expect(
    onion.nutrients.find((row) => row.nutrientId === "iodine_ug"),
  ).toMatchObject({ value: 0, status: "measured" });
});

it("rejects ambiguous mappings, missing or blocked naming sources and future verification", () => {
  const today = new Date().toISOString();
  const changed = structuredClone(matches);
  changed[0]!.description = "Different cultivar or preparation";
  expect(() =>
    verifyFoodIdentityMatches(changed, mappings, sources, today),
  ).toThrow(/differs/);
  expect(() => verifyFoodIdentityMatches(matches, mappings, [], today)).toThrow(
    /approved/,
  );
  const blocked = sources.map((source) =>
    matches[0]!.sourceIds.includes(source.id)
      ? { ...source, reuse: "blocked" }
      : source,
  );
  expect(() =>
    verifyFoodIdentityMatches(matches, mappings, blocked, today),
  ).toThrow(/approved/);
  expect(() =>
    verifyFoodIdentityMatches(
      [...matches, matches[0]],
      mappings,
      sources,
      today,
    ),
  ).toThrow(/Duplicate/);
  changed[0] = { ...matches[0]!, verifiedAt: "2099-01-01T00:00:00Z" };
  expect(() =>
    verifyFoodIdentityMatches(changed, mappings, sources, today),
  ).toThrow(/Future/);
});
