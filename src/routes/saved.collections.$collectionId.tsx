import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { SavedPage } from "../features/search/pages";
export const Route = createFileRoute("/saved/collections/$collectionId")({ head: () => ({ ...metadataFor("/saved"), meta: [...metadataFor("/saved").meta, { name: "robots", content: "noindex,follow" }], links: [] }), component: Page });
function Page() { return <SavedPage section="collection" collectionId={Route.useParams().collectionId} />; }
