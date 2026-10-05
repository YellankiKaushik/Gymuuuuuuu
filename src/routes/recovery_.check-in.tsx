import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryCheckIn } from "../features/recovery/pages";
export const Route = createFileRoute("/recovery_/check-in")({
  head: () => recoveryMetadata("/recovery/check-in"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Daily recovery check-in">
      <RecoveryCheckIn />
    </RecoveryPage>
  );
}
