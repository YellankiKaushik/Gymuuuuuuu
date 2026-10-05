import { useState } from "react";
import {
  WorkspacePage,
  useWorkspace,
  Field,
  TextField,
  numberOrNull,
  readable,
} from "./workspace";
import { trialSchema, observationSchema, type Trial } from "./schema";
import { newId } from "./domain";
import { saveTrial, removeRecord } from "./storage";
export function TrialsPage() {
  return (
    <WorkspacePage title="Personal supplement observations">
      <Trials />
    </WorkspacePage>
  );
}
function Trials() {
  const { view, run } = useWorkspace();
  return (
    <section className="card">
      <h2>My trials</h2>
      <p>
        One change at a time can help you describe observations. This record
        cannot establish benefit, harm or causality; it gives no dose
        recommendation or rechallenge plan.
      </p>
      <a className="button primary" href="/supplements/trials/create">
        Create observation trial
      </a>
      {view?.data.supplementTrials.length === 0 && <p>No trials recorded.</p>}
      {view?.data.supplementTrials.map((t) => (
        <article className="card" key={t.id}>
          <h3>{t.title}</h3>
          <p>
            {readable(t.status)} · {t.observations.length} observations
          </p>
          {t.status === "stopped_for_adverse_event" && (
            <p role="alert">
              Stopped after a suspected adverse event. Seek appropriate medical
              review; routine restart guidance is suppressed.
            </p>
          )}
          <a href={`/supplements/trials/${t.id}`}>Review trial</a>
          <button
            className="button secondary"
            onClick={() => {
              if (
                window.confirm(
                  "Delete this trial? Preserve related intake and recovery snapshot.",
                )
              )
                void run(
                  () => removeRecord("supplementTrials", t.id, true),
                  "Trial deleted",
                );
            }}
          >
            Delete trial
          </button>
        </article>
      ))}
    </section>
  );
}
export function TrialEditorPage({ trialId }: { trialId?: string }) {
  return (
    <WorkspacePage
      title={trialId ? "Review personal trial" : "Create observation trial"}
    >
      <Loader trialId={trialId} />
    </WorkspacePage>
  );
}
function Loader({ trialId }: { trialId?: string }) {
  const { view } = useWorkspace();
  if (!view) return null;
  const trial = view.data.supplementTrials.find((t) => t.id === trialId);
  if (trialId && !trial)
    return (
      <p>Trial unavailable. Check settings for deletion or raw recovery.</p>
    );
  return (
    <Editor key={`${trialId ?? "new"}:${trial?.revision ?? 0}`} trial={trial} />
  );
}
function Editor({ trial }: { trial?: Trial }) {
  const { view, run, busy } = useWorkspace();
  const [title, setTitle] = useState(trial?.title ?? ""),
    [labelId, setLabelId] = useState(trial?.labelVersionId ?? ""),
    [reason, setReason] = useState(trial?.reasonForTrial ?? ""),
    [outcomes, setOutcomes] = useState(
      trial?.primaryOutcomeIds.join("\n") ?? "",
    ),
    [baseline, setBaseline] = useState(trial?.baselineStartDate ?? ""),
    [start, setStart] = useState(trial?.trialStartDate ?? ""),
    [planned, setPlanned] = useState(trial?.plannedEndDate ?? ""),
    [end, setEnd] = useState(trial?.actualEndDate ?? ""),
    [status, setStatus] = useState<Trial["status"]>(trial?.status ?? "draft"),
    [protocol, setProtocol] = useState(trial?.plannedProtocolText ?? ""),
    [professional, setProfessional] = useState<Trial["professionalReview"]>(
      trial?.professionalReview ?? "not_recorded",
    ),
    [stops, setStops] = useState(trial?.stopRules.join("\n") ?? ""),
    [notes, setNotes] = useState(trial?.notes ?? ""),
    [links, setLinks] = useState(
      JSON.stringify(trial?.contextLinks ?? [], null, 2),
    ),
    [obsDate, setObsDate] = useState(""),
    [obsKind, setObsKind] = useState<"subjective" | "objective">("subjective"),
    [obsOutcome, setObsOutcome] = useState(""),
    [obsValue, setObsValue] = useState(""),
    [obsUnit, setObsUnit] = useState(""),
    [obsNote, setObsNote] = useState(""),
    [adherence, setAdherence] = useState<
      "as_recorded" | "partial" | "missed" | "not_recorded"
    >("not_recorded");
  const [savedTrial, setSavedTrial] = useState("");
  const lineList = (s: string) =>
    s
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
  const stopped = trial?.status === "stopped_for_adverse_event";
  const safeContext = view?.data.safetyContexts.some((c) => c.active);
  const save = async () => {
    const trialRecordId = trial?.id ?? newId();
    const saved = await run(async () => {
      const now = new Date().toISOString(),
        label = view?.data.productLabelVersions.find((l) => l.id === labelId);
      const record = trialSchema.parse({
        id: trialRecordId,
        title,
        labelVersionId: labelId || null,
        ingredientIdentityIds: trial?.ingredientIdentityIds ?? [],
        reasonForTrial: reason,
        primaryOutcomeIds: lineList(outcomes),
        baselineStartDate: baseline || null,
        trialStartDate: start || null,
        plannedEndDate: planned || null,
        actualEndDate: end || null,
        status,
        plannedProtocolText: protocol,
        professionalReview: professional,
        stopRules: lineList(stops),
        notes,
        createdAt: trial?.createdAt ?? now,
        updatedAt: now,
        labelSnapshot: trial?.labelSnapshot ?? label ?? null,
        observations: trial?.observations ?? [],
        contextLinks: JSON.parse(links) as unknown,
        revision: (trial?.revision ?? 0) + 1,
      });
      await saveTrial(record, trial?.revision);
    }, "Trial saved; observations do not establish efficacy");
    if (saved) setSavedTrial(trialRecordId);
  };
  return (
    <>
      <section className="card">
        <h2>Personal observation record</h2>
        {stopped && (
          <p role="alert">
            Stopped for a suspected adverse event. Do not use this page as
            advice to resume. Seek appropriate professional review.
          </p>
        )}
        {safeContext && (
          <p role="status">
            An optional safety context is active. Professional review is
            appropriate; this app does not offer generic use or dosing guidance.
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <TextField label="Trial title" value={title} onChange={setTitle} />
          <Field label="Exact label version (optional)">
            <select
              value={labelId}
              disabled={!!trial}
              onChange={(e) => setLabelId(e.target.value)}
            >
              <option value="">No product label</option>
              {view?.data.productLabelVersions.map((l) => (
                <option key={l.id} value={l.id}>
                  {view.data.personalProducts.find(
                    (p) => p.id === l.personalProductId,
                  )?.displayName ?? "Historical product"}{" "}
                  · version {l.versionNumber}
                </option>
              ))}
            </select>
          </Field>
          <TextField
            label="Reason for trial"
            value={reason}
            onChange={setReason}
          />
          <Field label="Personal outcome IDs (one per line)">
            <textarea
              value={outcomes}
              onChange={(e) => setOutcomes(e.target.value)}
            />
          </Field>
          <TextField
            label="Baseline start date"
            type="date"
            value={baseline}
            onChange={setBaseline}
          />
          <TextField
            label="Trial start date"
            type="date"
            value={start}
            onChange={setStart}
          />
          <TextField
            label="Planned end date"
            type="date"
            value={planned}
            onChange={setPlanned}
          />
          <TextField
            label="Actual end date"
            type="date"
            value={end}
            onChange={setEnd}
          />
          <Field label="Trial status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Trial["status"])}
            >
              {trialSchema.shape.status.options.map((s) => (
                <option key={s} value={s} disabled={stopped && s === "active"}>
                  {readable(s)}
                </option>
              ))}
            </select>
          </Field>
          <TextField
            label="User-entered protocol, not a recommendation"
            value={protocol}
            onChange={setProtocol}
          />
          <Field label="Professional review recorded">
            <select
              value={professional}
              onChange={(e) =>
                setProfessional(e.target.value as Trial["professionalReview"])
              }
            >
              {trialSchema.shape.professionalReview.options.map((s) => (
                <option key={s} value={s}>
                  {readable(s)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Personal stop rules (one per line)">
            <textarea
              value={stops}
              onChange={(e) => setStops(e.target.value)}
            />
          </Field>
          <TextField label="Trial notes" value={notes} onChange={setNotes} />
          <details>
            <summary>Optional read-only context links</summary>
            <p>
              JSON records use module (workout, nutrition, sleep, recovery or
              cardio), recordId and note. Imported external IDs stay unchanged;
              this module never edits their owner records.
            </p>
            <Field label="Context links JSON">
              <textarea
                rows={4}
                value={links}
                onChange={(e) => setLinks(e.target.value)}
              />
            </Field>
          </details>
          <button
            type="submit"
            className="button primary"
            disabled={busy || Boolean(savedTrial)}
          >
            Save trial
          </button>
          {savedTrial && (
            <p role="status">
              <a href={`/supplements/trials/${trial?.id ?? savedTrial}`}>
                Open saved trial
              </a>
            </p>
          )}
        </form>
      </section>
      {trial && (
        <section className="card">
          <h2>Observations and adherence</h2>
          <p>
            Record subjective perceptions separately from objective
            measurements. A completed trial is a personal observation summary,
            not an efficacy conclusion.
          </p>
          {trial.observations.map((o) => (
            <article key={o.id} className="card">
              <h3>
                {o.outcome} · {o.date}
              </h3>
              <p>
                {o.kind} · {o.value ?? "value not recorded"} {o.unit ?? ""} ·{" "}
                {readable(o.adherence)}
              </p>
              <p>{o.note}</p>
              <button
                className="button secondary"
                onClick={() => {
                  if (window.confirm("Delete this observation?"))
                    void run(
                      () =>
                        saveTrial(
                          {
                            ...trial,
                            observations: trial.observations.filter(
                              (v) => v.id !== o.id,
                            ),
                            revision: trial.revision + 1,
                            updatedAt: new Date().toISOString(),
                          },
                          trial.revision,
                        ),
                      "Observation deleted",
                    );
                }}
              >
                Delete observation
              </button>
            </article>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                const observation = observationSchema.parse({
                  id: newId(),
                  date: obsDate,
                  kind: obsKind,
                  outcome: obsOutcome,
                  value: numberOrNull(obsValue),
                  unit: obsUnit || null,
                  note: obsNote,
                  adherence,
                });
                await saveTrial(
                  {
                    ...trial,
                    observations: [...trial.observations, observation],
                    revision: trial.revision + 1,
                    updatedAt: new Date().toISOString(),
                  },
                  trial.revision,
                );
              }, "Observation saved without a causal conclusion");
            }}
          >
            <TextField
              label="Observation date"
              type="date"
              value={obsDate}
              onChange={setObsDate}
            />
            <Field label="Observation kind">
              <select
                value={obsKind}
                onChange={(e) =>
                  setObsKind(e.target.value as "subjective" | "objective")
                }
              >
                <option value="subjective">Subjective perception</option>
                <option value="objective">Objective measurement</option>
              </select>
            </Field>
            <TextField
              label="Observed outcome"
              value={obsOutcome}
              onChange={setObsOutcome}
            />
            <TextField
              label="Observed value (optional)"
              value={obsValue}
              onChange={setObsValue}
            />
            <TextField
              label="Observation unit"
              value={obsUnit}
              onChange={setObsUnit}
            />
            <TextField
              label="Observation note"
              value={obsNote}
              onChange={setObsNote}
            />
            <Field label="Adherence">
              <select
                value={adherence}
                onChange={(e) =>
                  setAdherence(e.target.value as typeof adherence)
                }
              >
                {["as_recorded", "partial", "missed", "not_recorded"].map(
                  (v) => (
                    <option value={v} key={v}>
                      {readable(v)}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <button className="button primary" type="submit" disabled={busy}>
              Add observation
            </button>
          </form>
        </section>
      )}
    </>
  );
}
