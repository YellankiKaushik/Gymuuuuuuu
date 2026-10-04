import { createFileRoute } from "@tanstack/react-router";
import { NutritionDayPage } from "../features/nutrition-tracker/pages";
export const Route = createFileRoute("/nutrition/")({
  component: () => <NutritionDayPage />,
});
