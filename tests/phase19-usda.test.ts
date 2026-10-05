import { describe, it, expect } from "vitest";
import { buildUsdaRelease, snapshotHash } from "../scripts/content/usda";
import identities from "../src/content/foods/identities.json";
import mappings from "../src/content/provenance/food-mappings.json";
import snapshots from "../src/content/provenance/usda-selected.json";
import records from "../src/content/foods/records.json";
import sources from "../src/content/provenance/sources.json";
import { buildPublicSearchDocuments } from "../src/features/search/public-sources";
describe("Verified USDA ingestion", () => {
  const build = (m: unknown[] = mappings, s: unknown[] = snapshots) =>
    buildUsdaRelease(identities, m, s, sources[0]!.extractedAt);
  it("reproduces the checked-in release exactly with immutable IDs", () => {
    expect(build()).toEqual(records);
    expect(
      records.every((r) =>
        identities.some((i) => i.id === r.id && i.slug === r.slug),
      ),
    ).toBe(true);
  });
  it("rejects changed source amounts before producing a proposed release", () => {
    const tampered = structuredClone(snapshots);
    tampered[0]!.description = "Different cultivar";
    expect(() => build(mappings, tampered)).toThrow(/Source drift/);
  });
  it("rejects duplicate and unresolved mappings", () => {
    expect(() => build([...mappings, mappings[0]!])).toThrow(
      /Duplicate mapping/,
    );
    expect(() => build([{ ...mappings[0], foodId: "food_missing" }])).toThrow(
      /Unresolved mapping/,
    );
  });
  it("does not invent zero, portions or measured status for source assumptions", () => {
    const rows = build(),
      banana = rows.find((r) => r.id === "food_banana")!
        .compositionProfiles[0]!;
    expect(
      banana.nutrients.find((n) => n.nutrientId === "omega_3_g"),
    ).toMatchObject({ value: null, status: "not_available" });
    const legacy = rows.find((r) => r.id === "food_pear")!
      .compositionProfiles[0]!;
    const assumed = legacy.nutrients.filter((n) =>
      n.methodNote?.includes("Assumed zero"),
    );
    expect(assumed.length).toBeGreaterThan(0);
    expect(
      assumed.every((n) => n.value === 0 && n.status === "estimated"),
    ).toBe(true);
    expect(
      rows
        .find((r) => r.id === "food_chickpea")!
        .compositionProfiles.map((p) => p.foodState),
    ).toEqual(["raw", "boiled"]);
  });
  it("indexes compiled foods and excludes all unmapped identities", async () => {
    const docs = await buildPublicSearchDocuments(async (v) => snapshotHash(v));
    const foods = docs.filter((d) => d.entityType === "food");
    expect(foods).toHaveLength(records.length);
    expect(foods.find((d) => d.entityId === "food_apple")?.route).toBe(
      "/foods/apple",
    );
    expect(foods.some((d) => d.entityId === "food_amla")).toBe(false);
  });
});
