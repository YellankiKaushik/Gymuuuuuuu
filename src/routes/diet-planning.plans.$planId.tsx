import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { DietPlans } from "../features/diet-planning/pages";
export const Route = createFileRoute("/diet-planning/plans/$planId")({
  head: () => ({
    ...metadataFor("/diet-planning/plans/$planId"),
    meta: [
      ...metadataFor("/diet-planning/plans/$planId").meta,
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return <DietPlans planId={Route.useParams().planId} />;
}
