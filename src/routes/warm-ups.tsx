import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryKnowledge } from "../features/recovery/info-pages";
export const Route = createFileRoute("/warm-ups")({
  head: () => recoveryMetadata("/warm-ups"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Warm-ups">
      <RecoveryKnowledge routines />
    </RecoveryPage>
  );
}
