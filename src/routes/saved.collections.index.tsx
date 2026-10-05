import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { SavedPage } from "../features/search/pages";
export const Route = createFileRoute("/saved/collections/")({ head: () => ({ ...metadataFor("/saved/collections"), meta: [...metadataFor("/saved").meta, { name: "robots", content: "noindex,follow" }], links: [] }), component: () => <SavedPage section="collections" /> });
