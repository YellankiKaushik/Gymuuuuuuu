import { useEffect, useRef, useState } from "react";
import { PageHeader } from "../../components/common/page-header";
import {
  createRecordStorage,
  type AtomicRecordStorage,
} from "../../storage/indexed-db/adapter";
import {
  personalPlanSchema,
  type PersonalPlan,
} from "../../domain/schemas/personal-workout-plan";
import { exerciseIndexes } from "../exercises/repository";
import { createWorkout, getPreferences } from "../workout-tracker/storage";
import { downloadLocal } from "../workout-tracker/backup";
import {
  deletePersonalPlan,
  canonicalPlanRest,
  listPersonalPlans,
  newPersonalPlan,
  personalPlanCsv,
  savePersonalPlan,
  withPersonalPlanWrite,
  workoutFromPersonalPlan,
} from "./plans";
import { localId } from "../workout-tracker/domain";
import { isPilotExercise, pilotExerciseIds } from "./scope";

type Entry = {
  id: string;
  exerciseId: (typeof pilotExerciseIds)[number];
  sets: string;
  repetitions: string;
  rest: string;
  unit: "s" | "min";
};
type Form = { name: string; sessions: { id: "A" | "B"; entries: Entry[] }[] };
const show = (n: number | null) => (n === null ? "" : String(n));
const toForm = (p: PersonalPlan): Form => ({
  name: p.payload.name,
  sessions: p.payload.sessions.map((s) => ({
    id: s.id,
    entries: s.entries.map((e) => ({
      id: e.id,
      exerciseId: e.exerciseId,
      sets: show(e.sets),
      repetitions: show(e.repetitions),
      rest: show(e.restSeconds),
      unit: "s",
    })),
  })),
});
const number = (value: string) => (value.trim() === "" ? null : Number(value));
const nameOf = (id: string) =>
  exerciseIndexes.byId.get(id)?.displayName ?? "Exercise unavailable";
const explain = (e: unknown) =>
  e instanceof Error
    ? e.message
    : "The operation failed. Your draft remains on this page.";

export function PersonalPlanEditor() {
  const [plans, setPlans] = useState<PersonalPlan[]>([]),
    [seed, setSeed] = useState<PersonalPlan>(),
    [saved, setSaved] = useState<PersonalPlan>(),
    [form, setForm] = useState<Form>(),
    [message, setMessage] = useState("Opening personal plans…"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [choices, setChoices] = useState({ A: "", B: "" });
  const storage = useRef<AtomicRecordStorage | null>(null),
    pending = useRef(false),
    channel = useRef<BroadcastChannel | null>(null),
    signature = useRef(""),
    errorBox = useRef<HTMLParagraphElement>(null);
  const dirty =
    !!form &&
    (!saved || JSON.stringify(form) !== JSON.stringify(toForm(saved)));
  const unsaved =
    !!form &&
    dirty &&
    (!!saved ||
      !!form.name ||
      form.sessions.some((s) => s.entries.length > 0) ||
      form.sessions.length > 1);
  const refresh = async () => {
    if (!storage.current) return;
    const rows = await listPersonalPlans(storage.current),
      next = JSON.stringify(rows.map((p) => [p.id, p.payload.revision]));
    signature.current = next;
    setPlans(rows);
  };
  useEffect(() => {
    const s = createRecordStorage();
    storage.current = s;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const p = newPersonalPlan();
      setSeed(p);
      setForm(toForm(p));
      const intent = new URLSearchParams(window.location.search).get(
        "exercise",
      );
      if (intent && isPilotExercise(intent)) setChoices({ A: intent, B: "" });
    });
    void listPersonalPlans(s)
      .then((rows) => {
        if (active) {
          setPlans(rows);
          signature.current = JSON.stringify(
            rows.map((p) => [p.id, p.payload.revision]),
          );
          setMessage(
            "Personal plans stay in this browser. Save a draft when you are ready.",
          );
        }
      })
      .catch((e) => {
        if (active) setError(explain(e));
      });
    const update = () => {
      if (active)
        void listPersonalPlans(s)
          .then((rows) => {
            if (!active) return;
            const next = JSON.stringify(
              rows.map((p) => [p.id, p.payload.revision]),
            );
            if (signature.current !== next) {
              signature.current = next;
              setPlans(rows);
              setMessage(
                "Saved plans changed in another tab. Your draft has not been replaced. Reload before changing it.",
              );
            }
          })
          .catch((e) => {
            if (active) setError(explain(e));
          });
    };
    window.addEventListener("focus", update);
    if (typeof BroadcastChannel !== "undefined") {
      const c = new BroadcastChannel("fitness-os-personal-plans");
      channel.current = c;
      c.onmessage = update;
    }
    return () => {
      active = false;
      window.removeEventListener("focus", update);
      channel.current?.close();
      channel.current = null;
      s.close();
      storage.current = null;
    };
  }, []);
  useEffect(() => {
    if (!unsaved) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);
  const fail = (e: unknown) => {
    setError(explain(e));
    window.requestAnimationFrame(() => errorBox.current?.focus());
  };
  const run = async (operation: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await operation();
    } catch (e) {
      fail(e);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  const select = (plan?: PersonalPlan) => {
    if (unsaved && !window.confirm("Discard unsaved changes to this draft?"))
      return;
    const p = plan ?? newPersonalPlan();
    setSeed(p);
    setSaved(plan);
    setForm(toForm(p));
    setError("");
    setMessage(
      plan
        ? "Opened saved personal plan."
        : "New personal draft; no targets are prefilled.",
    );
  };
  const change = (id: "A" | "B", entryId: string, patch: Partial<Entry>) =>
    setForm(
      (f) =>
        f && {
          ...f,
          sessions: f.sessions.map((s) =>
            s.id === id
              ? {
                  ...s,
                  entries: s.entries.map((e) =>
                    e.id === entryId ? { ...e, ...patch } : e,
                  ),
                }
              : s,
          ),
        },
    );
  const save = () =>
    run(async () => {
      if (!storage.current || !seed || !form) return;
      const candidate = {
        ...seed,
        payload: {
          ...seed.payload,
          name: form.name.trim(),
          sessions: form.sessions.map((s) => ({
            id: s.id,
            entries: s.entries.map((e) => ({
              id: e.id,
              exerciseId: e.exerciseId,
              sets: number(e.sets),
              repetitions: number(e.repetitions),
              restSeconds: canonicalPlanRest(number(e.rest), e.unit),
            })),
          })),
        },
      };
      const parsed = personalPlanSchema.safeParse(candidate);
      if (!parsed.success)
        throw Error(
          parsed.error.issues
            .slice(0, 3)
            .map(
              (i) =>
                `${i.path.includes("entries") ? "Exercise targets: " : ""}${i.message}`,
            )
            .join(" "),
        );
      const p = await savePersonalPlan(storage.current, parsed.data, saved);
      setSaved(p);
      setSeed(p);
      setForm(toForm(p));
      channel.current?.postMessage("changed");
      setMessage("Saved personal plan in this browser.");
      await refresh().catch(() => {
        setMessage(
          "Plan saved. The saved-plan list could not refresh; reload this page to reopen it.",
        );
      });
    });
  const start = (sessionId: "A" | "B") =>
    run(async () => {
      if (!saved || dirty || !storage.current)
        throw Error("Save your plan before starting a workout.");
      await withPersonalPlanWrite(async () => {
        const raw = await storage.current!.get(saved.id);
        if (!raw)
          throw Error(
            "This plan was deleted in another tab. Choose another saved plan.",
          );
        const current = personalPlanSchema.parse(raw);
        if (JSON.stringify(current) !== JSON.stringify(saved))
          throw Error(
            "This plan changed in another tab. Reload it before starting.",
          );
        await getPreferences();
        const session = await createWorkout(
          workoutFromPersonalPlan(current, sessionId),
        );
        window.location.assign(`/workout/session/${session.id}`);
      });
    });
  const remove = () => {
    if (
      !saved ||
      !window.confirm(
        `Delete personal plan “${saved.payload.name}”? Logged workouts will be preserved.`,
      )
    )
      return;
    void run(async () => {
      if (!storage.current) return;
      await deletePersonalPlan(storage.current, saved);
      const p = newPersonalPlan();
      setSaved(undefined);
      setSeed(p);
      setForm(toForm(p));
      channel.current?.postMessage("changed");
      setMessage("Personal plan deleted. Logged workouts are preserved.");
      await refresh().catch(() => {
        setMessage(
          "Plan deleted. The saved-plan list could not refresh; reload this page.",
        );
      });
    });
  };
  const csv = () => {
    if (!saved) return;
    downloadLocal(
      "personal-workout-plan.csv",
      personalPlanCsv(saved),
      "text/csv;charset=utf-8",
    );
    setMessage(
      "CSV download requested for the saved revision. Verify the downloaded file.",
    );
  };
  return (
    <div className="page personal-plans">
      <PageHeader
        title="Personal workout plans"
        eyebrow="LEARN → PLAN → TRAIN"
        description="Choose from six guided exercises. Write your own targets and keep up to two sessions in each personal plan."
      />
      <nav className="section-nav" aria-label="Personal plan journey">
        <a href="/muscles?view=body">Explore muscles</a>
        <a href="/exercises">Exercise guides</a>
        <a href="/workout">Workout workspace</a>
        <a href="/workout/history">History & progress</a>
        <a href="/settings/data">Back up plans & workouts</a>
      </nav>
      <p role="status">{message}</p>
      <p ref={errorBox} tabIndex={-1} role="alert" className="form-error">
        {error}
      </p>
      <div className="personal-plan-layout">
        <aside aria-label="Saved personal plans">
          <h2>Saved plans</h2>
          <button
            className="button secondary"
            disabled={busy || !form}
            onClick={() => select()}
          >
            New personal plan
          </button>
          {plans.length ? (
            <ul>
              {plans.map((p) => (
                <li key={p.id}>
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() => select(p)}
                    aria-pressed={saved?.id === p.id}
                  >
                    {p.payload.name} · revision {p.payload.revision}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No personal plans saved yet.</p>
          )}
          <p>
            Personal plans are your edited records. They are separate from
            published source programs and actual completed workouts.
          </p>
          <a href="/programs">Browse published source programs</a>
        </aside>
        {form && seed ? (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="personal-plan-editor"
          >
            <fieldset disabled={busy}>
              <legend>
                {saved ? "Edit personal plan" : "New personal draft"}
              </legend>
              <label>
                Plan name
                <input
                  maxLength={120}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoComplete="off"
                />
              </label>
              <p>
                Blank targets mean unspecified. There are no suggested sets,
                repetitions, loads or schedules.
              </p>
              {form.sessions.map((session) => (
                <section
                  className="personal-session"
                  key={session.id}
                  aria-label={`Session ${session.id}`}
                >
                  <h2>Session {session.id}</h2>
                  {session.id === "B" && (
                    <button
                      type="button"
                      className="button danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Remove Session B and its draft entries?",
                          )
                        )
                          setForm({
                            ...form,
                            sessions: form.sessions.filter((s) => s.id !== "B"),
                          });
                      }}
                    >
                      Remove Session B
                    </button>
                  )}
                  <label>
                    {`Exercise for Session ${session.id}`}
                    <select
                      value={choices[session.id]}
                      onChange={(e) =>
                        setChoices({ ...choices, [session.id]: e.target.value })
                      }
                    >
                      <option value="">Choose an exercise</option>
                      {pilotExerciseIds.map((id) => (
                        <option
                          key={id}
                          value={id}
                          disabled={session.entries.some(
                            (e) => e.exerciseId === id,
                          )}
                        >
                          {nameOf(id)} ·{" "}
                          {exerciseIndexes.byId.get(id)?.difficulty}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="button secondary"
                    disabled={
                      !choices[session.id] ||
                      session.entries.some(
                        (e) => e.exerciseId === choices[session.id],
                      )
                    }
                    onClick={() => {
                      const id = choices[session.id];
                      if (!isPilotExercise(id)) return;
                      setForm({
                        ...form,
                        sessions: form.sessions.map((s) =>
                          s.id === session.id
                            ? {
                                ...s,
                                entries: [
                                  ...s.entries,
                                  {
                                    id: localId("plan_entry"),
                                    exerciseId: id as Entry["exerciseId"],
                                    sets: "",
                                    repetitions: "",
                                    rest: "",
                                    unit: "s",
                                  },
                                ],
                              }
                            : s,
                        ),
                      });
                      setChoices({ ...choices, [session.id]: "" });
                      setMessage(
                        "Exercise added to the draft. Save to keep your changes.",
                      );
                    }}
                  >{`Add exercise to Session ${session.id}`}</button>
                  {!session.entries.length && (
                    <p>
                      No exercises selected. Add an exercise before starting
                      this session.
                    </p>
                  )}
                  <ol className="personal-plan-entries">
                    {session.entries.map((entry, index) => (
                      <li key={entry.id}>
                        <h3>{nameOf(entry.exerciseId)}</h3>
                        <p>
                          {
                            exerciseIndexes.byId.get(entry.exerciseId)
                              ?.difficulty
                          }{" "}
                          ·{" "}
                          <a
                            href={`/exercises/${exerciseIndexes.byId.get(entry.exerciseId)?.slug}`}
                          >
                            Read guide & safety
                          </a>
                        </p>
                        <div className="personal-targets">
                          <label>
                            Intended sets
                            <input
                              type="number"
                              min={1}
                              max={100}
                              step={1}
                              value={entry.sets}
                              onChange={(e) =>
                                change(session.id, entry.id, {
                                  sets: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label>
                            Intended repetitions
                            <input
                              type="number"
                              min={1}
                              max={10000}
                              step={1}
                              value={entry.repetitions}
                              onChange={(e) =>
                                change(session.id, entry.id, {
                                  repetitions: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label>
                            Rest (optional)
                            <input
                              type="number"
                              min={0}
                              max={entry.unit === "s" ? 86400 : 1440}
                              step="any"
                              value={entry.rest}
                              onChange={(e) =>
                                change(session.id, entry.id, {
                                  rest: e.target.value,
                                })
                              }
                            />
                          </label>
                          <label>
                            Rest unit
                            <select
                              value={entry.unit}
                              onChange={(e) =>
                                change(session.id, entry.id, {
                                  unit: e.target.value as Entry["unit"],
                                })
                              }
                            >
                              <option value="s">seconds</option>
                              <option value="min">minutes</option>
                            </select>
                          </label>
                        </div>
                        <div className="personal-actions">
                          {([-1, 1] as const).map((direction) => (
                            <button
                              type="button"
                              className="button secondary"
                              key={direction}
                              disabled={
                                index + direction < 0 ||
                                index + direction >= session.entries.length
                              }
                              aria-label={`${direction === -1 ? "Move up" : "Move down"} ${nameOf(entry.exerciseId)} in Session ${session.id}`}
                              onClick={() => {
                                const entries = [...session.entries];
                                [entries[index], entries[index + direction]] = [
                                  entries[index + direction]!,
                                  entries[index]!,
                                ];
                                setForm({
                                  ...form,
                                  sessions: form.sessions.map((s) =>
                                    s.id === session.id ? { ...s, entries } : s,
                                  ),
                                });
                              }}
                            >
                              {direction === -1 ? "Move up" : "Move down"}
                            </button>
                          ))}
                          <button
                            type="button"
                            className="button danger"
                            aria-label={`Remove ${nameOf(entry.exerciseId)} from Session ${session.id}`}
                            onClick={() =>
                              setForm({
                                ...form,
                                sessions: form.sessions.map((s) =>
                                  s.id === session.id
                                    ? {
                                        ...s,
                                        entries: s.entries.filter(
                                          (e) => e.id !== entry.id,
                                        ),
                                      }
                                    : s,
                                ),
                              })
                            }
                          >
                            Remove exercise
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    className="button primary"
                    disabled={!saved || dirty || !session.entries.length}
                    onClick={() => void start(session.id)}
                  >{`Start Session ${session.id}`}</button>
                </section>
              ))}
              <div className="personal-actions">
                <button
                  type="button"
                  className="button secondary"
                  disabled={form.sessions.length === 2}
                  onClick={() =>
                    setForm({
                      ...form,
                      sessions: [...form.sessions, { id: "B", entries: [] }],
                    })
                  }
                >
                  Add Session B
                </button>
                <button
                  type="submit"
                  className="button primary"
                  disabled={!!saved && !dirty}
                >
                  Save personal plan
                </button>
                {saved && (
                  <>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() =>
                        void run(async () => {
                          const raw = await storage.current?.get(saved.id);
                          if (!raw)
                            throw Error(
                              "This plan was deleted in another tab.",
                            );
                          if (
                            unsaved &&
                            !window.confirm(
                              "Discard this draft and reload the saved plan?",
                            )
                          )
                            return;
                          const p = personalPlanSchema.parse(raw);
                          setSaved(p);
                          setSeed(p);
                          setForm(toForm(p));
                          setMessage("Reloaded the saved revision.");
                        })
                      }
                    >
                      Reload saved plan
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={csv}
                    >
                      Export saved plan CSV
                    </button>
                    <button
                      type="button"
                      className="button danger"
                      onClick={remove}
                    >
                      Delete personal plan
                    </button>
                  </>
                )}
              </div>
              <p>
                {dirty
                  ? "Unsaved draft. Save before starting."
                  : "Saved revision selected."}{" "}
                Workouts start as repetition logs; recording mode and actual
                loads can be changed in the existing tracker. Unspecified sets
                create no prefilled sets.
              </p>
              <p>
                Browser storage is not a backup. Use{" "}
                <a href="/settings/data/backup">full local-data backup</a> for
                personal plans and workouts; CSV is for inspection, not restore.
                Never assume a download succeeded without checking it.
              </p>
            </fieldset>
          </form>
        ) : (
          <p>Personal records are loaded only in this browser.</p>
        )}
      </div>
    </div>
  );
}
