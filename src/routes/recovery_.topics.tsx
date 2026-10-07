import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryKnowledge } from "../features/recovery/info-pages";
export const Route = createFileRoute("/recovery_/topics")({
  head: () => recoveryMetadata("/recovery/topics"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage publicKnowledge title="Recovery topics">
      <RecoveryKnowledge domain="recovery" />
    </RecoveryPage>
  );
}
