import { createFileRoute, Outlet } from "@tanstack/react-router";
import { NutritionProvider } from "../features/nutrition-tracker/workspace";
import { NutritionLayoutNav } from "../features/nutrition-tracker/pages";
export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition diary | Fitness OS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <NutritionProvider>
      <NutritionLayoutNav />
      <Outlet />
    </NutritionProvider>
  ),
});
