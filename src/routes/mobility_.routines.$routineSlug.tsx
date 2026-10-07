import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryKnowledge } from "../features/recovery/info-pages";
export const Route = createFileRoute("/mobility_/routines/$routineSlug")({
  head: () => recoveryMetadata("/mobility/routines/$routineSlug"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage publicKnowledge title="Reviewed mobility routine">
      <RecoveryKnowledge routines slug={Route.useParams().routineSlug} />
    </RecoveryPage>
  );
}
