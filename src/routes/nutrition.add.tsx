import { createFileRoute } from "@tanstack/react-router";
import { NutritionAddPage } from "../features/nutrition-tracker/pages";
export const Route = createFileRoute("/nutrition/add")({
  component: () => <NutritionAddPage />,
});
