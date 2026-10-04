import { createFileRoute } from "@tanstack/react-router";
import { FoodMethodology } from "../features/foods/information";
export const Route = createFileRoute("/foods_/methodology")({
  head: () => ({ meta: [{ title: "Food data methodology | Fitness OS" }] }),
  component: FoodMethodology,
});
