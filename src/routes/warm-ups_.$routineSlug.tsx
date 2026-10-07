import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryKnowledge } from "../features/recovery/info-pages";
export const Route = createFileRoute("/warm-ups_/$routineSlug")({
  head: () => recoveryMetadata("/warm-ups/$routineSlug"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage publicKnowledge title="Reviewed warm-up">
      <RecoveryKnowledge routines slug={Route.useParams().routineSlug} />
    </RecoveryPage>
  );
}
