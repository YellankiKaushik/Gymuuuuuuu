import { createFileRoute } from "@tanstack/react-router";
import { NutrientCatalogue } from "../features/nutrients/catalogue";
import { parseNutrientQuery } from "../features/nutrients/query";
import { nutrientReference } from "../features/nutrients/schema";
import { NotFoundState } from "../components/common/states";
export const Route = createFileRoute("/nutrients_/categories_/$groupId")({
  validateSearch: parseNutrientQuery,
  head: ({ params }) => {
    const group = nutrientReference.groups.find((g) => g.id === params.groupId);
    return {
      meta: [
        { title: `${group?.label ?? "Group not available"} | Fitness OS` },
        ...(!group ? [{ name: "robots", content: "noindex" }] : []),
      ],
    };
  },
  component: Page,
});
function Page() {
  const group = Route.useParams().groupId,
    query = Route.useSearch(),
    navigate = Route.useNavigate();
  return nutrientReference.groups.some((g) => g.id === group) ? (
    <NutrientCatalogue
      query={{ ...query, group }}
      onChange={(next) => {
        void navigate({ to: "/nutrients", search: next });
      }}
    />
  ) : (
    <NotFoundState />
  );
}
