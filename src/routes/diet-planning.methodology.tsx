import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { DietInformation } from "../features/diet-planning/pages";
export const Route = createFileRoute("/diet-planning/methodology")({
  head: () => ({
    ...metadataFor("/diet-planning/methodology"),
    meta: [
      ...metadataFor("/diet-planning/methodology").meta,
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return <DietInformation kind="methodology" />;
}
