import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { DietOverview } from "../features/diet-planning/pages";
export const Route = createFileRoute("/diet-planning/")({
  head: () => ({
    ...metadataFor("/diet-planning"),
    meta: [
      ...metadataFor("/diet-planning").meta,
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return <DietOverview />;
}
