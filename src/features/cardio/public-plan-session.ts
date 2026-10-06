import { publicPlanSchema, type PublicCardioPlan } from "./public-plan";
import { manualIntensity, makeSegment, validatePlan } from "./domain";
import type { PublicCardioEntity } from "./publication";

/** The whole selected source week is frozen; later content cannot rewrite it. */
export function publicPlanWeekSnapshot(
  entity: PublicCardioEntity,
  week: number,
) {
  const plan = publicPlanSchema.parse(entity.plan);
  if (!Number.isInteger(week) || week < 1 || week > plan.durationWeeks)
    throw Error("Choose a published source week.");
  return validatePlan({
    id: `${entity.id}_v${plan.version.replaceAll(".", "_")}_week_${week}`,
    planIdentityId: entity.id,
    versionNumber: 1,
    title: entity.title,
    goal: plan.goal,
    durationWeeks: plan.durationWeeks,
    sessions: plan.sessions
      .filter((s) => s.week === week)
      .map((s) => ({
        id: `${entity.id}_week_${s.week}_run_${s.run}`,
        dayIndex: s.run * 2 - 1,
        title: `Week ${s.week}, run ${s.run}`,
        modalityId: "modality_running_outdoor",
        sessionTypeId: "walk_jog",
        segments: s.segments.map((part, index) => {
          const type =
            part.kind === "warm_up" || part.kind === "cool_down"
              ? part.kind
              : part.kind === "walk"
                ? "recovery"
                : "work";
          const segment = makeSegment(
            part.kind === "run"
              ? "Run"
              : part.kind === "walk"
                ? "Walk"
                : part.kind === "warm_up"
                  ? "Warm-up walk"
                  : "Cooldown walk",
            "duration",
            part.seconds,
            type,
            index + 1,
          );
          segment.id = `${entity.id}_w${s.week}_r${s.run}_part_${index + 1}`;
          const intensity = manualIntensity(plan.intensity.instruction);
          intensity.methodVersion = plan.intensity.methodVersion;
          intensity.provenance.basis = "reviewed_source";
          intensity.provenance.sourceIds = [plan.sourceId];
          segment.intensity = intensity;
          if (part.kind === "walk") segment.recoveryMode = "active";
          return segment;
        }),
        notes: `Source snapshot ${plan.version}; original week ${week}. ${plan.progression} ${plan.regression}`,
      })),
    progressionNotes: `${plan.progression} ${plan.regression}`,
    sourceIds: [plan.sourceId],
    publicationStatus: "local_active",
    revisionReason: `Immutable public source schedule ${plan.version}, week ${week}; not a generated schedule.`,
    createdAt: plan.extractedAt,
  });
}

export function publicPlanMatches(
  plan: PublicCardioPlan,
  filters: {
    experience: string;
    days: string;
    time: string;
    equipment: string;
    impact: string;
    priority: string;
    environment: string;
  },
) {
  return (
    (!filters.experience || filters.experience === plan.experience) &&
    (!filters.days || Number(filters.days) >= plan.sessionsPerWeek) &&
    (!filters.time ||
      Number(filters.time) * 60 >=
        Math.max(...plan.sessions.map((s) => s.totalSeconds))) &&
    (!filters.equipment ||
      plan.equipment.some((item) =>
        item.toLowerCase().includes(filters.equipment.toLowerCase()),
      )) &&
    (!filters.impact || filters.impact === "any") &&
    !filters.priority &&
    !filters.environment
  );
}
