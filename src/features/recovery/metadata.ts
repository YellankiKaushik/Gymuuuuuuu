import { metadataFor } from "../../lib/route-metadata";
export function recoveryMetadata(path: string) {
  const metadata = metadataFor(path);
  return {
    ...metadata,
    meta: [...metadata.meta, { name: "robots", content: "noindex,nofollow" }],
    links: [],
  };
}
