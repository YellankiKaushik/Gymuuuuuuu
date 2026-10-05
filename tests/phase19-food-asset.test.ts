import { expect, it, vi } from "vitest";
import { loadPublicFoodAsset } from "../src/features/foods/public-asset";
import records from "../src/content/foods/records.json";

it("loads schema-validated public composition without sending cookies or personal records", async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response(JSON.stringify([records[0]])));
  const result = await loadPublicFoodAsset("/assets/fruits-test.json", fetcher);
  expect(result[0]?.id).toBe("food_apple");
  expect(fetcher).toHaveBeenCalledWith("/assets/fruits-test.json", {
    method: "GET",
    credentials: "omit",
    redirect: "error",
    cache: "force-cache",
  });
});

it("rejects remote URLs, failed responses and corrupt composition before returning values", async () => {
  const fetcher = vi.fn<typeof fetch>();
  await expect(
    loadPublicFoodAsset("https://example.com/foods.json", fetcher),
  ).rejects.toThrow(/same-origin/);
  await expect(
    loadPublicFoodAsset("//example.com/foods.json", fetcher),
  ).rejects.toThrow(/same-origin/);
  await expect(
    loadPublicFoodAsset("/\\example.com/foods.json", fetcher),
  ).rejects.toThrow(/same-origin/);
  expect(fetcher).not.toHaveBeenCalled();
  fetcher.mockResolvedValueOnce(new Response("", { status: 404 }));
  await expect(
    loadPublicFoodAsset("/assets/fruits.json", fetcher),
  ).rejects.toThrow(/could not be loaded/);
  fetcher.mockResolvedValueOnce(
    new Response(JSON.stringify([{ id: "food_apple" }])),
  );
  await expect(
    loadPublicFoodAsset("/assets/fruits.json", fetcher),
  ).rejects.toThrow();
});
