import { z } from "zod";
import manifestJson from "../../content/nutrients/manifest.json";
import { nutrientSchema } from "./schema";
import { referenceValueNormativeSchema } from "./schema.generated";
import type { Nutrient } from "./schema";
import type { ReferenceRow, FrameworkDataset } from "./frameworks";
import type { RankedFood } from "./ranking";
import { nutrientIndex } from "./public-index";
import { loadPublicJson } from "../content-review/public-json";
export {
  nutrientIndex,
  nutrientReleaseReport,
  getFrameworkGlossary,
  type NutrientIndexEntry,
} from "./public-index";
const manifest = manifestJson as Record<string, string>;
const topics = import.meta.glob<{ default: unknown }>(
    "../../content/nutrients/topics/*.json",
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
    const loader = topics[`../../content/nutrients/topics/${slug}.json`];
    if (!loader) return undefined;
    pending = loader().then((module) => {
      const n = nutrientSchema.parse(module.default);
      return n.status === "published" ? n : undefined;
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
const rankedFoodSchema = z.strictObject({
  foodId: z.string(),
  slug: z.string(),
  name: z.string(),
  profileId: z.string(),
  profileLabel: z.string(),
  state: z.string(),
  nutrientId: z.string(),
  amount: z.number().finite().nonnegative(),
  unit: z.string(),
  status: z.enum(["measured", "calculated", "imputed", "estimated"]),
  basis: z.enum(["per_100g", "per_100kcal", "per_verified_portion"]),
  portionLabel: z.string().nullable(),
  grams: z.number().positive().nullable(),
  sourceReleases: z.array(z.string()),
  energyStatus: z.string().nullable(),
  portionStatus: z.string().nullable(),
});
const rankingCache = new Map<string, Promise<RankedFood[]>>();
async function loadRankingData(id: string): Promise<RankedFood[]> {
  const path = `../../content/nutrients/rankings/${id}.json`;
  if (import.meta.env.SSR) {
    const serverRankings = import.meta.glob<{ default: unknown }>(
      "../../content/nutrients/rankings/*.json",
    );
    const loader = serverRankings[path];
    if (!loader) return [];
    return rankedFoodSchema.array().parse((await loader()).default);
  }
  const url = rankingUrls[path];
  return url ? loadPublicJson(url, rankedFoodSchema.array()) : [];
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
