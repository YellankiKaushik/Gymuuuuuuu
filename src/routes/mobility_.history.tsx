import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { MobilityHistory } from "../features/recovery/routines";
export const Route = createFileRoute("/mobility_/history")({
  head: () => recoveryMetadata("/mobility/history"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Mobility history">
      <MobilityHistory />
    </RecoveryPage>
  );
}
