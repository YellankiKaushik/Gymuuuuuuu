import { useState } from "react";
import {
  Frame,
  WorkspacePage,
  Field,
  TextField,
  useWorkspace,
  readable,
} from "./workspace";
import { publicSupplements } from "./publication";
import { supplementReference, type Backup } from "./schema";
import { defaultPreferences, parseBackup } from "./domain";
import {
  readBackup,
  rawRecovery,
  restore,
  clearData,
  mutate,
  undoDelete,
  type RestoreMode,
} from "./storage";
import { download, supplementsCsv } from "./export";
export function HomePage() {
  return (
    <Frame title="Supplements & evidence">
      <section className="card">
        <h2>Start with the question</h2>
        <p>
          Browse reviewed claims by outcome, population and formulation.
          Ingredient evidence, product quality, safety and anti-doping rules
          remain separate.
        </p>
        <p>
          Browse source-backed ingredient education and outcome-specific
          research findings. Personal dosing prescriptions are not supplied.
        </p>
        <a href="/supplements/ingredients">Browse ingredient education</a>{" "}
        <a className="button primary" href="/supplements/products/create">
          Capture a product label
        </a>{" "}
        <a className="button secondary" href="/supplements/trials/create">
          Create a personal observation trial
        </a>
      </section>
      <section className="card">
        <h2>Your choice to track</h2>
        <p>
          Records are optional, browser-local and exportable. Recording a label
          or serving does not mean the product or amount is recommended.
        </p>
        <a href="/supplements/settings">Tracking preferences and backup</a>
      </section>
    </Frame>
  );
}
export function LibraryPage({
  kind,
  slug,
}: {
  kind: "ingredients" | "evidence";
  slug?: string;
}) {
  const [query, setQuery] = useState("");
  const entries = publicSupplements.filter(
    (e) =>
      (kind === "ingredients"
        ? e.entityType === "ingredient"
        : e.entityType !== "ingredient" || e.claims.length > 0) &&
      (!slug || e.slug === slug) &&
      [
        e.title,
        ...e.aliases,
        ...e.claims.flatMap((claim) => [
          claim.outcomeDefinition,
          claim.population,
          claim.formulation,
        ]),
      ].some((value) => value.toLowerCase().includes(query.toLowerCase())),
  );
  return (
    <Frame
      title={
        slug
          ? "Supplement evidence record"
          : kind === "ingredients"
            ? "Ingredient library"
            : "Claim-level evidence"
      }
    >
      <section className="card">
        <h2>
          {slug && !entries.length
            ? "Record unavailable"
            : "Source-backed records"}
        </h2>
        {slug && !entries.length ? (
          <p>
            This page is not available yet. More verified content will be added
            over time. No dose, efficacy or safety verdict is supplied.
          </p>
        ) : (
          <>
            <form onSubmit={(event) => event.preventDefault()}>
              <TextField
                label="Search names, outcomes, populations and forms"
                value={query}
                onChange={setQuery}
              />
            </form>
            <p>
              {entries.length} source-backed records. Personal-use publication
              with machine validation; no independent human review.
            </p>
          </>
        )}
        <a href="/supplements/methodology">How publication is reviewed</a>
      </section>
      {entries.map((e) => (
        <article className="card" key={e.id}>
          <h2>
            <a
              href={`/supplements/${e.entityType === "ingredient" ? "ingredients" : "evidence"}/${e.slug}`}
            >
              {e.title}
            </a>
          </h2>
          <p>
            Personal-use publication · machine source verification · no
            independent human or clinical review.
          </p>
          {e.sections.map((s) => (
            <section key={s.id}>
              <h3>{s.heading}</h3>
              <p>{s.content.text}</p>
            </section>
          ))}
          {e.claims.length > 0 && <h3>Outcome-specific findings</h3>}
          {e.claims.map((claim) => (
            <section key={claim.id}>
              <h4>{claim.outcomeDefinition}</h4>
              <dl>
                <dt>Ingredient form</dt>
                <dd>{claim.formulation}</dd>
                <dt>Population</dt>
                <dd>
                  {claim.population} · {claim.ageAndSexLimits}
                </dd>
                <dt>Training context</dt>
                <dd>{claim.trainingStatus}</dd>
                <dt>Protocol and duration</dt>
                <dd>
                  {claim.timeframe}{" "}
                  {claim.protocol === null
                    ? "No single source regimen extracted; no personal amount supplied."
                    : claim.protocol.duration}
                </dd>
                <dt>Comparator</dt>
                <dd>{claim.comparator}</dd>
                <dt>Effect direction</dt>
                <dd>{readable(claim.effectDirection)}</dd>
                <dt>Confidence</dt>
                <dd>
                  {readable(claim.evidenceConfidence)} ·{" "}
                  {claim.assessmentDocumentation}
                </dd>
                <dt>Study count for this outcome</dt>
                <dd>{claim.studyCount ?? "Not available"}</dd>
              </dl>
              <ul>
                {claim.limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
              <ul>
                {claim.sourceIds.map((id) => {
                  const source = supplementReference.sources.find(
                    (source) => source.id === id,
                  )!;
                  return (
                    <li key={id}>
                      <a href={source.url}>{source.title}</a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <h3>Safety context</h3>
          <ul>
            {e.safety.map((s) => (
              <li key={s.id}>{s.content.text}</li>
            ))}
          </ul>
          <p>
            No personal protocol, product-quality certification or current
            anti-doping verdict is supplied.
          </p>
          <p>
            Source checked {e.review.reviewedAt} by {e.review.reviewer}.
          </p>
          <ul>
            {e.sourceIds.map((id) => {
              const source = supplementReference.sources.find(
                (s) => s.id === id,
              )!;
              return (
                <li key={id}>
                  <a href={source.url}>{source.title}</a>
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </Frame>
  );
}
export function ComparePage() {
  return (
    <Frame title="Compare ingredient evidence">
      <section className="card">
        <h2>Choose up to four reviewed ingredients</h2>
        <p>
          Use public search to select compatible ingredient records for a source
          comparison. Read each outcome, population, form and timeframe
          separately; efficacy, safety, quality and anti-doping are distinct.
        </p>
        <p>
          No overall winner, brand ranking or purchase recommendation is
          generated.
        </p>
        <a href="/supplements/ingredients">Ingredient library</a>{" "}
        <a href="/search?type=supplement_ingredient">
          Search ingredient records
        </a>
      </section>
    </Frame>
  );
}
export function GuidancePage({
  kind,
}: {
  kind:
    | "safety"
    | "quality"
    | "anti-doping"
    | "frameworks"
    | "methodology"
    | "privacy";
}) {
  return (
    <Frame title={readable(kind)}>
      <section className="card">
        <h2>
          {kind === "privacy"
            ? "Your browser owns these records"
            : kind === "methodology"
              ? "Separate evidence questions"
              : "Review boundaries"}
        </h2>
        {kind === "privacy" ? (
          <>
            <p>
              Product labels, images, trial observations, intake records and
              adverse events stay in this browser’s IndexedDB. No accounts,
              uploads, cloud backup or automatic registry requests are used.
            </p>
            <p>
              Browser clearing or device loss can remove records. Export JSON
              including images; CSV is for review and cannot restore complete
              history. Downloaded files contain personal information.
            </p>
            <a href="/supplements/settings">Backup, restore and delete</a>
          </>
        ) : kind === "quality" ? (
          <>
            <p>
              A label logo is not a registry verification. Record the exact
              product and lot, official registry URL, lookup date, result and
              scope. An unmatched lot cannot be labelled verified for that lot.
            </p>
            <p>
              Certification does not establish clinical efficacy, medical
              compatibility or zero contamination risk.
            </p>
            <a
              href="https://www.nsf.org/consumer-resources/articles/certified-for-sport-program"
              rel="noreferrer"
            >
              NSF Certified for Sport programme
            </a>
            <p>
              General quality limitations:{" "}
              <a href="https://ods.od.nih.gov/factsheets/WYNTK-Consumer/">
                National Institutes of Health Office of Dietary Supplements
              </a>
              . Engineering link checked 5 October 2026; no ingredient-specific
              clinical approval.
            </p>
          </>
        ) : kind === "anti-doping" ? (
          <>
            <p>
              The World Anti-Doping Agency (WADA) publishes an annually
              versioned list. No ingredient status has been clinically or
              legally approved in this library. Not identified on a list is not
              a guarantee of permission or uncontaminated products.
            </p>
            <p>
              A dated classification cannot carry into a different list year
              without review. Athlete mode stores your selected year and
              strengthens lot-record reminders; it does not clear a product.
            </p>
            <a href="https://www.wada-ama.org/en/resources/world-anti-doping-code-and-international-standards/prohibited-list">
              Current official WADA resource
            </a>
          </>
        ) : kind === "frameworks" ? (
          <>
            <p>
              Australian Institute of Sport (AIS) classifications are dated
              external-framework snapshots. The supplied classifications are
              awaiting revalidation and remain hidden.
            </p>
            <p>
              United States Food and Drug Administration (FDA), India Food
              Safety and Standards Authority (FSSAI) and Australian regulatory
              contexts require separate reviews. No legal conclusion is inferred
              across jurisdictions.
            </p>
          </>
        ) : kind === "safety" ? (
          <>
            <p>
              Discuss products with an appropriate qualified health
              professional, particularly with medication, pregnancy, an
              underlying condition or upcoming surgery. This app cannot declare
              a combination safe.
            </p>
            <p>
              If a serious suspected reaction occurs, stop the product and seek
              urgent medical help through local emergency services. Recording an
              event must not delay care.
            </p>
            <a href="https://www.fda.gov/food/dietary-supplements/how-report-problem-dietary-supplements">
              FDA suspected reaction and reporting guidance (United States)
            </a>
            <p>
              <a href="https://ods.od.nih.gov/factsheets/WYNTK-Consumer/">
                NIH consumer safety guidance
              </a>
              . Links checked 5 October 2026.
            </p>
          </>
        ) : (
          <>
            <p>
              Claims require exact outcome, population, formulation, protocol,
              comparator, timeframe, source references, limitations and reviewer
              approval. Confidence labels are editorial unless a documented
              source grading assessment applies.
            </p>
            <p>
              Research protocols describe studied conditions and do not
              prescribe a personal amount. Missing amounts stay unavailable.
              Proprietary blend totals are never allocated across ingredients.
              Label capture does not create verified efficacy evidence.
            </p>
            <p>
              Self-observations do not establish causality. Known exposure is
              incomplete when foods, other products, label amounts or units are
              missing. No medical upper-limit clearance is calculated.
            </p>
          </>
        )}
      </section>
      {kind === "methodology" && (
        <details className="card">
          <summary>Source registry (unreviewed ingredient evidence)</summary>
          {supplementReference.sources.map((s) => (
            <p key={s.id}>
              <a href={s.url} rel="noreferrer">
                {s.title}
              </a>{" "}
              · {s.publisher}. Supplied source record; clinical publication
              review pending.
            </p>
          ))}
        </details>
      )}
    </Frame>
  );
}
export function SettingsPage() {
  return (
    <WorkspacePage title="Supplement settings & backup">
      <Settings />
    </WorkspacePage>
  );
}
function Settings() {
  const { view, run, busy } = useWorkspace();
  const [preview, setPreview] = useState<Backup | null>(null),
    [error, setError] = useState(""),
    [mode, setMode] = useState<RestoreMode>("keep_existing"),
    [confirmed, setConfirmed] = useState(false),
    [phrase, setPhrase] = useState("");
  const prefs = view?.data.settings[0] ?? defaultPreferences();
  return (
    <>
      <section className="card">
        <h2>Optional tracking</h2>
        <Field label="Enable supplement tracking">
          <input
            type="checkbox"
            checked={prefs.value.trackingEnabled}
            onChange={(e) =>
              void run(
                () =>
                  mutate(
                    "preferences_saved",
                    (root) => {
                      root.settings = [
                        {
                          ...prefs,
                          value: {
                            ...prefs.value,
                            trackingEnabled: e.target.checked,
                          },
                          updatedAt: new Date().toISOString(),
                        },
                      ];
                    },
                    { allowDisabled: true },
                  ),
                "Tracking preference saved",
              )
            }
          />
        </Field>
        <Field label="Tested athlete mode">
          <input
            type="checkbox"
            checked={prefs.value.athleteMode}
            onChange={(e) =>
              void run(
                () =>
                  mutate(
                    "preferences_saved",
                    (root) => {
                      root.settings = [
                        {
                          ...prefs,
                          value: {
                            ...prefs.value,
                            athleteMode: e.target.checked,
                          },
                          updatedAt: new Date().toISOString(),
                        },
                      ];
                    },
                    { allowDisabled: true },
                  ),
                "Athlete preference saved",
              )
            }
          />
        </Field>
        <Field label="Configured WADA list year">
          <input
            type="number"
            min="2020"
            max="2100"
            value={prefs.value.listYear}
            onChange={(e) => {
              const year = Number(e.target.value);
              if (Number.isInteger(year) && year >= 2020 && year <= 2100)
                void run(
                  () =>
                    mutate(
                      "preferences_saved",
                      (root) => {
                        root.settings = [
                          {
                            ...prefs,
                            value: { ...prefs.value, listYear: year },
                            updatedAt: new Date().toISOString(),
                          },
                        ];
                      },
                      { allowDisabled: true },
                    ),
                  "List year saved; ingredient statuses remain unassessed",
                );
            }}
          />
        </Field>
      </section>
      <section className="card">
        <h2>Export and raw recovery</h2>
        <p>
          JSON preserves all versions, corrections, images, audits and deletion
          snapshots. CSV exposes seven review datasets. Raw recovery may contain
          malformed personal records; preserve it before repair.
        </p>
        <button
          className="button secondary"
          disabled={busy}
          onClick={() =>
            void run(
              async () =>
                download(
                  "fitness-os-supplements.json",
                  JSON.stringify(await readBackup(), null, 2),
                ),
              "JSON backup exported",
            )
          }
        >
          Export JSON backup
        </button>
        <button
          className="button secondary"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              const root = await readBackup();
              for (const [name, body] of Object.entries(supplementsCsv(root)))
                download(name, body, "text/csv;charset=utf-8");
            }, "Seven CSV datasets exported")
          }
        >
          Export CSV datasets
        </button>
        <button
          className="button secondary"
          onClick={() =>
            void run(
              async () =>
                download(
                  "supplement-raw-recovery.json",
                  JSON.stringify(await rawRecovery(), null, 2),
                ),
              "Raw recovery exported",
            )
          }
        >
          Export raw recovery
        </button>
      </section>
      <section className="card">
        <h2>Validate before restoring</h2>
        <Field label="Supplement JSON backup">
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(null);
              setConfirmed(false);
              setError("");
              if (file)
                void file.text().then((text) => {
                  try {
                    setPreview(parseBackup(text));
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Invalid backup",
                    );
                  }
                });
            }}
          />
        </Field>
        {error && <p role="alert">{error}</p>}
        {preview && (
          <>
            <p>
              {preview.personalProducts.length} products,{" "}
              {preview.productLabelVersions.length} labels,{" "}
              {preview.supplementTrials.length} trials,{" "}
              {preview.intakeLogs.length} intakes,{" "}
              {preview.adverseEvents.length} events. Imports preserve external
              context IDs.
            </p>
            <Field label="Restore mode">
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as RestoreMode);
                  setConfirmed(false);
                }}
              >
                <option value="keep_existing">
                  Keep existing; record conflicts
                </option>
                <option value="import_as_copy">Import as copies</option>
                <option value="replace">Replace this module</option>
              </select>
            </Field>
            <Field label="I reviewed the import and confirm this write">
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
                  await restore(preview, mode, confirmed);
                  setPreview(null);
                  setConfirmed(false);
                }, "Backup restored atomically")
              }
            >
              Restore validated backup
            </button>
          </>
        )}
      </section>
      <section className="card">
        <h2>Deletion recovery</h2>
        {view?.data.deletedRecords.map((t) => (
          <p key={t.id}>
            {readable(t.entityType)} · {t.deletedAt}
            <button
              className="button secondary"
              onClick={() => {
                if (window.confirm("Restore this deleted record?"))
                  void run(
                    () => undoDelete(t.id, true),
                    "Deleted record restored",
                  );
              }}
            >
              Restore deleted record
            </button>
          </p>
        ))}
      </section>
      <section className="card">
        <h2>Clear supplement records</h2>
        <p>
          Export first. This clears only this module’s records, images and
          recovery history.
        </p>
        <TextField
          label="Enter DELETE SUPPLEMENT DATA"
          value={phrase}
          onChange={setPhrase}
        />
        <button
          className="button secondary"
          disabled={phrase !== "DELETE SUPPLEMENT DATA" || busy}
          onClick={() =>
            void run(async () => {
              await clearData(phrase);
              setPhrase("");
            }, "Supplement records cleared")
          }
        >
          Clear supplement data
        </button>
      </section>
    </>
  );
}
