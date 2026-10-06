import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/common/page-header";
import { RecipeTemplates } from "../features/recipes-meal-plans/info-pages";
import { loadPublicTemplates } from "../features/recipes-meal-plans/public.functions";
export const Route = createFileRoute("/meal-plans_/templates")({
  loader: () => loadPublicTemplates(),
  head: () => ({ meta: [{ title: "Meal-prep collections | Fitness OS" }] }),
  component: Page,
});
function Page() {
  return (
    <div className="page recipe-page">
      <PageHeader
        title="Meal-prep collections"
        description="Original meal organization examples with source-backed ingredients."
      />
      <RecipeTemplates templates={Route.useLoaderData()} />
    </div>
  );
}
