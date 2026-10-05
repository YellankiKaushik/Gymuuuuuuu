import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { LocalRoutines } from "../features/recovery/routines";
export const Route = createFileRoute("/mobility_/custom")({
  head: () => recoveryMetadata("/mobility/custom"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="My mobility routines">
      <LocalRoutines />
    </RecoveryPage>
  );
}
