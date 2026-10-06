import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/common/page-header";
import { loadPublicTemplate } from "../features/recipes-meal-plans/public.functions";
import { PublicTemplateDetail } from "../features/recipes-meal-plans/public-template-page";
export const Route = createFileRoute("/meal-plans_/templates_/$templateSlug")({
  loader: ({ params }) =>
    loadPublicTemplate({ data: { slug: params.templateSlug } }),
  head: () => ({ meta: [{ title: "Meal-prep collection | Fitness OS" }] }),
  component: Page,
});
function Page() {
  return (
    <div className="page recipe-page">
      <PageHeader
        title="Meal-prep collection"
        description="Exact public recipe versions; personal-use review."
      />
      <a href="/meal-plans/templates">All collections</a>
      <PublicTemplateDetail template={Route.useLoaderData()} />
    </div>
  );
}
