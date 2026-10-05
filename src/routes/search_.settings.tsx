import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { SearchSettingsPage } from "../features/search/pages";
export const Route = createFileRoute("/search_/settings")({ head: () => ({ ...metadataFor("/search"), meta: [...metadataFor("/search").meta, { name: "robots", content: "noindex,follow" }], links: [] }), component: SearchSettingsPage });
