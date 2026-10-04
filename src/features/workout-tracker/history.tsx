import { useEffect, useState } from "react";
import { PageHeader } from "../../components/common/page-header";
import { EmptyState } from "../../components/common/states";
import { repeatSession, sessionSummary } from "./domain";
import {
  createWorkout,
  getWorkout,
  queryWorkouts,
  type HistoryQuery,
} from "./storage";
import { WorkoutNav } from "./start";
import { workoutPersonalRecords } from "./backup";
import type { WorkoutSession } from "./schema";
import { performanceModes, loadScopes } from "./schema";
export function WorkoutHistory({ exerciseId }: { exerciseId?: string }) {
  const [query, setQuery] = useState<HistoryQuery>({
      exerciseId,
      sort: "newest",
      limit: 30,
      offset: 0,
    }),
    [records, setRecords] = useState<WorkoutSession[]>([]),
    [message, setMessage] = useState("Loading history…");
  const [allRecords, setAllRecords] = useState<
    Awaited<ReturnType<typeof workoutPersonalRecords>>
  >([]);
  useEffect(() => {
    if (exerciseId)
      void workoutPersonalRecords()
        .then(setAllRecords)
        .catch(() => undefined);
  }, [exerciseId]);
  useEffect(() => {
    let cancelled = false;
    void queryWorkouts(query)
      .then((value) => {
        if (!cancelled) {
          setRecords(value);
          setMessage("");
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setMessage(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);
  const change = (next: Partial<HistoryQuery>) =>
    setQuery({ ...query, ...next, offset: 0 });
  return (
    <div className="page">
      <PageHeader
        title={exerciseId ? "Exercise history" : "Workout history"}
        description="Review and edit your device-local performance records."
      />
      <WorkoutNav />
      <form className="local-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Search titles
          <input
            value={query.q ?? ""}
            onChange={(event) => change({ q: event.target.value })}
          />
        </label>
        <label>
          From date
          <input
            type="date"
            value={query.from ?? ""}
            onChange={(event) => change({ from: event.target.value })}
          />
        </label>
        <label>
          To date
          <input
            type="date"
            value={query.to ?? ""}
            onChange={(event) => change({ to: event.target.value })}
          />
        </label>
        <label>
          Source
          <select
            value={query.source ?? ""}
            onChange={(event) => change({ source: event.target.value })}
          >
            <option value="">All sources</option>
            {["program", "ad_hoc", "repeat", "import"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Program ID (optional)
          <input
            value={query.programId ?? ""}
            onChange={(event) => change({ programId: event.target.value })}
          />
        </label>
        {!exerciseId && (
          <label>
            Exercise or personal label ID (optional)
            <input
              value={query.exerciseId ?? ""}
              onChange={(event) => change({ exerciseId: event.target.value })}
            />
          </label>
        )}
        {exerciseId && (
          <>
            <label>
              Performance mode
              <select
                value={query.mode ?? ""}
                onChange={(event) => change({ mode: event.target.value })}
              >
                <option value="">All modes</option>
                {performanceModes.map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </label>
            <label>
              Load scope
              <select
                value={query.scope ?? ""}
                onChange={(event) => change({ scope: event.target.value })}
              >
                <option value="">All scopes</option>
                {loadScopes.map((scope) => (
                  <option key={scope}>{scope}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <label>
          Status
          <select
            value={query.status ?? ""}
            onChange={(event) => change({ status: event.target.value })}
          >
            <option value="">Completed and abandoned</option>
            <option>completed</option>
            <option>abandoned</option>
          </select>
        </label>
        <label>
          Sort
          <select
            value={query.sort}
            onChange={(event) =>
              change({ sort: event.target.value as "newest" | "oldest" })
            }
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={Boolean(query.deleted)}
            onChange={(event) => change({ deleted: event.target.checked })}
          />
          Show deleted workouts
        </label>
      </form>
      <p role="status">{message}</p>
      {records.length ? (
        <div className="entity-grid">
          {records.map((session) => (
            <a
              className="entity-card"
              key={session.id}
              href={`/workout/history/${session.id}`}
            >
              <small>
                {session.localDate} · {session.status}
                {session.deletedAt ? " · Deleted" : ""}
              </small>
              <h2>{session.title}</h2>
              <p>
                {sessionSummary(session).completed} completed sets ·{" "}
                {Math.floor(sessionSummary(session).duration / 60)} minutes
              </p>
            </a>
          ))}
        </div>
      ) : (
        !message && (
          <EmptyState
            title="No workout history here yet."
            description="Start an optional local workout to create a record."
          >
            <a className="button primary" href="/workout">
              Start workout
            </a>
          </EmptyState>
        )
      )}
      <div className="actions">
        <button
          className="button secondary"
          disabled={!query.offset}
          onClick={() =>
            setQuery({
              ...query,
              offset: Math.max(0, (query.offset ?? 0) - 30),
            })
          }
        >
          Previous page
        </button>
        <button
          className="button secondary"
          disabled={records.length < 30}
          onClick={() =>
            setQuery({ ...query, offset: (query.offset ?? 0) + 30 })
          }
        >
          Next page
        </button>
      </div>
      {exerciseId && records.length > 0 && (
        <section className="detail-section">
          <h2>Comparable personal records</h2>
          <ul>
            {allRecords
              .filter((item) => item.key.startsWith(`${exerciseId}:`))
              .map((item) => (
                <li key={item.key}>
                  {item.label} · {item.value} canonical units · {item.date}
                </li>
              ))}
          </ul>
          <small>
            Separated by performance mode and load scope. Warm-ups, abandoned
            and deleted sessions are excluded.
          </small>
        </section>
      )}
    </div>
  );
}
export function WorkoutSummary({ id }: { id: string }) {
  const [session, setSession] = useState<WorkoutSession>(),
    [message, setMessage] = useState("Loading summary…");
  const [records, setRecords] = useState<
    Awaited<ReturnType<typeof workoutPersonalRecords>>
  >([]);
  useEffect(() => {
    void workoutPersonalRecords()
      .then(setRecords)
      .catch(() => undefined);
  }, [id]);
  useEffect(() => {
    void getWorkout(id)
      .then((value) => {
        setSession(value);
        setMessage(value ? "" : "This workout was not found.");
      })
      .catch((error: Error) => setMessage(error.message));
  }, [id]);
  const summary = session ? sessionSummary(session) : undefined;
  return (
    <div className="page">
      <PageHeader
        title={session ? `${session.title} — summary` : "Workout summary"}
      />
      <WorkoutNav />
      <p role="status">{message}</p>
      {session && summary && (
        <>
          <div className="summary-grid">
            {[
              [
                "Active duration",
                `${Math.floor(summary.duration / 60)} minutes`,
              ],
              ["Exercises", summary.exercises],
              ["Completed sets", summary.completed],
              ["Skipped sets", summary.skipped],
              ["Incomplete sets", summary.incomplete],
              ["Total repetitions", summary.reps],
            ].map(([label, value]) => (
              <div className="entity-card" key={label}>
                <h2>{label}</h2>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          {Object.entries(summary.volumeByScope).map(([scope, value]) => (
            <p key={scope}>
              External load volume ({scope}): {value.toLocaleString()} kg ×
              repetitions. This log total does not estimate adaptation.
            </p>
          ))}
          <p>{session.sessionNote}</p>
          <section className="detail-section">
            <h2>Comparable personal records held by this workout</h2>
            <ul>
              {records
                .filter((record) => record.sessionId === session.id)
                .map((record) => (
                  <li key={record.key}>
                    {record.label} ·{" "}
                    {record.key.split(":").at(-1) === "max_load"
                      ? `${record.value / 1000} kg`
                      : record.value}{" "}
                    · {record.date}
                  </li>
                ))}
            </ul>
            <small>
              Calculated from completed local sessions, separated by exercise,
              mode and scope. Warm-ups and deleted sessions are excluded.
            </small>
          </section>
          <p>Session RPE: {session.sessionRpe ?? "Not entered"}</p>
          <div className="actions">
            <a className="button secondary" href={`/workout/history/${id}`}>
              Review or edit
            </a>
            <button
              className="button primary"
              onClick={() => {
                const next = repeatSession(session);
                void createWorkout(next)
                  .then(() =>
                    window.location.assign(`/workout/session/${next.id}`),
                  )
                  .catch((error: Error) => setMessage(error.message));
              }}
            >
              Repeat workout
            </button>
          </div>
          <details>
            <summary>Record details</summary>
            <p>
              ID {session.id} · revision {session.revision} ·{" "}
              {session.programRef?.canonicalProgramVersion ?? "Ad hoc"}
            </p>
          </details>
        </>
      )}
    </div>
  );
}
