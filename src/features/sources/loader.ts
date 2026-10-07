import { verifiedSourceSchema } from "../content-review/schema";
import { loadPublicJson } from "../content-review/public-json";
const urls = import.meta.glob<string>(
  "../../content/provenance/verified-sources.json",
  { query: "?url", import: "default", eager: true },
);
let pending:
  Promise<ReturnType<typeof verifiedSourceSchema.array>["_output"]> | undefined;
export async function loadVerifiedSources() {
  pending ??= (async () => {
    if (import.meta.env.SSR) {
      const data =
        await import("../../content/provenance/verified-sources.json");
      return verifiedSourceSchema.array().parse(data.default);
    }
    const url = urls["../../content/provenance/verified-sources.json"];
    if (!url) throw Error("Source directory data is unavailable.");
    return loadPublicJson(url, verifiedSourceSchema.array());
  })().catch((error: unknown) => {
    pending = undefined;
    throw error;
  });
  return pending;
}
