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
// Brief original paraphrases from individually read NIH ODS consumer
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
  {
    id: "folate_food_ug",
    page: "Folate",
    updated: "2022-11-01",
    role: "Naturally occurring food folate supports DNA production and cell division.",
    foods:
      "ODS lists leafy vegetables, fruit, nuts, beans and peas as natural food-folate sources.",
    deficiency:
      "Low folate can cause megaloblastic anemia. This page cannot determine the cause of fatigue or anemia.",
    excess:
      "ODS distinguishes natural food folate from folic acid in supplements and fortified foods; their excess-risk frameworks are not interchangeable.",
    interaction:
      "Folate supplements can interact with methotrexate and some antiseizure medicines. Do not change medicines based on this page.",
    forms: [],
  },
  {
    id: "folate_dfe_ug",
    page: "Folate",
    updated: "2022-11-01",
    role: "Dietary folate equivalents describe folate intake while accounting for differences between food folate and folic acid.",
    foods:
      "Natural folate and folic acid added to enriched grains contribute different forms; check the exact food profile.",
    deficiency:
      "Insufficient folate can cause megaloblastic anemia; assessment requires clinical context.",
    excess:
      "Large supplemental folate amounts can hide the anemia of vitamin B12 deficiency without preventing its nerve damage.",
    interaction:
      "Folate supplements can affect some medicines; consult a pharmacist or clinician before use.",
    absorption:
      "Folic acid from fortified foods and supplements is absorbed differently from naturally occurring food folate. No intake conversion is inferred here.",
    forms: ["Folic acid", "Methylfolate (5-MTHF)"],
  },
  {
    id: "choline_mg",
    page: "Choline",
    updated: "2022-06-02",
    role: "Choline supports cell membranes and nervous-system functions including muscle control; the body makes some but also uses dietary choline.",
    foods:
      "ODS lists eggs, meat, fish, dairy, potatoes, cruciferous vegetables, some beans, nuts, seeds and whole grains.",
    deficiency:
      "Very low choline levels can cause muscle and liver damage. Below-reference intake alone does not establish deficiency.",
    excess:
      "Excess choline can cause vomiting, sweating, low blood pressure and liver damage; more is not automatically better.",
    interaction:
      "ODS reports no known choline medication interactions but recommends discussing supplements and medicines with health professionals.",
    forms: ["Choline bitartrate", "Phosphatidylcholine", "Lecithin"],
  },
  {
    id: "iodine_ug",
    page: "Iodine",
    updated: "2024-05-01",
    role: "Iodine is needed to make thyroid hormones, which support metabolism and development.",
    foods:
      "ODS lists seafood, dairy, eggs and iodized salt. Specialty salts are not necessarily iodized; check the product label.",
    deficiency:
      "Low iodine can impair thyroid-hormone production. Pregnancy and diets excluding seafood, dairy and eggs need appropriate professional assessment.",
    excess:
      "High iodine intake can also harm thyroid function. Deficiency and excess can share symptoms, so symptoms cannot guide self-dosing.",
    interaction:
      "Iodine supplements can interact with antithyroid medicines. Potassium iodide can raise potassium with ACE inhibitors or potassium-sparing diuretics.",
    forms: ["Potassium iodide", "Sodium iodide"],
  },
  {
    id: "potassium_mg",
    page: "Potassium",
    updated: "2021-03-22",
    role: "Potassium supports kidney and heart function, nerve transmission and muscle contraction.",
    foods:
      "ODS lists fruit, vegetables, legumes, nuts, dairy, meat and fish as potassium sources.",
    deficiency:
      "Illnesses, substantial losses and some medicines can cause severe low blood potassium. Muscle weakness alone does not diagnose deficiency.",
    excess:
      "Kidney disease and some medicines can raise blood potassium even with usual food intake. Supplements and salt substitutes can also cause dangerous excess.",
    interaction:
      "ACE inhibitors, angiotensin-receptor blockers and potassium-sparing diuretics can raise potassium. Other diuretics can lower it; a clinician should assess the specific medicine.",
    forms: ["Potassium chloride", "Potassium citrate"],
  },
  {
    id: "phosphorus_mg",
    page: "Phosphorus",
    updated: "2021-03-22",
    reviewedAt: "2026-10-07",
    role: "Phosphorus is present in cells, bones and teeth and supports energy production and other chemical processes.",
    foods:
      "ODS lists dairy, grains, meat, eggs, nuts, seeds, legumes and some vegetables; processed foods can also contain phosphate additives.",
    deficiency:
      "Deficiency is rare in the United States; severe malnutrition and certain rare disorders are risk contexts. Symptoms cannot establish a diagnosis here.",
    excess:
      "Severe kidney disease can impair phosphorus removal. This page does not prescribe restriction or interpret blood results.",
    interaction:
      "Some antacids reduce phosphorus absorption. Phosphate-containing laxatives can increase phosphorus, with particular risks in dehydration or kidney disease; seek professional advice.",
    forms: ["Dipotassium phosphate", "Disodium phosphate"],
  },
  {
    id: "copper_mg",
    page: "Copper",
    updated: "2022-10-18",
    reviewedAt: "2026-10-07",
    role: "Copper supports energy production, connective tissue, blood vessels and nervous and immune system functions.",
    foods:
      "ODS lists liver, shellfish, nuts, seeds, chocolate, whole grains, potatoes, mushrooms, avocados, chickpeas and tofu.",
    deficiency:
      "Deficiency is rare in the United States; celiac disease, Menkes disease and high-dose zinc supplementation are risk contexts.",
    excess:
      "Repeated excessive copper exposure can damage the liver and cause gastrointestinal problems. Wilson's disease is a special toxicity-risk context.",
    interaction:
      "ODS identifies no known medication interactions but describes high-dose zinc reducing copper absorption. Discuss supplements and medicines with a clinician or pharmacist.",
    forms: ["Cupric oxide", "Cupric sulfate", "Copper gluconate"],
  },
  {
    id: "manganese_mg",
    page: "Manganese",
    updated: "2021-03-22",
    reviewedAt: "2026-10-07",
    role: "Manganese supports energy production, cellular protection, bones, reproduction, blood clotting and immune function.",
    foods:
      "ODS lists whole grains, shellfish, nuts, legumes, leafy vegetables, some fruit, tea and spices.",
    deficiency:
      "Deficiency is very rare in the United States. Possible effects on growth, bones and skin are education, not a symptom-based diagnosis.",
    excess:
      "Very high manganese levels in drinking water and occupational dust exposure can cause toxicity affecting the nervous system. Exposure contexts are not interchangeable.",
    interaction:
      "ODS identifies no known medicine interactions for manganese but recommends discussing supplement and medication use with health professionals.",
    forms: ["Manganese sulfate", "Manganese aspartate"],
  },
  {
    id: "selenium_ug",
    page: "Selenium",
    updated: "2025-06-18",
    reviewedAt: "2026-10-07",
    role: "Selenium supports thyroid function, reproduction, DNA production and cellular protection.",
    foods:
      "ODS lists seafood, meat, poultry, eggs, dairy, grains, legumes and nuts. Soil selenium affects plant-food composition.",
    deficiency:
      "Dialysis, HIV and diets based on plants grown in low-selenium soil are risk contexts. Deficiency is rare in the United States and Canada.",
    excess:
      "Excess selenium can harm hair, nails and the nervous system; extreme exposure can be severe. US and European upper-limit frameworks differ and are not intake goals.",
    interaction:
      "Cisplatin can lower selenium levels; ODS states that the effect on the body is unclear. Discuss cancer-treatment and supplement decisions with the treating team.",
    forms: ["Selenomethionine", "Sodium selenite", "Sodium selenate"],
  },
  {
    id: "vitamin_e_mg",
    page: "VitaminE",
    updated: "2021-03-22",
    reviewedAt: "2026-10-07",
    role: "Vitamin E is a fat-soluble nutrient with antioxidant and immune functions.",
    foods:
      "ODS lists vegetable oils, nuts, seeds, some green vegetables and fortified foods.",
    deficiency:
      "Deficiency is rare in healthy people and is often linked to impaired fat digestion or absorption; it can affect nerves and muscles.",
    excess:
      "High-dose supplemental vitamin E can increase bleeding risk. A physiological role does not establish that supplements improve health or training outcomes.",
    interaction:
      "Vitamin E supplements can increase bleeding risk with anticoagulant or antiplatelet medicines and may affect chemotherapy or radiation treatment. Seek professional review.",
    forms: ["d-alpha-tocopherol", "dl-alpha-tocopherol"],
  },
  {
    id: "vitamin_k_ug",
    page: "VitaminK",
    updated: "2021-03-22",
    reviewedAt: "2026-10-07",
    role: "Vitamin K contributes to blood clotting and healthy bones. Its forms should not be treated as interchangeable composition measurements.",
    foods:
      "ODS lists leafy vegetables, vegetable oils, some fruit, meat, cheese, eggs and soybeans.",
    deficiency:
      "Severe deficiency can cause bruising and bleeding. Malabsorption and bariatric surgery are risk contexts; this page cannot diagnose deficiency.",
    excess:
      "ODS reports no demonstrated harm from vitamin K itself, but serious medicine interactions remain possible; this does not authorise unrestricted supplementation.",
    interaction:
      "Warfarin has a serious vitamin K interaction: sudden intake changes can be dangerous. Antibiotics, bile acid sequestrants and orlistat can also affect availability. Do not change medicines here.",
    forms: ["Phylloquinone", "Phytonadione", "Menaquinone-4", "Menaquinone-7"],
  },
] as const;
const sourceIds = ["nih_ods_fact_sheets"] as const;
const additions = definitions.map((d) => {
  const recordReviewedAt = "reviewedAt" in d ? d.reviewedAt : reviewedAt;
  const seed = identities.find((r) => r.id === d.id);
  if (!seed) throw Error(`Unknown immutable nutrient identity ${d.id}`);
  const claims = (
    [
      ["function", d.role],
      ["food_source", d.foods],
      ["deficiency", d.deficiency],
      ["excess", d.excess],
      ["interaction", d.interaction],
      ...("absorption" in d ? [["absorption", d.absorption] as const] : []),
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
      id: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, ""),
      name,
      relationship: "supplement_form",
      sourceIds,
    })),
    referenceValues: [],
    absorptionFactors:
      "absorption" in d
        ? [
            {
              factorType: "form_difference",
              direction: "context_dependent",
              description: d.absorption,
              sourceIds,
            },
          ]
        : seed.absorptionFactors,
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
        accessedAt: recordReviewedAt,
        notes: `Individually read consumer page; source updated ${d.updated}. No numeric intake rows imported. See the source for framework-specific recommendations.`,
      },
    ],
    editorial: {
      reviewStatus: "approved",
      reviewedAt: recordReviewedAt,
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
