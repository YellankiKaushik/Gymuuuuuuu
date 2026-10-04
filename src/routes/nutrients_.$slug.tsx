import { createFileRoute } from "@tanstack/react-router";
import { NutrientDetail } from "../features/nutrients/detail";
import {
  getNutrientBySlug,
  loadFoodRankings,
} from "../features/nutrients/repository";
import { appConfig } from "../config/app";
export const Route = createFileRoute("/nutrients_/$slug")({
  loader: async ({ params }) => {
    const record = await getNutrientBySlug(params.slug);
    return {
      record,
      rankings: record ? await loadFoodRankings(record.id) : [],
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.record?.canonicalName ?? "Nutrient not available"} | ${appConfig.name}`,
      },
      {
        name: "description",
        content:
          loaderData?.record?.summary ?? "Source-reviewed nutrient education.",
      },
      ...(!loaderData?.record ? [{ name: "robots", content: "noindex" }] : []),
    ],
    links: loaderData?.record
      ? [
          {
            rel: "canonical",
            href: new URL(
              `/nutrients/${loaderData.record.slug}`,
              appConfig.origin,
            ).href,
          },
        ]
      : [],
  }),
  component: Page,
});
function Page() {
  return (
    <NutrientDetail key={Route.useParams().slug} {...Route.useLoaderData()} />
  );
}
