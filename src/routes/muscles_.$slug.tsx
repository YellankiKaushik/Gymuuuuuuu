import { createFileRoute } from "@tanstack/react-router";
import { MuscleDetail } from "../features/muscles/detail";
import { loadMuscleBySlug } from "../features/muscles/detail-loader";
import { appConfig } from "../config/app";
export const Route = createFileRoute("/muscles_/$slug")({
  loader: ({ params }) => loadMuscleBySlug(params.slug),
  head: ({ loaderData: record }) => {
    return {
      meta: [
        {
          title: `${record?.displayName ?? "Muscle not available"} | ${appConfig.name}`,
        },
        {
          name: "description",
          content:
            record?.summary ?? "The requested anatomy record is unavailable.",
        },
        ...(!record ? [{ name: "robots", content: "noindex" }] : []),
      ],
      links: record
        ? [
            {
              rel: "canonical",
              href: new URL(`/muscles/${record.slug}`, appConfig.origin).href,
            },
          ]
        : [],
    };
  },
  component: Page,
});
function Page() {
  return <MuscleDetail record={Route.useLoaderData()} />;
}
