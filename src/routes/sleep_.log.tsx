import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { SleepDiary } from "../features/recovery/pages";
export const Route = createFileRoute("/sleep_/log")({
  head: () => recoveryMetadata("/sleep/log"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Sleep diary">
      <SleepDiary />
    </RecoveryPage>
  );
}
