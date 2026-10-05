import { useEffect, useState } from "react";
import {
  CardioPage,
  CardioField as Field,
  useCardio,
  numberOrNull,
  display,
  readable,
} from "./workspace";
import {
  type Session,
  type Segment,
  recordSchema,
  cardioReference,
  stopSignals,
} from "./schema";
import { SegmentEditor, ModalitySelect, TypeSelect } from "./builders";
import {
  makeSegment,
  startCardioSession,
  transitionCardio,
  sessionElapsed,
  markUrgentStop,
  validateSession,
  newCardioId,
  recordCardioLap,
} from "./domain";
import {
  saveCardioSession,
  cardioOwnerId,
  getCardioSession,
  deleteCardioEntity,
} from "./storage";
const hrSources = [
  "none",
  "manual_pulse",
  "chest_strap_estimate",
  "wrist_device_estimate",
  "machine_estimate",
  "other_device_estimate",
] as const;
export function RecordMetrics({
  value,
  onChange,
}: {
  value: Session;
  onChange: (patch: Partial<Session>) => void;
}) {
  return (
    <fieldset>
      <legend>Actual observations, optional</legend>
      <Field label="Device or machine label (optional)">
        <input
          maxLength={200}
          value={value.deviceLabel ?? ""}
          onChange={(e) =>
            onChange({
              deviceLabel: e.target.value.trim() ? e.target.value : null,
            })
          }
        />
      </Field>
      {(
        [
          ["distanceMeters", "Distance m"],
          ["averageHeartRateBpm", "Average heart rate bpm"],
          ["maximumHeartRateBpm", "Maximum heart rate bpm"],
          ["averagePowerWatts", "Average power W"],
          ["averageCadence", "Average cadence"],
          ["perceivedEffort0to10", "Perceived effort 0–10"],
        ] as const
      ).map(([key, label]) => (
        <Field key={key} label={label}>
          <input
            type="number"
            min="0"
            step={
              key === "perceivedEffort0to10" ||
              key === "averageHeartRateBpm" ||
              key === "maximumHeartRateBpm"
                ? "1"
                : "any"
            }
            max={key === "perceivedEffort0to10" ? 10 : undefined}
            value={value[key] ?? ""}
            onChange={(e) => onChange({ [key]: numberOrNull(e.target.value) })}
          />
        </Field>
      ))}
      <Field label="Heart-rate observation source">
        <select
          value={value.heartRateSource}
          onChange={(e) =>
            onChange({
              heartRateSource: e.target.value as Session["heartRateSource"],
            })
          }
        >
          {hrSources.map((s) => (
            <option key={s} value={s}>
              {readable(s)}
            </option>
          ))}
        </select>
      </Field>
      <p>
        Device heart rates are estimates. A manual pulse is a user report; the
        app does not classify either as a clinical measurement.
      </p>
      <Field label="Cadence unit">
        <select
          value={value.cadenceUnit}
          onChange={(e) =>
            onChange({ cadenceUnit: e.target.value as Session["cadenceUnit"] })
          }
        >
          {[
            "not_recorded",
            "steps_per_minute",
            "revolutions_per_minute",
            "strokes_per_minute",
            "other",
          ].map((s) => (
            <option value={s} key={s}>
              {readable(s)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Actual talk-test observation">
        <select
          value={value.talkTest}
          onChange={(e) =>
            onChange({ talkTest: e.target.value as Session["talkTest"] })
          }
        >
          {cardioReference.talkTestStates.map((s) => (
            <option key={s} value={s}>
              {readable(s)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Environment">
        <select
          value={value.environment.locationType}
          onChange={(e) =>
            onChange({
              environment: {
                ...value.environment,
                locationType: e.target
                  .value as Session["environment"]["locationType"],
              },
            })
          }
        >
          {["unknown", "indoor", "outdoor", "mixed"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Surface">
        <input
          value={value.environment.surface ?? ""}
          onChange={(e) =>
            onChange({
              environment: {
                ...value.environment,
                surface: e.target.value || null,
              },
            })
          }
        />
      </Field>
      {(
        [
          ["temperatureCelsius", "Temperature °C"],
          ["humidityPercent", "Humidity %"],
          ["elevationGainMeters", "Elevation gain m"],
        ] as const
      ).map(([key, label]) => (
        <Field key={key} label={label}>
          <input
            type="number"
            step="any"
            value={value.environment[key] ?? ""}
            onChange={(e) =>
              onChange({
                environment: {
                  ...value.environment,
                  [key]: numberOrNull(e.target.value),
                },
              })
            }
          />
        </Field>
      ))}
      <Field label="Environment tags">
        <input
          value={value.environment.tags.join(", ")}
          onChange={(e) =>
            onChange({
              environment: {
                ...value.environment,
                tags: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              },
            })
          }
        />
      </Field>
      <Field label="Your notes">
        <textarea
          maxLength={10000}
          value={value.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </Field>
    </fieldset>
  );
}
export function NewSessionPage() {
  return (
    <CardioPage title="Start or record cardio">
      <NewSession />
    </CardioPage>
  );
}
function NewSession() {
  const { view, run, busy } = useCardio();
  const [title, setTitle] = useState(""),
    [modality, setModality] = useState("modality_walking_outdoor"),
    [type, setType] = useState<Session["sessionTypeId"]>("manual_other"),
    [segments, setSegments] = useState<Segment[]>([]),
    [manual, setManual] = useState(false),
    [started, setStarted] = useState(""),
    [duration, setDuration] = useState(""),
    [draft, setDraft] = useState<Session | null>(null);
  return (
    <>
      <p>
        Tracking is optional. A live timer uses timestamps and remains accurate
        through background suspension. Manual entry requires your actual elapsed
        time; targets never become measurements.
      </p>
      <form
        className="card recovery-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(
            async () => {
              if (!view) throw Error("Browser storage is not ready.");
              const owner = cardioOwnerId(),
                now = manual ? started : new Date().toISOString();
              let s = startCardioSession(
                {
                  title,
                  modalityId: modality,
                  sessionTypeId: type,
                  timezone: view.preferences.value.timezone,
                  segments: segments.length
                    ? segments
                    : [makeSegment("Manual activity")],
                },
                now,
                owner,
              );
              if (manual) {
                const seconds = numberOrNull(duration);
                if (seconds === null || seconds <= 0)
                  throw Error("Enter a positive actual elapsed duration.");
                if (Date.parse(now) + seconds * 1000 > Date.now())
                  throw Error(
                    "A completed manual session cannot end in the future.",
                  );
                s = transitionCardio(
                  s,
                  "finish",
                  new Date(Date.parse(now) + seconds * 1000).toISOString(),
                );
                const created = new Date().toISOString();
                s.createdAt = created;
                s.updatedAt = created;
                if (s.originalCompletedRecord) {
                  s.originalCompletedRecord.createdAt = created;
                  s.originalCompletedRecord.updatedAt = created;
                }
              }
              await saveCardioSession(s, null, owner);
              if (manual) setDraft(s);
              else window.location.assign("/cardio/session/active");
            },
            manual
              ? "Manual session saved locally; edit its observations below."
              : "Timer started and saved locally.",
          );
        }}
      >
        <Field label="Session title">
          <input
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Activity category">
          <ModalitySelect value={modality} onChange={setModality} />
        </Field>
        <Field label="Session type">
          <TypeSelect
            value={type}
            onChange={(v) => setType(v as typeof type)}
          />
        </Field>
        <Field label="Record a completed session manually">
          <input
            type="checkbox"
            checked={manual}
            onChange={(e) => setManual(e.target.checked)}
          />
        </Field>
        {manual && (
          <>
            <Field
              label="Actual start timestamp with offset"
              help="For example 2026-10-05T07:30:00+05:30. Use your real date and timezone; no example is saved automatically."
            >
              <input
                required
                value={started}
                onChange={(e) => setStarted(e.target.value)}
              />
            </Field>
            <Field label="Actual elapsed seconds">
              <input
                required
                type="number"
                min="0.001"
                step="any"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </Field>
          </>
        )}
        <SegmentEditor value={segments} onChange={setSegments} />
        <button className="button primary" disabled={busy || !view}>
          {manual ? "Save completed manual session" : "Start local timer"}
        </button>
      </form>
      {draft && (
        <p>
          <a className="button primary" href={`/cardio/history/${draft.id}`}>
            Edit actual observations for {draft.title}
          </a>
        </p>
      )}
      <p>
        <a href="/cardio/custom-plans">Start from my plan</a> ·{" "}
        <a href="/conditioning">Start from my routine</a>
      </p>
    </>
  );
}
export function ActiveSessionPage() {
  return (
    <CardioPage title="Active cardio session">
      <ActiveSession />
    </CardioPage>
  );
}
function ActiveSession() {
  const { view, run, busy } = useCardio();
  const session = view?.sessions.find((s) =>
    ["active", "paused"].includes(s.status),
  );
  const [now, setNow] = useState(""),
    [takeover, setTakeover] = useState(false),
    [signal, setSignal] = useState<Session["stopSignals"][number]>(
      "other_urgent_concern",
    ),
    [modification, setModification] = useState(""),
    [distance, setDistance] = useState(""),
    [talk, setTalk] = useState<Session["talkTest"]>("not_recorded"),
    [effort, setEffort] = useState(""),
    [hr, setHr] = useState(""),
    [hrSource, setHrSource] =
      useState<Exclude<Session["heartRateSource"], "none">>("manual_pulse"),
    [wake, setWake] = useState("");
  const [lapDistance, setLapDistance] = useState("");
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().toISOString()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!session)
    return (
      <section className="card">
        <h2>No active session</h2>
        <a className="button primary" href="/cardio/session/new">
          Choose an activity
        </a>
      </section>
    );
  const current = session.segments[session.player.currentIndex];
  let elapsed: number | null = null;
  try {
    elapsed = sessionElapsed(session, now || session.updatedAt);
  } catch {
    /* visible clock issue below */
  }
  const transition = (action: Parameters<typeof transitionCardio>[1]) =>
    void run(
      async () => {
        const instant = new Date().toISOString();
        const next = transitionCardio(session, action, instant);
        await saveCardioSession(
          next,
          session.revision,
          cardioOwnerId(),
          takeover,
        );
        setTakeover(false);
        if (action === "next" || action === "skip") {
          setDistance("");
          setEffort("");
          setTalk("not_recorded");
          setModification("");
        }
      },
      action === "finish" || action === "abandon"
        ? "Session ended and saved locally."
        : "Session state saved locally.",
    );
  return (
    <>
      <section className="card">
        <h2>{session.title}</h2>
        <p>
          {
            cardioReference.modalities.find((m) => m.id === session.modalityId)
              ?.displayName
          }{" "}
          · {readable(session.status)}
        </p>
        <p className="cardio-timer" aria-label="Elapsed active time">
          {elapsed === null
            ? "Clock changed: pause and check the record."
            : `${Math.floor(elapsed / 60)}:${String(Math.floor(elapsed % 60)).padStart(2, "0")}`}
        </p>
        <p>
          The timer uses timestamp differences. It does not estimate distance or
          moving time.
        </p>
        {current && (
          <>
            <h3>
              Segment {current.order}: {current.title}
            </h3>
            <p>
              Planned:{" "}
              {current.targetMode === "open"
                ? "Open"
                : `${current.targetValue} ${current.targetUnit}`}{" "}
              · {current.intensity.method} · {current.intensity.methodVersion}
            </p>
            <p>
              {current.intensity.instruction ??
                `${display(current.intensity.lower)}–${display(current.intensity.upper)} ${current.intensity.unit ?? ""}`}
            </p>
            {current.intensity.provenance.estimated && (
              <p>
                Age-predicted maximum estimate; substantial individual error.
              </p>
            )}
          </>
        )}
        <Field label="Confirm taking session control from another tab">
          <input
            type="checkbox"
            checked={takeover}
            onChange={(e) => setTakeover(e.target.checked)}
          />
        </Field>
        <div className="actions">
          <button
            className="button primary"
            disabled={busy || session.stopSignals.length > 0}
            onClick={() =>
              transition(session.status === "active" ? "pause" : "resume")
            }
          >
            {session.status === "active" ? "Pause timer" : "Resume timer"}
          </button>
          <button
            className="button secondary"
            disabled={busy || session.stopSignals.length > 0}
            onClick={() => transition("next")}
          >
            Complete current segment
          </button>
          <button
            className="button secondary"
            disabled={busy || session.stopSignals.length > 0}
            onClick={() => transition("skip")}
          >
            Skip current segment
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => transition("finish")}
          >
            End and save session
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => transition("abandon")}
          >
            End as abandoned
          </button>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            if (!("wakeLock" in navigator)) {
              setWake("Screen wake lock is unavailable in this browser.");
              return;
            }
            void navigator.wakeLock
              .request("screen")
              .then((lock) => {
                setWake(
                  "Screen wake lock requested. It may be released when the page is hidden.",
                );
                lock.addEventListener("release", () =>
                  setWake("Screen wake lock released."),
                );
              })
              .catch(() =>
                setWake(
                  "Screen wake lock was declined; the timestamp timer continues.",
                ),
              );
          }}
        >
          Keep screen awake
        </button>
        {wake && <p role="status">{wake}</p>}
      </section>
      <section className="card">
        <h2>Laps</h2>
        <Field label="Actual distance for this lap m">
          <input
            type="number"
            min="0"
            step="any"
            value={lapDistance}
            onChange={(e) => setLapDistance(e.target.value)}
          />
        </Field>
        <button
          className="button secondary"
          disabled={busy || session.stopSignals.length > 0}
          onClick={() =>
            void run(async () => {
              await saveCardioSession(
                recordCardioLap(
                  session,
                  new Date().toISOString(),
                  numberOrNull(lapDistance),
                ),
                session.revision,
                cardioOwnerId(),
                takeover,
              );
              setLapDistance("");
            }, "Lap saved from timestamp elapsed time; distance was not inferred.")
          }
        >
          Record lap
        </button>
        <ol>
          {session.laps.map((lap, i) => (
            <li key={lap.id}>
              Lap {i + 1}:{" "}
              {display(
                lap.elapsedSecondsExact -
                  (session.laps[i - 1]?.elapsedSecondsExact ?? 0),
                3,
              )}{" "}
              s · {display(lap.distanceMeters, 3)} m
            </li>
          ))}
        </ol>
      </section>
      <form
        className="card recovery-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            const next = structuredClone(session),
              seg = next.segments[next.player.currentIndex];
            if (!seg) throw Error("Current segment is unavailable.");
            seg.actualDistanceMeters = numberOrNull(distance);
            seg.actualTalkTest = talk;
            seg.actualPerceivedEffort = numberOrNull(effort);
            seg.modificationNote = modification;
            next.updatedAt = new Date().toISOString();
            next.revision++;
            await saveCardioSession(
              next,
              session.revision,
              cardioOwnerId(),
              takeover,
            );
          }, "Current segment observations saved; planned targets are unchanged.");
        }}
      >
        <h2>Record this segment</h2>
        <Field label="Actual segment distance m">
          <input
            type="number"
            min="0"
            step="any"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          />
        </Field>
        <Field label="Actual segment talk test">
          <select
            value={talk}
            onChange={(e) => setTalk(e.target.value as typeof talk)}
          >
            {cardioReference.talkTestStates.map((t) => (
              <option value={t} key={t}>
                {readable(t)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Actual segment effort 0–10">
          <input
            type="number"
            min="0"
            max="10"
            step="1"
            value={effort}
            onChange={(e) => setEffort(e.target.value)}
          />
        </Field>
        <Field label="Modification note">
          <textarea
            value={modification}
            onChange={(e) => setModification(e.target.value)}
          />
        </Field>
        <button className="button secondary" disabled={busy}>
          Save segment observations
        </button>
      </form>
      <form
        className="card recovery-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            const bpm = numberOrNull(hr);
            if (bpm === null) throw Error("Enter your observed HR.");
            const next = structuredClone(session);
            next.heartRateObservations.push({
              id: newCardioId(),
              at: new Date().toISOString(),
              bpm,
              source: hrSource,
            });
            next.updatedAt = new Date().toISOString();
            next.revision++;
            await saveCardioSession(
              next,
              session.revision,
              cardioOwnerId(),
              takeover,
            );
          }, "Heart-rate observation saved with its source.");
        }}
      >
        <h2>Optional HR observation</h2>
        <Field label="Observed heart rate bpm">
          <input
            type="number"
            required
            min="20"
            max="280"
            step="1"
            value={hr}
            onChange={(e) => setHr(e.target.value)}
          />
        </Field>
        <Field label="Observed HR source">
          <select
            value={hrSource}
            onChange={(e) => setHrSource(e.target.value as typeof hrSource)}
          >
            {hrSources
              .filter((s) => s !== "none")
              .map((s) => (
                <option value={s} key={s}>
                  {readable(s)}
                </option>
              ))}
          </select>
        </Field>
        <button className="button secondary" disabled={busy}>
          Save HR observation
        </button>
      </form>
      <section className="card">
        <h2>Stop concerns</h2>
        {session.stopSignals.length > 0 && (
          <p role="alert">
            Stop activity. Urgent concerns disable continuation. Seek urgent
            medical help; contact your local emergency service when appropriate.
            The app cannot diagnose or clear you to resume.
          </p>
        )}
        <Field label="Stop concern category">
          <select
            value={signal}
            onChange={(e) => setSignal(e.target.value as typeof signal)}
          >
            {stopSignals.map((s) => (
              <option value={s} key={s}>
                {readable(s)}
              </option>
            ))}
          </select>
        </Field>
        <button
          className="button secondary"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              await saveCardioSession(
                markUrgentStop(session, signal, new Date().toISOString()),
                session.revision,
                cardioOwnerId(),
                takeover,
              );
            }, "Stop concern saved; activity paused.")
          }
        >
          Record urgent stop and pause
        </button>
        <p>
          <a href="https://www.heart.org/en/health-topics/cardiac-rehab/getting-physically-active/develop-a-physical-activity-plan-for-you">
            AHA symptom precautions
          </a>
        </p>
      </section>
    </>
  );
}
export function SessionDetailPage({ sessionId }: { sessionId: string }) {
  return (
    <CardioPage title="Cardio session record">
      <SessionDetail sessionId={sessionId} />
    </CardioPage>
  );
}
function SessionDetail({ sessionId }: { sessionId: string }) {
  const { run, busy } = useCardio();
  const [record, setRecord] = useState<Session | null>(null),
    [draft, setDraft] = useState<Session | null>(null),
    [error, setError] = useState(""),
    [loaded, setLoaded] = useState(false),
    [reason, setReason] = useState(""),
    [confirmed, setConfirmed] = useState(false);
  useEffect(() => {
    void getCardioSession(sessionId)
      .then((s) => {
        setRecord(s);
        setDraft(s);
        setLoaded(true);
      })
      .catch(() => {
        setError("This record is unavailable or needs raw backup recovery.");
        setLoaded(true);
      });
  }, [sessionId]);
  if (!loaded) return <p role="status">Loading selected browser record…</p>;
  if (error || !record || !draft)
    return <p role="status">{error || "This local record is unavailable."}</p>;
  if (["active", "paused"].includes(record.status))
    return <a href="/cardio/session/active">Open the active session</a>;
  const update = (patch: Partial<Session>) => setDraft({ ...draft, ...patch });
  return (
    <>
      <section className="card">
        <h2>{record.title}</h2>
        <p>
          {record.sessionDate} · {record.timezone} · {record.status} · revision{" "}
          {record.revision}
        </p>
        <p>
          Actual elapsed {display(record.elapsedSecondsExact, 3)} s · actual
          distance {display(record.distanceMeters, 3)} m
        </p>
        <p>
          Frozen source:{" "}
          {record.frozenSource?.version.title ?? "User-created activity"}
          {record.frozenSource
            ? ` · version ${record.frozenSource.version.versionNumber}`
            : ""}
        </p>
        <details>
          <summary>Original completed observations and edit history</summary>
          <p>
            Original elapsed:{" "}
            {display(record.originalCompletedRecord?.elapsedSecondsExact, 3)} s.
            Original notes: {record.originalCompletedRecord?.notes || "None"}
          </p>
          {record.revisions.map((r) => (
            <p key={r.id}>
              {r.at}: {r.reason} · prior notes {r.record.notes || "None"}
            </p>
          ))}
        </details>
      </section>
      <form
        className="card recovery-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            const now = new Date().toISOString();
            const prior = recordSchema.parse(
              Object.fromEntries(
                Object.entries(record).filter(
                  ([key]) =>
                    ![
                      "originalCompletedRecord",
                      "revisions",
                      "revision",
                      "lease",
                    ].includes(key),
                ),
              ),
            );
            const next = validateSession({
              ...draft,
              updatedAt: now,
              revision: record.revision + 1,
              revisions: [
                ...record.revisions,
                { id: newCardioId(), at: now, reason, record: prior },
              ],
            });
            await saveCardioSession(next, record.revision, cardioOwnerId());
            setRecord(next);
            setDraft(next);
            setReason("");
          }, "Correction saved with a revision; the original record and source snapshot remain available.");
        }}
      >
        <h2>Correct actual observations</h2>
        <RecordMetrics value={draft} onChange={update} />
        <Field label="Corrected actual elapsed seconds">
          <input
            type="number"
            min="0"
            step="any"
            value={draft.elapsedSecondsExact ?? ""}
            onChange={(e) => {
              const seconds = numberOrNull(e.target.value);
              update({
                elapsedSecondsExact: seconds,
                elapsedSeconds: seconds === null ? null : Math.floor(seconds),
              });
            }}
          />
        </Field>
        {draft.segments.map((s, index) => (
          <fieldset key={s.id}>
            <legend>
              Actual segment {index + 1}: {s.title}
            </legend>
            <Field label="Actual seconds">
              <input
                type="number"
                min="0"
                step="any"
                value={s.actualSecondsExact ?? ""}
                onChange={(e) => {
                  const seconds = numberOrNull(e.target.value);
                  update({
                    segments: draft.segments.map((seg, i) =>
                      i === index
                        ? {
                            ...seg,
                            actualSecondsExact: seconds,
                            actualDurationSeconds:
                              seconds === null ? null : Math.floor(seconds),
                          }
                        : seg,
                    ),
                  });
                }}
              />
            </Field>
            <Field label="Actual metres">
              <input
                type="number"
                min="0"
                step="any"
                value={s.actualDistanceMeters ?? ""}
                onChange={(e) =>
                  update({
                    segments: draft.segments.map((seg, i) =>
                      i === index
                        ? {
                            ...seg,
                            actualDistanceMeters: numberOrNull(e.target.value),
                          }
                        : seg,
                    ),
                  })
                }
              />
            </Field>
            <Field label="Segment talk observation">
              <select
                value={s.actualTalkTest}
                onChange={(e) =>
                  update({
                    segments: draft.segments.map((seg, i) =>
                      i === index
                        ? {
                            ...seg,
                            actualTalkTest: e.target
                              .value as typeof s.actualTalkTest,
                          }
                        : seg,
                    ),
                  })
                }
              >
                {cardioReference.talkTestStates.map((t) => (
                  <option value={t} key={t}>
                    {readable(t)}
                  </option>
                ))}
              </select>
            </Field>
            <p>
              Original target: {s.targetValue ?? "Open"} {s.targetUnit} ·{" "}
              {s.intensity.methodVersion}. Actuals may be corrected; prescribed
              targets are frozen.
            </p>
          </fieldset>
        ))}
        <Field label="Correction reason">
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <button className="button primary" disabled={busy}>
          Save audited correction
        </button>
      </form>
      <section className="card">
        <h2>Delete this record</h2>
        <Field label="Confirm deleting this cardio session">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
        </Field>
        <button
          className="button secondary"
          disabled={!confirmed || busy}
          onClick={() =>
            void run(async () => {
              await deleteCardioEntity("session", record.id, confirmed);
              setRecord(null);
              setDraft(null);
            }, "Deleted locally. Undo is available in settings.")
          }
        >
          Delete session
        </button>
      </section>
    </>
  );
}
