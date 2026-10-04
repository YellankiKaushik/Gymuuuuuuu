import { createFileRoute } from "@tanstack/react-router";
import { NutrientFrameworks } from "../features/nutrients/information";
export const Route = createFileRoute("/nutrients_/frameworks")({
  head: () => ({ meta: [{ title: "Reference frameworks | Fitness OS" }] }),
  component: NutrientFrameworks,
});
