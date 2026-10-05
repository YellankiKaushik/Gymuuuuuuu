import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryHistory } from "../features/recovery/pages";
export const Route = createFileRoute("/sleep_/history")({
  head: () => recoveryMetadata("/sleep/history"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Sleep history">
      <RecoveryHistory kind="sleep" />
    </RecoveryPage>
  );
}
