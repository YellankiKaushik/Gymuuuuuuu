import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { DietPlanner } from "../features/diet-planning/workspace";
export const Route = createFileRoute("/diet-planning/energy")({
  head: () => ({
    ...metadataFor("/diet-planning/energy"),
    meta: [
      ...metadataFor("/diet-planning/energy").meta,
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return <DietPlanner step="energy" />;
}
