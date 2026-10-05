import { dimensions, type RecoveryBackup } from "./schema";
import { summarize } from "./domain";
export function recoveryReadModels(data: RecoveryBackup) {
  return {
    sleep: data.sleepLogs.map((s) => ({
      id: `sleep:${s.id}`,
      recordId: s.id,
      updatedAt: s.updatedAt,
      date: s.sleepDate,
      timezone: s.timezone,
      source: s.source,
      mainMinutes: s.calculated.estimatedTotalSleepMinutes,
      dailyMinutes: s.calculated.dailyTotalSleepMinutes,
      efficiencyPercent: s.calculated.sleepEfficiencyPercent,
    })),
    checkins: data.recoveryCheckIns.map((c) => ({
      id: `checkin:${c.id}`,
      recordId: c.id,
      updatedAt: c.updatedAt,
      date: c.date,
      dimensions: Object.fromEntries(dimensions.map((d) => [d, c[d] ?? null])),
      regionalSoreness: c.regionalSoreness,
      painConcern: c.painOrInjuryConcern ?? false,
      illness: c.illnessSymptoms ?? false,
      linkedWorkoutSessionIds: c.linkedWorkoutSessionIds ?? [],
    })),
    routines: data.mobilitySessions.map((s) => ({
      id: `session:${s.id}`,
      recordId: s.id,
      updatedAt: s.updatedAt,
      routineId: s.routineId,
      routineVersionId: s.routineVersionId,
      startedAt: s.startedAt,
      state: s.state,
      completedSteps: s.completedStepIds.length,
      skippedSteps: s.skippedStepIds.length,
      plannedSteps: s.routineSnapshot.steps.length,
      activeSeconds: s.activeSeconds,
    })),
  };
}
export function dimensionSummaries(data: RecoveryBackup) {
  return dimensions.map((d) => ({
    dimension: d,
    ...summarize(data.recoveryCheckIns.map((c) => c[d])),
  }));
}
export function regionalSummaries(data: RecoveryBackup) {
  const keys = [
    ...new Set(
      data.recoveryCheckIns.flatMap((c) =>
        c.regionalSoreness.map((r) => `${r.regionId}:${r.laterality}`),
      ),
    ),
  ];
  return keys.map((key) => {
    const [regionId, laterality] = key.split(":");
    return {
      regionId: regionId!,
      laterality: laterality!,
      ...summarize(
        data.recoveryCheckIns.map(
          (c) =>
            c.regionalSoreness.find(
              (r) => `${r.regionId}:${r.laterality}` === key,
            )?.severity,
        ),
      ),
    };
  });
}
