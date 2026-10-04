import { useEffect, useState } from "react";
import { PageHeader } from "../../components/common/page-header";
import { InfoCallout } from "../../components/common/primitives";
import { createRecordStorage } from "../../storage/indexed-db/adapter";
import { listProgramInstances } from "../programs/local";
import { resolveProgramVersion } from "../programs/repository";
import type { LocalProgramInstance, Program } from "../programs/schema";
import { getPublishedExercises } from "../exercises/repository";
import {
  activeWorkout,
  createWorkout,
  getCustomExercises,
  queryWorkouts,
  saveCustomExercise,
  readTracker,
} from "./storage";
import {
  fromProgram,
  localId,
  newExercise,
  newSession,
  repeatSession,
} from "./domain";
import {
  allowedScopes,
  performanceModes,
  type CustomExercise,
  type WorkoutExercise,
  type WorkoutSession,
} from "./schema";
export function WorkoutNav() {
  return (
    <nav className="section-nav" aria-label="Workout">
      <a href="/workout">Start / resume</a>
      <a href="/workout/history">History</a>
      <a href="/workout/settings">Settings & backup</a>
    </nav>
  );
}
const publishedExercises = getPublishedExercises();
export function WorkoutStart() {
  const [active, setActive] = useState<WorkoutSession>(),
    [history, setHistory] = useState<WorkoutSession[]>([]),
    [customs, setCustoms] = useState<CustomExercise[]>([]),
    [title, setTitle] = useState(""),
    [name, setName] = useState(""),
    [mode, setMode] = useState<WorkoutExercise["performanceMode"]>("load_reps"),
    [scope, setScope] =
      useState<WorkoutExercise["loadScope"]>("total_external"),
    [chosen, setChosen] = useState<string[]>([]),
    [nextSessionId, setNextSessionId] = useState<string>(),
    [message, setMessage] = useState("Loading local data…"),
    [busy, setBusy] = useState(true),
    [current, setCurrent] = useState<{
      program: Program;
      instance: LocalProgramInstance;
    }>();
  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      activeWorkout(),
      queryWorkouts({ limit: 5 }),
      getCustomExercises(),
    ])
      .then(([session, records, labels]) => {
        if (!cancelled) {
          setActive(session);
          setHistory(records);
          setCustoms(labels);
          setMessage("");
          setBusy(false);
        }
      })
      .catch((error: Error) => {
        setMessage(error.message);
        setBusy(false);
      });
    const storage = createRecordStorage();
    void listProgramInstances(storage)
      .then((instances) => {
        const instance = instances.find((item) =>
            ["planned", "active", "paused"].includes(item.status),
          ),
          program = instance
            ? resolveProgramVersion(
                instance.canonicalProgramId,
                instance.canonicalProgramVersion,
              )
            : undefined;
        if (!cancelled && instance && program) {
          setCurrent({ instance, program });
          const id = instance.instanceId.startsWith("program_instance_")
            ? instance.instanceId
            : `program_instance_${instance.instanceId}`;
          void readTracker<{ sequenceCursor: number | null }>(
            "programTrackingStates",
            id,
          ).then((state) => {
            const sessions = program.scheduleModel?.sessions ?? [];
            if (!cancelled && sessions.length)
              setNextSessionId(
                sessions[(state?.sequenceCursor ?? 0) % sessions.length]?.id,
              );
          });
        }
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => storage.close());
    return () => {
      cancelled = true;
    };
  }, []);
  const start = async (session: WorkoutSession) => {
    setBusy(true);
    try {
      await createWorkout(session);
      window.location.assign(`/workout/session/${session.id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Workout could not start.",
      );
      setBusy(false);
    }
  };
  const addLabel = async () => {
    if (!name.trim()) return;
    const now = new Date().toISOString(),
      label: CustomExercise = {
        id: localId("custom_exercise"),
        schemaVersion: 1,
        displayName: name.trim(),
        performanceMode: mode,
        loadScope: scope,
        notes: null,
        createdAt: now,
        updatedAt: now,
        archivedAt: null,
      };
    try {
      await saveCustomExercise(label);
      setCustoms([...customs, label]);
      setChosen([...chosen, label.id]);
      setName("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Label could not be saved.",
      );
    }
  };
  return (
    <div className="page">
      <PageHeader
        title="Workout workspace"
        eyebrow="TRAIN / LOG"
        description="Record what you do. Your sessions stay in this browser and can be exported at any time."
      />
      <WorkoutNav />
      <p role="status">{message}</p>
      {active && (
        <InfoCallout title="Continue your workout">
          <p>
            {active.title} · {active.status}
          </p>
          <a className="button primary" href={`/workout/session/${active.id}`}>
            Resume workout
          </a>
        </InfoCallout>
      )}
      {!active && current && (
        <section className="detail-section">
          <h2>From your current program</h2>
          {current.program.scheduleModel?.sessions.map((session) => (
            <button
              key={session.id}
              className="button secondary"
              disabled={busy}
              onClick={() => {
                try {
                  void start(
                    fromProgram(
                      current.program,
                      current.instance,
                      session.id,
                      mode,
                    ),
                  );
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Template unavailable.",
                  );
                }
              }}
            >
              {session.id === nextSessionId ? "Next in sequence · " : ""}
              {session.displayName}
            </button>
          ))}
          <p>
            Select the performance mode below before starting; you can change
            individual exercises in the workspace.
          </p>
        </section>
      )}
      <section className="detail-section">
        <h2>Start an ad hoc workout</h2>
        <form
          className="local-form"
          onSubmit={(event) => {
            event.preventDefault();
            const exercises = chosen.map((id, index) => {
              const custom = customs.find((item) => item.id === id);
              if (custom) return newExercise(custom, index + 1);
              const canonical = publishedExercises.find(
                (item) => item.id === id,
              );
              if (!canonical) throw new Error("Exercise unavailable.");
              return {
                ...newExercise(
                  {
                    id: "custom_exercise_temporary",
                    schemaVersion: 1,
                    displayName: canonical.displayName,
                    performanceMode: mode,
                    loadScope: scope,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    archivedAt: null,
                  },
                  index + 1,
                ),
                exerciseRef: {
                  kind: "canonical" as const,
                  exerciseId: canonical.id,
                },
              };
            });
            void start(newSession(title, exercises));
          }}
        >
          <label>
            Workout title
            <input
              value={title}
              disabled={busy}
              maxLength={160}
              placeholder="Optional; defaults to today’s date"
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            Performance mode
            <select
              value={mode}
              onChange={(event) => {
                const value = event.target.value as typeof mode;
                setMode(value);
                setScope(allowedScopes[value][0]);
              }}
            >
              {performanceModes.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Load scope
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value as typeof scope)}
            >
              {allowedScopes[mode].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Choose exercises</legend>
            {[
              ...publishedExercises,
              ...customs.filter((item) => !item.archivedAt),
            ].map((item) => (
              <label key={item.id}>
                <input
                  type="checkbox"
                  checked={chosen.includes(item.id)}
                  onChange={(event) =>
                    setChosen(
                      event.target.checked
                        ? [...chosen, item.id]
                        : chosen.filter((id) => id !== item.id),
                    )
                  }
                />
                {item.displayName}
                {item.id.startsWith("custom_") ? " · Local label" : ""}
              </label>
            ))}
            {!customs.length && !publishedExercises.length && (
              <p>
                No reviewed exercises are available yet. Add a personal label
                below to log your own activity.
              </p>
            )}
          </fieldset>
          <button className="button primary" disabled={busy || Boolean(active)}>
            Start workout
          </button>
        </form>
        <div className="local-form">
          <label>
            Personal exercise label
            <input
              value={name}
              disabled={busy}
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <button
            className="button secondary"
            disabled={busy || !name.trim()}
            onClick={() => {
              void addLabel();
            }}
          >
            Save label and select
          </button>
        </div>
        <small>
          Local labels contain no technique or anatomy claims and never enter
          the public library.
        </small>
      </section>
      {history.length > 0 && (
        <section className="detail-section">
          <h2>Repeat a recent workout</h2>
          {history.map((session) => (
            <button
              key={session.id}
              className="button secondary"
              disabled={busy || Boolean(active)}
              onClick={() => {
                void start(repeatSession(session));
              }}
            >
              {session.title} · {session.localDate}
            </button>
          ))}
        </section>
      )}
      <InfoCallout title="Protect your local records">
        Browser data can be cleared or evicted. Download a backup from Workout
        settings.
      </InfoCallout>
    </div>
  );
}
