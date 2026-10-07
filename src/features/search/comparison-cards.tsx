import { useEffect, useState } from "react";
import type { EntityReference, ComparisonFamily } from "../saved/schema";
import {
  loadComparisonRecords,
  type ComparisonRecord,
} from "./comparison-records";
import { foodReference, type CompositionProfile } from "../foods/schema";

function FoodProfileFields({ record }: { record: ComparisonRecord }) {
  const profiles = record.profiles ?? [];
  const [selected, setSelected] = useState(
    profiles.length === 1 ? profiles[0]!.profileId : "",
  );
  const profile = profiles.find((p) => p.profileId === selected);
  return (
    <>
      <label>
        Source food preparation
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          <option value="">Choose an exact preparation</option>
          {profiles.map((p) => (
            <option key={p.profileId} value={p.profileId}>
              {p.label} · {p.foodState}
            </option>
          ))}
        </select>
      </label>
      {profile ? (
        <>
          <p>
            {profile.label} · {profile.foodState} · per 100 g edible portion
          </p>
          <dl>
            {profile.nutrients.map((n) => (
              <div key={n.nutrientId}>
                <dt>
                  {foodReference.nutrientRegistry.find(
                    (r) => r.id === n.nutrientId,
                  )?.label ?? n.nutrientId}
                </dt>
                <dd>{formatComparisonMeasurement(n)}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p>
          Select a source preparation before comparing composition. No raw or
          cooked profile is chosen on your behalf.
        </p>
      )}
    </>
  );
}
export function formatComparisonMeasurement(
  n: CompositionProfile["nutrients"][number],
) {
  // A missing, trace or unmeasured value never acquires a zero. No unit conversion.
  if (n.status === "trace") return `Trace · ${n.unit}`;
  if (n.value == null) return `${n.status.replaceAll("_", " ")} · ${n.unit}`;
  return `${n.value} ${n.unit} · ${n.status.replaceAll("_", " ")}`;
}
export function PublicComparisonCards({
  family,
  entities,
}: {
  family: ComparisonFamily;
  entities: readonly EntityReference[];
}) {
  const selection = `${family}:${JSON.stringify(entities)}`;
  const [loaded, setLoaded] = useState<{
    selection: string;
    records: ComparisonRecord[] | null;
    error: string;
  }>({ selection: "", records: null, error: "" });
  useEffect(() => {
    let active = true;
    void loadComparisonRecords(family, entities)
      .then((rows) => {
        if (active) setLoaded({ selection, records: rows, error: "" });
      })
      .catch((reason: unknown) => {
        if (active)
          setLoaded({
            selection,
            records: null,
            error:
              reason instanceof Error
                ? reason.message
                : "Published comparison records could not be loaded. Reload to retry.",
          });
      });
    return () => {
      active = false;
    };
  }, [family, entities, selection]);
  const { records, error } = loaded;
  if (loaded.selection !== selection)
    return <p role="status">Loading published comparison records…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!records)
    return <p role="status">Loading published comparison records…</p>;
  return (
    <>
      <p>
        Personal-use publication · sources checked by Codex and automated
        validation; no independent human or clinical review. Review the full
        record for its context.
      </p>
      <div
        className="comparison-grid"
        aria-label={`${family.replaceAll("_", " ")} comparison`}
      >
        {records.map((record) => (
          <article className="comparison-card" key={record.id}>
            <h2>{record.title}</h2>
            {record.unavailable ? (
              <p role="status">{record.unavailable}</p>
            ) : (
              <>
                <dl>
                  {record.fields.map((f, i) => (
                    <div key={`${f.label}-${i}`}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
                {record.profiles && <FoodProfileFields record={record} />}
                {record.limitations.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
                {record.sources.length > 0 && (
                  <details>
                    <summary>Source references</summary>
                    <ul>
                      {record.sources.map((s, i) => (
                        <li key={i}>
                          <a href={s.url}>{s.label}</a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                <a href={record.route}>Open full record</a>
              </>
            )}
          </article>
        ))}
      </div>
      <p>
        No winner or personal target is assigned. Preparation, units, source
        framework and missing values remain explicit.
      </p>
    </>
  );
}
