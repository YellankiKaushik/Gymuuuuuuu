import { createFileRoute } from "@tanstack/react-router";
import { NutrientMethodology } from "../features/nutrients/information";
export const Route = createFileRoute("/nutrients_/methodology")({
  head: () => ({ meta: [{ title: "Nutrient methodology | Fitness OS" }] }),
  component: NutrientMethodology,
});
