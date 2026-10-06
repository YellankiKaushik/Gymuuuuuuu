import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { publicRecipes } from "../src/features/recipes-meal-plans/public-records";
import {
  plannedRecipeItem,
  recalculateMealPlan,
} from "../src/features/recipes-meal-plans/domain";
import { mealPlanDraft } from "../src/features/recipes-meal-plans/editor";
import {
  publicTemplateSchema,
  validatePublicRelease,
} from "../src/features/recipes-meal-plans/publication";
const now = "2026-10-06T05:46:24Z";
// A neutral calendar anchor is required by the existing immutable plan contract.
// It is not a personal record, an intake target or a complete day of eating.
const anchor = "2000-01-01";
const definitions = [
  {
    slug: "rice-chickpea-meal-prep",
    title: "Rice and chickpea meal-prep collection",
    recipes: [
      "rice-chickpea-bowl",
      "cucumber-carrot-salad",
      "apple-banana-bowl",
    ],
  },
  {
    slug: "potato-chickpea-meal-prep",
    title: "Potato and chickpea meal-prep collection",
    recipes: [
      "potato-cucumber-bowl",
      "chickpea-carrot-salad",
      "mango-pineapple-bowl",
    ],
  },
  {
    slug: "chickpea-salad-meal-prep",
    title: "Chickpea salad meal-prep collection",
    recipes: [
      "chickpea-cucumber-bowl",
      "cucumber-carrot-salad",
      "strawberry-banana-bowl",
    ],
  },
] as const;
const templates = definitions.map((def) => {
  const key = def.slug.replaceAll("-", "_");
  const recipes = def.recipes.map((slug) => {
    const recipe = publicRecipes.find((r) => r.slug === slug);
    if (!recipe) throw Error(`Missing exact recipe ${slug}`);
    return recipe;
  });
  const draft = mealPlanDraft(def.title, anchor, 1, "UTC", [
    "meal_lunch",
    "meal_snack",
  ]);
  const plan = recalculateMealPlan({
    ...draft,
    id: `mpver_template_${key}_v1`,
    mealPlanId: `mplan_template_${key}`,
    createdAt: now,
    revisionReason:
      "Original static collection v1; neutral date anchor; not a complete diet",
    plannedItems: recipes.map((r, i) => ({
      ...plannedRecipeItem(
        r.version,
        1,
        anchor,
        i === 2 ? "meal_snack" : "meal_lunch",
      ),
      id: `pitem_template_${key}_${i}`,
    })),
    summary: { ...draft.summary, calculatedAt: now },
  });
  const energy = plan.summary.dailySummaries[0]?.nutrients.find(
    (n) => n.nutrientId === "energy_kcal",
  );
  if (!energy || energy.value === null || energy.status !== "complete")
    throw Error("Template energy must be available for every ingredient.");
  return publicTemplateSchema.parse({
    id: `template_${key}`,
    slug: def.slug,
    title: def.title,
    status: "published",
    plan,
    recipeVersionIds: recipes.map((r) => r.version.id),
    dietaryTags: [],
    allergenTags: ["unknown"],
    recipeLinks: recipes.map((r) => ({
      versionId: r.version.id,
      slug: r.slug,
    })),
    equipment: ["bowl", "kitchen scale"],
    energyBandKcal: [Math.floor(energy.value), Math.ceil(energy.value)],
    substitutionGuidance:
      "Any replacement needs its exact verified food profile and a newly calculated recipe version. A replacement is not nutritionally equivalent by default.",
    sourceRefs: [
      "original_meal_collections_v1",
      ...new Set(recipes.flatMap((r) => r.sourceRefs)),
    ],
    review: {
      reviewer:
        "Codex automated snapshot, calculation and source validation; no human or clinical review",
      reviewedAt: now,
      status: "approved",
    },
    limitations: [
      "Personal-use publication. Original meal organization example; no independent human, taste, yield or clinical review.",
      "Includes lunch and a snack only; not a complete daily diet or a recommendation for energy or nutrient intake.",
      "Energy filter is the calculated collection total rounded down/up to whole kcal, not a personal target or an uncertainty interval.",
      "Ingredient-sum yields are estimated. Missing nutrient values and unknown allergen information remain unknown.",
      "The January 2000 date is a neutral template anchor, not a personal eating record. No consumption is logged by viewing this page.",
    ],
  });
});
validatePublicRelease(publicRecipes, templates);
const path = "src/content/recipes/templates.json",
  value = JSON.stringify(templates, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== value)
    throw Error("Public meal collections are stale.");
} else {
  writeFileSync(`${path}.tmp`, value);
  renameSync(`${path}.tmp`, path);
}
console.log(
  `Compiled ${templates.length} static meal collections; no intake targets or consumption records.`,
);
