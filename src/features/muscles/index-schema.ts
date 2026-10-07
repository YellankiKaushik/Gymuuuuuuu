import { z } from "zod";
import { muscleSchema } from "./schema";

const s = muscleSchema.shape;
/** Only sourced discovery fields; full teaching records load on detail routes. */
export const muscleIndexSchema = z.strictObject({
  id: s.id,
  slug: s.slug,
  displayName: s.displayName,
  anatomicalName: s.anatomicalName,
  latinName: s.latinName,
  aliases: s.aliases,
  entityType: s.entityType,
  contentStatus: s.contentStatus,
  regions: s.regions,
  trainingGroups: s.trainingGroups,
  visibility: s.visibility,
  depth: s.depth,
  jointActions: z.array(
    z.strictObject({ joint: z.string().min(1), motion: z.string().min(1) }),
  ),
  movementPatterns: s.movementPatterns,
  reviewedAt: s.reviewedAt,
  sources: s.sources,
  replacementId: s.replacementId,
});
export type MuscleIndexEntry = z.infer<typeof muscleIndexSchema>;
export function projectMuscleIndex(
  record: z.infer<typeof muscleSchema>,
): MuscleIndexEntry {
  return muscleIndexSchema.parse({
    ...Object.fromEntries(
      Object.keys(muscleIndexSchema.shape).map((key) => [
        key,
        record[key as keyof typeof record],
      ]),
    ),
    jointActions: record.jointActions.map(({ joint, motion }) => ({
      joint,
      motion,
    })),
  });
}
