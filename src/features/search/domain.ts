import { z } from "zod";
import { navigationItems, findModule } from "../../data/navigation";

export const searchEntityTypes = [
  "route", "muscle", "exercise", "workout_science_topic", "workout_program", "workout_session", "food", "nutrient", "diet_plan", "recipe", "meal_plan_template", "meal_plan", "recovery_topic", "recovery_routine", "sleep_entry", "recovery_checkin", "cardio_topic", "cardio_modality", "cardio_plan", "conditioning_routine", "supplement_ingredient", "supplement_evidence_topic", "measurement_protocol", "progress_topic", "body_measurement", "dashboard_widget",
] as const;
export type SearchEntityType = (typeof searchEntityTypes)[number];
export const entityRegistry = [
  ["route", "phase_01_navigation", "public", "none"], ["muscle", "phase_02_anatomy", "public", "muscles"], ["exercise", "phase_03_exercises", "public", "exercises"], ["workout_science_topic", "phase_04_workout_science", "public", "workout_science_topics"], ["workout_program", "phase_05_programs", "public", "workout_programs"], ["workout_session", "phase_06_workout_tracker", "private_opt_in", "none"], ["food", "phase_07_foods", "public", "foods"], ["nutrient", "phase_08_nutrients", "public", "nutrients"], ["diet_plan", "phase_09_diet_planning", "private_opt_in", "none"], ["recipe", "phase_11_recipes", "mixed", "recipes"], ["meal_plan_template", "phase_11_meal_plans", "public", "none"], ["meal_plan", "phase_11_meal_plans", "private_opt_in", "none"], ["recovery_topic", "phase_12_recovery", "public", "recovery_methods"], ["recovery_routine", "phase_12_recovery", "public", "none"], ["sleep_entry", "phase_12_recovery", "private_opt_in", "none"], ["recovery_checkin", "phase_12_recovery", "private_opt_in", "none"], ["cardio_topic", "phase_13_cardio", "public", "none"], ["cardio_modality", "phase_13_cardio", "public", "cardio_modalities"], ["cardio_plan", "phase_13_cardio", "public", "cardio_plans"], ["conditioning_routine", "phase_13_cardio", "public", "none"], ["supplement_ingredient", "phase_14_supplements", "public", "supplements"], ["supplement_evidence_topic", "phase_14_supplements", "public", "none"], ["measurement_protocol", "phase_15_progress", "public", "none"], ["progress_topic", "phase_15_progress", "public", "none"], ["body_measurement", "phase_15_progress", "private_opt_in", "none"], ["dashboard_widget", "phase_15_progress", "public", "none"],
] as const satisfies readonly (readonly [SearchEntityType, string, "public" | "private_opt_in" | "mixed", string])[];

export interface PublicSearchDocument {
  documentId: string;
  entityType: SearchEntityType;
  entityId: string;
  entityVersion: string | null;
  sourceModule: string;
  route: string;
  title: string;
  normalizedTitle: string;
  aliases: string[];
  normalizedAliases: string[];
  summary: string;
  keywords: string[];
  headings: string[];
  searchableBody: string;
  facets: Record<string, string[]>;
  publicationStatus: "published";
  lastReviewedAt: string | null;
  contentHash: string;
}
export const searchDocumentSchema = z.strictObject({
  documentId: z.string().min(1), entityType: z.enum(searchEntityTypes), entityId: z.string().min(1), entityVersion: z.string().nullable(), sourceModule: z.string().min(1), route: z.string().regex(/^\/(?!\/)[^?#]*$/), title: z.string().min(1), normalizedTitle: z.string(), aliases: z.array(z.string()), normalizedAliases: z.array(z.string()), summary: z.string(), keywords: z.array(z.string()), headings: z.array(z.string()), searchableBody: z.string(), facets: z.record(z.string(), z.array(z.string())), publicationStatus: z.literal("published"), lastReviewedAt: z.iso.date().nullable(), contentHash: z.string().regex(/^[a-f0-9]{64}$/),
});

export function normalizeSearchText(value: string) {
  return value.normalize("NFKC").replace(/[’‘`]/g, "'").replace(/[‐‑‒–—−]/g, "-").toLocaleLowerCase("en-US").replace(/\s+/g, " ").trim();
}
export function foldDiacritics(value: string) {
  return normalizeSearchText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC");
}
export function tokenizeSearchText(value: string) {
  return normalizeSearchText(value).match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu) ?? ([] as string[]);
}
export const searchUrlStateSchema = z.object({
  q: z.string().max(120).optional(), type: z.preprocess((value) => typeof value === "string" ? [value] : value, z.array(z.enum(searchEntityTypes)).max(searchEntityTypes.length)).optional(), module: z.preprocess((value) => typeof value === "string" ? [value] : value, z.array(z.string().regex(/^phase_[0-9]{2}_[a-z_]+$/).max(60)).max(25)).optional(), sort: z.enum(["relevance", "title_asc", "title_desc", "reviewed_desc"]).default("relevance"), page: z.coerce.number().int().min(1).max(1000).default(1), saved: z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")]).default(false),
}).strict().transform((state) => ({ ...state, q: state.q?.slice(0, 120), type: [...new Set(state.type ?? [])].sort(), module: [...new Set(state.module ?? [])].sort() }));
export type SearchUrlState = z.infer<typeof searchUrlStateSchema>;
export function parseSearchUrl(search: Record<string, unknown>) { const parsed = searchUrlStateSchema.safeParse(search); return parsed.success ? parsed.data : { q: undefined, type: [], module: [], sort: "relevance" as const, page: 1, saved: false }; }
export function canonicalSearchUrl(state: SearchUrlState) {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  for (const type of state.type ?? []) params.append("type", type);
  for (const module of state.module ?? []) params.append("module", module);
  if (state.sort !== "relevance") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  if (state.saved) params.set("saved", "true");
  return params.size ? `/search?${params.toString()}` : "/search";
}
export function isAllowlistedPublicRoute(path: string) {
  return !path.includes("$") && path.startsWith("/") && !path.includes("?") && !path.includes("#") && navigationItems.some((item) => item.href === path);
}
export function isSafeCanonicalRoute(path: string) { return path.startsWith("/") && !path.startsWith("//") && !path.includes("?") && !path.includes("#") && !!findModule(path); }
export function safePage(value: number, resultCount: number, pageSize: number) { return Math.max(1, Math.min(Math.floor(value || 1), Math.max(1, Math.ceil(resultCount / pageSize)))); }
