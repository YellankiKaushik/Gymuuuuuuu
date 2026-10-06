import { z } from "zod";
import { plannedRecipeItem, recalculateMealPlan } from "./domain";
import {
  recipeVersionSchema,
  mealPlanVersionSchema,
  type RecipeVersion,
} from "./schema";
export const publicRecipeSchema = z
  .strictObject({
    id: z.string().regex(/^public_recipe_/),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    status: z.literal("published"),
    version: recipeVersionSchema,
    sourceRefs: z.array(z.string().min(1)).min(1),
    review: z.strictObject({
      status: z.literal("approved"),
      reviewer: z.string().min(1),
      reviewedAt: z.iso.datetime({ offset: true }),
      dietaryAndAllergenReviewed: z.literal(true),
      reuseRightsReviewed: z.literal(true),
    }),
  })
  .superRefine((recipe, ctx) => {
    if (
      recipe.version.source.kind === "user_created" ||
      recipe.version.source.licenceStatus === "not_for_publication" ||
      (recipe.version.source.licenceStatus === "user_owned" &&
        recipe.version.source.kind !== "original_project_recipe") ||
      !recipe.version.source.reviewedAt ||
      !recipe.version.source.reviewer
    )
      ctx.addIssue({
        code: "custom",
        message: "Public recipe needs reviewed authorship and reuse rights.",
      });
    if (
      recipe.version.ingredients.some((i) =>
        ["custom_food", "unresolved_text"].includes(i.kind),
      ) ||
      recipe.version.calculation.status === "unavailable"
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Public recipe requires resolved repository ingredients and usable calculation.",
      });
  });
export const publicTemplateSchema = z
  .strictObject({
    id: z.string().regex(/^template_/),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1).max(200),
    status: z.literal("published"),
    plan: mealPlanVersionSchema,
    recipeVersionIds: z.array(z.string().regex(/^rver_/)).min(1),
    recipeLinks: z
      .array(
        z.strictObject({
          versionId: z.string().regex(/^rver_/),
          slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        }),
      )
      .min(1),
    dietaryTags: z.array(z.string()),
    allergenTags: z.array(z.string()),
    equipment: z.array(z.string()),
    energyBandKcal: z.tuple([z.number().nonnegative(), z.number().positive()]),
    substitutionGuidance: z.string().min(1),
    sourceRefs: z.array(z.string().min(1)).min(1),
    review: z.strictObject({
      reviewer: z.string().min(1),
      reviewedAt: z.iso.datetime({ offset: true }),
      status: z.literal("approved"),
    }),
    limitations: z.array(z.string().min(1)).min(1),
  })
  .refine(
    (t) => t.energyBandKcal[0] <= t.energyBandKcal[1],
    "Invalid energy band.",
  );
export type PublicRecipe = z.infer<typeof publicRecipeSchema>;
export type PublicTemplate = z.infer<typeof publicTemplateSchema>;
export function validatePublicRelease(
  recipes: readonly PublicRecipe[],
  templates: readonly PublicTemplate[],
) {
  const versions = new Set(
    recipes.map((r) => publicRecipeSchema.parse(r).version.id),
  );
  if (
    new Set(templates.map((t) => t.id)).size !== templates.length ||
    new Set(templates.map((t) => t.slug)).size !== templates.length
  )
    throw Error("Duplicate public template IDs or slugs.");
  if (
    new Set(recipes.map((r) => r.id)).size !== recipes.length ||
    new Set(recipes.map((r) => r.slug)).size !== recipes.length
  )
    throw Error("Duplicate public recipe IDs or slugs.");
  for (const template of templates) {
    const t = publicTemplateSchema.parse(template);
    if (
      t.recipeVersionIds.some((id) => !versions.has(id)) ||
      t.plan.plannedItems.some(
        (i) =>
          i.kind !== "recipe" ||
          !i.recipeRef ||
          !versions.has(i.recipeRef.recipeVersionId),
      )
    )
      throw Error("Template references unpublished recipe versions.");
    const actualVersions = [
      ...new Set(t.plan.plannedItems.map((i) => i.recipeRef!.recipeVersionId)),
    ].sort();
    if (
      JSON.stringify(actualVersions) !==
      JSON.stringify([...t.recipeVersionIds].sort())
    )
      throw Error("Template recipe-version manifest disagrees with its menu.");
    if (
      t.recipeLinks.length !== actualVersions.length ||
      new Set(t.recipeLinks.map((r) => r.versionId)).size !==
        actualVersions.length ||
      t.recipeLinks.some(
        (link) =>
          !actualVersions.includes(link.versionId) ||
          !recipes.some(
            (r) => r.version.id === link.versionId && r.slug === link.slug,
          ),
      )
    )
      throw Error("Template recipe links must use the exact canonical slugs.");
    for (const item of t.plan.plannedItems) {
      const recipe = recipes.find(
        (r) => r.version.id === item.recipeRef!.recipeVersionId,
      )!;
      const expected = plannedRecipeItem(
        recipe.version,
        item.quantity,
        item.localDate,
        item.mealSlotId,
      );
      for (const key of [
        "recipeRef",
        "nutrients",
        "gramWeight",
        "completeness",
        "displayNameSnapshot",
      ] as const)
        if (JSON.stringify(item[key]) !== JSON.stringify(expected[key]))
          throw Error(
            "Template snapshot differs from its exact public recipe version.",
          );
      if (item.quantityUnit !== "serving" || item.loggedEntryIds.length)
        throw Error(
          "Public template items must be unconsumed recipe servings.",
        );
      if (
        recipe.version.allergenInfo.some((a) => a.state === "unknown") &&
        !t.allergenTags.includes("unknown")
      )
        throw Error("Template must preserve unknown allergen information.");
    }
    if (
      JSON.stringify(recalculateMealPlan(t.plan).summary) !==
      JSON.stringify(t.plan.summary)
    )
      throw Error("Template nutrition summary is stale.");
    const energy = t.plan.summary.dailySummaries[0]?.nutrients.find(
      (n) => n.nutrientId === "energy_kcal",
    );
    if (
      t.plan.dayCount === 1 &&
      (energy?.value === null ||
        energy?.value === undefined ||
        energy.status !== "complete" ||
        t.energyBandKcal[0] !== Math.floor(energy.value) ||
        t.energyBandKcal[1] !== Math.ceil(energy.value))
    )
      throw Error(
        "Collection energy band must be its rounded calculated total.",
      );
  }
}
export function matchReviewedTemplates(
  query: {
    energyKcal?: number;
    days?: number;
    dietary?: string;
    equipment?: string[];
    excludedAllergens?: string[];
  },
  templates: readonly PublicTemplate[] = [],
) {
  return templates
    .map((raw) => publicTemplateSchema.parse(raw))
    .filter(
      (t) =>
        (!query.days || t.plan.dayCount === query.days) &&
        (!query.dietary || t.dietaryTags.includes(query.dietary)) &&
        (query.energyKcal === undefined ||
          (query.energyKcal >= t.energyBandKcal[0] &&
            query.energyKcal <= t.energyBandKcal[1])) &&
        !t.allergenTags.some((tag) => query.excludedAllergens?.includes(tag)) &&
        // Unknown labels must never be presented as a safe exclusion match.
        !(
          query.excludedAllergens?.length && t.allergenTags.includes("unknown")
        ) &&
        (!query.equipment ||
          t.equipment.every((e) => query.equipment!.includes(e))),
    )
    .map((template) => ({
      template,
      reasons: [
        `Source-validated ${template.plan.dayCount}-day collection; personal-use review`,
        ...(query.energyKcal === undefined
          ? []
          : ["Selected energy falls within the declared band"]),
        ...(query.dietary ? ["Declared dietary tag matches"] : []),
      ],
    }));
}
export function recipeExclusionWarnings(
  recipe: RecipeVersion,
  ingredientIds: readonly string[],
  allergens: readonly string[],
) {
  const ingredientMatches = recipe.ingredients
    .filter((i) =>
      ingredientIds.includes(
        i.canonicalFoodRef?.foodId ??
          i.customFoodRef?.customFoodId ??
          i.displayNameSnapshot,
      ),
    )
    .map((i) => `Excluded ingredient: ${i.displayNameSnapshot}`);
  const allergenMatches = recipe.allergenInfo
    .filter(
      (a) =>
        allergens.includes(a.tag) &&
        ["contains", "may_contain_or_uncertain"].includes(a.state),
    )
    .map((a) => `Declared allergen exclusion: ${a.tag} (${a.state})`);
  return [
    ...ingredientMatches,
    ...allergenMatches,
    ...(recipe.allergenInfo.some((a) => a.state === "unknown") ||
    recipe.ingredients.some(
      (i) =>
        i.dataQualityFlags.includes("allergen_information_unknown") ||
        i.kind === "unresolved_text",
    )
      ? [
          "Allergen or ingredient information is incomplete; exclusion safety is unknown.",
        ]
      : []),
  ];
}
