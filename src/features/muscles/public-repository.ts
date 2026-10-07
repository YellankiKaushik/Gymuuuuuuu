import rawTaxonomy from "../../content/muscles/runtime-taxonomy.json";
import rawIndex from "../../content/muscles/index.json";
import { sourceRegistry } from "../../data/sources";
import { z } from "zod";
import { muscleIndexSchema } from "./index-schema";

const seedSchema = z.strictObject({
  id: z.string().min(1),
  slug: z.string().min(1),
  displayName: z.string().min(1),
  entityType: z.string().min(1),
  regionIds: z.array(z.string()),
  trainingGroupIds: z.array(z.string()),
});
export const anatomyTaxonomy = {
  ...rawTaxonomy,
  records: seedSchema.array().parse(rawTaxonomy.records),
};
export const muscleRecords = muscleIndexSchema.array().parse(rawIndex);
export const normalizeTerm = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export const getPublishedMuscles = () =>
  muscleRecords.filter((r) => r.contentStatus === "published");
export function getAnatomySources(ids: readonly string[]) {
  return sourceRegistry.filter((r) => ids.includes(r.sourceId));
}
