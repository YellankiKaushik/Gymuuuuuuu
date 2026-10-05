import { metadataFor } from "../../lib/route-metadata";
export function cardioMetadata(path: string) {
  const meta = metadataFor(path);
  return {
    ...meta,
    meta: [...meta.meta, { name: "robots", content: "noindex,nofollow" }],
    links: [],
  };
}
