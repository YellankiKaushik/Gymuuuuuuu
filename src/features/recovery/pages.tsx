import { useState } from "react";
import { dimensionSummaries, regionalSummaries } from "./read-models";
import { allTracker } from "../workout-tracker/storage";
import {
  workoutSessionSchema,
  type WorkoutSession,
} from "../workout-tracker/schema";
import { dimensions, regions, type SleepLog, type CheckIn } from "./schema";
import {
  calculateSleep,
  newRecoveryId,
  localDate,
  summarize,
  clockRegularity,
} from "./domain";
import {
  saveSleep,
  saveCheckIn,
  deleteRecoveryRecord,
  readRecoveryView,
  defaultRecoverySettings,
} from "./storage";
import { useRecovery, Field, display } from "./workspace";
const labels: Record<(typeof dimensions)[number], string> = {
  overallReadiness: "Overall readiness",
  energy: "Energy",
  generalFatigue: "General fatigue",
  stress: "Stress",
  motivation: "Motivation",
  mood: "Mood",
  perceivedRecovery: "Perceived recovery",
};
export function RecoveryOverview({
  sleepOnly = false,
}: {
  sleepOnly?: boolean;
}) {
  const { view } = useRecovery();
  if (!view) return null;
  const sleeps = [...view.data.sleepLogs].sort((a, b) =>
      b.sleepDate.localeCompare(a.sleepDate),
    ),
    checks = [...view.data.recoveryCheckIns].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  const recent = sleeps[0],
    check = checks[0];
  return (
    <>
      <div className="recovery-grid">
        <section className="recovery-card">
          <h2>Latest sleep report</h2>
          {recent ? (
            <>
              <p>
                {recent.sleepDate} · {recent.source.replaceAll("_", " ")} ·{" "}
                {recent.status}
              </p>
              <p className="recovery-number">
                {display(recent.calculated.estimatedTotalSleepMinutes)}{" "}
                <small>minutes</small>
              </p>
              <p>
                Daily total including naps:{" "}
                {display(recent.calculated.dailyTotalSleepMinutes)} min
              </p>
              <p>Quality: {display(recent.quality, 0)} / 5</p>
            </>
          ) : (
            <p>No diary entries yet. Tracking is optional.</p>
          )}
          <a className="button primary" href="/sleep/log">
            Add a sleep entry
          </a>
          <a className="button secondary" href="/sleep/history">
            Sleep history
          </a>
        </section>
        {!sleepOnly && (
          <section className="recovery-card">
            <h2>Latest check-in</h2>
            {check ? (
              <>
                <p>{check.date}</p>
                <dl>
                  {dimensions.map((d) => (
                    <div key={d}>
                      <dt>{labels[d]}</dt>
                      <dd>{display(check[d], 0)} / 5</dd>
                    </div>
                  ))}
                </dl>
                <p>
                  {check.regionalSoreness.length} reported region/side pairs
                </p>
              </>
            ) : (
              <p>No check-ins yet. Ratings are your own reports.</p>
            )}
            <a className="button primary" href="/recovery/check-in">
              Add a check-in
            </a>
            <a className="button secondary" href="/recovery/history">
              Check-in history
            </a>
          </section>
        )}
      </div>
      <section className="recovery-card">
        <h2>Explore and practise</h2>
        <p>
          Local text-only routines are available. Repository knowledge awaits
          source and editorial review.
        </p>
        <div className="actions">
          <a className="button secondary" href="/mobility/custom">
            My routines
          </a>
          <a className="button secondary" href="/recovery/topics">
            Recovery topics
          </a>
          <a className="button secondary" href="/sleep/methodology">
            Sleep methodology
          </a>
          <a className="button secondary" href="/recovery/privacy">
            Privacy
          </a>
        </div>
      </section>
    </>
  );
}
function initialSleep(timezone: string): SleepLog {
  const now = new Date().toISOString();
  const base = {
    id: newRecoveryId(),
    sleepDate: localDate(now, timezone),
    timezone,
    source: "manual_morning_diary" as const,
    createdAt: now,
    updatedAt: now,
    status: "incomplete" as const,
    gotIntoBedAt: null,
    attemptedSleepAt: null,
    finalWakeAt: null,
    outOfBedAt: null,
    sleepOnsetLatencyMinutes: null,
    wakeAfterSleepOnsetMinutes: null,
    awakeningsCount: null,
    naps: [],
    quality: null,
    restedness: null,
    daytimeSleepiness: null,
    tags: [],
    notes: "",
    deviceName: null,
    deviceDurationMinutes: null,
  };
  return { ...base, calculated: calculateSleep(base) };
}
export function SleepDiary() {
  const { view } = useRecovery();
  const [edit, setEdit] = useState<SleepLog | null>(null),
    [revision, setRevision] = useState(0);
  if (!view) return null;
  const selected = view.data.sleepLogs.find((s) => s.id === edit?.id) ?? edit;
  return (
    <>
      <Field label="Edit an existing entry">
        <select
          value={edit?.id ?? ""}
          onChange={(e) => {
            setEdit(
              view.data.sleepLogs.find((s) => s.id === e.target.value) ?? null,
            );
            setRevision((v) => v + 1);
          }}
        >
          <option value="">New sleep entry</option>
          {view.data.sleepLogs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.sleepDate} · {s.source.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </Field>
      <SleepForm
        key={`${selected?.id ?? "new"}:${selected?.updatedAt ?? revision}`}
        existing={selected}
      />
    </>
  );
}
function SleepForm({ existing }: { existing: SleepLog | null }) {
  const { view, run, busy } = useRecovery();
  const settings = view?.data.settings[0] ?? defaultRecoverySettings();
  const [entry, setEntry] = useState(
    () => existing ?? initialSleep(settings.value.timezone),
  );
  const calculated = calculateSleep(entry);
  const set = <K extends keyof SleepLog>(key: K, value: SleepLog[K]) =>
    setEntry((v) => ({ ...v, [key]: value }));
  const ratingFields = ["quality", "restedness", "daytimeSleepiness"] as const;
  return (
    <form
      className="recovery-form"
      onSubmit={(e) => {
        e.preventDefault();
        const status =
          calculated.estimatedTotalSleepMinutes === null
            ? "incomplete"
            : "complete";
        void run(
          () =>
            saveSleep(
              {
                ...entry,
                calculated,
                status,
                updatedAt: new Date().toISOString(),
              },
              existing?.updatedAt,
            ),
          "Sleep entry saved to this browser.",
        );
      }}
    >
      <div className="recovery-grid">
        <Field label="Wake date">
          <input
            type="date"
            required
            value={entry.sleepDate}
            onChange={(e) => set("sleepDate", e.target.value)}
          />
        </Field>
        <Field
          label="IANA timezone"
          help="Offsets must match this zone at the entered time; daylight-saving changes need the correct offset."
        >
          <input
            required
            value={entry.timezone}
            onChange={(e) => set("timezone", e.target.value)}
          />
        </Field>
        <Field label="Entry source">
          <select
            value={entry.source}
            onChange={(e) =>
              setEntry((v) => ({
                ...v,
                source: e.target.value as SleepLog["source"],
                deviceDurationMinutes: null,
              }))
            }
          >
            <option value="manual_morning_diary">Morning diary</option>
            <option value="manual_recall">Later recall</option>
            <option value="consumer_device_estimate">
              Consumer device estimate
            </option>
          </select>
        </Field>
      </div>
      {entry.source === "consumer_device_estimate" ? (
        <>
          <Field label="Device duration estimate (minutes)">
            <input
              type="number"
              min="0"
              max="1440"
              step="any"
              value={entry.deviceDurationMinutes ?? ""}
              onChange={(e) =>
                set(
                  "deviceDurationMinutes",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            />
          </Field>
          <Field label="Device name (optional)">
            <input
              value={entry.deviceName ?? ""}
              maxLength={200}
              onChange={(e) => set("deviceName", e.target.value || null)}
            />
          </Field>
          <p>
            Device stages are not collected. This duration remains a device
            estimate.
          </p>
        </>
      ) : (
        <>
          <p>
            Use an ISO timestamp with its explicit UTC offset, for example
            2026-08-04T22:30:00+05:30. Blank fields remain unknown.
          </p>
          <div className="recovery-grid">
            {(
              [
                "gotIntoBedAt",
                "attemptedSleepAt",
                "finalWakeAt",
                "outOfBedAt",
              ] as const
            ).map((key) => (
              <Field
                key={key}
                label={
                  {
                    gotIntoBedAt: "Got into bed",
                    attemptedSleepAt: "Attempted sleep",
                    finalWakeAt: "Final wake",
                    outOfBedAt: "Got out of bed",
                  }[key]
                }
              >
                <input
                  type="text"
                  value={entry[key] ?? ""}
                  placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
                  onChange={(e) => set(key, e.target.value || null)}
                />
              </Field>
            ))}
            {(
              [
                "sleepOnsetLatencyMinutes",
                "wakeAfterSleepOnsetMinutes",
                "awakeningsCount",
              ] as const
            ).map((key) => (
              <Field
                key={key}
                label={
                  {
                    sleepOnsetLatencyMinutes: "Time to fall asleep (minutes)",
                    wakeAfterSleepOnsetMinutes:
                      "Awake after falling asleep (minutes)",
                    awakeningsCount: "Awakenings (count)",
                  }[key]
                }
              >
                <input
                  type="number"
                  min="0"
                  max={
                    key === "sleepOnsetLatencyMinutes"
                      ? 720
                      : key === "awakeningsCount"
                        ? 100
                        : 1440
                  }
                  value={entry[key] ?? ""}
                  onChange={(e) =>
                    set(
                      key,
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
              </Field>
            ))}
          </div>
        </>
      )}
      <fieldset>
        <legend>Naps</legend>
        {(entry.naps ?? []).map((nap, i) => (
          <div className="recovery-card" key={nap.id}>
            <Field label={`Nap ${i + 1} start (ISO timestamp)`}>
              <input
                value={nap.startAt}
                onChange={(e) =>
                  set(
                    "naps",
                    entry.naps?.map((n) =>
                      n.id === nap.id ? { ...n, startAt: e.target.value } : n,
                    ),
                  )
                }
              />
            </Field>
            <Field label={`Nap ${i + 1} end (ISO timestamp)`}>
              <input
                value={nap.endAt}
                onChange={(e) =>
                  set(
                    "naps",
                    entry.naps?.map((n) =>
                      n.id === nap.id ? { ...n, endAt: e.target.value } : n,
                    ),
                  )
                }
              />
            </Field>
            <Field label={`Nap ${i + 1} note`}>
              <input
                value={nap.notes ?? ""}
                maxLength={1000}
                onChange={(e) =>
                  set(
                    "naps",
                    entry.naps?.map((n) =>
                      n.id === nap.id ? { ...n, notes: e.target.value } : n,
                    ),
                  )
                }
              />
            </Field>
            <button
              className="button secondary"
              type="button"
              onClick={() =>
                set(
                  "naps",
                  entry.naps?.filter((n) => n.id !== nap.id),
                )
              }
            >
              Remove nap {i + 1}
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            set("naps", [
              ...(entry.naps ?? []),
              { id: newRecoveryId(), startAt: "", endAt: "", notes: "" },
            ])
          }
        >
          Add nap
        </button>
      </fieldset>
      <div className="recovery-grid">
        {ratingFields.map((key) => (
          <Field
            key={key}
            label={
              {
                quality: "Sleep quality",
                restedness: "Restedness",
                daytimeSleepiness: "Daytime sleepiness",
              }[key]
            }
            help={
              key === "daytimeSleepiness"
                ? "1 = very low, 5 = very high"
                : "1 = very poor, 5 = very good"
            }
          >
            <select
              value={entry[key] ?? ""}
              onChange={(e) =>
                set(key, e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Not measured</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
        ))}
      </div>
      <fieldset>
        <legend>Context tags (optional)</legend>
        {(
          [
            "late_caffeine",
            "alcohol",
            "late_intense_exercise",
            "travel",
            "shift_work",
            "illness",
            "high_stress",
            "device_estimate",
            "other",
          ] as const
        ).map((tag) => (
          <label className="recovery-check" key={tag}>
            <input
              type="checkbox"
              checked={entry.tags?.includes(tag) ?? false}
              onChange={(e) =>
                set(
                  "tags",
                  e.target.checked
                    ? [...(entry.tags ?? []), tag]
                    : entry.tags?.filter((t) => t !== tag),
                )
              }
            />
            {tag.replaceAll("_", " ")}
          </label>
        ))}
      </fieldset>
      <Field label="Notes">
        <textarea
          maxLength={5000}
          value={entry.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>
      <section className="recovery-card">
        <h2>Calculation preview</h2>
        <p>
          Opportunity: {display(calculated.sleepOpportunityMinutes)} min · Main
          duration: {display(calculated.estimatedTotalSleepMinutes)} min · Daily
          total: {display(calculated.dailyTotalSleepMinutes)} min
        </p>
        <p>
          Efficiency: {display(calculated.sleepEfficiencyPercent)}% · Naps:{" "}
          {display(calculated.napMinutes)} min
        </p>
        {calculated.validationWarnings.map((w) => (
          <p key={w}>{w}</p>
        ))}
        <p>
          These are diary arithmetic, not a diagnosis. A selected goal does not
          rewrite your history.
        </p>
      </section>
      <button className="button primary" disabled={busy || !calculated.valid}>
        Save sleep entry
      </button>
      {existing && (
        <button
          className="button secondary"
          type="button"
          disabled={busy}
          onClick={() => {
            if (
              window.confirm(
                "Delete this sleep entry? You can undo in settings.",
              )
            )
              void run(
                () => deleteRecoveryRecord("sleepLogs", existing.id),
                "Sleep entry deleted; undo is available in settings.",
              );
          }}
        >
          Delete entry
        </button>
      )}
    </form>
  );
}
function initialCheck(timezone: string): CheckIn {
  const now = new Date().toISOString();
  return {
    id: newRecoveryId(),
    date: localDate(now, timezone),
    timezone,
    createdAt: now,
    updatedAt: now,
    regionalSoreness: [],
    alertCategories: [],
    notes: "",
    painOrInjuryConcern: false,
    painConcernSeverity: null,
    illnessSymptoms: false,
    linkedSleepLogId: null,
    linkedWorkoutSessionIds: [],
  };
}
export function RecoveryCheckIn() {
  const { view } = useRecovery();
  const [edit, setEdit] = useState<CheckIn | null>(null);
  if (!view) return null;
  const selected =
    view.data.recoveryCheckIns.find((s) => s.id === edit?.id) ?? edit;
  return (
    <>
      <Field label="Edit an existing check-in">
        <select
          value={edit?.id ?? ""}
          onChange={(e) =>
            setEdit(
              view.data.recoveryCheckIns.find((s) => s.id === e.target.value) ??
                null,
            )
          }
        >
          <option value="">New check-in</option>
          {view.data.recoveryCheckIns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.date}
            </option>
          ))}
        </select>
      </Field>
      <CheckForm
        key={`${selected?.id ?? "new"}:${selected?.updatedAt ?? ""}`}
        existing={selected}
      />
    </>
  );
}
function CheckForm({ existing }: { existing: CheckIn | null }) {
  const { view, run, busy } = useRecovery();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [workoutsLoaded, setWorkoutsLoaded] = useState(false);
  const [entry, setEntry] = useState(
    () =>
      existing ??
      initialCheck(
        view?.data.settings[0]?.value.timezone ??
          defaultRecoverySettings().value.timezone,
      ),
  );
  const set = <K extends keyof CheckIn>(key: K, value: CheckIn[K]) =>
    setEntry((v) => ({ ...v, [key]: value }));
  return (
    <form
      className="recovery-form"
      onSubmit={(e) => {
        e.preventDefault();
        void run(
          () =>
            saveCheckIn(
              { ...entry, updatedAt: new Date().toISOString() },
              existing?.updatedAt,
            ),
          "Check-in saved to this browser.",
        );
      }}
    >
      <div className="recovery-grid">
        <Field label="Check-in date">
          <input
            type="date"
            required
            value={entry.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
        <Field label="IANA timezone">
          <input
            required
            value={entry.timezone}
            onChange={(e) => set("timezone", e.target.value)}
          />
        </Field>
        {dimensions.map((d) => (
          <Field
            key={d}
            label={labels[d]}
            help={
              d === "stress" || d === "generalFatigue"
                ? "1 = very low, 5 = very high"
                : "1 = very low / poor, 5 = very high / good"
            }
          >
            <select
              value={entry[d] ?? ""}
              onChange={(e) =>
                set(d, e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Not measured</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
        ))}
      </div>
      <p>
        Overall readiness is entered by you. Dimensions remain separate and
        missing values remain unknown.
      </p>
      <fieldset>
        <legend>Regional soreness (0 = none, 10 = maximum reported)</legend>
        {entry.regionalSoreness.map((r, i) => (
          <div key={i} className="recovery-grid">
            <Field label={`Region ${i + 1}`}>
              <select
                value={r.regionId}
                onChange={(e) =>
                  set(
                    "regionalSoreness",
                    entry.regionalSoreness.map((v, j) =>
                      j === i ? { ...v, regionId: e.target.value } : v,
                    ),
                  )
                }
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.displayName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`Side ${i + 1}`}>
              <select
                value={r.laterality}
                onChange={(e) =>
                  set(
                    "regionalSoreness",
                    entry.regionalSoreness.map((v, j) =>
                      j === i
                        ? {
                            ...v,
                            laterality: e.target.value as typeof r.laterality,
                          }
                        : v,
                    ),
                  )
                }
              >
                {[
                  "not_applicable",
                  "left",
                  "right",
                  "bilateral",
                  "midline",
                ].map((side) => (
                  <option key={side} value={side}>
                    {side.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`Soreness ${i + 1}`}>
              <input
                type="number"
                min="0"
                max="10"
                required
                value={r.severity}
                onChange={(e) =>
                  set(
                    "regionalSoreness",
                    entry.regionalSoreness.map((v, j) =>
                      j === i ? { ...v, severity: Number(e.target.value) } : v,
                    ),
                  )
                }
              />
            </Field>
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                set(
                  "regionalSoreness",
                  entry.regionalSoreness.filter((_, j) => j !== i),
                )
              }
            >
              Remove region {i + 1}
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            set("regionalSoreness", [
              ...entry.regionalSoreness,
              {
                regionId: regions[0]!.id,
                severity: 0,
                laterality: "not_applicable",
              },
            ])
          }
        >
          Add region
        </button>
      </fieldset>
      <label className="recovery-check">
        <input
          type="checkbox"
          checked={entry.painOrInjuryConcern ?? false}
          onChange={(e) => {
            setEntry((v) => ({
              ...v,
              painOrInjuryConcern: e.target.checked,
              painConcernSeverity: e.target.checked
                ? v.painConcernSeverity
                : null,
            }));
          }}
        />
        Pain or injury concern
      </label>
      {entry.painOrInjuryConcern && (
        <Field label="Reported pain concern severity (0–10)">
          <input
            type="number"
            min="0"
            max="10"
            value={entry.painConcernSeverity ?? ""}
            onChange={(e) =>
              set(
                "painConcernSeverity",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
        </Field>
      )}
      <label className="recovery-check">
        <input
          type="checkbox"
          checked={entry.illnessSymptoms ?? false}
          onChange={(e) => set("illnessSymptoms", e.target.checked)}
        />
        Illness symptoms
      </label>
      <fieldset>
        <legend>Sleep or other concerns</legend>
        {(
          [
            "severe_sleepiness",
            "breathing_during_sleep_concern",
            "persistent_sleep_problem",
          ] as const
        ).map((category) => (
          <label key={category} className="recovery-check">
            <input
              type="checkbox"
              checked={entry.alertCategories.includes(category)}
              onChange={(e) =>
                set(
                  "alertCategories",
                  e.target.checked
                    ? [...entry.alertCategories, category]
                    : entry.alertCategories.filter((c) => c !== category),
                )
              }
            />
            {category.replaceAll("_", " ")}
          </label>
        ))}
      </fieldset>
      {(entry.painOrInjuryConcern ||
        entry.illnessSymptoms ||
        entry.alertCategories.length > 0) && (
        <p className="recovery-card">
          You recorded a concern. This diary does not assess its cause or
          prescribe training. Discuss concerns with a qualified professional.
        </p>
      )}
      <fieldset disabled={busy} aria-busy={busy}>
        <legend>Completed workout context (optional)</legend>
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            void run(async () => {
              const raw = await allTracker<unknown>("workoutSessions");
              setWorkouts(
                raw.flatMap((v) => {
                  const parsed = workoutSessionSchema.safeParse(v);
                  return parsed.success && parsed.data.status === "completed"
                    ? [parsed.data]
                    : [];
                }),
              );
              setWorkoutsLoaded(true);
            }, "Completed workout context loaded without changing training records.")
          }
        >
          Load completed workouts
        </button>
        {workouts.map((w) => (
          <label className="recovery-check" key={w.id}>
            <input
              type="checkbox"
              checked={entry.linkedWorkoutSessionIds?.includes(w.id) ?? false}
              onChange={(e) =>
                set(
                  "linkedWorkoutSessionIds",
                  e.target.checked
                    ? [...(entry.linkedWorkoutSessionIds ?? []), w.id]
                    : entry.linkedWorkoutSessionIds?.filter(
                        (id) => id !== w.id,
                      ),
                )
              }
            />
            {w.startedAt} · {w.id}
          </label>
        ))}
        <p>
          {entry.linkedWorkoutSessionIds?.length ?? 0} linked sessions. No
          workout or program is altered.
        </p>
        {(entry.linkedWorkoutSessionIds ?? [])
          .filter((id) => !workouts.some((w) => w.id === id))
          .map((id) => (
            <p key={id}>
              {workoutsLoaded
                ? "Completed workout unavailable in this browser"
                : "Workout link has not been checked in this browser"}
              : {id}{" "}
              <button
                type="button"
                className="button secondary"
                onClick={() =>
                  set(
                    "linkedWorkoutSessionIds",
                    entry.linkedWorkoutSessionIds?.filter(
                      (value) => value !== id,
                    ),
                  )
                }
              >
                Remove unavailable workout link
              </button>
            </p>
          ))}
      </fieldset>
      <Field label="Link a sleep entry (optional)">
        <select
          value={entry.linkedSleepLogId ?? ""}
          onChange={(e) => set("linkedSleepLogId", e.target.value || null)}
        >
          <option value="">No link</option>
          {view?.data.sleepLogs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.sleepDate}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notes">
        <textarea
          maxLength={5000}
          value={entry.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>
      <button className="button primary" disabled={busy}>
        Save check-in
      </button>
      {existing && (
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "Delete this check-in? Undo is available in settings.",
              )
            )
              void run(
                () => deleteRecoveryRecord("recoveryCheckIns", existing.id),
                "Check-in deleted.",
              );
          }}
        >
          Delete check-in
        </button>
      )}
    </form>
  );
}
export function RecoveryHistory({ kind }: { kind: "sleep" | "checkin" }) {
  const { view, run } = useRecovery();
  const [days, setDays] = useState<7 | 28 | 90>(28),
    [end, setEnd] = useState(new Date().toISOString().slice(0, 10)),
    [custom, setCustom] = useState<Awaited<
      ReturnType<typeof readRecoveryView>
    > | null>(null);
  const [page, setPage] = useState(0);
  const source = custom ?? view;
  if (!source) return null;
  const start = new Date(`${end}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - days + 1);
  const from = start.toISOString().slice(0, 10);
  const sleeps = source.data.sleepLogs.filter(
      (s) => s.sleepDate >= from && s.sleepDate <= end,
    ),
    checks = source.data.recoveryCheckIns.filter(
      (s) => s.date >= from && s.date <= end,
    );
  const values =
    kind === "sleep"
      ? sleeps.map((s) => s.calculated.dailyTotalSleepMinutes)
      : checks.map((c) => c.overallReadiness);
  const summary = summarize(values),
    regularity = clockRegularity(sleeps);
  const missingDays =
    days -
    new Set(
      kind === "sleep"
        ? sleeps.map((s) => s.sleepDate)
        : checks.map((c) => c.date),
    ).size;
  return (
    <>
      <form
        className="recovery-grid"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            setCustom(await readRecoveryView(days, end, 100000));
            setPage(0);
          }, "History window loaded.");
        }}
      >
        <Field label="Window">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value) as 7 | 28 | 90)}
          >
            {[7, 28, 90].map((n) => (
              <option key={n} value={n}>
                {n} days
              </option>
            ))}
          </select>
        </Field>
        <Field label="Window ends">
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
        </Field>
        <button className="button secondary">Load window</button>
      </form>
      <section className="recovery-card">
        <h2>
          {kind === "sleep" ? "Daily sleep minutes" : "Your entered readiness"}
        </h2>
        <p>
          Mean {display(summary.mean)} · Median {display(summary.median)} ·
          Range {display(summary.min)}–{display(summary.max)}
        </p>
        <p>
          {summary.known} measured records · {summary.missing} incomplete
          records · {missingDays} days without a record. Multiple reports in a
          day remain separate.
        </p>
        {kind === "sleep" && (
          <>
            <p>
              {
                sleeps.filter((s) => s.source === "consumer_device_estimate")
                  .length
              }{" "}
              / {sleeps.length} device estimates. Efficiency uses main manual
              diary sleep only.
            </p>
            {regularity.timezoneChanged ? (
              <p>
                Timezone changed. Local clock regularity is not combined across
                zones.
              </p>
            ) : (
              <p>
                Bedtime clock range: {display(regularity.bedtime.min)}–
                {display(regularity.bedtime.max)} minutes around the
                midnight-aware centre. No quality threshold is assigned.
              </p>
            )}
          </>
        )}
      </section>
      {kind === "checkin" && (
        <>
          <section className="recovery-card">
            <h2>Separate dimension summaries</h2>
            <dl>
              {dimensionSummaries({
                ...source.data,
                recoveryCheckIns: checks,
              }).map((s) => (
                <div key={s.dimension}>
                  <dt>{labels[s.dimension]}</dt>
                  <dd>
                    Mean {display(s.mean)} · median {display(s.median)} ·{" "}
                    {s.known} reported / {s.missing} missing
                  </dd>
                </div>
              ))}
            </dl>
            <p>
              This window describes your own reports; it does not diagnose
              readiness or prescribe training.
            </p>
          </section>
          <section className="recovery-card">
            <h2>Regional soreness summaries</h2>
            <dl>
              {regionalSummaries({
                ...source.data,
                recoveryCheckIns: checks,
              }).map((s) => (
                <div key={`${s.regionId}:${s.laterality}`}>
                  <dt>
                    {regions.find((r) => r.id === s.regionId)?.displayName} ·{" "}
                    {s.laterality.replaceAll("_", " ")}
                  </dt>
                  <dd>
                    Mean {display(s.mean)} · median {display(s.median)} ·{" "}
                    {s.known} reported / {s.missing} missing
                  </dd>
                </div>
              ))}
            </dl>
            {!checks.some((c) => c.regionalSoreness.length) && (
              <p>No regional soreness measurements in this window.</p>
            )}
          </section>
        </>
      )}
      {kind === "sleep" &&
        source.data.settings[0]?.value.sleepGoalMinutes != null && (
          <section className="recovery-card">
            <h2>Comparison with your current goal</h2>
            <p>
              Current personal goal:{" "}
              {source.data.settings[0].value.sleepGoalMinutes} min. Differences
              are separate daily comparisons, without a cumulative sleep-debt
              calculation.
            </p>
            {sleeps.map((s) => (
              <p key={s.id}>
                {s.sleepDate}:{" "}
                {s.calculated.dailyTotalSleepMinutes == null
                  ? "Not available"
                  : `${display(s.calculated.dailyTotalSleepMinutes - source.data.settings[0]!.value.sleepGoalMinutes!)} min from current goal`}
              </p>
            ))}
          </section>
        )}
      <div className="recovery-grid">
        {kind === "sleep"
          ? sleeps
              .sort((a, b) => b.sleepDate.localeCompare(a.sleepDate))
              .slice(page * 20, page * 20 + 20)
              .map((s) => (
                <article key={s.id} className="recovery-card">
                  <h2>{s.sleepDate}</h2>
                  <p>
                    {s.source.replaceAll("_", " ")} · {s.timezone} · {s.status}
                  </p>
                  <dl>
                    <div>
                      <dt>Main sleep (min)</dt>
                      <dd>
                        {display(s.calculated.estimatedTotalSleepMinutes)}
                      </dd>
                    </div>
                    <div>
                      <dt>Daily total (min)</dt>
                      <dd>{display(s.calculated.dailyTotalSleepMinutes)}</dd>
                    </div>
                    <div>
                      <dt>Efficiency (%)</dt>
                      <dd>{display(s.calculated.sleepEfficiencyPercent)}</dd>
                    </div>
                  </dl>
                  <p>{s.notes}</p>
                  <a href="/sleep/log">Edit diary entries</a>
                </article>
              ))
          : checks
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(page * 20, page * 20 + 20)
              .map((c) => (
                <article key={c.id} className="recovery-card">
                  <h2>{c.date}</h2>
                  <dl>
                    {dimensions.map((d) => (
                      <div key={d}>
                        <dt>{labels[d]}</dt>
                        <dd>{display(c[d], 0)}</dd>
                      </div>
                    ))}
                  </dl>
                  <p>
                    {c.regionalSoreness
                      .map(
                        (r) =>
                          `${regions.find((v) => v.id === r.regionId)?.displayName} (${r.laterality}): ${r.severity}`,
                      )
                      .join(" · ") || "No regional soreness measurements"}
                  </p>
                  <p>{c.notes}</p>
                  <a href="/recovery/check-in">Edit check-ins</a>
                </article>
              ))}
      </div>
      {(kind === "sleep" ? sleeps : checks).length === 0 && (
        <p>No records in this window.</p>
      )}
      <p>
        Initial views show up to 500 recent records. Load a window explicitly to
        read older entries; cards are paginated by 20.
      </p>
      <div className="actions">
        <button
          className="button secondary"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous records
        </button>
        <button
          className="button secondary"
          disabled={
            (page + 1) * 20 >= (kind === "sleep" ? sleeps : checks).length
          }
          onClick={() => setPage((p) => p + 1)}
        >
          Next records
        </button>
      </div>
    </>
  );
}
