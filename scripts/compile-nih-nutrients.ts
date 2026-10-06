import { readFileSync, writeFileSync, renameSync } from "node:fs";
import {
  nutrientSchema,
  deficiencyBoundary,
} from "../src/features/nutrients/schema";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const identities = nutrientSchema
  .array()
  .parse(read("src/content/nutrients/identities.json"));
const current = nutrientSchema
  .array()
  .parse(read("src/content/nutrients/records.json"));
const reviewedAt = "2026-10-06";
// Brief original paraphrases from the four individually read NIH ODS consumer
// pages. No table, dose, treatment protocol or performance effect is imported.
const definitions = [
  {
    id: "thiamin_mg",
    page: "Thiamin",
    updated: "2021-03-22",
    role: "Thiamin supports the conversion of food into usable energy and normal cell development and function.",
    foods:
      "ODS lists whole or fortified grains, pork, fish, legumes, seeds and nuts as food sources.",
    deficiency:
      "Insufficient thiamin intake, absorption or retention can cause deficiency; severe deficiency can affect nerves and the heart.",
    excess:
      "ODS reports no demonstrated harm from thiamin. This does not establish that unrestricted supplement use is appropriate.",
    interaction:
      "Some medicines, including furosemide and fluorouracil, can lower thiamin levels. Discuss supplement and medicine use with a pharmacist or clinician.",
    forms: ["Thiamin mononitrate", "Thiamin hydrochloride"],
  },
  {
    id: "riboflavin_mg",
    page: "Riboflavin",
    updated: "2022-05-11",
    role: "Riboflavin supports energy metabolism and the growth and function of cells.",
    foods:
      "ODS lists eggs, lean meat, milk, mushrooms, spinach and fortified grain products as food sources.",
    deficiency:
      "Riboflavin deficiency can affect the skin, mouth and red blood cells. ODS identifies vegan diets and avoiding dairy or eggs as contexts needing attention.",
    excess:
      "ODS reports no demonstrated harm from riboflavin. That statement is not a recommendation to take unrestricted supplements.",
    interaction:
      "ODS does not identify known medication interactions for riboflavin, but recommends discussing supplements and medicines with health professionals.",
    forms: [],
  },
  {
    id: "niacin_mg",
    page: "Niacin",
    updated: "2021-03-22",
    role: "Niacin contributes to energy metabolism and normal cell development and function.",
    foods:
      "ODS lists poultry, meat, fish, some nuts and legumes, and enriched or fortified grain products as food sources.",
    deficiency:
      "Severe niacin deficiency can lead to pellagra. Low niacin or tryptophan intake and certain medical conditions can contribute.",
    excess:
      "High-dose niacin supplements can cause adverse effects, including flushing with nicotinic acid and liver problems with some high-dose regimens.",
    interaction:
      "High-dose nicotinic acid can affect blood glucose and interfere with diabetes medicines. Prescription niacin use requires clinical supervision.",
    forms: ["Nicotinic acid", "Nicotinamide"],
  },
  {
    id: "vitamin_b6_mg",
    page: "VitaminB6",
    updated: "2023-06-16",
    role: "Vitamin B6 participates in metabolic enzyme reactions, immune function and brain development.",
    foods:
      "ODS lists poultry, fish, potatoes and other starchy vegetables, and non-citrus fruit as food sources.",
    deficiency:
      "Vitamin B6 deficiency can affect blood cells, skin and immune function; some kidney disorders, malabsorption conditions and alcohol dependence increase risk.",
    excess:
      "High supplemental vitamin B6 intake over extended periods can cause serious nerve damage. US and European upper-limit frameworks differ.",
    interaction:
      "Vitamin B6 can interact with cycloserine, some epilepsy medicines and theophylline. A pharmacist or clinician should assess medication interactions.",
    forms: ["Pyridoxine"],
  },
] as const;
const sourceIds = ["nih_ods_fact_sheets"] as const;
const additions = definitions.map((d) => {
  const seed = identities.find((r) => r.id === d.id);
  if (!seed) throw Error(`Unknown immutable nutrient identity ${d.id}`);
  const claims = (
    [
      ["function", d.role],
      ["food_source", d.foods],
      ["deficiency", d.deficiency],
      ["excess", d.excess],
      ["interaction", d.interaction],
    ] as const
  ).map(([category, text]) => ({
    claimId: `claim_${d.id}_${category}`,
    text,
    category,
    evidenceLevel: "authoritative_reference",
    population:
      "General NIH ODS consumer education; not an individual assessment or athlete supplement protocol",
    sourceIds,
    limitations:
      "Brief source-linked education. No diagnosis, personal intake target or performance benefit is inferred.",
    reviewStatus: "approved",
  }));
  return nutrientSchema.parse({
    ...seed,
    status: "published",
    contentStatus: "complete_for_mvp",
    summary: d.role,
    functions: [
      { title: "Physiological role", description: d.role, sourceIds },
    ],
    forms: d.forms.map((name) => ({
      id: name.toLowerCase().replaceAll(" ", "_"),
      name,
      relationship: "supplement_form",
      sourceIds,
    })),
    referenceValues: [],
    foodSourceRules: [
      {
        rankingBasis: d.id === "niacin_mg" ? "qualitative_only" : "per_100g",
        phase07NutrientId: d.id === "niacin_mg" ? null : d.id,
        minimumDataStatus: "measured_or_calculated",
        status: d.id === "niacin_mg" ? "disabled" : "enabled",
        notes:
          d.id === "niacin_mg"
            ? "USDA niacin mass is not niacin equivalents (NE). Tryptophan contribution is not inferred, and an NE ranking is unavailable."
            : "Exact source-backed 100 g profiles; missing composition is not zero.",
      },
    ],
    deficiency: {
      overview: d.deficiency,
      riskGroups: [],
      signsAndSymptoms: [],
      medicalBoundary: deficiencyBoundary,
      sourceIds,
    },
    excess: {
      overview: d.excess,
      riskGroups: [],
      signsAndSymptoms: [],
      medicalBoundary:
        "No upper limit is an intake goal. Seek professional or medical advice before changing supplement or medication use.",
      sourceIds,
    },
    interactions: [
      {
        type: "nutrient_medication",
        counterparty: "Medicines discussed in the linked NIH ODS fact sheet",
        description: d.interaction,
        severity: "professional_review",
        sourceIds,
        limitations:
          "Informational summary, not a complete interaction list or an instruction to change medicines.",
      },
    ],
    claims,
    sources: [
      {
        sourceId: "nih_ods_fact_sheets",
        locator: `https://ods.od.nih.gov/factsheets/${d.page}-Consumer/`,
        accessedAt: reviewedAt,
        notes: `Individually read consumer page; source updated ${d.updated}. No numeric intake rows imported. See the source for framework-specific recommendations.`,
      },
    ],
    editorial: {
      reviewStatus: "approved",
      reviewedAt,
      reviewer:
        "Codex source verification and machine validation; personal use; no human review",
      notes:
        "published_personal_use. Brief source-linked education, no independent human/clinical review and no personal intake prescription.",
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
      `Refusing to replace changed published nutrient ${addition.id}; record a new reviewed revision.`,
    );
}
const addedIds = new Set(additions.map((r) => r.id));
const output = nutrientSchema
  .array()
  .parse([...current.filter((r) => !addedIds.has(r.id)), ...additions]);
const path = "src/content/nutrients/records.json",
  value = JSON.stringify(output, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== value)
    throw Error("NIH nutrient education release is stale.");
} else {
  writeFileSync(`${path}.tmp`, value);
  renameSync(`${path}.tmp`, path);
}
console.log(
  `Validated ${additions.length} additional NIH nutrient articles; no numerical intake rows fabricated.`,
);
