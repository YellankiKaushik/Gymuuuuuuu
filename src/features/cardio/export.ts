import type { CardioBackup } from "./schema";
import { weeklyVolume } from "./domain";
function cell(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  const text = String(value),
    safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
function csv(headers: string[], rows: unknown[][]) {
  return [
    headers.map(cell).join(","),
    ...rows.map((row) => row.map(cell).join(",")),
  ].join("\r\n");
}
function weekStart(date: string) {
  const day = new Date(`${date}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  return day.toISOString().slice(0, 10);
}
export function cardioCsv(root: CardioBackup) {
  const sessions = root.cardioSessions;
  const weeks = [
    ...new Set(sessions.map((s) => weekStart(s.sessionDate))),
  ].sort();
  return {
    "cardio-sessions.csv": csv(
      [
        "id",
        "date",
        "timezone",
        "title",
        "modality_id",
        "type",
        "status",
        "elapsed_s",
        "distance_m",
        "average_hr_bpm",
        "maximum_hr_bpm",
        "hr_source",
        "power_W",
        "cadence",
        "cadence_unit",
        "effort_0_10",
        "talk_test",
        "stop_signals",
        "notes",
        "device_label",
        "started_at",
        "ended_at",
        "location_type",
        "surface",
        "temperature_C",
        "humidity_percent",
        "elevation_gain_m",
        "environment_tags",
        "source_plan_version_id",
        "classification_version",
        "linked_workout_ids",
        "created_at",
        "updated_at",
      ],
      sessions.map((s) => [
        s.id,
        s.sessionDate,
        s.timezone,
        s.title,
        s.modalityId,
        s.sessionTypeId,
        s.status,
        s.elapsedSecondsExact,
        s.distanceMeters,
        s.averageHeartRateBpm,
        s.maximumHeartRateBpm,
        s.heartRateSource,
        s.averagePowerWatts,
        s.averageCadence,
        s.cadenceUnit,
        s.perceivedEffort0to10,
        s.talkTest,
        s.stopSignals.join("|"),
        s.notes,
        s.deviceLabel,
        s.startedAt,
        s.endedAt,
        s.environment.locationType,
        s.environment.surface,
        s.environment.temperatureCelsius,
        s.environment.humidityPercent,
        s.environment.elevationGainMeters,
        s.environment.tags.join("|"),
        s.sourcePlanSnapshot?.planVersionId ?? null,
        s.classificationVersion,
        s.linkedWorkoutIds.join("|"),
        s.createdAt,
        s.updatedAt,
      ]),
    ),
    "cardio-segments.csv": csv(
      [
        "session_id",
        "segment_id",
        "order",
        "title",
        "type",
        "target_mode",
        "target_value",
        "target_unit",
        "actual_s",
        "actual_distance_m",
        "status",
        "method",
        "method_version",
        "source_ids",
        "modification",
      ],
      sessions.flatMap((s) => [
        ...s.segments.map((seg) => [
          s.id,
          seg.id,
          seg.order,
          seg.title,
          seg.segmentType,
          seg.targetMode,
          seg.targetValue,
          seg.targetUnit,
          seg.actualSecondsExact,
          seg.actualDistanceMeters,
          seg.status,
          seg.intensity.method,
          seg.intensity.methodVersion,
          seg.intensity.provenance.sourceIds.join("|"),
          seg.modificationNote,
        ]),
        ...s.laps.map((lap, i) => [
          s.id,
          lap.id,
          i + 1,
          `Lap ${i + 1}`,
          "lap_observation",
          "open",
          null,
          null,
          lap.elapsedSecondsExact - (s.laps[i - 1]?.elapsedSecondsExact ?? 0),
          lap.distanceMeters,
          "recorded",
          "timestamp",
          "timestamp-lap-1",
          "",
          "Separate observation overlaps segment time; do not sum with segment rows.",
        ]),
      ]),
    ),
    "cardio-heart-rate-observations.csv": csv(
      [
        "session_id",
        "observation_id",
        "timestamp",
        "bpm",
        "source",
        "clinical_measurement",
      ],
      sessions.flatMap((s) =>
        s.heartRateObservations.map((h) => [
          s.id,
          h.id,
          h.at,
          h.bpm,
          h.source,
          false,
        ]),
      ),
    ),
    "cardio-interval-completion.csv": csv(
      [
        "session_id",
        "segment_id",
        "work_or_recovery",
        "recovery_mode",
        "planned_mode",
        "planned_value",
        "planned_unit",
        "actual_s",
        "actual_distance_m",
        "completion_status",
      ],
      sessions.flatMap((s) =>
        s.segments
          .filter((seg) => ["work", "recovery"].includes(seg.segmentType))
          .map((seg) => [
            s.id,
            seg.id,
            seg.segmentType,
            seg.recoveryMode,
            seg.targetMode,
            seg.targetValue,
            seg.targetUnit,
            seg.actualSecondsExact,
            seg.actualDistanceMeters,
            seg.status,
          ]),
      ),
    ),
    "cardio-weekly-summary.csv": csv(
      [
        "week_start",
        "moderate_minutes",
        "vigorous_minutes",
        "unclassified_minutes",
        "guideline_equivalent_minutes",
        "framework",
        "method_version",
        "source_ids",
      ],
      weeks.map((week) => {
        const volume = weeklyVolume(
          sessions.filter((s) => weekStart(s.sessionDate) === week),
        );
        return [
          week,
          volume.moderateMinutes,
          volume.vigorousMinutes,
          volume.unclassifiedMinutes,
          volume.equivalentMinutes,
          volume.frameworkId,
          volume.methodVersion,
          volume.sourceIds.join("|"),
        ];
      }),
    ),
    "cardio-custom-plans.csv": csv(
      [
        "identity_id",
        "version_id",
        "version_number",
        "title",
        "goal",
        "duration_weeks",
        "day_index",
        "session_id",
        "session_title",
        "modality_id",
        "session_type",
        "revision_reason",
      ],
      root.customPlanVersions.flatMap((p) =>
        p.sessions.map((s) => [
          p.planIdentityId,
          p.id,
          p.versionNumber,
          p.title,
          p.goal,
          p.durationWeeks,
          s.dayIndex,
          s.id,
          s.title,
          s.modalityId,
          s.sessionTypeId,
          p.revisionReason,
        ]),
      ),
    ),
    "cardio-custom-routines.csv": csv(
      [
        "identity_id",
        "version_id",
        "version_number",
        "title",
        "modality_id",
        "session_type",
        "segment_id",
        "segment_order",
        "segment_title",
        "target_mode",
        "target_value",
        "target_unit",
        "include_final_recovery",
        "revision_reason",
      ],
      root.customRoutineVersions.flatMap((r) =>
        r.segments.map((s) => [
          r.routineIdentityId,
          r.id,
          r.versionNumber,
          r.title,
          r.modalityId,
          r.sessionTypeId,
          s.id,
          s.order,
          s.title,
          s.targetMode,
          s.targetValue,
          s.targetUnit,
          r.includeFinalRecovery,
          r.revisionReason,
        ]),
      ),
    ),
  };
}
export function downloadCardioFile(
  name: string,
  text: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
