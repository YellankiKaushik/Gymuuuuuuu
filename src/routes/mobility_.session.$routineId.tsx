import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RoutinePlayer } from "../features/recovery/routines";
export const Route = createFileRoute("/mobility_/session/$routineId")({
  head: () => recoveryMetadata("/mobility/session/$routineId"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Routine session">
      <RoutinePlayer routineId={Route.useParams().routineId} />
    </RecoveryPage>
  );
}
