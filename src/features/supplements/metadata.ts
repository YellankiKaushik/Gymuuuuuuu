import { metadataFor } from "../../lib/route-metadata";
export function supplementMetadata(path: string) {
  const meta = metadataFor(path);
  return {
    ...meta,
    meta: [...meta.meta, { name: "robots", content: "noindex,nofollow" }],
    links: [],
  };
}
