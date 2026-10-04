import { createFileRoute } from "@tanstack/react-router";
import { CustomFoodPage } from "../features/nutrition-tracker/pages";
export const Route = createFileRoute("/nutrition/custom-foods/$customFoodId")({
  component: Page,
});
function Page() {
  const { customFoodId } = Route.useParams();
  return <CustomFoodPage selectedId={customFoodId} />;
}
