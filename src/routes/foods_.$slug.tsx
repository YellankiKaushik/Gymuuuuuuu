import { createFileRoute } from "@tanstack/react-router";
import { FoodDetail } from "../features/foods/detail";
import { getFoodBySlug } from "../features/foods/repository";
import { appConfig } from "../config/app";
export const Route = createFileRoute("/foods_/$slug")({
  validateSearch: (input: Record<string, unknown>) => ({
    profile: typeof input.profile === "string" ? input.profile : "",
  }),
  loaderDeps: ({search})=>search,
  loader: async ({ params,deps }) => {const food=await getFoodBySlug(params.slug);return deps.profile && !food?.compositionProfiles.some(p=>p.profileId===deps.profile&&p.review.status==='approved') ? undefined : food},
  head: ({ loaderData: food }) => ({
    meta: [
      {
        title: `${food?.canonicalName ?? "Food not available"} | ${appConfig.name}`,
      },
      {
        name: "description",
        content: food?.description ?? "Source-reviewed food composition.",
      },
      ...(!food ? [{ name: "robots", content: "noindex" }] : []),
    ],
    links: food
      ? [
          {
            rel: "canonical",
            href: new URL(`/foods/${food.slug}`, appConfig.origin).href,
          },
        ]
      : [],
  }),
  component: Page,
});
function Page() {
  return (
    <FoodDetail
      key={`${Route.useParams().slug}:${Route.useSearch().profile}`}
      food={Route.useLoaderData()}
      initialProfile={Route.useSearch().profile}
    />
  );
}
