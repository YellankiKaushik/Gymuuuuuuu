import { createFileRoute } from "@tanstack/react-router";
import { FoodCategories } from "../features/foods/information";
export const Route = createFileRoute("/foods_/categories")({
  head: () => ({ meta: [{ title: "Food categories | Fitness OS" }] }),
  component: FoodCategories,
});
