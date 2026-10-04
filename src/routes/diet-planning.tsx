import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { Outlet } from "@tanstack/react-router";
import {
  DietWorkspaceProvider,
  DietNavigation,
} from "../features/diet-planning/workspace";
export const Route = createFileRoute("/diet-planning")({
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
  return (
    <DietWorkspaceProvider>
      <DietNavigation />
      <Outlet />
    </DietWorkspaceProvider>
  );
}
