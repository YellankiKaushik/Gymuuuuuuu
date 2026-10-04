import { createFileRoute } from "@tanstack/react-router";
import { CustomFoodPage } from "../features/nutrition-tracker/pages";
export const Route = createFileRoute("/nutrition/custom-foods/")({
  component: () => <CustomFoodPage />,
});
