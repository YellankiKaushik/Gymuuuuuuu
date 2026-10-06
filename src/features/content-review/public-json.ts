import type { z } from "zod";

/** Only repository-owned public JSON. Personal records never enter this loader. */
export async function loadPublicJson<T>(
  assetUrl: string,
  schema: z.ZodType<T>,
  fetcher: typeof fetch = fetch,
): Promise<T> {
  if (
    !/^\/(?:assets\/[a-zA-Z0-9_.-]+|src\/content\/[a-zA-Z0-9_/-]+)\.json$/.test(
      assetUrl,
    )
  )
    throw Error("Public data requires a same-origin repository JSON asset.");
  const response = await fetcher(assetUrl, {
    method: "GET",
    credentials: "omit",
    redirect: "error",
    cache: "force-cache",
  });
  if (!response.ok)
    throw Error("Public data could not be loaded. Retry or reload this page.");
  const input: unknown = await response.json();
  return schema.parse(input);
}
