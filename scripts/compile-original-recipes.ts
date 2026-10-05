import { readFileSync, writeFileSync, renameSync } from "node:fs";
import foodsJson from "../src/content/foods/records.json";
import { foodSchema } from "../src/features/foods/schema";
import {
  createCanonicalFoodLogSnapshot,
  exactMassAmount,
} from "../src/features/nutrition-tracker/domain";
import { ingredientFromFoodEntry } from "../src/features/recipes-meal-plans/domain";
import { recipeDraft } from "../src/features/recipes-meal-plans/editor";
import { recipeVersionSchema } from "../src/features/recipes-meal-plans/schema";
import {
  publicRecipeSchema,
  validatePublicRelease,
} from "../src/features/recipes-meal-plans/publication";
const foods = foodSchema.array().parse(foodsJson),
  now = "2026-10-05T14:21:40Z";
const reviewer =
  "Codex machine calculation and source verification; personal use; no human review";
const recipes: readonly {
  slug: string;
  title: string;
  ingredients: readonly [string, number, string?][];
}[] = [
  {
    slug: "chickpea-cucumber-bowl",
    title: "Chickpea and cucumber bowl",
    ingredients: [
      ["chickpea", 150, "boiled"],
      ["cucumber", 100],
      ["carrot", 50],
    ],
  },
  {
    slug: "potato-cucumber-bowl",
    title: "Potato and cucumber bowl",
    ingredients: [
      ["potato", 180],
      ["cucumber", 100],
      ["carrot", 40],
    ],
  },
  {
    slug: "rice-chickpea-bowl",
    title: "Rice and chickpea bowl",
    ingredients: [
      ["white_rice", 150],
      ["chickpea", 120, "boiled"],
      ["cucumber", 80],
    ],
  },
  {
    slug: "chickpea-carrot-salad",
    title: "Chickpea and carrot salad",
    ingredients: [
      ["chickpea", 150, "boiled"],
      ["carrot", 80],
      ["cucumber", 50],
    ],
  },
  {
    slug: "apple-banana-bowl",
    title: "Apple and banana bowl",
    ingredients: [
      ["apple", 100],
      ["banana", 100],
    ],
  },
  {
    slug: "mango-pineapple-bowl",
    title: "Mango and pineapple bowl",
    ingredients: [
      ["mango", 100],
      ["pineapple", 120],
    ],
  },
  {
    slug: "strawberry-banana-bowl",
    title: "Strawberry and banana bowl",
    ingredients: [
      ["strawberry", 120],
      ["banana", 80],
    ],
  },
  {
    slug: "pear-apple-bowl",
    title: "Pear and apple bowl",
    ingredients: [
      ["pear", 100],
      ["apple", 100],
    ],
  },
  {
    slug: "watermelon-pomegranate-bowl",
    title: "Watermelon and pomegranate bowl",
    ingredients: [
      ["watermelon", 160],
      ["pomegranate", 60],
    ],
  },
  {
    slug: "pineapple-raspberry-bowl",
    title: "Pineapple and raspberry bowl",
    ingredients: [
      ["pineapple", 120],
      ["raspberry", 60],
    ],
  },
  {
    slug: "mandarin-mango-bowl",
    title: "Mandarin and mango bowl",
    ingredients: [
      ["mandarin", 100],
      ["mango", 100],
    ],
  },
  {
    slug: "cucumber-carrot-salad",
    title: "Cucumber and carrot salad",
    ingredients: [
      ["cucumber", 150],
      ["carrot", 80],
    ],
  },
];
const output = recipes.map((def) => {
  const ingredients = def.ingredients.map(([slug, grams, state], order) => {
    const food = foods.find((f) => f.id === `food_${slug}`);
    const profile = food?.compositionProfiles.find(
      (p) => !state || p.foodState === state,
    );
    if (!food || !profile)
      throw Error(`Unresolved original recipe ingredient ${slug}:${state}`);
    const entry = createCanonicalFoodLogSnapshot(
      food,
      profile.profileId,
      exactMassAmount(grams, "g"),
      {
        localDate: "2026-10-05",
        occurredAtUtc: now,
        timeZone: "UTC",
        mealSlotId: "meal_lunch",
        mealLabelSnapshot: "Public recipe compilation",
        now,
      },
    );
    const line = ingredientFromFoodEntry(entry, order);
    return { ...line, id: `ing_${def.slug.replaceAll("-", "_")}_${order}` };
  });
  const mass = def.ingredients.reduce((sum, i) => sum + i[1], 0);
  const draft = recipeDraft(def.title, ingredients, {
    recipeId: `recipe_${def.slug.replaceAll("-", "_")}`,
    instructions:
      "Use the exact listed food profiles. Weigh edible portions after peeling or removing inedible parts as appropriate to the source description.\nFor boiled ingredients, weigh the already cooked food; raw quantities are not interchangeable. Chop the ready-to-use ingredients and combine in a bowl.\nThe listed batch is one serving. Actual final mass is unmeasured; weigh your own batch before logging a measured yield.",
    cookingMethod: "no_cook",
    allowUnadjustedRetention: false,
    yieldModel: {
      mode: "estimated_sum_ingredients",
      preCookingEdibleWeightGrams: mass,
      finalWeightGrams: mass,
      servings: 1,
      servingWeightGrams: mass,
      tolerancePercent: 0,
      measuredAt: null,
      note: "Estimated sum of listed edible ingredient masses for assembly only. No final yield or nutrient retention was measured. No thermal cooking or raw-to-cooked conversion is modelled.",
    },
    reason:
      "Original static repository recipe, version 1; source-backed ingredients, no human taste or yield testing.",
  });
  const version = recipeVersionSchema.parse({
    ...draft,
    id: `rver_${def.slug.replaceAll("-", "_")}_v1`,
    createdAt: now,
    source: {
      kind: "original_project_recipe",
      title: def.title,
      authorOrPublisher: "Fitness OS repository",
      licenceStatus: "user_owned",
      licenceText:
        "Original repository instructions and ingredient arrangement. USDA composition remains CC0 with attribution.",
      reviewedAt: now,
      reviewer,
    },
    instructions: draft.instructions.map((s, i) => ({
      ...s,
      id: `step_${def.slug.replaceAll("-", "_")}_${i}`,
    })),
    calculation: { ...draft.calculation, calculatedAt: now },
    tags: {
      ...draft.tags,
      mealTypes: ["snack"],
      equipment: ["bowl", "kitchen scale"],
      cuisines: ["original repository assembly"],
    },
    allergenInfo: [
      {
        tag: "allergens",
        state: "unknown",
        basis:
          "Ingredient labels, individual allergies and cross-contact are not verified. This is not an allergen-free claim. Machine review preserves this uncertainty.",
      },
    ],
  });
  return {
    id: `public_recipe_${def.slug.replaceAll("-", "_")}`,
    slug: def.slug,
    status: "published",
    version,
    sourceRefs: [
      ...new Set(
        ingredients.flatMap(
          (i) =>
            i.sourceSnapshot?.sourceRecords?.map((s) => s.sourceRecordId) ?? [],
        ),
      ),
    ],
    review: {
      status: "approved",
      reviewer,
      reviewedAt: now,
      dietaryAndAllergenReviewed: true,
      reuseRightsReviewed: true,
    },
  };
});
// Caller publication validator parses the complete release; source ingredients are validated before writing.
const release = publicRecipeSchema.array().parse(output);
validatePublicRelease(release, []);
const path = "src/content/recipes/records.json",
  value = JSON.stringify(release, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== value)
    throw Error("Original recipe release is stale.");
} else {
  writeFileSync(`${path}.tmp`, value);
  renameSync(`${path}.tmp`, path);
}
console.log(
  `Original recipes compiled: ${output.length}. Final yields remain explicitly estimated.`,
);
