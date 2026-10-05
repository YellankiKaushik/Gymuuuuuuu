import { createFileRoute } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/compare")({ head: () => ({ ...metadataFor("/compare"), meta: [...metadataFor("/saved").meta, { name: "robots", content: "noindex,follow" }], links: [] }), component: () => <Outlet /> });
