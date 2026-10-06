import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import documents from "../src/data/search/search-documents.public.json";
import { verifyPublicSearchDocuments } from "../src/features/search/verify-documents";

const digest = async (value: string) =>
  createHash("sha256").update(value).digest("hex");
it("still rejects corrupted, duplicate and disallowed documents before search can use them", async () => {
  const subset = documents.slice(0, 9);
  expect(await verifyPublicSearchDocuments(subset, digest)).toHaveLength(9);
  const corrupt = structuredClone(subset);
  corrupt[0]!.summary += " changed";
  await expect(verifyPublicSearchDocuments(corrupt, digest)).rejects.toThrow(
    /hash is invalid/,
  );
  await expect(
    verifyPublicSearchDocuments([subset[0], subset[0]], digest),
  ).rejects.toThrow(/duplicate stable IDs/);
  const wrongRoute = structuredClone(subset[0]!);
  wrongRoute.route = "/not-allowlisted";
  await expect(
    verifyPublicSearchDocuments([wrongRoute], digest),
  ).rejects.toThrow();
});
it("verifies every document with bounded concurrent native requests", async () => {
  let active = 0,
    peak = 0,
    calls = 0;
  const result = await verifyPublicSearchDocuments(documents, async (value) => {
    active++;
    calls++;
    peak = Math.max(active, peak);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    const hash = await digest(value);
    active--;
    return hash;
  });
  expect(calls).toBe(documents.length);
  expect(result).toHaveLength(documents.length);
  expect(peak).toBeGreaterThan(1);
  expect(peak).toBeLessThanOrEqual(8);
  expect(active).toBe(0);
});
