import { publicRecoveryRoutines } from "./publication";
import { recoveryReference, routineSchema } from "./schema";
import { newRecoveryId } from "./domain";
/** Creates a new local version only after an explicit user action. */
export function createPublicRoutineCopy(
  publicId: string,
  now = new Date().toISOString(),
) {
  const entry = publicRecoveryRoutines.find((r) => r.article.id === publicId);
  if (!entry) throw Error("Published routine is unavailable.");
  const provenance = {
    publicIdentity: entry.article.id,
    publicVersion: entry.routine.id,
    sourceChecked: entry.article.review.reviewedAt,
    reviewLevel: "published_personal_use",
    sourceReferences: entry.article.sourceIds.map((id) => {
      const source = recoveryReference.sources.find((s) => s.id === id);
      if (!source) throw Error("Routine source is missing.");
      return { id, url: source.url, title: source.title };
    }),
    limitations: entry.article.limitations,
    sourceSteps: entry.routine.steps,
  };
  return routineSchema.parse({
    ...structuredClone(entry.routine),
    id: newRecoveryId(),
    routineIdentityId: newRecoveryId(),
    versionNumber: 1,
    publicationStatus: "local_active",
    createdAt: now,
    revisionReason:
      "Independent local copy of a source-verified public template",
    steps: entry.routine.steps.map((step) => ({
      ...structuredClone(step),
      id: newRecoveryId(),
    })),
    notes: `Copied from ${entry.article.title}. Source checked ${entry.article.review.reviewedAt}; personal-use publication, no independent human review.`,
    publicationProvenance: provenance,
  });
}
