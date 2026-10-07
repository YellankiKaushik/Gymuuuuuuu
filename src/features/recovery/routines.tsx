import { useEffect, useRef, useState } from "react";
import { contexts, type Routine, type Session } from "./schema";
import {
  newRecoveryId,
  startSession,
  transitionSession,
  playerElapsed,
} from "./domain";
import {
  saveRoutine,
  saveSession,
  archiveRoutine,
  deleteRecoveryRecord,
  readRecoveryView,
} from "./storage";
import { Field, useRecovery, display } from "./workspace";
export function LocalRoutines() {
  const { view, run } = useRecovery();
  const [query, setQuery] = useState(""),
    [context, setContext] = useState("");
  if (!view) return null;
  return (
    <>
      <a className="button primary" href="/mobility/custom/create">
        Create a routine
      </a>
      <div className="recovery-grid">
        <Field label="Search my routines">
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </Field>
        <Field label="Routine context">
          <select value={context} onChange={(e) => setContext(e.target.value)}>
            <option value="">All contexts</option>
            {contexts.map((c) => (
              <option key={c} value={c}>
                {c.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="recovery-grid">
        {view.data.customRoutineIdentities
          .filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
          .map((identity) => {
            const routine = view.data.customRoutineVersions.find(
              (v) => v.id === identity.currentVersionId,
            );
            if (!routine || (context && routine.context !== context))
              return null;
            return (
              <article className="recovery-card" key={identity.id}>
                <h2>{identity.title}</h2>
                <p>
                  {identity.status} · version {routine.versionNumber} ·{" "}
                  {routine.context.replaceAll("_", " ")}
                </p>
                <p>
                  {routine.steps.length} steps ·{" "}
                  {routine.estimatedMinutes ?? "Unknown"} estimated minutes
                </p>
                {routine.publicationProvenance && (
                  <details>
                    <summary>Original source instructions</summary>
                    <p>
                      Source checked{" "}
                      {routine.publicationProvenance.sourceChecked}.
                      Personal-use publication; no independent human review.
                      Your changes do not alter this original source snapshot.
                    </p>
                    <ul>
                      {routine.publicationProvenance.sourceReferences.map(
                        (source) => (
                          <li key={source.id}>
                            <a
                              href={source.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {source.title}
                            </a>
                          </li>
                        ),
                      )}
                    </ul>
                    <ol>
                      {routine.publicationProvenance.sourceSteps.map((step) => (
                        <li key={step.id}>
                          <strong>{step.title}</strong>: {step.doseValue}{" "}
                          {step.doseType.replaceAll("_", " ")}
                          <p>{step.techniqueCue}</p>
                          <p>{step.intensityCue}</p>
                          <ul>
                            {step.stopSignals?.map((signal) => (
                              <li key={signal}>{signal}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ol>
                    <ul>
                      {routine.publicationProvenance.limitations.map(
                        (limitation) => (
                          <li key={limitation}>{limitation}</li>
                        ),
                      )}
                    </ul>
                  </details>
                )}
                <div className="actions">
                  <a
                    className="button primary"
                    href={`/mobility/session/${identity.id}`}
                  >
                    Open routine
                  </a>
                  <a
                    className="button secondary"
                    href={`/mobility/custom/create?edit=${identity.id}`}
                  >
                    Create revision
                  </a>
                  <button
                    className="button secondary"
                    onClick={() =>
                      void run(
                        () => archiveRoutine(identity.id),
                        "Routine status updated; historical sessions preserved.",
                      )
                    }
                  >
                    {identity.status === "active" ? "Archive" : "Reactivate"}
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Delete this routine identity? Versions and historical sessions remain for backup and undo.",
                        )
                      )
                        void run(
                          () =>
                            deleteRecoveryRecord(
                              "customRoutineIdentities",
                              identity.id,
                            ),
                          "Routine deleted; undo is available in settings.",
                        );
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
      </div>
      {!view.data.customRoutineIdentities.length && (
        <p>
          No local routines yet. Build text-only steps from your own
          instructions.
        </p>
      )}
      <a href="/mobility/history">Routine session history</a>
    </>
  );
}
function blankStep(order: number): Routine["steps"][number] {
  return {
    id: newRecoveryId(),
    order,
    title: "",
    doseType: "seconds",
    doseValue: 30,
    sides: "none",
    intensityCue: "",
    techniqueCue: "",
    stopSignals: [],
    phase03ExerciseId: null,
    alternativeExerciseIds: [],
  };
}
export function RoutineBuilder() {
  const { view } = useRecovery();
  if (!view) return null;
  const editId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("edit")
      : null;
  const identity = view.data.customRoutineIdentities.find(
      (i) => i.id === editId,
    ),
    routine = view.data.customRoutineVersions.find(
      (v) => v.id === identity?.currentVersionId,
    );
  return <RoutineForm key={routine?.id ?? "new"} existing={routine} />;
}
function RoutineForm({ existing }: { existing: Routine | undefined }) {
  const { run, busy } = useRecovery();
  const [draft, setDraft] = useState<Routine>(() =>
    existing
      ? {
          ...structuredClone(existing),
          id: newRecoveryId(),
          versionNumber: existing.versionNumber + 1,
          revisionReason: "",
          createdAt: new Date().toISOString(),
        }
      : {
          id: newRecoveryId(),
          routineIdentityId: newRecoveryId(),
          versionNumber: 1,
          title: "",
          context: "standalone_mobility",
          publicationStatus: "local_active",
          estimatedMinutes: null,
          steps: [blankStep(1)],
          notes: "",
          createdAt: new Date().toISOString(),
          revisionReason: "Initial version",
        },
  );
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof Routine>(key: K, value: Routine[K]) =>
    setDraft((v) => ({ ...v, [key]: value }));
  const step = (index: number, change: Partial<Routine["steps"][number]>) =>
    set(
      "steps",
      draft.steps.map((s, i) => (i === index ? { ...s, ...change } : s)),
    );
  const move = (index: number, delta: number) => {
    const next = [...draft.steps],
      target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    set(
      "steps",
      next.map((s, i) => ({ ...s, order: i + 1 })),
    );
  };
  return (
    <form
      className="recovery-form"
      onSubmit={(e) => {
        e.preventDefault();
        void run(
          () =>
            saveRoutine(
              { ...draft, createdAt: new Date().toISOString() },
              existing?.id,
            ),
          "Immutable routine version saved.",
        ).then((ok) => {
          if (ok) setSaved(true);
        });
      }}
    >
      <p>
        Local instructions are authored by you. They receive no clinical or
        editorial endorsement. Source instructions, when copied, remain
        available separately from your changes.
      </p>
      <Field label="Routine title">
        <input
          required
          maxLength={200}
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label="Context">
        <select
          value={draft.context}
          onChange={(e) => set("context", e.target.value as Routine["context"])}
        >
          {contexts.map((c) => (
            <option key={c} value={c}>
              {c.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Estimated minutes (optional)">
        <input
          type="number"
          min="1"
          max="180"
          value={draft.estimatedMinutes ?? ""}
          onChange={(e) =>
            set(
              "estimatedMinutes",
              e.target.value ? Number(e.target.value) : null,
            )
          }
        />
      </Field>
      <Field label="Revision reason">
        <input
          required
          maxLength={1000}
          value={draft.revisionReason}
          onChange={(e) => set("revisionReason", e.target.value)}
        />
      </Field>
      {draft.steps.map((s, i) => (
        <fieldset key={s.id} className="recovery-card">
          <legend>Step {i + 1}</legend>
          <Field label={`Step ${i + 1} title`}>
            <input
              required
              maxLength={200}
              value={s.title}
              onChange={(e) => step(i, { title: e.target.value })}
            />
          </Field>
          <div className="recovery-grid">
            <Field label={`Step ${i + 1} dose type`}>
              <select
                value={s.doseType}
                onChange={(e) =>
                  step(i, { doseType: e.target.value as typeof s.doseType })
                }
              >
                {[
                  "seconds",
                  "repetitions",
                  "breaths",
                  "distance",
                  "ramp_up_set",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t === "distance" ? "Distance (m)" : t.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={`Step ${i + 1} dose`}
              help={
                s.doseType === "distance"
                  ? "Canonical metres"
                  : s.doseType === "seconds"
                    ? "Canonical seconds"
                    : "Whole-number count"
              }
            >
              <input
                type="number"
                min="0.001"
                max="86400"
                step={
                  ["seconds", "distance"].includes(s.doseType) ? "any" : "1"
                }
                required
                value={s.doseValue}
                onChange={(e) => step(i, { doseValue: Number(e.target.value) })}
              />
            </Field>
            <Field label={`Step ${i + 1} sides`}>
              <select
                value={s.sides ?? "none"}
                onChange={(e) =>
                  step(i, { sides: e.target.value as typeof s.sides })
                }
              >
                {["none", "left_right", "alternating", "bilateral"].map((v) => (
                  <option key={v} value={v}>
                    {v.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label={`Step ${i + 1} intensity cue`}>
            <input
              maxLength={500}
              value={s.intensityCue ?? ""}
              onChange={(e) => step(i, { intensityCue: e.target.value })}
            />
          </Field>
          <Field label={`Step ${i + 1} technique cue`}>
            <textarea
              maxLength={1000}
              value={s.techniqueCue ?? ""}
              onChange={(e) => step(i, { techniqueCue: e.target.value })}
            />
          </Field>
          <Field label={`Step ${i + 1} stop signals (one per line)`}>
            <textarea
              value={s.stopSignals?.join("\n") ?? ""}
              onChange={(e) =>
                step(i, {
                  stopSignals: e.target.value.split("\n").filter(Boolean),
                })
              }
            />
          </Field>
          <div className="actions">
            <button
              type="button"
              className="button secondary"
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              Move step {i + 1} up
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={i === draft.steps.length - 1}
              onClick={() => move(i, 1)}
            >
              Move step {i + 1} down
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                set("steps", [
                  ...draft.steps,
                  {
                    ...structuredClone(s),
                    id: newRecoveryId(),
                    order: draft.steps.length + 1,
                  },
                ])
              }
            >
              Duplicate step {i + 1}
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={draft.steps.length === 1}
              onClick={() =>
                set(
                  "steps",
                  draft.steps
                    .filter((_, j) => i !== j)
                    .map((v, j) => ({ ...v, order: j + 1 })),
                )
              }
            >
              Remove step {i + 1}
            </button>
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        className="button secondary"
        disabled={draft.steps.length >= 100}
        onClick={() =>
          set("steps", [...draft.steps, blankStep(draft.steps.length + 1)])
        }
      >
        Add step
      </button>
      <Field label="Routine notes">
        <textarea
          maxLength={5000}
          value={draft.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>
      <button className="button primary" disabled={busy || saved}>
        Save routine version
      </button>
      {saved && (
        <a className="button secondary" href="/mobility/custom">
          View saved routines
        </a>
      )}
    </form>
  );
}
export function RoutinePlayer({ routineId }: { routineId: string }) {
  const { view, run, busy } = useRecovery();
  const [tick, setTick] = useState(0),
    [wakeMessage, setWakeMessage] = useState("");
  const lock = useRef<WakeLockSentinel | null>(null);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => {
      window.clearInterval(timer);
      void lock.current?.release();
    };
  }, []);
  if (!view) return null;
  const identity = view.data.customRoutineIdentities.find(
      (i) => i.id === routineId,
    ),
    routine = view.data.customRoutineVersions.find(
      (v) => v.id === identity?.currentVersionId,
    ),
    session = [...view.data.mobilitySessions]
      .filter(
        (s) =>
          s.routineId === routineId && ["paused", "running"].includes(s.state),
      )
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  if (!routine)
    return (
      <p>
        Routine unavailable. Its historical snapshots remain in session history.
      </p>
    );
  const step = session?.routineSnapshot.steps[session.stepIndex],
    elapsed = session ? playerElapsed(session) : null;
  const act = (action: Parameters<typeof transitionSession>[1]) => {
    if (session)
      void run(
        () =>
          saveSession(transitionSession(session, action), session.updatedAt),
        `Routine ${action.replaceAll("_", " ")} saved.`,
      );
  };
  return (
    <>
      <section className="recovery-card">
        <h2>{session?.routineSnapshot.title ?? routine.title}</h2>
        <p>
          Frozen version{" "}
          {session?.routineSnapshot.versionNumber ?? routine.versionNumber} ·{" "}
          {identity?.status}
        </p>
        {session ? (
          <>
            <p role="status">
              Session {session.state} · Step {session.stepIndex + 1} of{" "}
              {session.routineSnapshot.steps.length}
            </p>
            <p className="recovery-number" aria-live="off" data-tick={tick}>
              {display(elapsed?.activeSeconds, 0)} <small>active seconds</small>
            </p>
            {step && (
              <>
                <h3>{step.title}</h3>
                <p>
                  {step.doseValue}{" "}
                  {step.doseType === "distance"
                    ? "m"
                    : step.doseType.replaceAll("_", " ")}{" "}
                  · {step.sides?.replaceAll("_", " ")}
                </p>
                <p>
                  Step elapsed {display(elapsed?.stepSeconds, 0)} s
                  {step.doseType === "seconds"
                    ? ` · Remaining ${display(Math.max(0, step.doseValue - (elapsed?.stepSeconds ?? 0)), 0)} s`
                    : ""}
                </p>
                <p>{step.intensityCue}</p>
                <p>{step.techniqueCue}</p>
                {step.stopSignals?.length ? (
                  <ul>
                    {step.stopSignals.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : null}
              </>
            )}
            <div className="actions">
              <button
                disabled={busy}
                className="button primary"
                onClick={() =>
                  act(session.state === "running" ? "pause" : "resume")
                }
              >
                {session.state === "running" ? "Pause" : "Resume"}
              </button>
              <button
                disabled={busy}
                className="button secondary"
                onClick={() => act("complete_step")}
              >
                {step?.sides === "left_right"
                  ? `Complete ${session.side} side`
                  : "Complete step"}
              </button>
              <button
                disabled={busy}
                className="button secondary"
                onClick={() => act("skip_step")}
              >
                Skip step
              </button>
              {step?.sides === "left_right" && (
                <>
                  <button
                    disabled={busy}
                    className="button secondary"
                    aria-pressed={session.side === "left"}
                    onClick={() => act("left")}
                  >
                    Left side
                  </button>
                  <button
                    disabled={busy}
                    className="button secondary"
                    aria-pressed={session.side === "right"}
                    onClick={() => act("right")}
                  >
                    Right side
                  </button>
                </>
              )}
              <button
                disabled={busy}
                className="button secondary"
                onClick={() => {
                  if (
                    window.confirm(
                      "End this unfinished session? Performed and skipped steps will be retained.",
                    )
                  )
                    act("abandon");
                }}
              >
                End session
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              No active session. Start explicitly to save a new version
              snapshot.
            </p>
            <button
              className="button primary"
              disabled={busy || identity?.status === "archived"}
              onClick={() =>
                void run(
                  () =>
                    saveSession(
                      startSession(
                        routine,
                        view.data.settings[0]?.value.timezone ??
                          Intl.DateTimeFormat().resolvedOptions().timeZone,
                      ),
                    ),
                  "Routine session started and saved.",
                )
              }
            >
              Start routine
            </button>
          </>
        )}
      </section>
      <button
        className="button secondary"
        onClick={() => {
          void run(async () => {
            if (lock.current) {
              await lock.current.release();
              lock.current = null;
              setWakeMessage("Screen wake lock released.");
            } else {
              if (!navigator.wakeLock)
                throw Error("Screen wake lock is unavailable in this browser.");
              lock.current = await navigator.wakeLock.request("screen");
              setWakeMessage(
                "Screen wake lock enabled while this page is visible.",
              );
            }
          }, "Screen preference updated.");
        }}
      >
        Toggle screen wake lock
      </button>
      <p role="status">{wakeMessage}</p>
      <a href="/mobility/history">Review session history and add feedback</a>
    </>
  );
}
export function MobilityHistory() {
  const { view, run, busy } = useRecovery();
  const [page, setPage] = useState(0);
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10)),
    [custom, setCustom] = useState<Awaited<
      ReturnType<typeof readRecoveryView>
    > | null>(null);
  if (!view) return null;
  const sessions = [...(custom ?? view).data.mobilitySessions].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );
  return (
    <>
      <p>
        {sessions.length} sessions in the loaded view. Initial views load at
        most 500 recent records; select an earlier window to review older
        sessions. Cards are paginated by 20.
      </p>
      <form
        className="recovery-grid"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            setCustom(await readRecoveryView(90, end, 100000));
            setPage(0);
          }, "Routine history window loaded.");
        }}
      >
        <Field label="Routine history window ends (UTC date)">
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </Field>
        <button className="button secondary">Load 90-day session window</button>
      </form>
      <div className="recovery-grid">
        {sessions.slice(page * 20, page * 20 + 20).map((session) => (
          <SessionCard
            key={`${session.id}:${session.updatedAt}`}
            session={session}
            run={run}
            busy={busy}
          />
        ))}
      </div>
      {!sessions.length && <p>No routine sessions yet.</p>}
      <div className="actions">
        <button
          className="button secondary"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous sessions
        </button>
        <button
          className="button secondary"
          disabled={(page + 1) * 20 >= sessions.length}
          onClick={() => setPage((p) => p + 1)}
        >
          Next sessions
        </button>
      </div>
    </>
  );
}
function SessionCard({
  session,
  run,
  busy,
}: {
  session: Session;
  run: ReturnType<typeof useRecovery>["run"];
  busy: boolean;
}) {
  const [notes, setNotes] = useState(session.notes ?? ""),
    [difficulty, setDifficulty] = useState(
      String(session.perceivedDifficulty ?? ""),
    ),
    [discomfort, setDiscomfort] = useState(session.discomfortConcern ?? false);
  return (
    <article className="recovery-card">
      <h2>{session.routineSnapshot.title}</h2>
      <p>
        {session.startedAt} · {session.timezone} · {session.state} · version{" "}
        {session.routineSnapshot.versionNumber}
      </p>
      <p>
        {session.completedStepIds.length} completed ·{" "}
        {session.skippedStepIds.length} skipped ·{" "}
        {display(session.activeSeconds, 0)} saved active seconds
      </p>
      <details>
        <summary>Exact performed version</summary>
        <ol>
          {session.routineSnapshot.steps.map((s) => (
            <li key={s.id}>
              {s.title} · {s.doseValue} {s.doseType} ·{" "}
              {session.completedStepIds.includes(s.id)
                ? "Completed"
                : session.skippedStepIds.includes(s.id)
                  ? "Skipped"
                  : "Not completed"}
            </li>
          ))}
        </ol>
      </details>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(
            () =>
              saveSession(
                {
                  ...session,
                  notes,
                  perceivedDifficulty: difficulty ? Number(difficulty) : null,
                  discomfortConcern: discomfort,
                  updatedAt: new Date().toISOString(),
                },
                session.updatedAt,
              ),
            "Session feedback saved.",
          );
        }}
      >
        <Field
          label="Perceived difficulty"
          help="1 = very easy, 5 = very difficult"
        >
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">Not measured</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
        <label className="recovery-check">
          <input
            type="checkbox"
            checked={discomfort}
            onChange={(e) => setDiscomfort(e.target.checked)}
          />
          Discomfort concern
        </label>
        <Field label="Session notes">
          <textarea
            maxLength={5000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
        <button className="button secondary" disabled={busy}>
          Save feedback
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "Delete this session? Undo is available in settings.",
              )
            )
              void run(
                () => deleteRecoveryRecord("mobilitySessions", session.id),
                "Session deleted.",
              );
          }}
        >
          Delete session
        </button>
      </form>
    </article>
  );
}
