import { createFileRoute } from "@tanstack/react-router";
import { FoodComparison } from "../features/foods/compare";
import { getFoodProfile } from "../features/foods/repository";
export const Route = createFileRoute("/foods_/compare")({
  validateSearch: (input: Record<string, unknown>) => ({
    profiles:
      typeof input.profiles === "string" ? input.profiles.slice(0, 1000) : "",
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const ids = deps.profiles.split(",").filter(Boolean);
    if (ids.length < 2 || ids.length > 4 || new Set(ids).size !== ids.length)
      return { columns: [], invalid: true };
    const results = await Promise.all(ids.map(getFoodProfile));
    return {
      columns: results.filter((r) => r !== undefined),
      invalid: results.some((r) => !r),
    };
  },
  head: () => ({
    meta: [
      { title: "Compare food profiles | Fitness OS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return <FoodComparison {...Route.useLoaderData()} />;
}
