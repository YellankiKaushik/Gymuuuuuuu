import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryOverview } from "../features/recovery/pages";
export const Route = createFileRoute("/recovery")({
  head: () => recoveryMetadata("/recovery"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Recovery">
      <RecoveryOverview />
    </RecoveryPage>
  );
}
