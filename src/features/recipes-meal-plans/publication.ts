import { z } from "zod";
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
  })
  .refine(
    (t) => t.energyBandKcal[0] <= t.energyBandKcal[1],
    "Invalid energy band.",
  );
export type PublicRecipe = z.infer<typeof publicRecipeSchema>;
export type PublicTemplate = z.infer<typeof publicTemplateSchema>;
export const publicTemplates: readonly PublicTemplate[] = [];
export function validatePublicRelease(
  recipes: readonly PublicRecipe[],
  templates: readonly PublicTemplate[],
) {
  const versions = new Set(
    recipes.map((r) => publicRecipeSchema.parse(r).version.id),
  );
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
  templates: readonly PublicTemplate[] = publicTemplates,
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
        (!query.equipment ||
          t.equipment.every((e) => query.equipment!.includes(e))),
    )
    .map((template) => ({
      template,
      reasons: [
        `Reviewed ${template.plan.dayCount}-day template`,
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
