import { useState } from "react";
import { publicRecoveryArticles, publicRecoveryRoutines } from "./publication";
import { createPublicRoutineCopy } from "./public-routines";
import { saveRoutine } from "./storage";
import { recoveryReference, type RecoveryBackup } from "./schema";
import {
  defaultRecoverySettings,
  saveRecoverySettings,
  readRecoveryBackup,
  readRawRecoveryData,
  validateRecoveryImport,
  restoreRecoveryBackup,
  recoveryConflicts,
  purgeRecovery,
  undoRecoveryDelete,
  type RestoreMode,
} from "./storage";
import { recoveryCsv, recoveryCsvKinds } from "./export";
import { Field, useRecovery, downloadRecoveryFile } from "./workspace";
export function RecoveryKnowledge({
  domain,
  slug,
  routines = false,
}: {
  domain?: string;
  slug?: string;
  routines?: boolean;
}) {
  const [query, setQuery] = useState(""),
    [outcome, setOutcome] = useState(""),
    [population, setPopulation] = useState(""),
    [evidence, setEvidence] = useState(""),
    [selected, setSelected] = useState<string[]>([]);
  const articles = (
    routines
      ? publicRecoveryRoutines.map((r) => r.article)
      : publicRecoveryArticles
  ).filter(
    (a) =>
      (!domain || a.domain === domain) &&
      (!slug || a.slug === slug) &&
      a.title.toLowerCase().includes(query.toLowerCase()) &&
      (!outcome || a.claims.some((c) => c.outcome === outcome)) &&
      (!population || a.population.includes(population)) &&
      (!evidence || a.evidenceStrength === evidence),
  );
  return (
    <>
      {articles.length === 0 && (
        <section className="recovery-card">
          <h2>{slug ? "Reviewed detail unavailable" : "Reviewed knowledge"}</h2>
          <p>
            {slug
              ? "This entry is unavailable while its sources and content are checked."
              : "No published entries match these filters. Try another search or clear the filters."}
          </p>
          <p>Local routines are independent of this publication gate.</p>
          <a href="/mobility/custom">Create or use your own routine</a>
        </section>
      )}
      {!slug && (
        <>
          <div className="recovery-grid">
            <Field label="Search reviewed knowledge">
              <input value={query} onChange={(e) => setQuery(e.target.value)} />
            </Field>
            <Field label="Outcome">
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              >
                <option value="">All outcomes</option>
                {[
                  "soreness",
                  "perceived_fatigue",
                  "strength_power",
                  "range_of_motion",
                  "adaptation",
                  "sleep",
                  "definition",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Population">
              <input
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
              />
            </Field>
            <Field label="Evidence strength">
              <select
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              >
                <option value="">All evidence strengths</option>
                {recoveryReference.evidenceStrength.map((v) => (
                  <option key={v} value={v}>
                    {v.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p>{articles.length} reviewed results</p>
        </>
      )}
      {articles.map((article) => (
        <article className="recovery-card" key={article.id}>
          <h2>
            <a
              href={
                routines
                  ? `/mobility/routines/${article.slug}`
                  : `/recovery/topics/${article.slug}`
              }
            >
              {article.title}
            </a>
          </h2>
          <p>{article.definition}</p>
          {routines && <PublishedRoutineSteps publicId={article.id} />}
          <p>
            Personal-use publication · machine source verification · no
            independent human review.
          </p>
          <ul>
            {article.limitations.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <ul>
            {article.contraindications.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <p>
            Source checked {article.review.reviewedAt} by{" "}
            {article.review.reviewer}.
          </p>
          <ul>
            {article.sourceIds.map((id) => {
              const source = recoveryReference.sources.find(
                (s) => s.id === id,
              )!;
              return (
                <li key={id}>
                  <a href={source.url}>{source.title}</a> ({source.year})
                </li>
              );
            })}
          </ul>
          <p>
            {article.population} · {article.context}
          </p>
          <label className="recovery-check">
            <input
              type="checkbox"
              checked={selected.includes(article.id)}
              onChange={(e) =>
                setSelected(
                  e.target.checked
                    ? [...selected, article.id]
                    : selected.filter((id) => id !== article.id),
                )
              }
            />
            Compare outcomes
          </label>
        </article>
      ))}
      {selected.length > 0 && (
        <section className="recovery-card">
          <h2>Outcome comparison</h2>
          {articles
            .filter((a) => selected.includes(a.id))
            .map((a) => (
              <div key={a.id}>
                <h3>{a.title}</h3>
                <dl>
                  {a.claims.map((c) => (
                    <div key={c.id}>
                      <dt>{c.outcome.replaceAll("_", " ")}</dt>
                      <dd>{c.text}</dd>
                    </div>
                  ))}
                </dl>
                <p>Limitations: {a.limitations.join(" ")}</p>
              </div>
            ))}
          <p>
            Different outcomes are not combined into a winner or a recovery
            score.
          </p>
        </section>
      )}
    </>
  );
}
function PublishedRoutineSteps({ publicId }: { publicId: string }) {
  const entry = publicRecoveryRoutines.find((r) => r.article.id === publicId);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  if (!entry) return null;
  return (
    <section>
      <h3>Source routine steps</h3>
      <ol>
        {entry.routine.steps.map((step, index) => (
          <li key={step.id}>
            <strong>
              {step.title}: {step.doseValue} {step.doseType}
            </strong>
            <p>{step.intensityCue}</p>
            <p>{step.techniqueCue}</p>
            <p>{entry.stepRationales[index]}</p>
            <ul>
              {step.stopSignals?.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p>
        Copying creates an editable local version and retains the source
        instructions. Changes to your copy do not acquire the publication’s
        review status.
      </p>
      <button
        className="button secondary"
        disabled={busy || !!message}
        onClick={() => {
          setBusy(true);
          setError("");
          void Promise.resolve()
            .then(() => saveRoutine(createPublicRoutineCopy(publicId)))
            .then(
              () =>
                setMessage(
                  "Source routine copied to this browser. Export a backup to keep it.",
                ),
              (cause: unknown) =>
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "Copy failed; existing records are preserved.",
                ),
            )
            .finally(() => setBusy(false));
        }}
      >
        Copy to my routines
      </button>
      {message && (
        <p role="status">
          {message} <a href="/mobility/custom">Open my routines</a>
        </p>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
export function SleepMethodology() {
  return (
    <>
      <section className="recovery-card">
        <h2>Transparent diary arithmetic</h2>
        <p>
          The wake date uses your selected IANA timezone. Timestamp offsets are
          explicit, including overnight and daylight-saving changes.
        </p>
        <ol>
          <li>Sleep opportunity = getting out of bed − attempting sleep.</li>
          <li>Terminal wake = getting out of bed − final wake.</li>
          <li>
            Estimated main sleep = opportunity − time to fall asleep − awake
            after sleep onset − terminal wake.
          </li>
          <li>Efficiency = estimated main sleep / opportunity × 100.</li>
          <li>Daily total = estimated main sleep + non-overlapping naps.</li>
        </ol>
        <p>
          Missing inputs leave duration unknown. Impossible chronology is
          rejected. Exact elapsed seconds are preserved in fractional minutes.
          Naps do not change main sleep efficiency.
        </p>
        <p>
          A device duration remains a separately labelled estimate. No stages,
          diagnoses, sleep debt or composite recovery scores are calculated.
        </p>
        <p>
          Clock regularity uses midnight-aware unwrapping and is not combined
          across timezones. Means and medians are descriptive; no traffic-light
          thresholds are applied.
        </p>
        <p>
          Field concepts were specified using the{" "}
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/22294820/"
            target="_blank"
            rel="noreferrer"
          >
            Consensus Sleep Diary reference
          </a>
          . No protected diary form is reproduced.
        </p>
      </section>
      <section className="recovery-card">
        <h2>Sleep concerns</h2>
        <p>
          For reported breathing concerns or persistent sleepiness, discuss your
          symptoms with a healthcare provider.{" "}
          <a
            href="https://www.nhlbi.nih.gov/health/sleep-apnea/symptoms"
            target="_blank"
            rel="noreferrer"
          >
            NHLBI symptom guidance
          </a>{" "}
          explains when professional evaluation may help. This diary does not
          determine the cause.
        </p>
      </section>
    </>
  );
}
export function RecoveryPrivacy() {
  return (
    <section className="recovery-card">
      <h2>Device-local records</h2>
      <p>
        Sleep, stress, soreness, pain, illness, mood, notes and routines are
        stored in this browser's IndexedDB after you save. Tracking is optional.
        Browser cleanup or changing devices can remove access; export a JSON
        backup first.
      </p>
      <p>
        No account, wearable connection, cloud health API, analytics payload or
        remote personal storage is used. Source links open only when you choose
        them.
      </p>
      <p>
        JSON includes routine versions and exact session snapshots. CSV exports
        are local files. Keep exported files somewhere you trust.
      </p>
      <p>
        Delete an individual record with confirmation and undo it from settings.
        Clearing all recovery data requires a typed phrase. Workout and
        nutrition records have separate storage owners.
      </p>
      <a href="/recovery/settings">Open backup and deletion controls</a>
    </section>
  );
}
export function RecoverySettingsPage() {
  const { view } = useRecovery();
  if (!view) return null;
  return (
    <RecoverySettingsForm key={view.data.settings[0]?.updatedAt ?? "default"} />
  );
}
function RecoverySettingsForm() {
  const { view, run, busy } = useRecovery();
  const [settings, setSettings] = useState(
      view?.data.settings[0] ?? defaultRecoverySettings(),
    ),
    [preview, setPreview] = useState<RecoveryBackup | null>(null),
    [conflicts, setConflicts] = useState<string[]>([]),
    [mode, setMode] = useState<RestoreMode>("keep_existing"),
    [confirmed, setConfirmed] = useState(false),
    [phrase, setPhrase] = useState("");
  if (!view) return null;
  return (
    <>
      <form
        className="recovery-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(
            () =>
              saveRecoverySettings({
                ...settings,
                updatedAt: new Date().toISOString(),
              }),
            "Recovery preferences saved.",
          );
        }}
      >
        <h2>Optional tracking preferences</h2>
        <Field label="Default IANA timezone">
          <input
            required
            value={settings.value.timezone}
            onChange={(e) =>
              setSettings((v) => ({
                ...v,
                value: { ...v.value, timezone: e.target.value },
              }))
            }
          />
        </Field>
        <Field
          label="Personal sleep goal (minutes, optional)"
          help="Your selected goal is not a prescription and never changes historical records."
        >
          <input
            type="number"
            min="1"
            max="1440"
            value={settings.value.sleepGoalMinutes ?? ""}
            onChange={(e) =>
              setSettings((v) => ({
                ...v,
                value: {
                  ...v.value,
                  sleepGoalMinutes: e.target.value
                    ? Number(e.target.value)
                    : null,
                },
              }))
            }
          />
        </Field>
        <label className="recovery-check">
          <input
            type="checkbox"
            checked={settings.value.trackingEnabled}
            onChange={(e) =>
              setSettings((v) => ({
                ...v,
                value: { ...v.value, trackingEnabled: e.target.checked },
              }))
            }
          />
          Enable optional tracking
        </label>
        <button className="button primary" disabled={busy}>
          Save preferences
        </button>
      </form>
      <section className="recovery-card">
        <h2>Backup and CSV</h2>
        <div className="actions">
          <button
            className="button secondary"
            onClick={() =>
              void run(
                async () =>
                  downloadRecoveryFile(
                    JSON.stringify(await readRecoveryBackup(), null, 2),
                    "fitness-os-recovery-backup.json",
                  ),
                "JSON backup exported.",
              )
            }
          >
            Export JSON backup
          </button>
          <button
            className="button secondary"
            onClick={() =>
              void run(
                async () =>
                  downloadRecoveryFile(
                    JSON.stringify(await readRawRecoveryData(), null, 2),
                    "fitness-os-recovery-raw.json",
                  ),
                "Raw recovery exported. Unvalidated data remains unchanged.",
              )
            }
          >
            Export raw recovery
          </button>
          {recoveryCsvKinds.map((kind) => (
            <button
              className="button secondary"
              key={kind}
              onClick={() =>
                void run(
                  async () =>
                    downloadRecoveryFile(
                      recoveryCsv(await readRecoveryBackup(), kind),
                      `recovery-${kind}.csv`,
                      "text/csv;charset=utf-8",
                    ),
                  `${kind} CSV exported.`,
                )
              }
            >
              Export {kind} CSV
            </button>
          ))}
        </div>
        <button
          className="button secondary"
          onClick={() =>
            void run(async () => {
              if (!navigator.storage?.persist)
                throw Error("Persistent browser storage is unavailable.");
              const granted = await navigator.storage.persist();
              if (!granted)
                throw Error(
                  "Browser declined persistent storage. Export backups regularly.",
                );
            }, "Browser persistent storage granted.")
          }
        >
          Request persistent storage
        </button>
      </section>
      <section className="recovery-card">
        <h2>Restore preview</h2>
        <Field label="Choose a recovery JSON backup">
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(null);
              setConfirmed(false);
              if (file)
                void run(async () => {
                  if (file.size > 20 * 1024 * 1024)
                    throw Error("Backup exceeds 20 MB.");
                  const incoming = validateRecoveryImport(await file.text());
                  let local: RecoveryBackup;
                  try {
                    local = await readRecoveryBackup();
                  } catch {
                    if (mode !== "replace_local")
                      throw Error(
                        "Existing records are unreadable. Export raw recovery and select replace local to repair with a validated backup.",
                      );
                    local = view.data;
                  }
                  setConflicts(recoveryConflicts(local, incoming));
                  setPreview(incoming);
                }, "Backup validated. Review counts and conflicts before restoring.");
            }}
          />
        </Field>
        <Field label="Conflict mode">
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as RestoreMode);
              setConfirmed(false);
            }}
          >
            <option value="keep_existing">Keep existing IDs</option>
            <option value="import_copy">Import as independent copy</option>
            <option value="replace_local">
              Replace all local recovery data
            </option>
          </select>
        </Field>
        {preview && (
          <>
            <p>
              {preview.sleepLogs.length} sleep entries ·{" "}
              {preview.recoveryCheckIns.length} check-ins ·{" "}
              {preview.mobilitySessions.length} sessions ·{" "}
              {preview.customRoutineVersions.length} routine versions ·{" "}
              {preview.deletedRecords.length} tombstones
            </p>
            <p>
              {conflicts.length} matching IDs. Conflicting graphs must remain
              internally consistent; invalid combinations will roll back.
            </p>
            <details>
              <summary>Conflicting IDs</summary>
              <ul>
                {conflicts.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </details>
            <label className="recovery-check">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              I reviewed the preview and confirm this restore
              {mode === "replace_local"
                ? ", including replacement of current recovery records"
                : ""}
              .
            </label>
            <button
              className="button primary"
              disabled={busy || !confirmed}
              onClick={() =>
                void run(
                  () => restoreRecoveryBackup(preview, mode, confirmed),
                  "Recovery backup restored atomically.",
                ).then((ok) => {
                  if (ok) {
                    setPreview(null);
                    setConfirmed(false);
                  }
                })
              }
            >
              Restore validated backup
            </button>
          </>
        )}
      </section>
      <section className="recovery-card">
        <h2>Undo individual deletions</h2>
        {view.data.deletedRecords.map((t) => (
          <p key={t.id}>
            {t.entityType} · {t.deletedAt}{" "}
            <button
              className="button secondary"
              onClick={() =>
                void run(
                  () => undoRecoveryDelete(t.id),
                  "Deleted record restored.",
                )
              }
            >
              Undo deletion
            </button>
          </p>
        ))}
        {!view.data.deletedRecords.length && (
          <p>No deleted records available for undo.</p>
        )}
      </section>
      <section className="recovery-card">
        <h2>Clear this module</h2>
        <Field label="Type DELETE RECOVERY DATA to confirm">
          <input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            autoComplete="off"
          />
        </Field>
        <button
          className="button secondary"
          disabled={busy || phrase !== "DELETE RECOVERY DATA"}
          onClick={() =>
            void run(
              () => purgeRecovery(phrase),
              "All recovery module records cleared.",
            ).then((ok) => {
              if (ok) setPhrase("");
            })
          }
        >
          Clear recovery data
        </button>
      </section>
    </>
  );
}
