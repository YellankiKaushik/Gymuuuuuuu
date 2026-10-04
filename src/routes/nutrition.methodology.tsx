import { createFileRoute } from "@tanstack/react-router";
import { NutritionInformationPage } from "../features/nutrition-tracker/pages";
export const Route = createFileRoute("/nutrition/methodology")({
  component: () => <NutritionInformationPage />,
});
