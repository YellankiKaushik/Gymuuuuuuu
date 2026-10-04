import { createFileRoute } from "@tanstack/react-router";
import { NutritionSettingsPage } from "../features/nutrition-tracker/pages";
export const Route = createFileRoute("/nutrition/settings")({
  component: () => <NutritionSettingsPage />,
});
