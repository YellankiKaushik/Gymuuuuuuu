import { createFileRoute } from "@tanstack/react-router";
import { FoodSources } from "../features/foods/information";
export const Route = createFileRoute("/foods_/sources")({
  head: () => ({ meta: [{ title: "Food composition sources | Fitness OS" }] }),
  component: FoodSources,
});
