import { createFileRoute } from "@tanstack/react-router";
import { ReferenceExplorer } from "../features/nutrients/explorer";
export const Route = createFileRoute("/nutrients_/reference-intakes")({
  validateSearch: (input: Record<string, unknown>) => ({
    framework:
      typeof input.framework === "string" ? input.framework.slice(0, 100) : "",
  }),
  head: () => ({ meta: [{ title: "Reference Intake Explorer | Fitness OS" }] }),
  component: Page,
});
function Page() {
  return (
    <ReferenceExplorer
      key={Route.useSearch().framework}
      initialFramework={Route.useSearch().framework}
    />
  );
}
