import { createFileRoute } from "@tanstack/react-router";
import { PersonalPlanEditor } from "../features/visual-training/plan-editor";
export const Route = createFileRoute("/workout_/plans")({
  head: () => ({
    meta: [
      { title: "Personal workout plans | Fitness OS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PersonalPlanEditor,
});
