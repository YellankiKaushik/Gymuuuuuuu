import { createFileRoute } from "@tanstack/react-router";
import { NutritionHistoryPage } from "../features/nutrition-tracker/pages";
export const Route = createFileRoute("/nutrition/history")({
  component: () => <NutritionHistoryPage />,
});
