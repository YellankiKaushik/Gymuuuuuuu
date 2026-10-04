import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { DietPlans } from "../features/diet-planning/pages";
export const Route = createFileRoute("/diet-planning/plans/")({
  head: () => ({
    ...metadataFor("/diet-planning/plans"),
    meta: [
      ...metadataFor("/diet-planning/plans").meta,
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return <DietPlans />;
}
