import { useState } from "react";
import {
  WorkspacePage,
  useWorkspace,
  TextField,
  Field,
  readable,
} from "./workspace";
import { eventSchema, supplementReference, type AdverseEvent } from "./schema";
import { newId, urgentEvent, defaultPreferences } from "./domain";
import { saveEvent, removeRecord, mutate } from "./storage";
import { safetyContextNormativeSchema } from "./schema.generated";
import { localDate } from "../recovery/domain";
export function EventsPage() {
  return (
    <WorkspacePage title="Suspected adverse events">
      <Events />
    </WorkspacePage>
  );
}
function Events() {
  const { view, run } = useWorkspace();
  const [editing, setEditing] = useState<AdverseEvent | null>(null);
  return (
    <>
      <p>
        Suspicion does not establish causality. Recording must not delay urgent
        care.
      </p>
      <EventEditor
        key={editing?.id ?? "new"}
        existing={editing}
        done={() => setEditing(null)}
      />
      <section className="card">
        <h2>Recorded events</h2>
        {view?.data.adverseEvents.map((event) => (
          <article className="card" key={event.id}>
            <h3>
              {event.localDate} · {readable(event.severity)}
            </h3>
            {urgentEvent(event) && (
              <p role="alert">
                Stop the suspected product and seek urgent medical help through
                local emergency services. Related active trials are stopped;
                routine trial guidance is suppressed.
              </p>
            )}
            <p>
              {event.symptoms.join(", ")} · {event.notes}
            </p>
            <button
              className="button secondary"
              onClick={() => setEditing(event)}
            >
              Edit event
            </button>
            <button
              className="button secondary"
              onClick={() => {
                if (
                  window.confirm(
                    "Delete this suspected event? Trial stop status remains for safety review.",
                  )
                )
                  void run(
                    () => removeRecord("adverseEvents", event.id, true),
                    "Event deleted; recovery snapshot retained",
                  );
              }}
            >
              Delete event
            </button>
          </article>
        ))}
      </section>
      <SafetyContexts />
    </>
  );
}
function EventEditor({
  existing,
  done,
}: {
  existing: AdverseEvent | null;
  done: () => void;
}) {
  const { view, run, busy } = useWorkspace();
  const [date, setDate] = useState(existing?.localDate ?? ""),
    [timezone, setTimezone] = useState(existing?.timezone ?? ""),
    [onset, setOnset] = useState(existing?.onsetAt ?? ""),
    [severity, setSeverity] = useState<AdverseEvent["severity"]>(
      existing?.severity ?? "unknown",
    ),
    [symptoms, setSymptoms] = useState(existing?.symptoms.join("\n") ?? ""),
    [signals, setSignals] = useState(existing?.stopSignals ?? []),
    [intakeIds, setIntakeIds] = useState(existing?.relatedIntakeLogIds ?? []),
    [productIds, setProductIds] = useState(existing?.suspectedProductIds ?? []),
    [actions, setActions] = useState(existing?.actionTaken.join("\n") ?? ""),
    [care, setCare] = useState<AdverseEvent["professionalCare"]>(
      existing?.professionalCare ?? "none",
    ),
    [resolved, setResolved] = useState(existing?.resolvedAt ?? ""),
    [jurisdiction, setJurisdiction] = useState(
      existing?.reportingJurisdiction ?? "global_education",
    ),
    [report, setReport] = useState(existing?.externalReportReference ?? ""),
    [notes, setNotes] = useState(existing?.notes ?? "");
  const list = (s: string) =>
    s
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
  const urgent = severity === "urgent_or_emergency" || signals.length > 0;
  const checkbox = (label: string, checked: boolean, change: () => void) => (
    <Field key={label} label={label}>
      <input type="checkbox" checked={checked} onChange={change} />
    </Field>
  );
  return (
    <section className="card">
      <h2>{existing ? "Edit suspected event" : "Record suspected event"}</h2>
      {urgent && (
        <div role="alert">
          <p>
            Stop the suspected product and seek urgent medical help through
            local emergency services. Do not wait to save this form. For
            thoughts of suicide, seek immediate local crisis or emergency
            support and contact a trusted person.
          </p>
          <p>
            Source:{" "}
            <a href="https://www.fda.gov/food/dietary-supplements/how-report-problem-dietary-supplements">
              FDA serious suspected reactions guidance
            </a>
            , United States, link checked 5 October 2026. Contact your local
            emergency service for care.
          </p>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            const now = new Date().toISOString(),
              zone = timezone || defaultPreferences().value.timezone;
            const linked =
                view?.data.intakeLogs.filter((l) => intakeIds.includes(l.id)) ??
                [],
              labels =
                view?.data.productLabelVersions.filter(
                  (l) =>
                    productIds.includes(l.personalProductId) ||
                    linked.some((log) => log.labelVersionId === l.id),
                ) ?? [];
            const event = eventSchema.parse({
              id: existing?.id ?? newId(),
              localDate: date || localDate(now, zone),
              timezone: zone,
              onsetAt: onset || null,
              severity,
              symptoms: list(symptoms),
              relatedIntakeLogIds: intakeIds,
              suspectedProductIds: productIds,
              actionTaken: list(actions),
              resolvedAt: resolved || null,
              professionalCare: care,
              reportingJurisdiction: jurisdiction,
              externalReportReference: report || null,
              notes,
              createdAt: existing?.createdAt ?? now,
              updatedAt: now,
              stopSignals: signals,
              labelSnapshots: existing?.labelSnapshots ?? labels,
              revision: (existing?.revision ?? 0) + 1,
            });
            await saveEvent(event, existing?.revision);
            done();
          }, "Suspected event saved; linked urgent trials stopped atomically");
        }}
      >
        <TextField
          label="Event local date"
          type="date"
          value={date}
          onChange={setDate}
        />
        <TextField
          label="Event timezone (blank uses browser)"
          value={timezone}
          onChange={setTimezone}
        />
        <TextField
          label="Onset timestamp with offset (optional)"
          value={onset}
          onChange={setOnset}
        />
        <Field label="Event severity">
          <select
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value as AdverseEvent["severity"])
            }
          >
            {eventSchema.shape.severity.options.map((s) => (
              <option key={s} value={s}>
                {readable(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Symptoms (one per line)">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </Field>
        <details>
          <summary>Urgent stop signals</summary>
          {supplementReference.adverseEventStopSignals.map((s) =>
            checkbox(readable(s), signals.includes(s), () =>
              setSignals((values) =>
                values.includes(s)
                  ? values.filter((v) => v !== s)
                  : [...values, s],
              ),
            ),
          )}
        </details>
        <details>
          <summary>Related intake records</summary>
          {view?.data.intakeLogs.map((l) =>
            checkbox(
              `Intake ${l.localDate} · ${l.productSnapshot?.displayName ?? l.id}`,
              intakeIds.includes(l.id),
              () =>
                setIntakeIds((values) =>
                  values.includes(l.id)
                    ? values.filter((v) => v !== l.id)
                    : [...values, l.id],
                ),
            ),
          )}
        </details>
        <details>
          <summary>Suspected products (does not prove causality)</summary>
          {view?.data.personalProducts.map((p) =>
            checkbox(
              `Suspected product ${p.displayName}`,
              productIds.includes(p.id),
              () =>
                setProductIds((values) =>
                  values.includes(p.id)
                    ? values.filter((v) => v !== p.id)
                    : [...values, p.id],
                ),
            ),
          )}
        </details>
        <Field label="Actions taken (one per line)">
          <textarea
            value={actions}
            onChange={(e) => setActions(e.target.value)}
          />
        </Field>
        <Field label="Professional care">
          <select
            value={care}
            onChange={(e) =>
              setCare(e.target.value as AdverseEvent["professionalCare"])
            }
          >
            {eventSchema.shape.professionalCare.options.map((s) => (
              <option value={s} key={s}>
                {readable(s)}
              </option>
            ))}
          </select>
        </Field>
        <TextField
          label="Resolution timestamp with offset (optional)"
          value={resolved}
          onChange={setResolved}
        />
        <Field label="Reporting jurisdiction">
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
          >
            {supplementReference.jurisdictions.map((s) => (
              <option key={s} value={s}>
                {readable(s)}
              </option>
            ))}
          </select>
        </Field>
        {jurisdiction === "united_states" ? (
          <p>
            <a href="https://www.fda.gov/food/dietary-supplements/how-report-problem-dietary-supplements">
              Official FDA reporting instructions (United States)
            </a>
            . Reports are submitted manually outside this app; a report is not
            emergency care.
          </p>
        ) : (
          <p>
            No reviewed reporting link is available for this jurisdiction. Ask
            your clinician or relevant local authority; this app does not
            automatically submit a report.
          </p>
        )}
        <TextField
          label="External report reference (optional)"
          value={report}
          onChange={setReport}
        />
        <TextField label="Event notes" value={notes} onChange={setNotes} />
        <button className="button primary" type="submit" disabled={busy}>
          Save suspected event
        </button>
      </form>
    </section>
  );
}
function SafetyContexts() {
  const { view, run } = useWorkspace();
  const [type, setType] = useState(
      safetyContextNormativeSchema.shape.contextType.options[0],
    ),
    [label, setLabel] = useState(""),
    [details, setDetails] = useState("");
  return (
    <section className="card">
      <h2>Optional safety context</h2>
      <p>
        No diagnosis or medication name is required. An active context prompts
        professional review rather than a safe-combination conclusion.
      </p>
      {view?.data.safetyContexts.map((c) => (
        <p key={c.id}>
          {readable(c.contextType)} · {c.userLabel} ·{" "}
          {c.active ? "active" : "inactive"}{" "}
          <button
            className="button secondary"
            onClick={() =>
              void run(
                () =>
                  mutate("safety_context_changed", (root) => {
                    const record = root.safetyContexts.find(
                      (v) => v.id === c.id,
                    );
                    if (record) {
                      record.active = !record.active;
                      record.updatedAt = new Date().toISOString();
                    }
                  }),
                "Safety context updated",
              )
            }
          >
            Toggle active context
          </button>
          <button
            className="button secondary"
            onClick={() => {
              if (window.confirm("Delete this optional safety context?"))
                void run(
                  () => removeRecord("safetyContexts", c.id, true),
                  "Safety context deleted",
                );
            }}
          >
            Delete context
          </button>
        </p>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(
            () =>
              mutate("safety_context_saved", (root) => {
                const now = new Date().toISOString();
                root.safetyContexts.push(
                  safetyContextNormativeSchema.parse({
                    id: newId(),
                    contextType: type,
                    active: true,
                    userLabel: label,
                    details,
                    professionalAdviceRecorded: false,
                    createdAt: now,
                    updatedAt: now,
                  }),
                );
              }),
            "Optional safety context saved",
          );
        }}
      >
        <Field label="Safety context type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
          >
            {safetyContextNormativeSchema.shape.contextType.options.map((s) => (
              <option key={s} value={s}>
                {readable(s)}
              </option>
            ))}
          </select>
        </Field>
        <TextField
          label="Context label (optional)"
          value={label}
          onChange={setLabel}
        />
        <TextField
          label="Context details (optional)"
          value={details}
          onChange={setDetails}
        />
        <button className="button primary" type="submit">
          Save optional context
        </button>
      </form>
    </section>
  );
}
