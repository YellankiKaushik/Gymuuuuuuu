import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryHistory } from "../features/recovery/pages";
export const Route = createFileRoute("/recovery_/history")({
  head: () => recoveryMetadata("/recovery/history"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Recovery history">
      <RecoveryHistory kind="checkin" />
    </RecoveryPage>
  );
}
