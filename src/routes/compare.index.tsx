import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { SavedPage } from "../features/search/pages";
export const Route = createFileRoute("/compare/")({ head: () => ({ ...metadataFor("/compare"), meta: [...metadataFor("/saved").meta, { name: "robots", content: "noindex,follow" }], links: [] }), component: () => <SavedPage section="compare" /> });
