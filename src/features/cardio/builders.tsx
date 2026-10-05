import { useState } from "react";
import {
  CardioPage,
  CardioField as Field,
  useCardio,
  display,
  readable,
  numberOrNull,
} from "./workspace";
import {
  cardioReference,
  sessionTypes,
  type Segment,
  type Intensity,
  type Plan,
  type Routine,
} from "./schema";
import {
  manualIntensity,
  makeSegment,
  newCardioId,
  startCardioSession,
} from "./domain";
import { calculateHeartRateTarget, tanakaMaximum } from "./calculations";
import {
  saveCardioVersion,
  saveCardioSession,
  deleteCardioEntity,
  cardioOwnerId,
  saveCardioPreferences,
} from "./storage";
export function ModalitySelect({
  value,
  onChange,
  id,
  "aria-describedby": describedBy,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  "aria-describedby"?: string;
}) {
  return (
    <select
      id={id}
      aria-describedby={describedBy}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {cardioReference.modalities.map((m) => (
        <option key={m.id} value={m.id}>
          {m.displayName}
        </option>
      ))}
    </select>
  );
}
export function TypeSelect({
  value,
  onChange,
  id,
  "aria-describedby": describedBy,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  "aria-describedby"?: string;
}) {
  return (
    <select
      id={id}
      aria-describedby={describedBy}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {sessionTypes.map((type) => (
        <option key={type} value={type}>
          {readable(type)}
        </option>
      ))}
    </select>
  );
}
function recalculateIntensity(value: Intensity): Intensity {
  const copy = structuredClone(value),
    p = copy.provenance;
  if (copy.method === "percent_hrmax" || copy.method === "heart_rate_reserve") {
    if (copy.maxHrSource === "age_predicted_tanaka") {
      try {
        const result = tanakaMaximum(p.ageYears);
        p.maximumHeartRateBpm = result?.bpm ?? null;
        p.sourceIds = result ? [result.sourceId] : [];
      } catch {
        p.maximumHeartRateBpm = null;
      }
    }
    try {
      const result = calculateHeartRateTarget({
        method: copy.method,
        maximumBpm: p.maximumHeartRateBpm,
        restingBpm: p.restingHeartRateBpm,
        lowerFraction: p.lowerFraction,
        upperFraction: p.upperFraction,
        affectedByMedicationOrMedicalContext: p.hrTargetingDisabled,
      });
      copy.lower = result.lowerBpm;
      copy.upper = result.upperBpm;
    } catch {
      copy.lower = null;
      copy.upper = null;
    }
  }
  return copy;
}
export function IntensityEditor({
  value,
  onChange,
}: {
  value: Intensity;
  onChange: (value: Intensity) => void;
}) {
  const { view } = useCardio();
  const hr =
    value.method === "percent_hrmax" || value.method === "heart_rate_reserve";
  const update = (patch: Partial<Intensity>) =>
    onChange(recalculateIntensity({ ...value, ...patch }));
  const provenance = (patch: Partial<Intensity["provenance"]>) =>
    update({ provenance: { ...value.provenance, ...patch } });
  return (
    <fieldset>
      <legend>Your intensity method</legend>
      <Field label="Target method">
        <select
          value={value.method}
          onChange={(e) => {
            const method = e.target.value as Intensity["method"];
            const next = manualIntensity();
            next.provenance.hrTargetingDisabled =
              view?.preferences.value.hrTargetingDisabled ?? false;
            next.method = method;
            next.methodVersion =
              method === "percent_hrmax" || method === "heart_rate_reserve"
                ? "hr-fraction-arithmetic-1"
                : `user-${method}-1`;
            next.unit =
              method === "pace"
                ? "s/km"
                : method === "power"
                  ? "W"
                  : method === "perceived_effort_0_10"
                    ? "0–10"
                    : method === "percent_hrmax" ||
                        method === "heart_rate_reserve"
                      ? "bpm"
                      : null;
            if (method !== "manual_text") next.instruction = null;
            if (method === "talk_test")
              next.instruction = "Your selected talk-test observation";
            if (method === "percent_hrmax" || method === "heart_rate_reserve")
              next.maxHrSource = "measured";
            onChange(next);
          }}
        >
          {cardioReference.intensityMethods.map((m) => (
            <option value={m.id} key={m.id}>
              {m.displayName}
            </option>
          ))}
        </select>
      </Field>
      {hr ? (
        <>
          <Field label="Maximum source">
            <select
              value={value.maxHrSource}
              onChange={(e) => {
                const source = e.target.value as Intensity["maxHrSource"];
                update({
                  maxHrSource: source,
                  provenance: {
                    ...value.provenance,
                    estimated: source === "age_predicted_tanaka",
                    ageYears: null,
                    maximumHeartRateBpm: null,
                    sourceIds: [],
                  },
                });
              }}
            >
              <option value="measured">User-reported measured maximum</option>
              <option value="clinician_supplied">Clinician supplied</option>
              <option value="age_predicted_tanaka">
                Optional Tanaka estimate
              </option>
            </select>
          </Field>
          {value.maxHrSource === "age_predicted_tanaka" ? (
            <Field label="Adult age years">
              <input
                type="number"
                min="18"
                max="100"
                step="any"
                value={value.provenance.ageYears ?? ""}
                onChange={(e) =>
                  provenance({ ageYears: numberOrNull(e.target.value) })
                }
              />
            </Field>
          ) : (
            <Field label="Maximum bpm">
              <input
                type="number"
                min="20"
                max="280"
                step="any"
                value={value.provenance.maximumHeartRateBpm ?? ""}
                onChange={(e) =>
                  provenance({
                    maximumHeartRateBpm: numberOrNull(e.target.value),
                  })
                }
              />
            </Field>
          )}
          <Field label="Resting bpm">
            <input
              type="number"
              min="20"
              max="260"
              step="any"
              value={value.provenance.restingHeartRateBpm ?? ""}
              onChange={(e) =>
                provenance({
                  restingHeartRateBpm: numberOrNull(e.target.value),
                })
              }
            />
          </Field>
          {(["lowerFraction", "upperFraction"] as const).map((key) => (
            <Field
              key={key}
              label={
                key === "lowerFraction"
                  ? "Your lower fraction (0–1)"
                  : "Your upper fraction (0–1)"
              }
            >
              <input
                type="number"
                min="0"
                max="1"
                step="any"
                value={value.provenance[key] ?? ""}
                onChange={(e) =>
                  provenance({ [key]: numberOrNull(e.target.value) })
                }
              />
            </Field>
          ))}
          <Field label="Disable HR targeting for medication or medical context">
            <input
              type="checkbox"
              checked={value.provenance.hrTargetingDisabled}
              onChange={(e) =>
                provenance({ hrTargetingDisabled: e.target.checked })
              }
            />
          </Field>
          <p>
            Selected target: {display(value.lower)}–{display(value.upper)} bpm.
            These fractions are your selection, not a prescribed zone. Age-based
            maxima and device readings are estimates.
          </p>
        </>
      ) : value.method === "manual_text" || value.method === "talk_test" ? (
        <Field label="Your target instruction">
          <textarea
            value={value.instruction ?? ""}
            onChange={(e) => update({ instruction: e.target.value })}
          />
        </Field>
      ) : (
        <>
          {(["lower", "upper"] as const).map((key) => (
            <Field
              key={key}
              label={`${key === "lower" ? "Lower" : "Upper"} target (${value.unit})`}
            >
              <input
                type="number"
                min="0"
                max={value.method === "perceived_effort_0_10" ? 10 : undefined}
                step="any"
                value={value[key] ?? ""}
                onChange={(e) =>
                  update({ [key]: numberOrNull(e.target.value) })
                }
              />
            </Field>
          ))}
          {value.method === "pace" && (
            <Field label="Pace target unit">
              <select
                value={value.unit ?? "s/km"}
                onChange={(e) => update({ unit: e.target.value })}
              >
                <option value="s/km">Seconds per km</option>
                <option value="s/mile">Seconds per mile</option>
              </select>
            </Field>
          )}
        </>
      )}
    </fieldset>
  );
}
export function SegmentEditor({
  value,
  onChange,
}: {
  value: Segment[];
  onChange: (value: Segment[]) => void;
}) {
  const change = (index: number, patch: Partial<Segment>) =>
    onChange(value.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const reorder = (from: number, to: number) => {
    const next = [...value];
    const item = next.splice(from, 1)[0];
    if (item) next.splice(to, 0, item);
    onChange(next.map((s, i) => ({ ...s, order: i + 1 })));
  };
  return (
    <section>
      <h2>Segments in order</h2>
      {value.map((s, index) => (
        <fieldset key={s.id} className="card">
          <legend>Segment {index + 1}</legend>
          <Field label="Segment name">
            <input
              required
              maxLength={200}
              value={s.title}
              onChange={(e) => change(index, { title: e.target.value })}
            />
          </Field>
          <Field label="Segment type">
            <select
              value={s.segmentType}
              onChange={(e) =>
                change(index, {
                  segmentType: e.target.value as Segment["segmentType"],
                  recoveryMode:
                    e.target.value === "recovery"
                      ? "passive"
                      : "not_applicable",
                })
              }
            >
              {cardioReference.segmentTypes.map((t) => (
                <option value={t} key={t}>
                  {readable(t)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Target mode">
            <select
              value={s.targetMode}
              onChange={(e) => {
                const mode = e.target.value as Segment["targetMode"];
                change(index, {
                  targetMode: mode,
                  targetValue: null,
                  targetUnit:
                    mode === "duration"
                      ? "s"
                      : mode === "distance"
                        ? "m"
                        : mode === "repetitions"
                          ? "repetitions"
                          : null,
                });
              }}
            >
              {cardioReference.targetModes.map((mode) => (
                <option key={mode} value={mode}>
                  {readable(mode)}
                </option>
              ))}
            </select>
          </Field>
          {s.targetMode !== "open" && (
            <Field label={`Target ${s.targetUnit}`}>
              <input
                type="number"
                required
                min="0.001"
                step={s.targetMode === "repetitions" ? "1" : "any"}
                value={s.targetValue ?? ""}
                onChange={(e) =>
                  change(index, { targetValue: numberOrNull(e.target.value) })
                }
              />
            </Field>
          )}
          {s.segmentType === "recovery" && (
            <Field label="Recovery mode">
              <select
                value={s.recoveryMode}
                onChange={(e) =>
                  change(index, {
                    recoveryMode: e.target.value as Segment["recoveryMode"],
                  })
                }
              >
                <option value="active">Active</option>
                <option value="passive">Passive</option>
              </select>
            </Field>
          )}
          <IntensityEditor
            value={s.intensity}
            onChange={(intensity) => change(index, { intensity })}
          />
          <div className="actions">
            <button
              type="button"
              className="button secondary"
              disabled={index === 0}
              onClick={() => reorder(index, index - 1)}
            >
              Move segment {index + 1} up
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={index === value.length - 1}
              onClick={() => reorder(index, index + 1)}
            >
              Move segment {index + 1} down
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                onChange(
                  value
                    .filter((_, i) => i !== index)
                    .map((s, i) => ({ ...s, order: i + 1 })),
                )
              }
            >
              Remove segment {index + 1}
            </button>
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        className="button secondary"
        disabled={value.length >= 500}
        onClick={() =>
          onChange([
            ...value,
            makeSegment(
              `Segment ${value.length + 1}`,
              "open",
              null,
              "steady",
              value.length + 1,
            ),
          ])
        }
      >
        Add segment
      </button>
    </section>
  );
}
function IntervalBuilder({
  onCreate,
}: {
  onCreate: (segments: Segment[], finalRecovery: boolean) => void;
}) {
  const [work, setWork] = useState(""),
    [rest, setRest] = useState(""),
    [warm, setWarm] = useState(""),
    [cool, setCool] = useState(""),
    [count, setCount] = useState(""),
    [final, setFinal] = useState(false),
    [error, setError] = useState("");
  return (
    <fieldset>
      <legend>Expand your interval pattern</legend>
      <p>
        Enter your own doses. This creates segment structure, not a recommended
        program.
      </p>
      {[
        ["Warm-up seconds", warm, setWarm],
        ["Work seconds", work, setWork],
        ["Recovery seconds", rest, setRest],
        ["Cool-down seconds", cool, setCool],
        ["Repetitions", count, setCount],
      ].map(([label, value, setter]) => (
        <Field key={label as string} label={label as string}>
          <input
            type="number"
            min="0"
            step="1"
            value={value as string}
            onChange={(e) => (setter as (v: string) => void)(e.target.value)}
          />
        </Field>
      ))}
      <Field label="Include final recovery">
        <input
          type="checkbox"
          checked={final}
          onChange={(e) => setFinal(e.target.checked)}
        />
      </Field>
      <button
        type="button"
        className="button secondary"
        onClick={() => {
          try {
            const n = Number(count),
              w = Number(work),
              r = Number(rest),
              a = Number(warm),
              b = Number(cool);
            if (
              !Number.isInteger(n) ||
              n < 1 ||
              n > 100 ||
              work === "" ||
              rest === "" ||
              w <= 0 ||
              r < 0 ||
              a < 0 ||
              b < 0
            )
              throw Error(
                "Enter 1–100 repetitions, positive work seconds and an explicit nonnegative recovery duration.",
              );
            const next: Segment[] = [];
            const add = (
              title: string,
              seconds: number,
              type: Segment["segmentType"],
            ) =>
              next.push(
                makeSegment(title, "duration", seconds, type, next.length + 1),
              );
            if (a > 0) add("Warm-up", a, "warm_up");
            for (let i = 0; i < n; i++) {
              add(`Work ${i + 1}`, w, "work");
              if (r > 0 && (i < n - 1 || final))
                add(`Recovery ${i + 1}`, r, "recovery");
            }
            if (b > 0) add("Cool-down", b, "cool_down");
            onCreate(next, final);
            setError("");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Check the pattern.");
          }
        }}
      >
        Create interval segments
      </button>
      {error && <p role="alert">{error}</p>}
    </fieldset>
  );
}
export function BuilderPage({ kind }: { kind: "plan" | "routine" }) {
  return (
    <CardioPage
      title={
        kind === "plan"
          ? "Build my cardio plan"
          : "Build my conditioning routine"
      }
    >
      <Builder kind={kind} />
    </CardioPage>
  );
}
function Builder({ kind }: { kind: "plan" | "routine" }) {
  const { view, run, busy } = useCardio();
  const [title, setTitle] = useState(""),
    [goal, setGoal] = useState(""),
    [weeks, setWeeks] = useState(1),
    [segments, setSegments] = useState<Segment[]>([]),
    [modality, setModality] = useState("modality_walking_outdoor"),
    [type, setType] =
      useState<Plan["sessions"][number]["sessionTypeId"]>("manual_other"),
    [reason, setReason] = useState("Initial user-created version"),
    [notes, setNotes] = useState(""),
    [finalRecovery, setFinalRecovery] = useState<boolean | null>(null),
    [sessions, setSessions] = useState<Plan["sessions"]>([]),
    [editId, setEditId] = useState<string | null>(null),
    [confirmed, setConfirmed] = useState(false);
  const existing =
    kind === "plan"
      ? view?.plans.find((v) => v.id === editId)
      : view?.routines.find((v) => v.id === editId);
  return (
    <>
      <form
        className="card recovery-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            const now = new Date().toISOString(),
              identityId = existing
                ? "planIdentityId" in existing
                  ? existing.planIdentityId
                  : existing.routineIdentityId
                : newCardioId();
            const base = {
              id: newCardioId(),
              versionNumber: (existing?.versionNumber ?? 0) + 1,
              title,
              publicationStatus: "local_active" as const,
              createdAt: now,
              revisionReason: reason,
              sourceIds: [],
            };
            const value: Plan | Routine =
              kind === "plan"
                ? {
                    ...base,
                    planIdentityId: identityId,
                    goal,
                    durationWeeks: weeks,
                    sessions,
                    progressionNotes: notes,
                  }
                : {
                    ...base,
                    routineIdentityId: identityId,
                    modalityId: modality,
                    sessionTypeId: type,
                    segments,
                    includeFinalRecovery: finalRecovery,
                    prerequisites: notes,
                  };
            await saveCardioVersion(value, existing?.id ?? null);
            setEditId(value.id);
            setReason("");
          }, "Immutable local version saved. Historical sessions retain their earlier snapshots.");
        }}
      >
        <Field label="Title">
          <input
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Revision reason">
          <input
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        {kind === "plan" ? (
          <>
            <Field label="Your goal">
              <input value={goal} onChange={(e) => setGoal(e.target.value)} />
            </Field>
            <Field label="Duration weeks">
              <input
                type="number"
                min="1"
                max="52"
                required
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
              />
            </Field>
            {sessions.map((session, index) => (
              <fieldset className="card" key={session.id}>
                <legend>Plan session {index + 1}</legend>
                <Field label="Session title">
                  <input
                    required
                    value={session.title}
                    onChange={(e) =>
                      setSessions(
                        sessions.map((s, i) =>
                          i === index ? { ...s, title: e.target.value } : s,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Day index (1–14)">
                  <input
                    type="number"
                    min="1"
                    max="14"
                    required
                    value={session.dayIndex}
                    onChange={(e) =>
                      setSessions(
                        sessions.map((s, i) =>
                          i === index
                            ? { ...s, dayIndex: Number(e.target.value) }
                            : s,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Session activity">
                  <ModalitySelect
                    value={session.modalityId}
                    onChange={(value) =>
                      setSessions(
                        sessions.map((s, i) =>
                          i === index ? { ...s, modalityId: value } : s,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Session type">
                  <TypeSelect
                    value={session.sessionTypeId}
                    onChange={(value) =>
                      setSessions(
                        sessions.map((s, i) =>
                          i === index
                            ? {
                                ...s,
                                sessionTypeId: value as typeof s.sessionTypeId,
                              }
                            : s,
                        ),
                      )
                    }
                  />
                </Field>
                <Field label="Session notes">
                  <textarea
                    value={session.notes}
                    onChange={(e) =>
                      setSessions(
                        sessions.map((s, i) =>
                          i === index ? { ...s, notes: e.target.value } : s,
                        ),
                      )
                    }
                  />
                </Field>
                <SegmentEditor
                  value={session.segments}
                  onChange={(value) =>
                    setSessions(
                      sessions.map((s, i) =>
                        i === index ? { ...s, segments: value } : s,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    setSessions(sessions.filter((_, i) => i !== index))
                  }
                >
                  Remove plan session {index + 1}
                </button>
              </fieldset>
            ))}
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                setSessions([
                  ...sessions,
                  {
                    id: newCardioId(),
                    dayIndex: 1,
                    title: `Session ${sessions.length + 1}`,
                    modalityId: modality,
                    sessionTypeId: type,
                    segments: [],
                    notes: "",
                  },
                ])
              }
            >
              Add plan session
            </button>
          </>
        ) : (
          <>
            <Field label="Activity">
              <ModalitySelect value={modality} onChange={setModality} />
            </Field>
            <Field label="Session type">
              <TypeSelect
                value={type}
                onChange={(value) => setType(value as typeof type)}
              />
            </Field>
            <IntervalBuilder
              onCreate={(value, final) => {
                setSegments(value);
                setFinalRecovery(final);
              }}
            />
            <SegmentEditor value={segments} onChange={setSegments} />
          </>
        )}
        <Field
          label={
            kind === "plan"
              ? "Your progression and deload notes"
              : "Your prerequisites and safety notes"
          }
        >
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <button disabled={busy || !view} className="button primary">
          Save local {kind} version
        </button>
      </form>
      <section className="card">
        <h2>Revise an existing {kind}</h2>
        <Field label={`Saved ${kind} version`}>
          <select
            value={editId ?? ""}
            disabled={!view}
            onChange={(e) => {
              const id = e.target.value;
              setEditId(id || null);
              const v =
                kind === "plan"
                  ? view?.plans.find((v) => v.id === id)
                  : view?.routines.find((v) => v.id === id);
              if (v) {
                setTitle(v.title);
                setReason("");
                if ("sessions" in v) {
                  setSessions(structuredClone(v.sessions));
                  setWeeks(v.durationWeeks);
                  setGoal(v.goal);
                  setNotes(v.progressionNotes);
                } else {
                  setSegments(structuredClone(v.segments));
                  setModality(v.modalityId);
                  setType(v.sessionTypeId);
                  setNotes(v.prerequisites);
                  setFinalRecovery(v.includeFinalRecovery);
                }
              }
            }}
          >
            <option value="">Create a new identity</option>
            {(kind === "plan"
              ? view?.planIdentities
              : view?.routineIdentities
            )?.map((i) => (
              <option key={i.id} value={i.currentVersionId}>
                {i.title}
              </option>
            ))}
          </select>
        </Field>
        <p>
          A new revision preserves every earlier version. Custom entries express
          your choices and have no public review approval.
        </p>
        {existing && (
          <>
            <Field label="Confirm deleting this identity and its local versions">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
            </Field>
            <button
              disabled={!confirmed || busy}
              className="button secondary"
              onClick={() =>
                void run(async () => {
                  await deleteCardioEntity(
                    kind,
                    "planIdentityId" in existing
                      ? existing.planIdentityId
                      : existing.routineIdentityId,
                    confirmed,
                  );
                  setEditId(null);
                  setConfirmed(false);
                }, "Deleted locally; undo is available in settings.")
              }
            >
              Delete local {kind}
            </button>
          </>
        )}
      </section>
    </>
  );
}
export function MyPlansPage({ kind }: { kind: "plan" | "routine" }) {
  return (
    <CardioPage
      title={kind === "plan" ? "My cardio plans" : "My conditioning routines"}
    >
      <MyPlans kind={kind} />
    </CardioPage>
  );
}
function MyPlans({ kind }: { kind: "plan" | "routine" }) {
  const { view, run, busy } = useCardio();
  const [week, setWeek] = useState(1),
    [startDate, setStartDate] = useState("");
  const identities =
    kind === "plan" ? view?.planIdentities : view?.routineIdentities;
  return (
    <>
      <a
        className="button primary"
        href={
          kind === "plan"
            ? "/cardio/custom-plans/create"
            : "/conditioning/custom"
        }
      >
        Build or revise a local {kind}
      </a>
      {!identities?.length && (
        <p>
          No local {kind}s yet. Start with your own choices; public drafts are
          not prescriptions.
        </p>
      )}
      {identities?.map((i) => {
        const v =
          kind === "plan"
            ? view?.plans.find((p) => p.id === i.currentVersionId)
            : view?.routines.find((r) => r.id === i.currentVersionId);
        if (!v)
          return (
            <p key={i.id}>An unavailable version needs raw backup recovery.</p>
          );
        return (
          <article className="card" key={i.id}>
            <h2>{v.title}</h2>
            <p>
              Version {v.versionNumber} · user created · {v.createdAt}
            </p>
            {"sessions" in v && (
              <>
                <Field label="Plan week to record">
                  <input
                    type="number"
                    min="1"
                    max={v.durationWeeks}
                    step="1"
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                  />
                </Field>
                <Field label="My plan start date">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Field>
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () =>
                        saveCardioPreferences({
                          ...view!.preferences,
                          value: {
                            ...view!.preferences.value,
                            currentPlanIdentityId: v.planIdentityId,
                            planStartDate: startDate || null,
                          },
                          updatedAt: new Date().toISOString(),
                        }),
                      "Current local cardio plan selected; no other module changed.",
                    )
                  }
                >
                  Use as my current cardio plan
                </button>
              </>
            )}
            {"sessions" in v ? (
              v.sessions.map((s) => (
                <div key={s.id}>
                  <p>
                    Day {s.dayIndex}: {s.title} ·{" "}
                    {
                      cardioReference.modalities.find(
                        (m) => m.id === s.modalityId,
                      )?.displayName
                    }
                  </p>
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        const session = startCardioSession(
                          {
                            title: s.title,
                            modalityId: s.modalityId,
                            sessionTypeId: s.sessionTypeId,
                            timezone: view!.preferences.value.timezone,
                            segments: s.segments,
                            frozenSource: {
                              kind: "plan",
                              version: v,
                              sessionId: s.id,
                              weekNumber: week,
                            },
                          },
                          new Date().toISOString(),
                          cardioOwnerId(),
                        );
                        await saveCardioSession(session, null, cardioOwnerId());
                        window.location.assign("/cardio/session/active");
                      }, "Plan session started locally.")
                    }
                  >
                    Start {s.title}
                  </button>
                </div>
              ))
            ) : (
              <>
                <p>{v.segments.length} ordered segments</p>
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      const session = startCardioSession(
                        {
                          title: v.title,
                          modalityId: v.modalityId,
                          sessionTypeId: v.sessionTypeId,
                          timezone: view!.preferences.value.timezone,
                          segments: v.segments,
                          frozenSource: { kind: "routine", version: v },
                        },
                        new Date().toISOString(),
                        cardioOwnerId(),
                      );
                      await saveCardioSession(session, null, cardioOwnerId());
                      window.location.assign("/cardio/session/active");
                    }, "Routine started locally.")
                  }
                >
                  Start routine
                </button>
              </>
            )}
          </article>
        );
      })}
    </>
  );
}
