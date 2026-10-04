import { createFileRoute } from "@tanstack/react-router";
import { FoodCatalogue } from "../features/foods/catalogue";
import { foodReference } from "../features/foods/schema";
import { parseFoodQuery } from "../features/foods/query";
import { NotFoundState } from "../components/common/states";
export const Route = createFileRoute("/foods_/categories_/$categoryId")({
  validateSearch: parseFoodQuery,
  head: ({ params }) => {
    const category = foodReference.foodCategories.find(
      (c) => c.id === params.categoryId,
    );
    return {
      meta: [
        {
          title: `${category?.label ?? "Category not available"} | Fitness OS`,
        },
        ...(!category ? [{ name: "robots", content: "noindex" }] : []),
      ],
    };
  },
  component: Page,
});
function Page() {
  const category = Route.useParams().categoryId,
    query = Route.useSearch(),
    navigate = Route.useNavigate();
  if (!foodReference.foodCategories.some((c) => c.id === category))
    return <NotFoundState />;
  return (
    <FoodCatalogue
      query={{ ...query, category }}
      onChange={(next) => {
        void navigate({ to: "/foods", search: next, replace: true });
      }}
    />
  );
}
