import { useState } from "react";
import { PageHeader } from "../../components/common/page-header";
import { NotFoundState } from "../../components/common/states";
import { InfoCallout } from "../../components/common/primitives";
import {
  nutrientReference,
  type Nutrient,
  type ReferenceValue,
} from "./schema";
import {
  frameworkDatasets,
  formatReferenceValue,
  referenceContext,
  type FrameworkDataset,
} from "./frameworks";
import { getFrameworkGlossary, nutrientIndex } from "./public-index";
import type { RankedFood, RankingBasis } from "./ranking";
const words = (s: string) => s.replaceAll("_", " ");
function SourceLinks({ ids }: { ids: string[] }) {
  return (
    <div className="nutrient-source-links">
      {[...new Set(ids)].map((id) => (
        <a key={id} href={`#citation-${id}`}>
          {nutrientReference.sourceRegistry.find((s) => s.id === id)
            ?.authority ?? id}
        </a>
      ))}
    </div>
  );
}
export function ReferenceTable({
  rows,
  dataset,
}: {
  rows: ReferenceValue[];
  dataset: FrameworkDataset | undefined;
}) {
  return (
    <div className="nutrient-reference-panel">
      <p>
        {dataset?.authority ?? "Authority not configured"} · Dataset version:{" "}
        {dataset?.version ?? "Not configured"}
      </p>
      {rows.length ? (
        <table className="nutrient-table">
          <caption>
            Reference values from {dataset?.id ?? "selected framework"}
          </caption>
          <thead>
            <tr>
              <th scope="col">Type and meaning</th>
              <th scope="col">Population</th>
              <th scope="col">Reference and basis</th>
              <th scope="col">Source and notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <th scope="row">
                  <abbr
                    title={
                      getFrameworkGlossary().find((g) => g.term === r.valueType)
                        ?.name ?? r.valueType
                    }
                  >
                    {r.valueType}
                  </abbr>
                  <small>{referenceContext(r)}</small>
                </th>
                <td>
                  {r.population.ageMinMonths}–
                  {r.population.ageMaxMonths ?? "no upper age limit"} months
                  <small>
                    {r.population.sex} · {r.population.lifeStage}
                  </small>
                  {r.population.notes && <small>{r.population.notes}</small>}
                </td>
                <td>
                  {formatReferenceValue(r)}
                  <small>{words(r.basis ?? "basis unavailable")}</small>
                </td>
                <td>
                  <a href={`#citation-${r.sourceId}`}>Source</a>
                  <small>{r.notes}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          No reviewed reference values are available for this framework and
          nutrient. No value is inferred.
        </p>
      )}
      <a href="/nutrients/glossary">Read full definitions of reference terms</a>
    </div>
  );
}
export function FoodSourceExplorer({
  rankings,
  nutrientName,
}: {
  rankings: RankedFood[];
  nutrientName: string;
}) {
  const [basis, setBasis] = useState<RankingBasis>("per_100g"),
    [estimates, setEstimates] = useState(true),
    [limit, setLimit] = useState(25);
  const rows = rankings.filter(
    (r) =>
      r.basis === basis &&
      (estimates ||
        ![r.status, r.energyStatus, r.portionStatus].some(
          (s) => s === "estimated" || s === "imputed",
        )),
  );
  return (
    <section id="food-sources">
      <h2>Verified food sources</h2>
      <div className="nutrient-controls">
        <label>
          Food ranking basis
          <select
            value={basis}
            aria-label="Food ranking basis"
            onChange={(e) => {
              setBasis(e.target.value as RankingBasis);
              setLimit(25);
            }}
          >
            <option value="per_100g">Per 100 g edible portion</option>
            <option value="per_100kcal">Per 100 kcal</option>
            <option value="per_verified_portion">
              Per source-backed portion
            </option>
          </select>
        </label>
        <label className="food-check">
          <input
            type="checkbox"
            checked={estimates}
            onChange={(e) => setEstimates(e.target.checked)}
          />
          Include estimated and imputed amounts
        </label>
      </div>
      {rows.length ? (
        <>
          <table className="nutrient-table">
            <caption>
              {nutrientName} food-source amounts · {words(basis)}
            </caption>
            <thead>
              <tr>
                <th scope="col">Food and preparation</th>
                <th scope="col">Amount and basis</th>
                <th scope="col">Data status and release</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, limit).map((r, i) => (
                <tr key={`${r.profileId}:${r.portionLabel}:${i}`}>
                  <th scope="row">
                    <a href={`/foods/${r.slug}?profile=${r.profileId}`}>
                      {r.name}
                    </a>
                    <small>
                      {r.profileLabel} · {r.state}
                    </small>
                  </th>
                  <td>
                    {new Intl.NumberFormat("en", {
                      maximumSignificantDigits: 4,
                    }).format(r.amount)}{" "}
                    {r.unit}
                    <small>
                      {r.portionLabel ?? words(basis)}
                      {r.grams !== null
                        ? ` · ${new Intl.NumberFormat("en", { maximumSignificantDigits: 4 }).format(r.grams)} g`
                        : ""}
                    </small>
                  </td>
                  <td>
                    {words(r.status)}
                    <small>{r.sourceReleases.join(" · ")}</small>
                    {r.energyStatus && (
                      <small>Energy: {words(r.energyStatus)}</small>
                    )}
                    {r.portionStatus && (
                      <small>Portion: {words(r.portionStatus)}</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {limit < rows.length && (
            <button
              className="button secondary"
              onClick={() => setLimit(limit + 25)}
            >
              Show more source rows
            </button>
          )}
        </>
      ) : (
        <p>
          No verified food measurements are available on this ranking basis.
          Incompatible forms, missing values and unavailable portions are
          excluded.
        </p>
      )}
      <p className="muted">
        The order describes the displayed composition basis. Absorption, food
        state and typical serving size affect practical contribution; the first
        result is not a universal “best source.”
      </p>
    </section>
  );
}
export function NutrientDetail({
  record,
  rankings = [],
  datasets = frameworkDatasets,
}: {
  record: Nutrient | undefined;
  rankings?: RankedFood[];
  datasets?: FrameworkDataset[];
}) {
  const [framework, setFramework] = useState(
    record?.referenceValues[0]?.frameworkId ?? "us_canada_dri",
  );
  if (!record || record.status !== "published") return <NotFoundState />;
  const n = record,
    sourceIds = n.claims.flatMap((c) => c.sourceIds),
    contextClaims = n.claims.filter(
      (c) =>
        c.category === "other" &&
        /vegetarian|vegan|indian|mixed diet|fortified/i.test(
          `${c.population} ${c.text}`,
        ),
    );
  return (
    <div className="page nutrient-detail">
      <a href="/nutrients" className="back-link">
        ← Nutrient encyclopedia
      </a>
      <PageHeader
        title={n.canonicalName}
        eyebrow={`EAT / ${nutrientReference.groups.find((g) => g.id === n.groupId)?.label.toUpperCase() ?? "NUTRIENT"}`}
        description={n.summary ?? ""}
      />
      <div className="tag-row">
        <span>{words(n.essentiality)}</span>
        <span>{words(n.displayKind)}</span>
        <span>{n.canonicalUnit}</span>
      </div>
      <p>Also called: {n.aliases.join(", ") || "No reviewed aliases"}</p>
      <nav className="nutrient-links" aria-label="Nutrient article sections">
        <a href="#functions">Functions</a>
        <a href="#reference-values">References</a>
        <a href="#food-sources">Food sources</a>
        <a href="#risk-context">Risk context</a>
        <a href="#nutrient-sources">Sources</a>
      </nav>
      <section>
        <h2>Forms and equivalents</h2>
        {n.forms.length ? (
          n.forms.map((f) => (
            <article key={f.id}>
              <h3>{f.name}</h3>
              <p>{words(f.relationship)}</p>
              <p>
                {f.conversionRule ??
                  "No interchangeable-unit rule is supplied for this form."}
              </p>
              <SourceLinks ids={f.sourceIds ?? []} />
            </article>
          ))
        ) : (
          <p>No additional source-reviewed forms are described.</p>
        )}
      </section>
      <section id="functions">
        <h2>Core functions</h2>
        {n.functions.map((f, i) => (
          <article key={i}>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
            <SourceLinks ids={f.sourceIds} />
          </article>
        ))}
      </section>
      <section id="reference-values">
        <h2>Population reference values</h2>
        <label className="nutrient-framework-label">
          Reference framework
          <select
            aria-label="Reference framework"
            value={framework}
            onChange={(e) => setFramework(e.target.value as typeof framework)}
          >
            {nutrientReference.referenceFrameworks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <ReferenceTable
          rows={n.referenceValues.filter((r) => r.frameworkId === framework)}
          dataset={datasets.find((d) => d.id === framework)}
        />
        <a href="/nutrients/reference-intakes">
          Explore a specific reference population
        </a>
      </section>
      <FoodSourceExplorer rankings={rankings} nutrientName={n.canonicalName} />
      <section>
        <h2>Absorption and bioavailability</h2>
        {n.absorptionFactors.length ? (
          n.absorptionFactors.map((f, i) => (
            <article key={i}>
              <p>{f.description}</p>
              <small>
                {words(f.factorType)} · {words(f.direction)} · {f.limitations}
              </small>
              <SourceLinks ids={f.sourceIds} />
            </article>
          ))
        ) : (
          <p>
            No reviewed absorption factors are available. No individual
            absorption percentage is inferred.
          </p>
        )}
      </section>
      <section id="risk-context">
        <h2>Deficiency and excess context</h2>
        {(
          [
            ["Deficiency", n.deficiency],
            ["Excess intake", n.excess],
          ] as const
        ).map(([title, s]) => (
          <article key={title}>
            <h3>{title}</h3>
            {s ? (
              <>
                <p>{s.overview}</p>
                {s.riskGroups.length > 0 && (
                  <>
                    <h4>Groups discussed by the source</h4>
                    <ul>
                      {s.riskGroups.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </>
                )}
                {s.signsAndSymptoms.length > 0 && (
                  <>
                    <h4>General signs discussed by the source</h4>
                    <ul>
                      {s.signsAndSymptoms.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </>
                )}
                <InfoCallout>{s.medicalBoundary}</InfoCallout>
                <SourceLinks ids={s.sourceIds} />
              </>
            ) : (
              <p>
                No reviewed {title.toLowerCase()} content is available for this
                topic.
              </p>
            )}
          </article>
        ))}
        <p>
          No established upper-limit entry must be interpreted as proof that
          unlimited intake is safe.
        </p>
      </section>
      <section>
        <h2>Interactions</h2>
        {n.interactions.length ? (
          n.interactions.map((f, i) => (
            <article className="nutrient-interaction" key={i}>
              <h3>
                {f.counterparty} · {words(f.severity)}
              </h3>
              <p>{f.description}</p>
              <small>{f.limitations}</small>
              <SourceLinks ids={f.sourceIds} />
            </article>
          ))
        ) : (
          <p>
            No reviewed interactions are described in this article; this does
            not establish that interactions are absent.
          </p>
        )}
        <p>
          Interaction information is non-exhaustive. It does not advise
          starting, stopping or changing medication.
        </p>
      </section>
      <section>
        <h2>Training relevance</h2>
        {n.athleticRelevance.length ? (
          n.athleticRelevance.map((f, i) => (
            <article key={i}>
              <h3>{words(f.context)}</h3>
              <p>{f.description}</p>
              <small>Evidence: {words(f.evidenceLevel)}</small>
              <SourceLinks ids={f.sourceIds} />
            </article>
          ))
        ) : (
          <p>
            No reviewed sports-specific claims are available. A greater intake
            is not assumed to improve performance.
          </p>
        )}
      </section>
      <section>
        <h2>Dietary-pattern context</h2>
        {contextClaims.length ? (
          contextClaims.map((c) => (
            <article key={c.claimId}>
              <p>{c.text}</p>
              <small>
                {c.population} · {c.limitations}
              </small>
              <SourceLinks ids={c.sourceIds} />
            </article>
          ))
        ) : (
          <p>
            No reviewed vegetarian, vegan, mixed-diet or Indian-diet context is
            supplied for this article.
          </p>
        )}
      </section>
      <section>
        <h2>Evidence and limitations</h2>
        {n.claims.map((c) => (
          <details key={c.claimId}>
            <summary>{c.text}</summary>
            <p>
              {words(c.category)} · {words(c.evidenceLevel)} · {c.population}
            </p>
            <p>
              {c.limitations ??
                "No additional limitations were recorded in the approved claim."}
            </p>
            <SourceLinks ids={c.sourceIds} />
          </details>
        ))}
      </section>
      <section id="nutrient-sources">
        <h2>Sources and review</h2>
        <p>
          Reviewed {n.editorial.reviewedAt} · {n.editorial.reviewer}
        </p>
        {n.sources.map((s, i) => (
          <article
            id={
              n.sources.findIndex((c) => c.sourceId === s.sourceId) === i
                ? `citation-${s.sourceId}`
                : undefined
            }
            key={i}
            className="nutrient-source"
          >
            <h3>
              {
                nutrientReference.sourceRegistry.find(
                  (r) => r.id === s.sourceId,
                )?.name
              }
            </h3>
            <p>{s.locator}</p>
            <p>{s.notes}</p>
            <small>Accessed {s.accessedAt}</small>
            <a
              href={
                nutrientReference.sourceRegistry.find(
                  (r) => r.id === s.sourceId,
                )?.url
              }
            >
              Official source
            </a>
          </article>
        ))}
        {!sourceIds.length && <p>No source-backed claims available.</p>}
      </section>
      <section>
        <h2>Related nutrient topics</h2>
        <div className="nutrient-links">
          {nutrientIndex
            .filter((r) => r.group === n.groupId && r.id !== n.id)
            .slice(0, 6)
            .map((r) => (
              <a key={r.id} href={`/nutrients/${r.slug}`}>
                {r.name}
              </a>
            ))}
        </div>
      </section>
    </div>
  );
}
