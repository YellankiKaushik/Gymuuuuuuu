import { metadataFor } from "../lib/route-metadata";
import { createFileRoute } from "@tanstack/react-router";
import { loadVerifiedSources } from "../features/sources/loader";
import { SourcesPage } from "../features/sources/page";
export const Route = createFileRoute("/about/sources")({
  head: () => metadataFor("/about/sources"),
  loader: loadVerifiedSources,
  component: SourceDirectory,
});

function SourceDirectory() {
  return <SourcesPage verifiedSources={Route.useLoaderData()} />;
}
