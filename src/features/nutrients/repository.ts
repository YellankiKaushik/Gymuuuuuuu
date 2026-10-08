import { z } from "zod";
import manifestJson from "../../content/nutrients/manifest.json";
import { nutrientSchema } from "./schema";
import { referenceValueNormativeSchema } from "./schema.generated";
import type { Nutrient } from "./schema";
import type { ReferenceRow, FrameworkDataset } from "./frameworks";
import type { RankedFood } from "./ranking";
import { nutrientIndex } from "./public-index";
import { loadPublicJson } from "../content-review/public-json";
import rankingProfilesUrl from "../../content/nutrients/ranking-profiles.json?url";
import {
  packedRankingsSchema,
  rankingProfilesSchema,
  unpackRankings,
} from "./ranking-codec";
export {
  nutrientIndex,
  nutrientReleaseReport,
  getFrameworkGlossary,
  type NutrientIndexEntry,
} from "./public-index";
const manifest = manifestJson as Record<string, string>;
const topicUrls = import.meta.glob<string>(
    "../../content/nutrients/topics/*.json",
    { query: "?url", import: "default", eager: true },
  ),
  frameworks = import.meta.glob<{ default: unknown }>(
    "../../content/nutrients/frameworks/*.json",
  ),
  rankingUrls = import.meta.glob<string>(
    "../../content/nutrients/rankings/*.json",
    { query: "?url", import: "default", eager: true },
  );
const topicCache = new Map<string, Promise<Nutrient | undefined>>();
export async function getNutrientBySlug(slug: string) {
  if (!nutrientIndex.some((n) => n.slug === slug)) return undefined;
  let pending = topicCache.get(slug);
  if (!pending) {
    const path = `../../content/nutrients/topics/${slug}.json`;
    pending = (async () => {
      let n: Nutrient;
      if (import.meta.env.SSR) {
        const serverTopics = import.meta.glob<{ default: unknown }>(
          "../../content/nutrients/topics/*.json",
        );
        const loader = serverTopics[path];
        if (!loader) return undefined;
        n = nutrientSchema.parse((await loader()).default);
      } else {
        const url = topicUrls[path];
        if (!url) return undefined;
        n = await loadPublicJson(url, nutrientSchema);
      }
      return n.status === "published" ? n : undefined;
    })().catch((error: unknown) => {
      topicCache.delete(slug);
      throw error;
    });
    topicCache.set(slug, pending);
  }
  return pending;
}
export async function getNutrientById(id: string) {
  const slug = manifest[id];
  return slug ? getNutrientBySlug(slug) : undefined;
}
const rowSchema = z.strictObject({
  nutrientId: z.string().min(1),
  nutrientName: z.string().min(1),
  reference: referenceValueNormativeSchema,
});
export async function loadReferenceFramework(
  dataset: FrameworkDataset,
): Promise<ReferenceRow[]> {
  if (
    dataset.status !== "approved" ||
    dataset.rightsStatus !== "approved" ||
    !dataset.version
  )
    return [];
  const loader =
    frameworks[`../../content/nutrients/frameworks/${dataset.id}.json`];
  if (!loader) throw Error("The selected framework dataset is unavailable.");
  const module = await loader();
  return rowSchema.array().parse(module.default);
}
let profileCache: Promise<unknown> | undefined;
function loadRankingProfiles() {
  if (!profileCache) {
    profileCache = (async () => {
      if (import.meta.env.SSR) {
        const module =
          await import("../../content/nutrients/ranking-profiles.json");
        return rankingProfilesSchema.parse(module.default);
      }
      return loadPublicJson(rankingProfilesUrl, rankingProfilesSchema);
    })().catch((error: unknown) => {
      profileCache = undefined;
      throw error;
    });
  }
  return profileCache;
}
const rankingCache = new Map<string, Promise<RankedFood[]>>();
async function loadRankingData(id: string): Promise<RankedFood[]> {
  const path = `../../content/nutrients/rankings/${id}.json`;
  if (import.meta.env.SSR) {
    const serverRankings = import.meta.glob<{ default: unknown }>(
      "../../content/nutrients/rankings/*.json",
    );
    const loader = serverRankings[path];
    if (!loader) return [];
    return unpackRankings(
      (await loader()).default,
      await loadRankingProfiles(),
      id,
    );
  }
  const url = rankingUrls[path];
  if (!url) return [];
  const [packed, profiles] = await Promise.all([
    loadPublicJson(url, packedRankingsSchema),
    loadRankingProfiles(),
  ]);
  return unpackRankings(packed, profiles, id);
}
export async function loadFoodRankings(id: string): Promise<RankedFood[]> {
  if (!manifest[id]) return [];
  let pending = rankingCache.get(id);
  if (!pending) {
    pending = loadRankingData(id).catch((error: unknown) => {
      rankingCache.delete(id);
      throw error;
    });
    rankingCache.set(id, pending);
  }
  return pending;
}
