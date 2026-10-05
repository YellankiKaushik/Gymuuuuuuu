import { createFileRoute } from "@tanstack/react-router";
import { recoveryMetadata } from "../features/recovery/metadata";
import { RecoveryPage } from "../features/recovery/workspace";
import { RecoveryKnowledge } from "../features/recovery/info-pages";
export const Route = createFileRoute("/recovery_/topics_/$topicSlug")({
  head: () => recoveryMetadata("/recovery/topics/$topicSlug"),
  component: Page,
});
function Page() {
  return (
    <RecoveryPage title="Recovery topic">
      <RecoveryKnowledge slug={Route.useParams().topicSlug} />
    </RecoveryPage>
  );
}
