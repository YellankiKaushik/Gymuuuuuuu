import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { DietPlanner } from "../features/diet-planning/workspace";
export const Route = createFileRoute("/diet-planning/meal-distribution")({
  head: () => ({
    ...metadataFor("/diet-planning/meal-distribution"),
    meta: [
      ...metadataFor("/diet-planning/meal-distribution").meta,
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return <DietPlanner step="meal-distribution" />;
}
