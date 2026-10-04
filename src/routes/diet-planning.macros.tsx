import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { DietPlanner } from "../features/diet-planning/workspace";
export const Route = createFileRoute("/diet-planning/macros")({
  head: () => ({
    ...metadataFor("/diet-planning/macros"),
    meta: [
      ...metadataFor("/diet-planning/macros").meta,
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return <DietPlanner step="macros" />;
}
