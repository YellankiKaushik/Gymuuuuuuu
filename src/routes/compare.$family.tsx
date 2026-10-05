import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { ComparisonPage } from "../features/search/pages";
export const Route = createFileRoute("/compare/$family")({ head: () => ({ ...metadataFor("/saved"), meta: [...metadataFor("/saved").meta, { name: "robots", content: "noindex,follow" }], links: [] }), component: Page });
function Page() { return <ComparisonPage family={Route.useParams().family} />; }
