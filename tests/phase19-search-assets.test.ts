import { expect, test, vi } from "vitest";
import { z } from "zod";
import { loadPublicJson } from "../src/features/content-review/public-json";
import { loadPublicSearchRuntime } from "../src/features/search/runtime";
import manifest from "../src/data/search/search-manifest.json";

test("repository search JSON is credential-free and restricted to the two public assets", async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockImplementation(async () => new Response("[]"));
  for (const name of ["documents", "index"])
    expect(
      await loadPublicJson(
        `/src/data/search/search-${name}.public.json`,
        z.array(z.unknown()),
        fetcher,
      ),
    ).toEqual([]);
  expect(fetcher).toHaveBeenCalledWith(
    "/src/data/search/search-index.public.json",
    {
      method: "GET",
      credentials: "omit",
      redirect: "error",
      cache: "force-cache",
    },
  );
});

test("lazy search assets retain the current canonical manifest and actual factual results", async () => {
  const runtime = await loadPublicSearchRuntime();
  expect(runtime.status).toBe("verified");
  expect(runtime.documentCount).toBe(manifest.documentCount);
  const result = await runtime.engine.search({
    query: "chloride",
    types: ["nutrient"],
  });
  expect(
    result.results.some(
      ({ document }) =>
        document.entityId === "chloride_mg" &&
        document.route === "/nutrients/chloride",
    ),
  ).toBe(true);
});
