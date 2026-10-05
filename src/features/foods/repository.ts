import searchIndex from "../../content/foods/index.json";
import manifestJson from "../../content/foods/manifest.json";
import report from "../../content/foods/release-report.json";
import { foodSchema, type Food } from "./schema";
import type { FoodIndexEntry } from "./domain";
import { loadPublicFoodAsset } from "./public-asset";
export const foodIndex = searchIndex as FoodIndexEntry[];
export const foodReleaseReport = report;
const manifest = manifestJson as Record<string, string>;
const shardUrls = import.meta.glob<string>(
  "../../content/foods/shards/*.json",
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);
async function loadCategory(category: string): Promise<Food[]> {
  const path = `../../content/foods/shards/${category}.json`;
  if (import.meta.env.SSR) {
    const serverShards = import.meta.glob<{ default: unknown }>(
      "../../content/foods/shards/*.json",
    );
    const loader = serverShards[path];
    if (!loader) throw Error("Public food data is unavailable.");
    const module = await loader();
    return foodSchema
      .array()
      .parse(module.default)
      .filter((food) => food.status === "published");
  }
  const url = shardUrls[path];
  if (!url) throw Error("Public food data is unavailable.");
  return loadPublicFoodAsset(url);
}
const cache = new Map<string, Promise<Food[]>>();
export async function getFoodBySlug(slug: string): Promise<Food | undefined> {
  const category = manifest[slug];
  if (!category) return undefined;
  let pending = cache.get(category);
  if (!pending) {
    pending = loadCategory(category).catch((error: unknown) => {
      cache.delete(category);
      throw error;
    });
    cache.set(category, pending);
  }
  return (await pending).find((f) => f.slug === slug);
}
export async function getFoodProfile(profileId: string) {
  const entry = foodIndex.find((f) =>
    f.profiles.some((p) => p.id === profileId),
  );
  if (!entry) return undefined;
  const food = await getFoodBySlug(entry.slug);
  const profile = food?.compositionProfiles.find(
    (p) => p.profileId === profileId && p.review.status === "approved",
  );
  return food && profile ? { food, profile } : undefined;
}
