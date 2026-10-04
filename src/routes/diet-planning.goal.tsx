import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { DietPlanner } from "../features/diet-planning/workspace";
export const Route = createFileRoute("/diet-planning/goal")({
  head: () => ({
    ...metadataFor("/diet-planning/goal"),
    meta: [
      ...metadataFor("/diet-planning/goal").meta,
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return <DietPlanner step="goal" />;
}
