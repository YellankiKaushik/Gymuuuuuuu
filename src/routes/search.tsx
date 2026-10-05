import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { metadataFor } from "../lib/route-metadata";
import { searchUrlStateSchema } from "../features/search/domain";
import { SearchPage } from "../features/search/pages";

export const Route = createFileRoute("/search")({ validateSearch: searchUrlStateSchema, head: () => ({ ...metadataFor("/search"), meta: [...metadataFor("/search").meta, { name: "robots", content: "noindex,follow" }], links: [] }), component: Page });
function Page() { const state = Route.useSearch(), navigate = useNavigate({ from: "/search" }); return <SearchPage query={state.q ?? ""} types={state.type} modules={state.module} sort={state.sort} page={state.page} savedOnly={state.saved} onQueryChange={(q) => void navigate({ search: (old) => ({ ...old, q: q || undefined, page: 1 }) })} onStateChange={(update) => void navigate({ search: (old) => ({ ...old, ...update }) })} />; }
