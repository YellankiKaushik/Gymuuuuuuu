import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryKnowledge } from "../features/recovery/info-pages";
export const Route = createFileRoute("/mobility")({
  head: () => recoveryMetadata("/mobility"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage publicKnowledge title="Mobility">
      <RecoveryKnowledge domain="mobility" routines />
    </RecoveryPage>
  );
}
