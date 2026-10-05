import type { RecoveryBackup } from "./schema";
export const recoveryCsvKinds = [
  "sleep",
  "checkins",
  "soreness",
  "sessions",
  "routines",
] as const;
const cell = (value: unknown) => {
  if (value == null) return "";
  let text = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
};
export function recoveryCsv(
  data: RecoveryBackup,
  kind: (typeof recoveryCsvKinds)[number],
) {
  let rows: unknown[][] = [];
  if (kind === "sleep")
    rows = [
      [
        "id",
        "wake_date",
        "timezone",
        "source",
        "status",
        "attempted_sleep_at",
        "final_wake_at",
        "out_of_bed_at",
        "latency_min",
        "awake_after_sleep_min",
        "opportunity_min",
        "main_sleep_min",
        "naps_min",
        "daily_total_min",
        "efficiency_percent",
        "quality",
        "restedness",
        "sleepiness",
        "notes",
      ],
      ...data.sleepLogs.map((v) => [
        v.id,
        v.sleepDate,
        v.timezone,
        v.source,
        v.status,
        v.attemptedSleepAt,
        v.finalWakeAt,
        v.outOfBedAt,
        v.sleepOnsetLatencyMinutes,
        v.wakeAfterSleepOnsetMinutes,
        v.calculated.sleepOpportunityMinutes,
        v.calculated.estimatedTotalSleepMinutes,
        v.calculated.napMinutes,
        v.calculated.dailyTotalSleepMinutes,
        v.calculated.sleepEfficiencyPercent,
        v.quality,
        v.restedness,
        v.daytimeSleepiness,
        v.notes,
      ]),
    ];
  if (kind === "checkins")
    rows = [
      [
        "id",
        "date",
        "timezone",
        "overall_readiness",
        "energy",
        "general_fatigue",
        "stress",
        "motivation",
        "mood",
        "perceived_recovery",
        "pain_concern",
        "pain_severity",
        "illness",
        "sleep_log_id",
        "workout_session_ids",
        "notes",
      ],
      ...data.recoveryCheckIns.map((v) => [
        v.id,
        v.date,
        v.timezone,
        v.overallReadiness,
        v.energy,
        v.generalFatigue,
        v.stress,
        v.motivation,
        v.mood,
        v.perceivedRecovery,
        v.painOrInjuryConcern,
        v.painConcernSeverity,
        v.illnessSymptoms,
        v.linkedSleepLogId,
        v.linkedWorkoutSessionIds,
        v.notes,
      ]),
    ];
  if (kind === "soreness")
    rows = [
      ["checkin_id", "date", "region_id", "laterality", "severity", "notes"],
      ...data.recoveryCheckIns.flatMap((v) =>
        v.regionalSoreness.map((r) => [
          v.id,
          v.date,
          r.regionId,
          r.laterality,
          r.severity,
          r.notes,
        ]),
      ),
    ];
  if (kind === "sessions")
    rows = [
      [
        "id",
        "routine_id",
        "version_id",
        "started_at",
        "ended_at",
        "timezone",
        "state",
        "completed_step_ids",
        "skipped_step_ids",
        "active_seconds",
        "difficulty",
        "discomfort",
        "notes",
        "snapshot",
      ],
      ...data.mobilitySessions.map((v) => [
        v.id,
        v.routineId,
        v.routineVersionId,
        v.startedAt,
        v.endedAt,
        v.timezone,
        v.state,
        v.completedStepIds,
        v.skippedStepIds,
        v.activeSeconds,
        v.perceivedDifficulty,
        v.discomfortConcern,
        v.notes,
        v.routineSnapshot,
      ]),
    ];
  if (kind === "routines")
    rows = [
      [
        "version_id",
        "identity_id",
        "version",
        "title",
        "context",
        "status",
        "estimated_minutes",
        "steps",
        "revision_reason",
        "created_at",
        "notes",
      ],
      ...data.customRoutineVersions.map((v) => [
        v.id,
        v.routineIdentityId,
        v.versionNumber,
        v.title,
        v.context,
        v.publicationStatus,
        v.estimatedMinutes,
        v.steps,
        v.revisionReason,
        v.createdAt,
        v.notes,
      ]),
    ];
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}
