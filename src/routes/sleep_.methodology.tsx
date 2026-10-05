import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { SleepMethodology } from "../features/recovery/info-pages";
export const Route = createFileRoute("/sleep_/methodology")({
  head: () => recoveryMetadata("/sleep/methodology"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Sleep methodology">
      <SleepMethodology />
    </RecoveryPage>
  );
}
