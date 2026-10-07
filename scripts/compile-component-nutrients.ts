import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  nutrientSchema,
  deficiencyBoundary,
} from "../src/features/nutrients/schema";
import { verifiedSourceSchema } from "../src/features/content-review/schema";

const root = "src/content/provenance/";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const sourceLink = z.strictObject({
  authority: z.enum([
    "fda_nutrition_education",
    "fao_food_energy",
    "nhs_food_education",
    "nih_ods_fact_sheets",
    "efsa_drv",
  ]),
  verifiedSourceId: z.string().min(1),
  url: z.url(),
  version: z.string().nullable(),
  sourceDate: z.iso.date().nullable(),
});
const definitions = z
  .array(
    z.strictObject({
      id: z.string().min(1),
      source: sourceLink,
      role: z.string().min(20).max(700),
      foods: z.string().min(10).max(700),
      limitation: z.string().min(20).max(700),
      deficiency: z.string().min(10).max(900).nullable(),
      excess: z.string().min(10).max(900).nullable(),
      absorption: z.string().min(10).max(700).nullable(),
      qualitativeOnly: z.boolean(),
      extraClaims: z.array(
        z.strictObject({
          category: z.literal("conversion"),
          text: z.string().min(20).max(500),
        }),
      ),
    }),
  )
  .parse(read(`${root}component-nutrient-definitions.json`));
const snapshot = z
  .strictObject({
    definitionsSha256: z.string().regex(/^[a-f0-9]{64}$/),
    recordIds: z.array(z.string()),
    sources: verifiedSourceSchema.array(),
  })
  .parse(read(`${root}component-nutrient-snapshot.json`));
if (
  createHash("sha256")
    .update(readFileSync(`${root}component-nutrient-definitions.json`))
    .digest("hex") !== snapshot.definitionsSha256
)
  throw Error("Component nutrient definition snapshot hash mismatch");
if (
  new Set(definitions.map((d) => d.id)).size !== definitions.length ||
  JSON.stringify(snapshot.recordIds) !==
    JSON.stringify(definitions.map((d) => d.id))
)
  throw Error("Duplicate or changed component nutrient snapshot identities");
const approved = verifiedSourceSchema
  .array()
  .parse(read(`${root}verified-sources.json`));
const identities = nutrientSchema
  .array()
  .parse(read("src/content/nutrients/identities.json"));
const current = nutrientSchema
  .array()
  .parse(read("src/content/nutrients/records.json"));
const additions = definitions.map((d) => {
  const source = snapshot.sources.find(
    (s) => s.id === d.source.verifiedSourceId,
  );
  if (
    !source ||
    source.url !== d.source.url ||
    source.sourceVersion !== d.source.version ||
    source.sourceDate !== d.source.sourceDate ||
    source.reuse === "blocked" ||
    JSON.stringify(source) !==
      JSON.stringify(approved.find((s) => s.id === source.id))
  )
    throw Error(`Unverified component nutrient source ${d.id}`);
  const seed = identities.find((r) => r.id === d.id);
  if (!seed)
    throw Error(`Unknown immutable component nutrient identity ${d.id}`);
  const sourceIds = [d.source.authority];
  const categories = [
    { category: "function" as const, text: d.role },
    { category: "food_source" as const, text: d.foods },
    { category: "other" as const, text: d.limitation },
    ...(d.deficiency
      ? [{ category: "deficiency" as const, text: d.deficiency }]
      : []),
    ...(d.excess ? [{ category: "excess" as const, text: d.excess }] : []),
    ...(d.absorption
      ? [{ category: "absorption" as const, text: d.absorption }]
      : []),
    ...d.extraClaims,
  ];
  if (
    d.extraClaims.length &&
    (d.id !== "energy_kj" ||
      d.extraClaims.length !== 1 ||
      !d.extraClaims[0]?.text.includes("1 kcal equals 4.184 kJ"))
  )
    throw Error(
      "Only the retained FAO exact energy-unit conversion is approved here",
    );
  const qualitative =
    d.qualitativeOnly || !seed.foodDataNutrientIds.includes(d.id);
  return nutrientSchema.parse({
    ...seed,
    status: "published",
    contentStatus: "complete_for_mvp",
    summary: d.role,
    functions: [
      { title: "Source-backed explanation", description: d.role, sourceIds },
    ],
    forms: [],
    referenceValues: [],
    interactions: [],
    athleticRelevance: [],
    absorptionFactors: d.absorption
      ? [
          {
            factorType: "other",
            description: d.absorption,
            direction: "context_dependent",
            sourceIds,
          },
        ]
      : [],
    foodSourceRules: [
      {
        rankingBasis: qualitative ? "qualitative_only" : "per_100g",
        phase07NutrientId: qualitative ? null : d.id,
        minimumDataStatus: "measured_or_calculated",
        status: qualitative ? "disabled" : "enabled",
        notes: qualitative
          ? "Qualitative source education only. Missing measurements and fatty-acid totals are not reconstructed from other concepts."
          : "Exact published Phase 07 source profiles only; missing measurements are not zero. State, units and serving mass remain explicit.",
      },
    ],
    deficiency: d.deficiency
      ? {
          overview: d.deficiency,
          riskGroups: [],
          signsAndSymptoms: [],
          medicalBoundary: deficiencyBoundary,
          sourceIds,
        }
      : null,
    excess: d.excess
      ? {
          overview: d.excess,
          riskGroups: [],
          signsAndSymptoms: [],
          medicalBoundary:
            "No upper limit is an intake goal. Individual clinical or medical assessment requires a qualified professional.",
          sourceIds,
        }
      : null,
    claims: categories.map(({ category, text }, i) => ({
      claimId: `claim_${d.id}_source_${i + 1}`,
      category,
      text,
      evidenceLevel:
        ["deficiency", "excess"].includes(category) &&
        /does not|rather than|not establish|not an individual|no universal|not diagnose|not provide/.test(
          text,
        )
          ? "insufficient"
          : "authoritative_reference",
      population:
        "General source education; no individual diagnostic, athlete supplementation or clinical assessment",
      sourceIds,
      limitations: d.limitation,
      reviewStatus: "approved",
    })),
    sources: [
      {
        sourceId: d.source.authority,
        locator: source.url,
        accessedAt: source.lastReviewedAt,
        notes: `Individually read source. Version: ${source.sourceVersion ?? "not supplied"}; date: ${source.sourceDate ?? "exact date not supplied"}. No numeric intake rows imported.`,
      },
    ],
    editorial: {
      reviewStatus: "approved",
      reviewedAt: source.lastReviewedAt,
      reviewer:
        "Codex source verification and machine validation; personal use; no human review",
      notes: `published_personal_use. ${d.limitation}`,
    },
  });
});
for (const addition of additions) {
  const previous = current.find((r) => r.id === addition.id);
  if (
    previous?.status === "published" &&
    JSON.stringify(previous) !== JSON.stringify(addition)
  )
    throw Error(
      `Refusing to overwrite published component nutrient ${addition.id}`,
    );
}
const output = nutrientSchema
  .array()
  .parse([
    ...current.map((r) => additions.find((a) => a.id === r.id) ?? r),
    ...additions.filter((r) => !current.some((p) => p.id === r.id)),
  ]);
const path = "src/content/nutrients/records.json",
  value = JSON.stringify(output, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== value)
    throw Error("Component nutrient education release is stale");
} else {
  writeFileSync(`${path}.tmp`, value);
  renameSync(`${path}.tmp`, path);
}
console.log(
  `Validated ${additions.length} component nutrient articles; no numeric intake targets inferred.`,
);
