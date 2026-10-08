import { expect, test, vi } from "vitest";
import { loadComparisonRecords } from "../src/features/search/comparison-records.server";
import { formatComparisonMeasurement } from "../src/features/search/comparison-cards";
import {
  entityRefSchema,
  type EntityReference,
} from "../src/features/saved/schema";
import documents from "../src/data/search/search-documents.public.json";
import reviews from "../src/content/provenance/publications.json";

function reference(
  type: EntityReference["entityType"],
  id: string,
): EntityReference {
  const document = documents.find(
    (d) => d.entityType === type && d.entityId === id,
  )!;
  if (!document) throw Error(`Missing published test record ${id}`);
  return {
    entityType: type,
    entityId: id,
    entityVersion: document.entityVersion,
    sourceModule: document.sourceModule,
    lastKnownTitle: "Stale saved label",
    lastKnownRoute: "/untrusted-saved-route",
    referenceStatus: "active",
  };
}

test("food comparison resolves canonical identities and retains every exact source preparation", async () => {
  const rows = await loadComparisonRecords("foods", [
    reference("food", "food_apple"),
    reference("food", "food_brown_rice"),
  ]);
  expect(rows.map((r) => r.title)).toEqual(["Apple", "Brown rice"]);
  expect(rows[0]?.route).toBe("/foods/apple");
  expect(rows[1]?.profiles?.some((p) => p.foodState === "raw")).toBe(true);
  expect(rows[1]?.profiles?.some((p) => p.foodState === "cooked")).toBe(true);
  expect(
    rows.every(
      (r) =>
        r.sources.length &&
        r.limitations.some((s) => s.includes("missing data is not zero")),
    ),
  ).toBe(true);
  const missing = rows[0]!.profiles![0]!.nutrients.find(
    (n) => n.nutrientId === "energy_kj",
  )!;
  expect(formatComparisonMeasurement(missing)).toBe("not available · kJ");
  expect(
    formatComparisonMeasurement({ ...missing, status: "measured", value: 0 }),
  ).toBe("0 kJ · measured");
  expect(
    formatComparisonMeasurement({ ...missing, status: "trace", value: null }),
  ).toBe("Trace · kJ");
});

test("source education and framework rows retain units, population and distinct limitations", async () => {
  const rows = await loadComparisonRecords("nutrients", [
    reference("nutrient", "iron_mg"),
    reference("nutrient", "protein_g"),
  ]);
  expect(
    rows[0]?.fields.find((f) => f.label === "Reference frameworks")?.value,
  ).toContain("label reference");
  expect(
    rows[0]?.fields.find((f) => f.label === "Reference frameworks")?.value,
  ).toContain("mg");
  expect(
    rows[1]?.fields.find((f) => f.label === "Reference frameworks")?.value,
  ).toBe(
    "fda dv adult 4 plus · DV · 50 g · label reference · all · 48–no upper bound months · general",
  );
  expect(rows.every((r) => r.sources.length > 0)).toBe(true);
  const anatomy = await loadComparisonRecords("muscles", [
    reference("muscle", "muscle_biceps_brachii"),
    reference("muscle", "muscle_biceps_brachii_long_head"),
  ]);
  expect(
    anatomy[1]?.fields.find((f) => f.label === "Source-described actions")
      ?.value,
  ).toBe("Subdivision-specific actions are not established");
  expect(anatomy.every((r) => r.sources.length > 0)).toBe(true);
});

test("comparison rejects private, mixed, duplicate and outdated references without inventing facts", async () => {
  const apple = reference("food", "food_apple"),
    rice = reference("food", "food_brown_rice");
  await expect(
    loadComparisonRecords("foods", [
      apple,
      { ...rice, referenceStatus: "private" },
    ]),
  ).rejects.toThrow(/active published/);
  await expect(
    loadComparisonRecords("foods", [apple, reference("nutrient", "iron_mg")]),
  ).rejects.toThrow(/selected comparison family/);
  await expect(loadComparisonRecords("foods", [apple, apple])).rejects.toThrow(
    /same reference twice/,
  );
  const rows = await loadComparisonRecords("foods", [
    apple,
    { ...rice, entityVersion: "obsolete-version" },
  ]);
  expect(rows[1]?.unavailable).toContain(
    "differs from the current publication",
  );
  expect(rows[1]?.profiles).toBeUndefined();
  expect(rows[1]?.fields).toEqual([]);
  const absent = await loadComparisonRecords("foods", [
    apple,
    { ...rice, entityId: "food_missing_reviewed_record" },
  ]);
  expect(absent[1]?.unavailable).toContain(
    "no longer in the published library",
  );
});

test("every factual search review date matches the explicit machine publication provenance", () => {
  const factual = documents.filter(
    (d) => !["route", "dashboard_widget"].includes(d.entityType),
  );
  expect(factual).toHaveLength(472);
  for (const document of factual) {
    const review = reviews.find((r) => r.id === document.entityId)!;
    expect(document.lastReviewedAt).toBe(review.lastReviewedAt);
  }
});

test("remaining populated comparison families resolve public facts and their scope", async () => {
  const cases = [
    [
      "exercises",
      "exercise",
      "exercise_dumbbell_curl",
      "exercise_dumbbell_lateral_raise",
    ],
    [
      "recipes",
      "recipe",
      "public_recipe_chickpea_cucumber_bowl",
      "public_recipe_potato_cucumber_bowl",
    ],
    [
      "recovery_methods",
      "recovery_topic",
      "sleep_duration_adults",
      "sleep_regularity",
    ],
    [
      "supplements",
      "supplement_ingredient",
      "ingredient_creatine_monohydrate",
      "ingredient_caffeine",
    ],
  ] as const;
  for (const [family, type, left, right] of cases) {
    const rows = await loadComparisonRecords(family, [
      reference(type, left),
      reference(type, right),
    ]);
    expect(
      rows.every(
        (r) =>
          r.fields.length > 0 &&
          r.sources.length > 0 &&
          r.limitations.length > 0 &&
          !r.unavailable,
      ),
    ).toBe(true);
    if (family === "supplements")
      expect(
        rows.every(
          (r) =>
            r.fields.find((f) => f.label === "Outcome-specific research claims")
              ?.value === "No outcome-specific efficacy claims published",
        ),
      ).toBe(true);
  }
});

test("saved reference validation rejects external and executable links before use", () => {
  const base = reference("food", "food_apple");
  for (const route of [
    "javascript:alert(1)",
    "data:text/html,test",
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/\n/evil",
  ])
    expect(
      entityRefSchema.safeParse({ ...base, lastKnownRoute: route }).success,
    ).toBe(false);
  for (const route of [
    "/foods/apple",
    "/search?q=apple",
    "/foods/apple#sources",
    "/deleted-reference",
  ])
    expect(
      entityRefSchema.safeParse({ ...base, lastKnownRoute: route }).success,
    ).toBe(true);
  expect(
    entityRefSchema.safeParse({ ...base, lastKnownRoute: null }).success,
  ).toBe(true);
});

const publicRequest = vi.hoisted(() => vi.fn());
vi.mock("../src/features/search/comparison.functions", () => ({
  loadPublicComparison: publicRequest,
}));
test("client comparison sends only allowlisted public identifiers, never saved labels, versions or private references", async () => {
  const { loadComparisonRecords: clientLoad } =
    await import("../src/features/search/comparison-records");
  const { resolvePublicComparison } =
    await import("../src/features/search/comparison-public.server");
  publicRequest.mockClear();
  publicRequest.mockImplementation(
    async ({
      data,
    }: Parameters<typeof resolvePublicComparison> extends [infer Input]
      ? { data: Input }
      : never) => resolvePublicComparison(data),
  );
  const apple = reference("food", "food_apple"),
    rice = reference("food", "food_brown_rice");
  await expect(
    clientLoad("foods", [apple, { ...rice, referenceStatus: "private" }]),
  ).rejects.toThrow(/active published/);
  expect(publicRequest).not.toHaveBeenCalled();
  await clientLoad("foods", [apple, rice]);
  expect(publicRequest).toHaveBeenCalledExactlyOnceWith({
    data: {
      family: "foods",
      entities: [
        { entityType: "food", entityId: "food_apple" },
        { entityType: "food", entityId: "food_brown_rice" },
      ],
    },
  });
  publicRequest.mockClear();
  const stale = await clientLoad("foods", [
    apple,
    { ...rice, entityVersion: "obsolete-private-saved-version" },
  ]);
  expect(stale[1]?.unavailable).toContain(
    "differs from the current publication",
  );
  expect(JSON.stringify(publicRequest.mock.calls)).not.toMatch(
    /obsolete|Stale saved label|untrusted-saved-route|lastKnown|entityVersion/,
  );
  await expect(
    resolvePublicComparison({
      family: "foods",
      entities: [{ entityType: "food", entityId: "food_unpublished_identity" }],
    }),
  ).rejects.toThrow(/Only published factual/);
});
