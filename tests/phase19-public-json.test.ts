import { expect, it, vi } from "vitest";
import { z } from "zod";
import { loadPublicJson } from "../src/features/content-review/public-json";
const schema = z.array(
  z.strictObject({
    amount: z.number().finite().nonnegative(),
    unit: z.literal("mg"),
  }),
);
it("validates a repository asset without cookies or redirects", async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(
      new Response(JSON.stringify([{ amount: 0, unit: "mg" }])),
    );
  expect(
    await loadPublicJson("/assets/iron_mg-example.json", schema, fetcher),
  ).toEqual([{ amount: 0, unit: "mg" }]);
  expect(fetcher).toHaveBeenCalledWith("/assets/iron_mg-example.json", {
    method: "GET",
    credentials: "omit",
    redirect: "error",
    cache: "force-cache",
  });
});
it("rejects external, encoded, traversal and non-JSON paths before requests", async () => {
  const fetcher = vi.fn<typeof fetch>();
  for (const url of [
    "https://example.com/a.json",
    "//example.com/a.json",
    "/assets/../a.json",
    "/assets/%2f.json",
    "/assets/a.json?private=1",
    "/assets/a.js",
    "/src/content/../../a.json",
    "/\\example.com/a.json",
  ])
    await expect(loadPublicJson(url, schema, fetcher)).rejects.toThrow(
      /same-origin/,
    );
  expect(fetcher).not.toHaveBeenCalled();
  fetcher.mockResolvedValueOnce(new Response("", { status: 500 }));
  await expect(
    loadPublicJson("/assets/a.json", schema, fetcher),
  ).rejects.toThrow(/could not be loaded/);
  fetcher.mockResolvedValueOnce(
    new Response(JSON.stringify([{ amount: null, unit: "mg" }])),
  );
  await expect(
    loadPublicJson("/assets/a.json", schema, fetcher),
  ).rejects.toThrow();
});
