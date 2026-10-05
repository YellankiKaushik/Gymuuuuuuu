import { loadPublicRecipe } from "../features/recipes-meal-plans/public.functions";
import { createFileRoute } from "@tanstack/react-router";
import { RecipePage } from "../features/recipes-meal-plans/pages";
import { PublicRecipeDetail } from "../features/recipes-meal-plans/public-pages";
export const Route = createFileRoute("/recipes_/$slug")({
  loader: ({ params }) => loadPublicRecipe({ data: { slug: params.slug } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.version.title ?? "Recipe unavailable"} | Fitness OS`,
      },
      { name: "robots", content: loaderData ? "index,follow" : "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <RecipePage title="Recipe detail">
      <PublicRecipeDetail recipe={Route.useLoaderData()} />
    </RecipePage>
  );
}
