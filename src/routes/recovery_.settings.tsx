import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoverySettingsPage } from "../features/recovery/info-pages";
export const Route = createFileRoute("/recovery_/settings")({
  head: () => recoveryMetadata("/recovery/settings"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Recovery backup and settings">
      <RecoverySettingsPage />
    </RecoveryPage>
  );
}
