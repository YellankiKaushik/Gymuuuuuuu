import { createFileRoute } from "@tanstack/react-router";
import { NutrientGlossary } from "../features/nutrients/information";
export const Route = createFileRoute("/nutrients_/glossary")({
  head: () => ({
    meta: [{ title: "Nutrient reference glossary | Fitness OS" }],
  }),
  component: NutrientGlossary,
});
