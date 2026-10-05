import { foodSchema, type Food } from "./schema";

// Bundler-generated same-origin static JSON contains public composition only.
export async function loadPublicFoodAsset(
  assetUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<Food[]> {
  if (
    (!assetUrl.startsWith("/assets/") &&
      !assetUrl.startsWith("/src/content/foods/shards/")) ||
    assetUrl.includes("\\") ||
    [...assetUrl].some(
      (character) =>
        character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127,
    )
  )
    throw Error("Public food assets must use a same-origin relative URL.");
  const response = await fetcher(assetUrl, {
    method: "GET",
    credentials: "omit",
    redirect: "error",
    cache: "force-cache",
  });
  if (!response.ok) throw Error("Public food data could not be loaded.");
  const input: unknown = await response.json();
  return foodSchema
    .array()
    .parse(input)
    .filter((food) => food.status === "published");
}
