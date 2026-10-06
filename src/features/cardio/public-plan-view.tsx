import type { PublicCardioPlan } from "./public-plan";
const time = (seconds: number) =>
  `${Math.floor(seconds / 60)} min${seconds % 60 ? ` ${seconds % 60} s` : ""}`;
export function PublicPlanSchedule({
  plan,
  detailed,
}: {
  plan: PublicCardioPlan;
  detailed: boolean;
}) {
  return (
    <section aria-label="Published running schedule">
      <h3>
        {plan.durationWeeks}-week schedule · {plan.sessionsPerWeek} runs each
        week
      </h3>
      <p>{plan.goal}</p>
      <p>
        Keep at least {plan.minimumRestDaysBetweenRuns} rest day between runs.
        Equipment: {plan.equipment.join(", ")}.
      </p>
      <p>Intensity method: source text · {plan.intensity.instruction}</p>
      <p>
        {plan.progression} {plan.regression}
      </p>
      <p>
        The session totals below exclude stretching. Targets describe the
        schedule; they are not recorded activity or a guarantee of completing 5
        km.
      </p>
      {detailed &&
        Array.from({ length: plan.durationWeeks }, (_, index) => index + 1).map(
          (week) => (
            <section key={week}>
              <h4>Week {week}</h4>
              <ol>
                {plan.sessions
                  .filter((s) => s.week === week)
                  .map((session) => (
                    <li key={session.run}>
                      <strong>
                        Run {session.run} · {time(session.totalSeconds)}
                      </strong>
                      <p>
                        {session.segments
                          .map(
                            (segment) =>
                              `${segment.kind === "warm_up" ? "Warm-up walk" : segment.kind === "cool_down" ? "Cooldown walk" : segment.kind === "walk" ? "Walk" : "Run"} ${time(segment.seconds)}`,
                          )
                          .join(" → ")}
                      </p>
                    </li>
                  ))}
              </ol>
            </section>
          ),
        )}
      <p>
        <a href="/cardio/session/new">
          Choose a source run in the optional tracker
        </a>
      </p>
      <p>
        {plan.attribution} <a href={plan.licenceUrl}>Licence</a> ·{" "}
        <a href={plan.sourceUrl}>Original source schedule</a> · snapshot version{" "}
        {plan.version}, extracted {plan.extractedAt.slice(0, 10)}; original
        update date {plan.sourceDate ?? "not available"}.
      </p>
    </section>
  );
}
