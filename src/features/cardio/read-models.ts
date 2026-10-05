import type { CardioBackup } from "./schema";
import { calculatePace } from "./calculations";
export function cardioReadModels(root: CardioBackup) {
  return root.cardioSessions.map((s) => ({
    id: `cardio:${s.id}`,
    recordId: s.id,
    date: s.sessionDate,
    timezone: s.timezone,
    updatedAt: s.updatedAt,
    modalityId: s.modalityId,
    status: s.status,
    elapsedSeconds: s.elapsedSecondsExact,
    distanceMeters: s.distanceMeters,
    heartRateSource: s.heartRateSource,
    deviceLabel: s.deviceLabel,
    classificationVersion: s.classificationVersion,
    averageHeartRateBpm: s.averageHeartRateBpm,
    clinicalMeasurement: false,
    sourcePlanVersionId: s.sourcePlanSnapshot?.planVersionId ?? null,
    stopConcern: s.stopSignals.length > 0,
    pace:
      s.distanceMeters !== null &&
      s.distanceMeters > 0 &&
      s.elapsedSecondsExact !== null &&
      s.elapsedSecondsExact > 0
        ? calculatePace(s.distanceMeters, s.elapsedSecondsExact)
        : null,
    linkedWorkoutIds: s.linkedWorkoutIds,
  }));
}
