// Repository-owned public content only. Never import a personal storage adapter here.
import records from "../../content/recipes/records.json";
import { publicRecipeSchema, type PublicRecipe } from "./publication";
export const publicRecipes: readonly PublicRecipe[] = publicRecipeSchema
  .array()
  .parse(records);
export function publicRecipeSummaries() {
  return publicRecipes.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.version.title,
    ingredients: r.version.ingredients.map((i) => ({
      grams: i.gramWeight,
      name: i.displayNameSnapshot,
    })),
    grade: r.version.calculation.grade,
    coverage: r.version.calculation.status,
  }));
}
export type PublicRecipeSummary = ReturnType<
  typeof publicRecipeSummaries
>[number];
