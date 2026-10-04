import { createFileRoute } from "@tanstack/react-router";
import { NutrientComparison } from "../features/nutrients/compare";
import { getNutrientById } from "../features/nutrients/repository";
export const Route = createFileRoute("/nutrients_/compare")({
  validateSearch: (input: Record<string, unknown>) => ({
    topics: typeof input.topics === "string" ? input.topics.slice(0, 1000) : "",
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const ids = deps.topics.split(",").filter(Boolean);
    if (ids.length < 2 || ids.length > 4 || new Set(ids).size !== ids.length)
      return { records: [], invalid: true };
    const records = await Promise.all(ids.map(getNutrientById));
    return {
      records: records.filter((r) => r !== undefined),
      invalid: records.some((r) => !r),
    };
  },
  head: () => ({
    meta: [
      { title: "Compare nutrient concepts | Fitness OS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  return <NutrientComparison {...Route.useLoaderData()} />;
}
