import { useState } from "react";
import {
  CardioPage,
  CardioField as Field,
  useCardio,
  display,
  readable,
} from "./workspace";
import { weeklyVolume } from "./domain";
import {
  readCardioView,
  saveCardioSession,
  cardioOwnerId,
  type CardioView,
} from "./storage";
import { cardioReference, type Session } from "./schema";
import { ModalitySelect } from "./builders";
import { calculatePace, formatPace, fromMetres } from "./calculations";
import { localDate } from "../recovery/domain";
import { queryWorkouts } from "../workout-tracker/storage";
import { readRecoveryView } from "../recovery/storage";
import { createRecordStorage } from "../../storage/indexed-db/adapter";
import { listProgramInstances } from "../programs/local";
export function HomePage() {
  return (
    <CardioPage title="Cardio & conditioning">
      <Home />
    </CardioPage>
  );
}
function Home() {
  const { view } = useCardio();
  const live = view?.sessions.find((s) =>
    ["active", "paused"].includes(s.status),
  );
  const today = localDate(
      new Date().toISOString(),
      view?.preferences.value.timezone ?? "UTC",
    ),
    start = new Date(`${today}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  const from = start.toISOString().slice(0, 10);
  const volume = weeklyVolume(
    view?.sessions.filter(
      (s) => s.sessionDate >= from && s.sessionDate <= today,
    ) ?? [],
  );
  const selectedIdentity = view?.planIdentities.find(
    (i) => i.id === view.preferences.value.currentPlanIdentityId,
  );
  const currentPlan = view?.plans.find(
    (p) => p.id === selectedIdentity?.currentVersionId,
  );
  const planStart = view?.preferences.value.planStartDate;
  const planWeek = planStart
    ? Math.floor(
        (Date.parse(`${today}T12:00:00Z`) -
          Date.parse(`${planStart}T12:00:00Z`)) /
          604800000,
      ) + 1
    : 1;
  const nextSlot =
    currentPlan && planWeek >= 1 && planWeek <= currentPlan.durationWeeks
      ? [...currentPlan.sessions]
          .sort((a, b) => a.dayIndex - b.dayIndex)
          .find(
            (slot) =>
              !view?.sessions.some(
                (s) =>
                  s.status === "completed" &&
                  s.sourcePlanSnapshot?.planId === currentPlan.planIdentityId &&
                  s.sourcePlanSnapshot.sessionId === slot.id &&
                  s.sourcePlanSnapshot.weekNumber === planWeek,
              ),
          )
      : null;
  return (
    <>
      <div className="recovery-grid">
        <section className="card">
          <h2>{live ? "Session in progress" : "Choose your next activity"}</h2>
          {live ? (
            <>
              <p>
                {live.title} · {live.status}
              </p>
              <a className="button primary" href="/cardio/session/active">
                Resume session controls
              </a>
            </>
          ) : (
            <a className="button primary" href="/cardio/session/new">
              Start or record a session
            </a>
          )}
          <p>
            <a href="/cardio/custom-plans">My plans</a> ·{" "}
            <a href="/conditioning">My conditioning routines</a>
          </p>
        </section>
        <section className="card">
          <h2>This calendar week</h2>
          <p>
            {from}–{today}. Uses recorded local session dates; records from
            different timezones share this date window.
          </p>
          {view ? (
            <dl>
              <dt>Moderate minutes</dt>
              <dd>{display(volume.moderateMinutes)}</dd>
              <dt>Vigorous minutes</dt>
              <dd>{display(volume.vigorousMinutes)}</dd>
              <dt>Unclassified minutes</dt>
              <dd>{display(volume.unclassifiedMinutes)}</dd>
              <dt>Guideline-equivalent minutes</dt>
              <dd>{display(volume.equivalentMinutes)}</dd>
            </dl>
          ) : (
            <p>Browser records have not loaded.</p>
          )}
          <p>{volume.warning} Missing intensity is not treated as moderate.</p>
        </section>
      </div>
      <section className="card">
        <h2>Adult public-health context</h2>
        <p>
          WHO/HHS describe 150–300 moderate or 75–150 vigorous minutes per week,
          or an equivalent combination. Short bouts count. These population
          ranges are not an individualized plan or a reason to override
          symptoms.
        </p>
        <p>
          <a href="https://www.ncbi.nlm.nih.gov/books/NBK566046/">
            WHO activity guidelines
          </a>{" "}
          ·{" "}
          <a href="https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines">
            HHS guidelines
          </a>
        </p>
      </section>
      <section className="card">
        <h2>My current cardio plan</h2>
        {currentPlan ? (
          <>
            <p>
              {currentPlan.title} · version {currentPlan.versionNumber} · your
              goal: {currentPlan.goal || "Not set"}
            </p>
            <p>
              {planStart
                ? `Plan starts ${planStart}; calendar week ${planWeek}.`
                : "No start date selected; showing week 1."}
            </p>
            <p>
              {nextSlot
                ? `Next unrecorded slot in this week: ${nextSlot.title}, day index ${nextSlot.dayIndex}.`
                : "No unrecorded slot in the loaded date window for this plan week."}
            </p>
            <p>
              Your own schedule is shown as context. It does not recommend
              increasing intensity or override stop concerns. Older completed
              records may be outside the loaded 90-day window.
            </p>
          </>
        ) : (
          <p>No current local cardio plan selected.</p>
        )}
        <a href="/cardio/custom-plans">Choose my plan or session</a>
      </section>
      <ConcurrentContext />
      <section className="card">
        <h2>Reviewed knowledge</h2>
        <p>
          Public drafts are awaiting claim-level review. Your own plans and
          records remain available independently.
        </p>
        <a href="/cardio/learn">Learn</a> ·{" "}
        <a href="/cardio/modalities">Reviewed modality guidance</a> ·{" "}
        <a href="/cardio/plans">Reviewed plan finder</a>
      </section>
      <h2>Recent sessions</h2>
      {view?.sessions.slice(0, 5).map((s) => (
        <SessionCard key={s.id} session={s} />
      ))}
      {view && !view.sessions.length && <p>No cardio records saved.</p>}
    </>
  );
}
export function SessionCard({ session }: { session: Session }) {
  const { view } = useCardio();
  const unit = view?.preferences.value.distanceUnit ?? "km";
  return (
    <article className="card">
      <h2>
        <a href={`/cardio/history/${session.id}`}>{session.title}</a>
      </h2>
      <p>
        {session.sessionDate} ·{" "}
        {
          cardioReference.modalities.find((m) => m.id === session.modalityId)
            ?.displayName
        }{" "}
        · {readable(session.sessionTypeId)} · {session.status}
      </p>
      <p>
        {display(session.elapsedSecondsExact)} s ·{" "}
        {display(
          session.distanceMeters === null
            ? null
            : fromMetres(session.distanceMeters, unit),
          3,
        )}{" "}
        {unit} · HR source: {readable(session.heartRateSource)}
      </p>
    </article>
  );
}
export function HistoryPage() {
  return (
    <CardioPage title="Cardio history">
      <History />
    </CardioPage>
  );
}
function History() {
  const { view, run, busy } = useCardio();
  const [loaded, setLoaded] = useState<CardioView | null>(null),
    [end, setEnd] = useState(""),
    [days, setDays] = useState(90),
    [modality, setModality] = useState(""),
    [status, setStatus] = useState(""),
    [type, setType] = useState(""),
    [source, setSource] = useState(""),
    [plan, setPlan] = useState(""),
    [environment, setEnvironment] = useState(""),
    [page, setPage] = useState(0);
  const data = loaded ?? view;
  const filtered =
    data?.sessions.filter(
      (s) =>
        (!modality || s.modalityId === modality) &&
        (!status || s.status === status) &&
        (!type || s.sessionTypeId === type) &&
        (!source || s.heartRateSource === source) &&
        (!plan || s.sourcePlanSnapshot?.planVersionId === plan) &&
        (!environment || s.environment.locationType === environment),
    ) ?? [];
  return (
    <>
      <form
        className="card recovery-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            setLoaded(
              await readCardioView(
                end || new Date().toISOString().slice(0, 10),
                days,
                100000,
              ),
            );
            setPage(0);
          }, "Requested history window loaded locally.");
        }}
      >
        <Field label="Window end date">
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </Field>
        <Field label="Window days">
          <input
            type="number"
            min="1"
            max="3650"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </Field>
        <button className="button secondary" disabled={busy}>
          Load history window
        </button>
        <Field label="Filter activity">
          <select
            value={modality}
            onChange={(e) => {
              setModality(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All activities</option>
            {cardioReference.modalities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </Field>
        {(
          [
            [
              "Status",
              status,
              setStatus,
              ["draft", "active", "paused", "completed", "abandoned"],
            ],
            ["Session type", type, setType, cardioReference.sessionTypes],
            ["HR source", source, setSource, cardioReference.heartRateSources],
            [
              "Environment",
              environment,
              setEnvironment,
              ["indoor", "outdoor", "mixed", "unknown"],
            ],
          ] as const
        ).map(([label, value, setter, options]) => (
          <Field key={label} label={`Filter ${label.toLowerCase()}`}>
            <select
              value={value}
              onChange={(e) => {
                setter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All</option>
              {options.map((o) => (
                <option key={o} value={o}>
                  {readable(o)}
                </option>
              ))}
            </select>
          </Field>
        ))}
        <Field label="Filter source plan version">
          <select
            value={plan}
            onChange={(e) => {
              setPlan(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All plan versions</option>
            {[
              ...new Set(
                data?.sessions.flatMap((s) =>
                  s.sourcePlanSnapshot
                    ? [s.sourcePlanSnapshot.planVersionId]
                    : [],
                ) ?? [],
              ),
            ].map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </Field>
      </form>
      <p>
        {filtered.length} matching loaded records. {data?.totalSessions ?? 0}{" "}
        total stored; the initial window is bounded to 500 records. Load another
        date window for older entries.
      </p>
      <details>
        <summary>Calendar date counts</summary>
        <ul>
          {[...new Set(filtered.map((s) => s.sessionDate))]
            .sort()
            .map((date) => (
              <li key={date}>
                {date}: {filtered.filter((s) => s.sessionDate === date).length}{" "}
                sessions
              </li>
            ))}
        </ul>
      </details>
      {filtered.slice(page * 20, (page + 1) * 20).map((s) => (
        <SessionCard key={s.id} session={s} />
      ))}
      {!filtered.length && <p>No matching records in this window.</p>}
      <div className="actions">
        <button
          className="button secondary"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Previous 20
        </button>
        <button
          className="button secondary"
          disabled={(page + 1) * 20 >= filtered.length}
          onClick={() => setPage(page + 1)}
        >
          Next 20
        </button>
      </div>
    </>
  );
}
export function ProgressPage() {
  return (
    <CardioPage title="Cardio observations over time">
      <Progress />
    </CardioPage>
  );
}
function Progress() {
  const { view } = useCardio();
  const [modality, setModality] = useState("modality_walking_outdoor"),
    [source, setSource] = useState("none"),
    [environment, setEnvironment] = useState("unknown");
  const [device, setDevice] = useState("");
  const rows =
    view?.sessions
      .filter(
        (s) =>
          s.status === "completed" &&
          s.modalityId === modality &&
          s.heartRateSource === source &&
          (s.deviceLabel ?? "") === device &&
          s.environment.locationType === environment,
      )
      .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate)) ?? [];
  return (
    <>
      <p>
        Descriptive observations from the loaded 90-day window. Compare the same
        activity, HR source and environment; sparse records or unrecorded
        terrain do not establish fitness improvement or cause. No cross-modality
        pace ranking is generated.
      </p>
      <div className="card">
        <Field label="Comparable device or machine">
          <select value={device} onChange={(e) => setDevice(e.target.value)}>
            <option value="">Device not recorded</option>
            {[
              ...new Set(
                view?.sessions.flatMap((s) =>
                  s.deviceLabel ? [s.deviceLabel] : [],
                ) ?? [],
              ),
            ].map((label) => (
              <option value={label} key={label}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Comparable activity">
          <ModalitySelect value={modality} onChange={setModality} />
        </Field>
        <Field label="Comparable HR source">
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            {cardioReference.heartRateSources.map((s) => (
              <option key={s} value={s}>
                {readable(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Comparable environment">
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          >
            {["unknown", "indoor", "outdoor", "mixed"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {!device && (
        <p>
          Device or machine identity is unrecorded for this group. Treat the
          observations as context, rather than a verified comparison between
          devices.
        </p>
      )}
      {rows.length < 3 && (
        <p>
          Fewer than three comparable entries. Read individual observations; no
          trend claim is made.
        </p>
      )}
      <div
        className="cardio-table"
        tabIndex={0}
        role="region"
        aria-label="Comparable session table"
      >
        <table>
          <caption>Recorded comparable sessions</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Time s</th>
              <th scope="col">Distance m</th>
              <th scope="col">Pace /km</th>
              <th scope="col">HR bpm</th>
              <th scope="col">Effort</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const pace =
                s.distanceMeters && s.elapsedSecondsExact
                  ? calculatePace(s.distanceMeters, s.elapsedSecondsExact)
                  : null;
              return (
                <tr key={s.id}>
                  <th scope="row">
                    <a href={`/cardio/history/${s.id}`}>{s.sessionDate}</a>
                  </th>
                  <td>{display(s.elapsedSecondsExact)}</td>
                  <td>{display(s.distanceMeters)}</td>
                  <td>{formatPace(pace?.secondsPerKm ?? null)}</td>
                  <td>{display(s.averageHeartRateBpm)}</td>
                  <td>{display(s.perceivedEffort0to10)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
type ContextData = {
  workouts: { id: string; title: string; date: string }[];
  programs: { id: string; status: string }[];
  concerns: { date: string; pain: boolean; illness: boolean }[];
};
export function ConcurrentContext() {
  const { view, run, busy } = useCardio();
  const [context, setContext] = useState<ContextData | null>(null),
    [selected, setSelected] = useState<string[]>([]),
    [priority, setPriority] = useState<Session["strengthPriority"]>("not_set");
  const live = view?.sessions.find((s) =>
    ["active", "paused"].includes(s.status),
  );
  return (
    <section className="card">
      <h2>Strength and recovery context</h2>
      <p>
        Load a read-only view of your local strength schedule, recent completed
        workouts and recovery concerns. Choose strength, cardio or balanced
        priority yourself. Scheduling separation can be considered; there is no
        universal order or automated hard-session recommendation.
      </p>
      <button
        className="button secondary"
        disabled={busy}
        onClick={() =>
          void run(async () => {
            const adapter = createRecordStorage();
            try {
              const [workouts, recovery, programs] = await Promise.all([
                queryWorkouts({ status: "completed", limit: 30 }),
                readRecoveryView(7),
                listProgramInstances(adapter),
              ]);
              setContext({
                workouts: workouts.map((w) => ({
                  id: w.id,
                  title: w.title,
                  date: w.localDate,
                })),
                programs: programs
                  .filter((p) =>
                    ["planned", "active", "paused"].includes(p.status),
                  )
                  .map((p) => ({ id: p.canonicalProgramId, status: p.status })),
                concerns: recovery.data.recoveryCheckIns
                  .filter((c) => c.painOrInjuryConcern || c.illnessSymptoms)
                  .map((c) => ({
                    date: c.date,
                    pain: c.painOrInjuryConcern ?? false,
                    illness: c.illnessSymptoms ?? false,
                  })),
              });
            } finally {
              adapter.close();
            }
          }, "Read-only local context loaded.")
        }
      >
        Load local concurrent context
      </button>
      {context && (
        <>
          <p>
            {context.programs.length} selected strength programs;{" "}
            {context.workouts.length} recent completed workouts. Loading does
            not update those modules.
          </p>
          {context.programs.map((p) => (
            <p key={p.id}>
              {p.id} · {p.status} ·{" "}
              <a href="/programs">Review strength schedule</a>
            </p>
          ))}
          {context.concerns.map((c) => (
            <p key={c.date}>
              Concern reported {c.date}: {c.pain ? "pain/injury " : ""}
              {c.illness ? "illness" : ""}. Avoid treating a target as
              clearance; seek individual advice.
            </p>
          ))}
          {live && (
            <>
              <Field label="Your concurrent priority">
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as typeof priority)
                  }
                >
                  {["not_set", "strength", "cardio", "balanced"].map((s) => (
                    <option value={s} key={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <fieldset>
                <legend>Optional completed-workout links</legend>
                {context.workouts.map((w) => (
                  <Field key={w.id} label={`${w.date} · ${w.title}`}>
                    <input
                      type="checkbox"
                      checked={selected.includes(w.id)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, w.id]
                            : selected.filter((id) => id !== w.id),
                        )
                      }
                    />
                  </Field>
                ))}
              </fieldset>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await saveCardioSession(
                      {
                        ...live,
                        linkedWorkoutIds: selected,
                        strengthPriority: priority,
                        revision: live.revision + 1,
                        updatedAt: new Date().toISOString(),
                      },
                      live.revision,
                      cardioOwnerId(),
                    );
                  }, "Concurrent choices saved only to this cardio session.")
                }
              >
                Save my concurrent choices
              </button>
            </>
          )}
        </>
      )}
    </section>
  );
}
