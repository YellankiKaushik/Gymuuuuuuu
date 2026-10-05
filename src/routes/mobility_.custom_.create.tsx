import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RoutineBuilder } from "../features/recovery/routines";
export const Route = createFileRoute("/mobility_/custom_/create")({
  head: () => recoveryMetadata("/mobility/custom/create"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Build a local routine">
      <RoutineBuilder />
    </RecoveryPage>
  );
}
