import { loadPublicRecipeSummaries } from "../features/recipes-meal-plans/public.functions";
import { createFileRoute } from "@tanstack/react-router";
import { RecipePage } from "../features/recipes-meal-plans/pages";
import { RecipeCatalogue } from "../features/recipes-meal-plans/pages";
import { PublicRecipeCatalogue } from "../features/recipes-meal-plans/public-pages";
export const Route = createFileRoute("/recipes")({
  loader: () => loadPublicRecipeSummaries(),
  head: () => ({
    meta: [
      { title: "Meals & recipes | Fitness OS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <RecipePage title="Meals & recipes">
      <PublicRecipeCatalogue recipes={Route.useLoaderData()} />
      <RecipeCatalogue />
    </RecipePage>
  );
}
