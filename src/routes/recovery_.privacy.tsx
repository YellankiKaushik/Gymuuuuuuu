import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryPrivacy } from "../features/recovery/info-pages";
export const Route = createFileRoute("/recovery_/privacy")({
  head: () => recoveryMetadata("/recovery/privacy"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Recovery privacy">
      <RecoveryPrivacy />
    </RecoveryPage>
  );
}
