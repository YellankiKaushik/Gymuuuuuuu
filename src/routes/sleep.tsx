import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryOverview } from "../features/recovery/pages";
export const Route = createFileRoute("/sleep")({
  head: () => recoveryMetadata("/sleep"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Sleep">
      <RecoveryOverview sleepOnly />
    </RecoveryPage>
  );
}
