import { muscleSchema, type Muscle } from "./schema";
import { muscleRecords } from "./public-repository";
import { loadPublicJson } from "../content-review/public-json";
const urls = import.meta.glob<string>("../../content/muscles/records.json", {
  query: "?url",
  import: "default",
  eager: true,
});
let pending: Promise<Muscle[]> | undefined;
async function loadRecords() {
  if (import.meta.env.SSR) {
    const record = await import("../../content/muscles/records.json");
    return muscleSchema.array().parse(record.default);
  }
  const url = urls["../../content/muscles/records.json"];
  if (!url) throw Error("Anatomy data is unavailable.");
  return loadPublicJson(url, muscleSchema.array());
}
export async function loadMuscleBySlug(
  slug: string,
): Promise<Muscle | undefined> {
  const entry = muscleRecords.find((r) => r.slug === slug);
  if (!entry) return undefined;
  pending ??= loadRecords().catch((error: unknown) => {
    pending = undefined;
    throw error;
  });
  const record = (await pending).find((r) => r.id === entry.id);
  if (
    !record ||
    !["published", "deprecated"].includes(record.contentStatus) ||
    JSON.stringify(project(record)) !== JSON.stringify(entry)
  )
    throw Error("Anatomy detail does not match its verified discovery record.");
  return record;
}
import { projectMuscleIndex as project } from "./index-schema";
