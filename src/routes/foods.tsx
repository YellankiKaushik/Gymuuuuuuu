import { metadataFor } from "../lib/route-metadata";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { FoodCatalogue } from "../features/foods/catalogue";
import { parseFoodQuery } from "../features/foods/query";
export const Route = createFileRoute("/foods")({
  head: () => metadataFor("/foods"),
  validateSearch: parseFoodQuery,
  search: { middlewares: [stripSearchParams(parseFoodQuery({}))] },
  component: Page,
});
function Page() {
  const query = Route.useSearch(),
    navigate = Route.useNavigate();
  return (
    <FoodCatalogue
      query={query}
      onChange={(next) => {
        void navigate({ search: next, replace: true });
      }}
    />
  );
}
