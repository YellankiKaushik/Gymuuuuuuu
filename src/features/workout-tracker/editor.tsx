import { useCallback, useEffect, useRef, useState } from "react";
import { WorkoutExercisePicker } from "./exercise-picker";
import { PageHeader } from "../../components/common/page-header";
import { InfoCallout } from "../../components/common/primitives";
import { exerciseIndexes } from "../exercises/repository";
import { resolveProgramVersion } from "../programs/repository";

import { useWorkoutEditor } from "./hooks";
import { WorkoutNav } from "./start";
import {
  exerciseKey,
  elapsedSeconds,
  fromGrams,
  newSet,
  remainingSeconds,
  sessionSummary,
  toGrams,
  toMeters,
  fromMeters,
} from "./domain";
import { getPreferences, readTracker, writeTracker } from "./storage";
import { downloadLocal, previousPerformance } from "./backup";
import {
  allowedScopes,
  performanceModes,
  performanceNormativeSchema,
  setTypes,
  workoutSetSchema,
  restTimerSchema,
  type WorkoutExercise,
  type WorkoutSet,
  type WorkoutPreferences,
} from "./schema";
const fields = {
  load_reps: ["loadGrams", "reps"],
  bodyweight_reps: ["reps", "addedLoadGrams"],
  reps_only: ["reps"],
  duration: ["durationSeconds"],
  distance_duration: ["distanceMeters", "durationSeconds"],
  load_duration: ["loadGrams", "durationSeconds"],
  assisted_reps: ["assistanceGrams", "reps"],
} as const;
const labels = {
  loadGrams: "Load",
  addedLoadGrams: "Added load",
  assistanceGrams: "Assistance",
  reps: "Repetitions",
  durationSeconds: "Duration (seconds)",
  distanceMeters: "Distance (meters)",
};
function SetEntry({
  set,
  exercise,
  unit,
  disabled,
  change,
  remove,
  duplicate,
  previous,
  defaultEffort = "none",
  distanceUnit = "km",
}: {
  set: WorkoutSet;
  exercise: WorkoutExercise;
  unit: "kg" | "lb";
  disabled: boolean;
  change: (next: WorkoutSet) => void;
  remove: () => void;
  duplicate: () => void;
  previous?: WorkoutSet;
  defaultEffort?: "none" | "rir" | "rpe";
  distanceUnit?: "km" | "mi";
}) {
  const [raw, setRaw] = useState<Record<string, string>>(() =>
      Object.fromEntries(
        fields[exercise.performanceMode].map((key) => {
          const value =
            set.performance && key in set.performance
              ? (set.performance as unknown as Record<string, number | null>)[
                  key
                ]
              : undefined;
          return [
            key,
            value === undefined || value === null
              ? ""
              : String(
                  key.endsWith("Grams")
                    ? Number(fromGrams(value, unit).toFixed(4))
                    : key === "distanceMeters"
                      ? Number(fromMeters(value, distanceUnit).toFixed(6))
                      : value,
                ),
          ];
        }),
      ),
    ),
    [error, setError] = useState("");
  const [effortChoice, setEffortChoice] = useState<"none" | "rir" | "rpe">();
  const effortMode =
    effortChoice ??
    (set.effort.mode === "none" ? defaultEffort : set.effort.mode);
  const chain = useRef(Promise.resolve());
  const hasPerformance = Boolean(set.performance);
  useEffect(() => {
    void readTracker<{
      mode: string;
      unit: string;
      fields: Record<string, string>;
    }>("appMeta", `draft:${set.id}`)
      .then((value) => {
        if (
          !hasPerformance &&
          value?.mode === exercise.performanceMode &&
          value.unit === `${unit}:${distanceUnit}`
        )
          setRaw(value.fields);
      })
      .catch(() => setError("Unfinished input could not be recovered."));
  }, [set.id, exercise.performanceMode, unit, distanceUnit, hasPerformance]);
  const enter = (key: string, text: string) => {
    const values = { ...raw, [key]: text };
    setRaw(values);
    chain.current = chain.current
      .then(() =>
        writeTracker("appMeta", {
          key: `draft:${set.id}`,
          mode: exercise.performanceMode,
          unit: `${unit}:${distanceUnit}`,
          fields: values,
        }),
      )
      .catch(() =>
        setError("Input draft could not be saved. Keep this page open."),
      );
    const complete = fields[exercise.performanceMode].every(
      (field) => field === "addedLoadGrams" || values[field]?.trim(),
    );
    if (complete) {
      const performance = performanceNormativeSchema.safeParse({
        mode: exercise.performanceMode,
        ...Object.fromEntries(
          fields[exercise.performanceMode].map((field) => [
            field,
            field === "addedLoadGrams" && !values[field]?.trim()
              ? null
              : field.endsWith("Grams")
                ? toGrams(Number(values[field]), unit)
                : field === "distanceMeters"
                  ? toMeters(Number(values[field]), distanceUnit)
                  : Number(values[field]),
          ]),
        ),
      });
      if (performance.success) {
        setError("");
        change({
          ...set,
          performance: performance.data,
          updatedAt: new Date().toISOString(),
        });
      } else
        setError("Enter finite, non-negative values within the allowed range.");
    } else if (set.performance)
      change({
        ...set,
        performance: null,
        status: "planned",
        completedAt: null,
        updatedAt: new Date().toISOString(),
      });
  };
  const complete = () => {
    const next = {
        ...set,
        status: "completed" as const,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      parsed = workoutSetSchema.safeParse(next);
    if (parsed.success) {
      change(parsed.data);
      setError("");
    } else
      setError(
        "Fill every required performance field before completing the set.",
      );
  };
  return (
    <fieldset className="set-entry" disabled={disabled}>
      <legend>
        Set {set.order} · {set.status}
      </legend>
      <label>
        Type
        <select
          value={set.setType}
          onChange={(event) =>
            change({
              ...set,
              setType: event.target.value as WorkoutSet["setType"],
            })
          }
        >
          {setTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </label>
      {fields[exercise.performanceMode].map((key) => (
        <label key={key}>
          {key === "distanceMeters"
            ? `Distance (${distanceUnit})`
            : labels[key]}
          {key.endsWith("Grams") ? ` (${unit})` : ""}
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step={key === "reps" || key === "durationSeconds" ? "1" : "any"}
            value={raw[key] ?? ""}
            onChange={(event) => enter(key, event.target.value)}
          />
        </label>
      ))}
      <label>
        Effort mode
        <select
          value={effortMode}
          onChange={(event) => {
            const mode = event.target.value as typeof effortMode;
            setEffortChoice(mode);
            if (mode === "none") change({ ...set, effort: { mode: "none" } });
          }}
        >
          <option value="none">None</option>
          <option value="rir">RIR</option>
          <option value="rpe">RPE</option>
        </select>
      </label>
      {effortMode !== "none" && (
        <label>
          {effortMode.toUpperCase()} (optional)
          <input
            type="number"
            min={effortMode === "rpe" ? 1 : 0}
            max="10"
            step="0.5"
            value={
              "value" in set.effort && set.effort.mode === effortMode
                ? set.effort.value
                : ""
            }
            onChange={(event) => {
              if (
                Number.isFinite(event.target.valueAsNumber) &&
                event.target.valueAsNumber >= (effortMode === "rpe" ? 1 : 0) &&
                event.target.valueAsNumber <= 10
              )
                change({
                  ...set,
                  effort: {
                    mode: effortMode,
                    value: event.target.valueAsNumber,
                  },
                });
            }}
          />
        </label>
      )}
      <label>
        Set note
        <input
          value={set.note ?? ""}
          maxLength={1000}
          onChange={(event) =>
            change({ ...set, note: event.target.value || null })
          }
        />
      </label>
      <div className="actions">
        <button type="button" className="button primary" onClick={complete}>
          Complete set
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            change({ ...set, status: "skipped", completedAt: null })
          }
        >
          Skip
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            change({ ...set, status: "planned", completedAt: null })
          }
        >
          Reset
        </button>
        <button type="button" className="button secondary" onClick={duplicate}>
          Duplicate
        </button>
        {previous?.performance && (
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              change({
                ...set,
                performance: previous.performance,
                effort: previous.effort,
              });
              setRaw(
                Object.fromEntries(
                  fields[exercise.performanceMode].map((key) => {
                    const value = (
                      previous.performance as unknown as Record<
                        string,
                        number | null
                      >
                    )[key];
                    return [
                      key,
                      value === null || value === undefined
                        ? ""
                        : String(
                            key.endsWith("Grams")
                              ? Number(fromGrams(value, unit).toFixed(4))
                              : key === "distanceMeters"
                                ? Number(
                                    fromMeters(value, distanceUnit).toFixed(6),
                                  )
                                : value,
                          ),
                    ];
                  }),
                ),
              );
            }}
          >
            Copy previous values
          </button>
        )}
        <button type="button" className="button secondary" onClick={remove}>
          Remove set
        </button>
      </div>
      <p className="form-error" role="status">
        {error}
      </p>
      {set.plannedTarget && (
        <small>
          Planned: {set.plannedTarget.repsMin}–{set.plannedTarget.repsMax} reps
          · {set.plannedTarget.durationSecondsMin}–
          {set.plannedTarget.durationSecondsMax} seconds · rest{" "}
          {set.restTargetSeconds ?? "not specified"} seconds
        </small>
      )}
    </fieldset>
  );
}
function Previous({
  exercise,
  onSet,
}: {
  exercise: WorkoutExercise;
  onSet: (id: string, set: WorkoutSet | undefined) => void;
}) {
  const [context, setContext] = useState("No comparable previous performance.");
  const key = exerciseKey(exercise),
    mode = exercise.performanceMode,
    scope = exercise.loadScope,
    id = exercise.id;
  useEffect(() => {
    void previousPerformance(key, mode, scope)
      .then((value) => {
        setContext(
          value
            ? `Previous comparable performance: ${value.date}. For context only.`
            : "No comparable previous performance.",
        );
        onSet(id, value?.sets.at(-1));
      })
      .catch(() => setContext("Previous performance is unavailable."));
  }, [key, mode, scope, id, onSet]);
  return <p className="muted">{context}</p>;
}
type RestTimer = {
  sessionId: string;
  startedAt: string;
  endsAt: string;
  durationSeconds: number;
};
export function WorkoutEditor({
  id,
  history = false,
}: {
  id: string;
  history?: boolean;
}) {
  const { session, message, owned, busy, mutate, takeover, retry } =
      useWorkoutEditor(id),
    [now, setNow] = useState(() => Date.now()),
    [unit, setUnit] = useState<"kg" | "lb">("kg"),
    [timer, setTimer] = useState<RestTimer>(),
    [preferences, setPreferences] = useState<WorkoutPreferences>(),
    [confirmation, setConfirmation] = useState<
      "finish" | "abandon" | "delete"
    >(),
    [error, setError] = useState(""),
    [undo, setUndo] = useState<{ exerciseId: string; set: WorkoutSet }>(),
    [replaceId, setReplaceId] = useState<string>(),
    [previous, setPrevious] = useState<Record<string, WorkoutSet | undefined>>(
      {},
    );
  const receivePrevious = useCallback(
    (exerciseId: string, set: WorkoutSet | undefined) =>
      setPrevious((current) =>
        current[exerciseId]?.id === set?.id
          ? current
          : { ...current, [exerciseId]: set },
      ),
    [],
  );
  const audio = useRef<AudioContext | undefined>(undefined),
    beeped = useRef("");
  useEffect(() => {
    if (
      !timer ||
      preferences?.timerSound !== "beep" ||
      remainingSeconds(timer.endsAt, now) > 0 ||
      beeped.current === timer.endsAt ||
      !audio.current
    )
      return;
    beeped.current = timer.endsAt;
    try {
      const oscillator = audio.current.createOscillator(),
        gain = audio.current.createGain();
      gain.gain.value = 0.08;
      oscillator.frequency.value = 700;
      oscillator.connect(gain);
      gain.connect(audio.current.destination);
      oscillator.start();
      oscillator.stop(audio.current.currentTime + 0.15);
    } catch {
      /* Timer logging remains usable when audio is blocked. */
    }
  }, [timer, now, preferences?.timerSound]);
  useEffect(() => {
    void getPreferences()
      .then((preferences) => {
        setUnit(preferences.weightUnit);
        setPreferences(preferences);
      })
      .catch((error: Error) => setError(error.message));
    void readTracker<RestTimer>("activeTimers", id)
      .then((value) => {
        if (value) setTimer(restTimerSchema.parse(value));
      })
      .catch(() =>
        setError(
          "The saved rest timer is invalid. Set logging is available; start a new timer to replace it.",
        ),
      );
    const interval = setInterval(() => setNow(Date.now()), 1000);
    const visible = () => setNow(Date.now());
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [id]);
  const apply = (change: Parameters<typeof mutate>[0]) => {
    void mutate(change).catch((error: Error) => setError(error.message));
  };
  const changeExercise = (exercise: WorkoutExercise) =>
    apply((current) => ({
      ...current,
      exercises: current.exercises.map((item) =>
        item.id === exercise.id
          ? { ...exercise, updatedAt: new Date().toISOString() }
          : item,
      ),
    }));
  const startRest = (seconds: number) => {
    if (!owned) return;
    if (preferences?.timerSound === "beep") {
      try {
        audio.current ??= new AudioContext();
        void audio.current.resume().catch(() => undefined);
      } catch {
        /* Visual timer remains available. */
      }
    }
    const value = {
      sessionId: id,
      startedAt: new Date().toISOString(),
      endsAt: new Date(new Date().getTime() + seconds * 1000).toISOString(),
      durationSeconds: seconds,
    };
    setTimer(value);
    void writeTracker("activeTimers", value).catch((error: Error) =>
      setError(error.message),
    );
  };
  if (!session)
    return (
      <div className="page">
        <PageHeader title="Workout" />
        <WorkoutNav />
        <p role="status">{message}</p>
        <a href="/workout/settings">Backup and recovery</a>
      </div>
    );
  let summary;
  try {
    summary = sessionSummary(session);
  } catch (error) {
    return (
      <div className="page">
        <PageHeader title={session.title} />
        <InfoCallout title="Timing data needs recovery">
          {error instanceof Error ? error.message : "Invalid duration"}
        </InfoCallout>
        <button
          className="button secondary"
          onClick={() =>
            downloadLocal(`${id}-draft.json`, JSON.stringify(session, null, 2))
          }
        >
          Export draft
        </button>
      </div>
    );
  }
  return (
    <div className="page workout-focus">
      <PageHeader
        title={session.title}
        eyebrow={history ? "TRAIN / HISTORY" : "TRAIN / ACTIVE WORKOUT"}
        description={`${session.localDate} · ${session.status}`}
      />
      <WorkoutNav />
      <div className="workout-status">
        <strong>
          {Math.floor(
            (["active", "paused"].includes(session.status)
              ? elapsedSeconds(session, now)
              : summary.duration) / 60,
          )}{" "}
          min active
        </strong>
        <span role="status">{message}</span>
        {!owned && (
          <button
            className="button primary"
            onClick={() => {
              void takeover().catch((error: Error) => setError(error.message));
            }}
          >
            Take over editor
          </button>
        )}
        <button
          className="button secondary"
          onClick={() =>
            downloadLocal(`${id}-draft.json`, JSON.stringify(session, null, 2))
          }
        >
          Export current draft
        </button>
      </div>
      <p role="status">{error}</p>
      {message !== "Saved" && !busy && owned && (
        <button
          className="button secondary"
          onClick={() => {
            void retry().catch((error: Error) => setError(error.message));
          }}
        >
          Retry save
        </button>
      )}
      <fieldset className="local-form" disabled={!owned}>
        <label>
          Workout title
          <input
            value={session.title}
            maxLength={160}
            onChange={(event) =>
              apply((current) => ({ ...current, title: event.target.value }))
            }
          />
        </label>
        <label>
          Weight display unit
          <select
            value={unit}
            onChange={(event) => setUnit(event.target.value as typeof unit)}
          >
            <option>kg</option>
            <option>lb</option>
          </select>
        </label>
        <label>
          Session note
          <textarea
            value={session.sessionNote ?? ""}
            maxLength={5000}
            onChange={(event) =>
              apply((current) => ({
                ...current,
                sessionNote: event.target.value || null,
              }))
            }
          />
        </label>
        <label>
          Session RPE (optional)
          <input
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={session.sessionRpe ?? ""}
            onChange={(event) =>
              apply((current) => ({
                ...current,
                sessionRpe: event.target.value
                  ? event.target.valueAsNumber
                  : null,
              }))
            }
          />
        </label>
        <label>
          Discomfort marker
          <select
            value={session.discomfortFlag}
            onChange={(event) =>
              apply((current) => ({
                ...current,
                discomfortFlag: event.target
                  .value as typeof current.discomfortFlag,
              }))
            }
          >
            {["none", "noticed", "stopped_set", "stopped_session"].map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
        </label>
      </fieldset>
      <section className="rest-timer" aria-label="Rest timer">
        <h2>Rest timer</h2>
        <p>
          {timer
            ? remainingSeconds(timer.endsAt, now) > 0
              ? `${remainingSeconds(timer.endsAt, now)} seconds remaining`
              : "Rest timer complete"
            : "No timer running"}
        </p>
        <div className="actions">
          {[60, 90, 120, 180, 300].map((seconds) => (
            <button
              className="button secondary"
              key={seconds}
              disabled={!owned}
              onClick={() => startRest(seconds)}
            >
              {seconds}s
            </button>
          ))}
          {timer && (
            <>
              <button
                className="button secondary"
                disabled={!owned}
                onClick={() => startRest(remainingSeconds(timer.endsAt) + 30)}
              >
                +30 seconds
              </button>
              <button
                className="button secondary"
                disabled={!owned}
                onClick={() =>
                  startRest(Math.max(0, remainingSeconds(timer.endsAt) - 30))
                }
              >
                −30 seconds
              </button>
              <button
                className="button secondary"
                disabled={!owned}
                onClick={() => startRest(0)}
              >
                Stop
              </button>
            </>
          )}
        </div>
      </section>
      {replaceId && (
        <p>
          Choose the replacement below. Its logged sets will start empty.{" "}
          <button
            className="button secondary"
            onClick={() => setReplaceId(undefined)}
          >
            Cancel replacement
          </button>
        </p>
      )}
      <WorkoutExercisePicker
        disabled={!owned}
        add={(exercise) => {
          if (
            session.programRef &&
            !window.confirm(
              "Use this exercise as a personal deviation from the reviewed program?",
            )
          )
            return;
          apply((current) => {
            const original = current.exercises.find(
              (item) => item.id === replaceId,
            );
            const replacement = original
              ? {
                  ...exercise,
                  order: original.order,
                  prescriptionSnapshot: original.prescriptionSnapshot,
                  originalExerciseId:
                    original.originalExerciseId ??
                    (original.exerciseRef.kind === "canonical"
                      ? original.exerciseRef.exerciseId
                      : null),
                  note: `Personal replacement of ${original.displayNameSnapshot}; confirmed by the user.`,
                  isProgramDeviation: Boolean(current.programRef),
                }
              : {
                  ...exercise,
                  order: current.exercises.length + 1,
                  isProgramDeviation: Boolean(current.programRef),
                };
            const exercises = original
              ? current.exercises.map((item) =>
                  item.id === original.id ? replacement : item,
                )
              : [...current.exercises, replacement];
            return {
              ...current,
              exercises,
              exerciseIds: [...new Set(exercises.map(exerciseKey))],
            };
          });
          setReplaceId(undefined);
        }}
      />
      {session.exercises.map((exercise, index) => (
        <article className="entity-card workout-exercise" key={exercise.id}>
          <h2>
            {index + 1}. {exercise.displayNameSnapshot}
          </h2>
          {exercise.exerciseRef.kind === "canonical" &&
            exerciseIndexes.byId.get(exercise.exerciseRef.exerciseId)
              ?.contentStatus === "published" && (
              <a
                href={`/exercises/${exerciseIndexes.byId.get(exercise.exerciseRef.exerciseId)?.slug}`}
              >
                Current exercise article
              </a>
            )}
          <p>
            {exercise.isProgramDeviation
              ? "Personal program deviation"
              : exercise.prescriptionSnapshot
                ? "Program prescription snapshot"
                : "Personal exercise label"}
          </p>
          {preferences?.showPreviousPerformance !== false && (
            <Previous exercise={exercise} onSet={receivePrevious} />
          )}
          <fieldset className="local-form" disabled={!owned}>
            <label>
              Performance mode
              <select
                value={exercise.performanceMode}
                disabled={exercise.sets.some(
                  (set) => set.status === "completed",
                )}
                onChange={(event) => {
                  const mode = event.target
                      .value as typeof exercise.performanceMode,
                    scope = allowedScopes[mode][0];
                  changeExercise({
                    ...exercise,
                    performanceMode: mode,
                    loadScope: scope,
                    sets: exercise.sets.map((set) => ({
                      ...set,
                      performance: null,
                      loadScope: scope,
                    })),
                  });
                }}
              >
                {performanceModes.map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </label>
            <label>
              Load scope
              <select
                value={exercise.loadScope}
                disabled={exercise.sets.some(
                  (set) => set.status === "completed",
                )}
                onChange={(event) =>
                  changeExercise({
                    ...exercise,
                    loadScope: event.target.value as typeof exercise.loadScope,
                    sets: exercise.sets.map((set) => ({
                      ...set,
                      loadScope: event.target.value as typeof set.loadScope,
                    })),
                  })
                }
              >
                {allowedScopes[exercise.performanceMode].map((scope) => (
                  <option key={scope}>{scope}</option>
                ))}
              </select>
            </label>
            <label>
              Exercise note
              <input
                value={exercise.note ?? ""}
                maxLength={2000}
                onChange={(event) =>
                  changeExercise({
                    ...exercise,
                    note: event.target.value || null,
                  })
                }
              />
            </label>
          </fieldset>
          {exercise.prescriptionSnapshot?.notesSnapshot?.map((note) => (
            <p key={note}>{note}</p>
          ))}
          {session.programRef &&
            resolveProgramVersion(
              session.programRef.canonicalProgramId,
              session.programRef.canonicalProgramVersion,
            )
              ?.substitutionGroups?.find(
                (group) =>
                  group.id ===
                  exercise.prescriptionSnapshot?.substitutionGroupId,
              )
              ?.candidateExerciseIds.map((id) => {
                const canonical = exerciseIndexes.byId.get(id);
                return canonical?.contentStatus === "published" ? (
                  <button
                    key={id}
                    className="button secondary"
                    disabled={!owned}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `Replace with reviewed alternative ${canonical.displayName}? Existing sets for this exercise will be replaced with empty rows; check its performance mode and load scope.`,
                        )
                      )
                        return;
                      apply((current) => {
                        const exercises = current.exercises.map((item) =>
                          item.id === exercise.id
                            ? {
                                ...item,
                                displayNameSnapshot: canonical.displayName,
                                exerciseRef: {
                                  kind: "canonical" as const,
                                  exerciseId: id,
                                },
                                originalExerciseId:
                                  item.originalExerciseId ??
                                  (item.exerciseRef.kind === "canonical"
                                    ? item.exerciseRef.exerciseId
                                    : null),
                                sets: item.sets.map((set, index) => ({
                                  ...newSet(
                                    index + 1,
                                    item.loadScope,
                                    set.plannedTarget,
                                  ),
                                  setType: set.setType,
                                })),
                                isProgramDeviation: false,
                              }
                            : item,
                        );
                        return {
                          ...current,
                          exercises,
                          exerciseIds: [...new Set(exercises.map(exerciseKey))],
                        };
                      });
                    }}
                  >
                    Reviewed alternative: {canonical.displayName}
                  </button>
                ) : null;
              })}
          {exercise.sets.map((set, setIndex) => (
            <SetEntry
              key={`${set.id}:${exercise.performanceMode}:${unit}:${preferences?.distanceUnit ?? "km"}`}
              set={set}
              exercise={exercise}
              unit={unit}
              defaultEffort={preferences?.effortMode}
              distanceUnit={preferences?.distanceUnit}
              disabled={!owned}
              previous={exercise.sets[setIndex - 1] ?? previous[exercise.id]}
              change={(next) => {
                if (
                  preferences?.autoStartRestTimer &&
                  next.status === "completed" &&
                  set.status !== "completed"
                )
                  startRest(
                    set.restTargetSeconds ?? preferences.defaultRestSeconds,
                  );
                changeExercise({
                  ...exercise,
                  sets: exercise.sets.map((item) =>
                    item.id === next.id ? next : item,
                  ),
                });
              }}
              duplicate={() =>
                changeExercise({
                  ...exercise,
                  sets: [
                    ...exercise.sets,
                    {
                      ...newSet(
                        exercise.sets.length + 1,
                        exercise.loadScope,
                        set.plannedTarget,
                      ),
                      setType: set.setType,
                    },
                  ],
                })
              }
              remove={() => {
                setUndo({ exerciseId: exercise.id, set });
                changeExercise({
                  ...exercise,
                  sets: exercise.sets
                    .filter((item) => item.id !== set.id)
                    .map((item, index) => ({ ...item, order: index + 1 })),
                });
              }}
            />
          ))}
          <div className="actions">
            <button
              className="button secondary"
              disabled={!owned}
              onClick={() => {
                setReplaceId(exercise.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Replace exercise
            </button>
            <button
              className="button secondary"
              disabled={!owned}
              onClick={() =>
                changeExercise({
                  ...exercise,
                  sets: [
                    ...exercise.sets,
                    newSet(exercise.sets.length + 1, exercise.loadScope),
                  ],
                })
              }
            >
              Add set
            </button>
            <button
              className="button secondary"
              disabled={!owned || index === 0}
              onClick={() =>
                apply((current) => {
                  const list = [...current.exercises];
                  [list[index - 1], list[index]] = [
                    list[index]!,
                    list[index - 1]!,
                  ];
                  return {
                    ...current,
                    exercises: list.map((item, order) => ({
                      ...item,
                      order: order + 1,
                    })),
                  };
                })
              }
            >
              Move exercise up
            </button>
            <button
              className="button secondary"
              disabled={!owned || index === session.exercises.length - 1}
              onClick={() =>
                apply((current) => {
                  const list = [...current.exercises];
                  [list[index], list[index + 1]] = [
                    list[index + 1]!,
                    list[index]!,
                  ];
                  return {
                    ...current,
                    exercises: list.map((item, order) => ({
                      ...item,
                      order: order + 1,
                    })),
                  };
                })
              }
            >
              Move exercise down
            </button>
            <button
              className="button secondary"
              disabled={!owned}
              onClick={() => {
                if (
                  window.confirm(
                    `Remove ${exercise.displayNameSnapshot} and its sets from this workout?`,
                  )
                )
                  apply((current) => {
                    const exercises = current.exercises
                      .filter((item) => item.id !== exercise.id)
                      .map((item, index) => ({ ...item, order: index + 1 }));
                    return {
                      ...current,
                      exercises,
                      exerciseIds: [...new Set(exercises.map(exerciseKey))],
                    };
                  });
              }}
            >
              Remove exercise
            </button>
          </div>
        </article>
      ))}
      {undo && (
        <div role="status">
          Set removed.{" "}
          <button
            className="button secondary"
            disabled={!owned}
            onClick={() => {
              apply((current) => ({
                ...current,
                exercises: current.exercises.map((item) =>
                  item.id === undo.exerciseId
                    ? {
                        ...item,
                        sets: [...item.sets, undo.set].map((set, index) => ({
                          ...set,
                          order: index + 1,
                        })),
                      }
                    : item,
                ),
              }));
              setUndo(undefined);
            }}
          >
            Undo
          </button>
        </div>
      )}
      <div className="actions">
        {session.status === "active" && (
          <button
            className="button secondary"
            disabled={!owned || busy}
            onClick={() =>
              apply((current) => ({
                ...current,
                status: "paused",
                pausedAt: new Date().toISOString(),
              }))
            }
          >
            Pause workout
          </button>
        )}
        {session.status === "paused" && (
          <button
            className="button primary"
            disabled={!owned || busy}
            onClick={() =>
              apply((current) => ({
                ...current,
                status: "active",
                accumulatedPausedSeconds:
                  current.accumulatedPausedSeconds +
                  Math.max(
                    0,
                    Math.floor(
                      (Date.now() - Date.parse(current.pausedAt!)) / 1000,
                    ),
                  ),
                pausedAt: null,
              }))
            }
          >
            Resume workout
          </button>
        )}
        {["active", "paused"].includes(session.status) && (
          <>
            <button
              className="button primary"
              disabled={!owned || busy}
              onClick={() => setConfirmation("finish")}
            >
              Finish workout
            </button>
            <button
              className="button secondary"
              disabled={!owned || busy}
              onClick={() => setConfirmation("abandon")}
            >
              End without completing
            </button>
          </>
        )}
        {["completed", "abandoned"].includes(session.status) && (
          <button
            className="button secondary"
            disabled={!owned || busy}
            onClick={() => setConfirmation("delete")}
          >
            {session.deletedAt ? "Restore deleted workout" : "Delete workout"}
          </button>
        )}
      </div>
      {confirmation && (
        <InfoCallout
          title={
            confirmation === "finish"
              ? "Finish this workout?"
              : confirmation === "delete"
                ? "Change deletion status?"
                : "End this workout?"
          }
        >
          <p>
            {summary.completed} completed · {summary.skipped} skipped ·{" "}
            {summary.incomplete} incomplete sets. Incomplete sets remain
            incomplete in history.
          </p>
          <button
            className="button primary"
            onClick={() => {
              const action = confirmation;
              setConfirmation(undefined);
              void mutate((current) => {
                const time = new Date().toISOString();
                if (action === "delete")
                  return {
                    ...current,
                    deletedAt: current.deletedAt ? null : time,
                  };
                const paused = current.pausedAt
                  ? Math.max(
                      0,
                      Math.floor(
                        (Date.now() - Date.parse(current.pausedAt)) / 1000,
                      ),
                    )
                  : 0;
                return {
                  ...current,
                  status: action === "finish" ? "completed" : "abandoned",
                  completedAt: action === "finish" ? time : null,
                  abandonedAt: action === "abandon" ? time : null,
                  pausedAt: null,
                  accumulatedPausedSeconds:
                    current.accumulatedPausedSeconds + paused,
                };
              })
                .then(() => {
                  if (action === "finish")
                    window.location.assign(`/workout/summary/${id}`);
                })
                .catch((error: Error) => setError(error.message));
            }}
          >
            Confirm
          </button>
          <button
            className="button secondary"
            onClick={() => setConfirmation(undefined)}
          >
            Cancel
          </button>
        </InfoCallout>
      )}
    </div>
  );
}
