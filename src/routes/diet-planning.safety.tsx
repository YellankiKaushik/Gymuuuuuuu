import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { DietInformation } from "../features/diet-planning/pages";
export const Route = createFileRoute("/diet-planning/safety")({
  head: () => ({
    ...metadataFor("/diet-planning/safety"),
    meta: [
      ...metadataFor("/diet-planning/safety").meta,
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return <DietInformation kind="safety" />;
}
