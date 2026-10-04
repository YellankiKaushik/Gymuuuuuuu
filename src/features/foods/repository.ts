import searchIndex from "../../content/foods/index.json";
import manifestJson from "../../content/foods/manifest.json";
import report from "../../content/foods/release-report.json";
import { foodSchema, type Food } from "./schema";
import type { FoodIndexEntry } from "./domain";
export const foodIndex = searchIndex as FoodIndexEntry[];
export const foodReleaseReport = report;
const manifest = manifestJson as Record<string, string>;
const shards = import.meta.glob<{ default: unknown }>(
  "../../content/foods/shards/*.json",
);
const cache = new Map<string, Promise<Food[]>>();
export async function getFoodBySlug(slug: string): Promise<Food | undefined> {
  const category = manifest[slug];
  if (!category) return undefined;
  let pending = cache.get(category);
  if (!pending) {
    const loader = shards[`../../content/foods/shards/${category}.json`];
    if (!loader) return undefined;
    pending = loader().then((module) =>
      foodSchema
        .array()
        .parse(module.default)
        .filter((f) => f.status === "published"),
    );
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
