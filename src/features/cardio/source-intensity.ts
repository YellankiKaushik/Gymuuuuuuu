import snapshot from "../../content/provenance/running-plan-snapshot.json";
import { publicPlanSchema } from "./public-plan";
import type { Intensity } from "./schema";

const approved = publicPlanSchema.parse(snapshot);
/** A narrow, source-versioned whitelist; it cannot approve arbitrary targets. */
export function isApprovedPublicIntensity(value: Intensity) {
  const source = value.provenance;
  return (
    value.method === approved.intensity.method &&
    value.methodVersion === approved.intensity.methodVersion &&
    value.instruction === approved.intensity.instruction &&
    value.maxHrSource === "not_applicable" &&
    value.lower === null &&
    value.upper === null &&
    value.unit === null &&
    source.basis === "reviewed_source" &&
    source.sourceIds.length === 1 &&
    source.sourceIds[0] === approved.sourceId &&
    source.frameworkId === null &&
    source.maximumHeartRateBpm === null &&
    source.restingHeartRateBpm === null &&
    source.ageYears === null &&
    source.lowerFraction === null &&
    source.upperFraction === null &&
    !source.estimated &&
    !source.hrTargetingDisabled &&
    source.cautions.length === 0
  );
}
