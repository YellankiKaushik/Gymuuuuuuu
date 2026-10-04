import { metadataFor } from "../lib/route-metadata";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { NutrientCatalogue } from "../features/nutrients/catalogue";
import { parseNutrientQuery } from "../features/nutrients/query";
export const Route = createFileRoute("/nutrients")({
  head: () => metadataFor("/nutrients"),
  validateSearch: parseNutrientQuery,
  search: { middlewares: [stripSearchParams(parseNutrientQuery({}))] },
  component: Page,
});
function Page() {
  const query = Route.useSearch(),
    navigate = Route.useNavigate();
  return (
    <NutrientCatalogue
      query={query}
      onChange={(next) => {
        void navigate({ search: next, replace: true });
      }}
    />
  );
}
