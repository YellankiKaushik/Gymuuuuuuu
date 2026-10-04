import { createFileRoute } from "@tanstack/react-router";
import { NutritionDayPage } from "../features/nutrition-tracker/pages";
export const Route = createFileRoute("/nutrition/day/$date")({
  component: Page,
});
function Page() {
  const { date } = Route.useParams();
  return <NutritionDayPage selectedDate={date} />;
}
