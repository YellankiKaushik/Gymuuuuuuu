import { useState } from "react";
import {
  CardioFrame,
  CardioPage,
  CardioField as Field,
  useCardio,
  readable,
} from "./workspace";
import { cardioReference, type CardioBackup } from "./schema";
import { publicCardioEntities } from "./publication";
import { MyPlansPage } from "./builders";
import {
  readCardioBackup,
  readRawCardioData,
  parseCardioImport,
  restoreCardio,
  saveCardioPreferences,
  clearCardioData,
  undoCardioDelete,
  type RestoreMode,
} from "./storage";
import { cardioCsv, downloadCardioFile } from "./export";
export function KnowledgePage({
  kind,
  slug,
}: {
  kind: "learn" | "modalities" | "plans" | "routine";
  slug?: string;
}) {
  const [query, setQuery] = useState(""),
    [domain, setDomain] = useState(""),
    [experience, setExperience] = useState(""),
    [days, setDays] = useState(""),
    [time, setTime] = useState(""),
    [impact, setImpact] = useState(""),
    [priority, setPriority] = useState(""),
    [equipment, setEquipment] = useState(""),
    [environment, setEnvironment] = useState("");
  const entityType =
    kind === "learn"
      ? "knowledge_topic"
      : kind === "modalities"
        ? "cardio_modality"
        : kind === "plans"
          ? "cardio_plan_template"
          : "conditioning_routine";
  const entries = publicCardioEntities.filter(
    (e) =>
      e.entityType === entityType &&
      (!slug || e.slug === slug) &&
      e.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <CardioFrame
      title={
        kind === "learn"
          ? "Cardio learning library"
          : kind === "modalities"
            ? "Reviewed activity guidance"
            : kind === "plans"
              ? "Reviewed cardio plan finder"
              : "Reviewed conditioning routine"
      }
    >
      {!slug && (
        <form
          className="card recovery-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <Field
            label={
              kind === "plans" ? "Your goal search" : "Search reviewed entries"
            }
          >
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
          </Field>
          {kind === "learn" && (
            <Field label="Topic domain">
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              >
                <option value="">All domains</option>
                {[
                  "foundations",
                  "intensity",
                  "formats",
                  "programming",
                  "concurrent",
                  "measurement",
                  "safety",
                ].map((d) => (
                  <option value={d} key={d}>
                    {readable(d)}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {kind === "plans" && (
            <>
              <Field label="Experience">
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
                  <option value="">Select experience</option>
                  <option value="new">New to activity</option>
                  <option value="experienced">Experienced</option>
                </select>
              </Field>
              <Field label="Available days">
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
              </Field>
              <Field label="Available session minutes">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </Field>
              <Field label="Impact preference">
                <select
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                >
                  <option value="">No preference</option>
                  <option value="lower">Lower impact</option>
                  <option value="any">Any</option>
                </select>
              </Field>
              <Field label="Equipment">
                <input
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                />
              </Field>
              <Field label="Strength priority">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="">Select priority</option>
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="balanced">Balanced</option>
                </select>
              </Field>
              <Field label="Preferred environment">
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                >
                  <option value="">No preference</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </Field>
              <p>
                Finder results require reviewed eligibility, dose and
                progression contracts. No automatic or generated plan is offered
                while those records are drafts.
              </p>
            </>
          )}
        </form>
      )}
      {entries.length === 0 ? (
        <section className="card">
          <h2>
            {slug
              ? "Reviewed entry unavailable"
              : "No reviewed entries released"}
          </h2>
          <p>
            The supplied 202 identities are drafts. Claims, suitability,
            training doses and comparisons await sources, rights checks and
            actual reviewer approval.
          </p>
          <p>
            <a href="/cardio/custom-plans/create">Create your own local plan</a>{" "}
            · <a href="/conditioning/custom">Create your own routine</a> ·{" "}
            <a href="/cardio/methodology">Read release methods</a>
          </p>
        </section>
      ) : (
        entries.map((e) => (
          <article key={e.id} className="card">
            <h2>{e.title}</h2>
            <p>{e.population}</p>
            {e.claims.map((c) => (
              <p key={c.id}>{c.text}</p>
            ))}
            <p>{e.limitations.join(" ")}</p>
            <p>
              Reviewed {e.review.reviewedAt} by {e.review.reviewer}
            </p>
          </article>
        ))
      )}
    </CardioFrame>
  );
}
export function ConditioningPage() {
  return <MyPlansPage kind="routine" />;
}
export function MethodologyPage() {
  return (
    <CardioFrame title="Cardio methodology">
      <section className="card">
        <h2>What calculations mean</h2>
        <p>
          Pace uses elapsed seconds divided by measured distance. Canonical
          units are metres and seconds, with 1609.344 metres per mile. Display
          rounding does not change stored calculations. Missing distance or
          duration produces an unavailable result.
        </p>
        <p>
          Tanaka's optional adult estimate is 208 − 0.7 × age. It is a
          population estimate with individual error. HR reserve is resting HR
          plus your selected fraction of maximum minus resting HR. Selected
          fractions are not universal zones; medication/medical-context caution
          disables HR targets.
        </p>
        <p>
          Each target freezes its method, version, input values, source IDs and
          estimate label. Actual device readings retain their source. Changing
          preferences does not update historical targets.
        </p>
        <p>
          WHO/HHS adult guideline-equivalent minutes are moderate minutes + 2 ×
          vigorous minutes. Actual CDC talk-test observations classify recorded
          time; otherwise intensity remains unclassified. Segment time and
          whole-session time are not counted twice. These totals do not
          represent training load, fatigue or calories.
        </p>
      </section>
      <section className="card">
        <h2>Intervals and local versions</h2>
        <p>
          You specify warm-up, cool-down, work/recovery doses, repetitions and
          whether the final recovery is included. Distance-based targets do not
          acquire a guessed duration. Skipped segments, modifications and
          actuals remain separate from planned targets.
        </p>
        <p>
          Plans and routines are user-created immutable versions. Historical
          sessions retain the full source version. Corrections preserve the
          original completed record and prior revisions; delete/undo uses a
          separate snapshot.
        </p>
      </section>
      <section className="card">
        <h2>Scope and stop concerns</h2>
        <p>
          General adult fitness only. This module does not provide medical
          clearance, rehabilitation, pediatric or pregnancy programs. Urgent
          stop concerns pause the session and block continuation; the app does
          not diagnose symptoms. Contact your local emergency service when
          urgent help is needed.
        </p>
        <p>
          No VO₂max, fitness-age, energy-expenditure model or automatic
          nutrition credit is produced. There are no live fitness APIs, GPS,
          wearable integrations or cloud accounts.
        </p>
      </section>
      <section className="card">
        <h2>Sources and review boundary</h2>
        <p>
          The registry below preserves the supplied source records. Engineering
          verification of the narrow arithmetic contracts does not approve the
          202 draft articles, modalities or training templates. No invented
          reviewer or review date is supplied.
        </p>
        <ul>
          {cardioReference.sources.map((s) => (
            <li key={s.id}>
              <a href={s.url}>{s.title}</a>
            </li>
          ))}
        </ul>
      </section>
    </CardioFrame>
  );
}
export function PrivacyPage() {
  return (
    <CardioFrame title="Cardio local data & privacy">
      <section className="card">
        <h2>Your browser owns your records</h2>
        <p>
          Structured cardio records use the separate
          fitness-os-cardio-conditioning IndexedDB database. There is no
          account, login, personal cloud storage, payment or live fitness
          service. Browser hydration precedes personal reads. Personal titles,
          notes and measurements are not server-rendered or included in page
          metadata.
        </p>
        <p>
          Clearing browser site data can erase records. Export a JSON backup
          before switching browsers or devices. CSV supports analysis; use JSON
          for restoration. Downloaded files contain personal data; choose where
          to store them.
        </p>
        <p>
          A small session-control token in sessionStorage identifies this tab
          across navigation. Change notifications contain only a changed flag.
          Strength/recovery context is read locally on request and never
          modifies those modules.
        </p>
        <p>
          Tracking is optional. Disable future saves in settings, or explicitly
          clear this module. Keep/merge/copy/replace imports require validation
          and confirmation; errors preserve existing records. Raw export
          preserves unsupported data for recovery.
        </p>
        <a className="button primary" href="/cardio/settings">
          Backup, restore and settings
        </a>
      </section>
    </CardioFrame>
  );
}
export function SettingsPage() {
  return (
    <CardioPage title="Cardio settings & backup">
      <Settings />
    </CardioPage>
  );
}
function Settings() {
  const { view, run, busy } = useCardio();
  const [imported, setImported] = useState<CardioBackup | null>(null),
    [mode, setMode] = useState<RestoreMode>("keep"),
    [confirmed, setConfirmed] = useState(false),
    [phrase, setPhrase] = useState(""),
    [deleted, setDeleted] = useState<CardioBackup["deletedRecords"]>([]),
    [undoConfirmed, setUndoConfirmed] = useState(false),
    [loadError, setLoadError] = useState("");
  const [timezone, setTimezone] = useState("");
  return (
    <>
      <section className="card">
        <h2>Preferences</h2>
        {view && (
          <>
            <Field label="Enable optional cardio tracking">
              <input
                type="checkbox"
                checked={view.preferences.value.trackingEnabled}
                onChange={(e) =>
                  void run(
                    () =>
                      saveCardioPreferences({
                        ...view.preferences,
                        value: {
                          ...view.preferences.value,
                          trackingEnabled: e.target.checked,
                        },
                        updatedAt: new Date().toISOString(),
                      }),
                    "Tracking preference saved.",
                  )
                }
              />
            </Field>
            <Field label="Display distance unit">
              <select
                value={view.preferences.value.distanceUnit}
                onChange={(e) =>
                  void run(
                    () =>
                      saveCardioPreferences({
                        ...view.preferences,
                        value: {
                          ...view.preferences.value,
                          distanceUnit: e.target.value as "km" | "mile",
                        },
                        updatedAt: new Date().toISOString(),
                      }),
                    "Display preference saved; historical targets are unchanged.",
                  )
                }
              >
                <option value="km">km</option>
                <option value="mile">mile</option>
              </select>
            </Field>
            <Field label="Disable HR targeting in new prescriptions">
              <input
                type="checkbox"
                checked={view.preferences.value.hrTargetingDisabled}
                onChange={(e) =>
                  void run(
                    () =>
                      saveCardioPreferences({
                        ...view.preferences,
                        value: {
                          ...view.preferences.value,
                          hrTargetingDisabled: e.target.checked,
                        },
                        updatedAt: new Date().toISOString(),
                      }),
                    "HR preference saved; historical targets are unchanged.",
                  )
                }
              />
            </Field>
            <p>
              Timezone: {view.preferences.value.timezone}. Manual timestamps
              must carry a real UTC offset; session dates use this timezone.
            </p>
            <Field label="New IANA timezone">
              <input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="For example Asia/Kolkata"
              />
            </Field>
            <button
              className="button secondary"
              disabled={!timezone.trim() || busy}
              onClick={() =>
                void run(
                  () =>
                    saveCardioPreferences({
                      ...view.preferences,
                      value: {
                        ...view.preferences.value,
                        timezone: timezone.trim(),
                      },
                      updatedAt: new Date().toISOString(),
                    }),
                  "Timezone preference saved for new records; historical session dates are unchanged.",
                )
              }
            >
              Save new timezone
            </button>
          </>
        )}
        <button
          className="button secondary"
          onClick={() =>
            void run(async () => {
              const persisted = await navigator.storage?.persist?.();
              if (!persisted)
                throw Error(
                  "Persistent storage was not granted. Continue keeping external backups.",
                );
            }, "Browser storage persistence granted. Keep external backups too.")
          }
        >
          Request persistent browser storage
        </button>
      </section>
      <section className="card">
        <h2>Export</h2>
        <p>
          JSON includes actual records, immutable versions, source snapshots,
          revisions, tombstones and audits. Derived summaries are rebuildable
          and excluded.
        </p>
        <div className="actions">
          <button
            className="button primary"
            disabled={busy}
            onClick={() =>
              void run(
                async () =>
                  downloadCardioFile(
                    "fitness-os-cardio-backup.json",
                    JSON.stringify(await readCardioBackup(), null, 2),
                  ),
                "JSON backup downloaded.",
              )
            }
          >
            Download cardio JSON backup
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() =>
              void run(
                async () =>
                  downloadCardioFile(
                    "fitness-os-cardio-raw-recovery.json",
                    JSON.stringify(await readRawCardioData(), null, 2),
                  ),
                "Raw database recovery downloaded; it is not a validated restore file.",
              )
            }
          >
            Download raw recovery
          </button>
        </div>
        <p>
          CSV: select a dataset to download. Missing measurements are blank;
          spreadsheet formulas are escaped.
        </p>
        {Object.keys(
          cardioCsv({
            schemaVersion: "1.0.0",
            companionVersion: 1,
            exportedAt: "2026-01-01T00:00:00Z",
            moduleId: "phase_13_cardio_conditioning",
            cardioSessions: [],
            customPlanIdentities: [],
            customPlanVersions: [],
            customRoutineIdentities: [],
            customRoutineVersions: [],
            settings: [],
            auditEvents: [],
            deletedRecords: [],
          }),
        ).map((name) => (
          <button
            key={name}
            className="button secondary"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const files = cardioCsv(await readCardioBackup());
                downloadCardioFile(
                  name,
                  files[name as keyof typeof files],
                  "text/csv;charset=utf-8",
                );
              }, `${name} downloaded.`)
            }
          >
            {name}
          </button>
        ))}
      </section>
      <section className="card">
        <h2>Validated restore</h2>
        <Field label="Cardio JSON backup file">
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              setImported(null);
              setConfirmed(false);
              setLoadError("");
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 20 * 1024 * 1024) {
                setLoadError("Backups are limited to 20 MB.");
                return;
              }
              void file
                .text()
                .then((text) => {
                  try {
                    setImported(parseCardioImport(text));
                  } catch {
                    setLoadError(
                      "This backup is invalid or contains unsupported fields. Nothing was written.",
                    );
                  }
                })
                .catch(() =>
                  setLoadError(
                    "The file could not be read; nothing was written.",
                  ),
                );
            }}
          />
        </Field>
        {loadError && <p role="alert">{loadError}</p>}
        {imported && (
          <>
            <p>
              Validated preview: {imported.cardioSessions.length} sessions,{" "}
              {imported.customPlanVersions.length} plan versions,{" "}
              {imported.customRoutineVersions.length} routine versions and{" "}
              {imported.deletedRecords.length} deleted-record snapshots. Import
              format {imported.schemaVersion}, companions{" "}
              {imported.companionVersion}.
            </p>
            <Field label="Restore mode">
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as RestoreMode);
                  setConfirmed(false);
                }}
              >
                <option value="keep">
                  Merge and keep existing matching IDs
                </option>
                <option value="copy">Merge as remapped copies</option>
                <option value="replace">
                  Replace this module, including damaged records
                </option>
              </select>
            </Field>
            <p>
              Keep mode preserves matching records and rejects incompatible
              version graphs. Copy mode remaps owned identities and retains
              external workout/source references. Replace removes all current
              cardio records; export a backup first.
            </p>
            <Field label="Confirm the reviewed restore mode">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
            </Field>
            <button
              className="button primary"
              disabled={!confirmed || busy}
              onClick={() =>
                void run(async () => {
                  await restoreCardio(imported, mode, confirmed);
                  setImported(null);
                  setConfirmed(false);
                }, "Validated restore completed atomically.")
              }
            >
              Apply cardio restore
            </button>
          </>
        )}
      </section>
      <section className="card">
        <h2>Deleted records</h2>
        <button
          className="button secondary"
          disabled={busy}
          onClick={() =>
            void run(
              async () => setDeleted((await readCardioBackup()).deletedRecords),
              "Deleted-record list loaded.",
            )
          }
        >
          Load deleted records
        </button>
        <Field label="Confirm restoring a deleted record">
          <input
            type="checkbox"
            checked={undoConfirmed}
            onChange={(e) => setUndoConfirmed(e.target.checked)}
          />
        </Field>
        {deleted.map((t) => (
          <p key={t.id}>
            {t.entityType} · {t.deletedAt}{" "}
            <button
              className="button secondary"
              disabled={!undoConfirmed || busy}
              onClick={() =>
                void run(async () => {
                  await undoCardioDelete(t.id);
                  setDeleted(deleted.filter((d) => d.id !== t.id));
                  setUndoConfirmed(false);
                }, "Deleted record restored.")
              }
            >
              Undo {t.entityType} deletion
            </button>
          </p>
        ))}
      </section>
      <section className="card">
        <h2>Clear this module</h2>
        <p>
          This removes cardio records, local plans/routines, audits and deleted
          snapshots. Other modules remain in their own databases. Export first.
        </p>
        <Field label="Enter DELETE CARDIO DATA">
          <input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            autoComplete="off"
          />
        </Field>
        <button
          className="button secondary"
          disabled={phrase !== "DELETE CARDIO DATA" || busy}
          onClick={() =>
            void run(async () => {
              await clearCardioData(phrase);
              setPhrase("");
              setDeleted([]);
            }, "Cardio data cleared from this browser.")
          }
        >
          Clear cardio data
        </button>
      </section>
    </>
  );
}
