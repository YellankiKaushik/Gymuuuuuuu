import { useState } from "react";
import { PageHeader } from "../../components/common/page-header";
import { EmptyState } from "../../components/common/states";
import { InfoCallout } from "../../components/common/primitives";
import { compareProfiles, formatNutrient, sourceBadge } from "./domain";
import type { Food, CompositionProfile } from "./schema";
export type FoodComparisonColumn = { food: Food; profile: CompositionProfile };
export function FoodComparison({
  columns,
  invalid = false,
}: {
  columns: FoodComparisonColumn[];
  invalid?: boolean;
}) {
  const [basis, setBasis] = useState("100"),
    [portions, setPortions] = useState<Record<string, string>>({});
  const canServe = columns.every((c) => c.profile.portions.length > 0);
  const servingGrams = columns.map(
    (c) =>
      c.profile.portions.find(
        (p) => p.portionId === portions[c.profile.profileId],
      )?.grams ??
      c.profile.portions[0]?.grams ??
      100,
  );
  if (invalid || columns.length < 2 || columns.length > 4)
    return (
      <div className="page">
        <PageHeader
          title="Compare food profiles"
          eyebrow="EAT / COMPARE"
          description="Select two to four reviewed composition profiles from the food library."
        />
        <EmptyState
          title="Choose reviewed food profiles."
          description="Comparison requires two to four distinct, available profile IDs. Each profile keeps its own preparation state and source."
        >
          <a className="button secondary" href="/foods">
            Choose food profiles
          </a>
        </EmptyState>
      </div>
    );
  const rows = compareProfiles(
    columns.map((c) => c.profile),
    basis === "servings" && canServe ? servingGrams : undefined,
  );
  return (
    <div className="page food-comparison">
      <PageHeader
        title="Compare food profiles"
        eyebrow="EAT / COMPARE"
        description="Compare amounts on an explicit basis. Missing data stays missing, and differences do not establish a winner."
      />
      <a href="/foods">← Choose food profiles</a>
      <label className="food-basis">
        Comparison basis
        <select value={basis} onChange={(e) => setBasis(e.target.value)}>
          <option value="100">Same 100 g edible portion</option>
          <option value="servings" disabled={!canServe}>
            Separate source-backed servings
          </option>
        </select>
      </label>
      {!canServe && (
        <p>
          Serving comparison is available when every selected profile has a
          source-backed portion.
        </p>
      )}
      <div className="food-comparison-heads">
        {columns.map((c, i) => (
          <section key={c.profile.profileId}>
            <h2>
              <a href={`/foods/${c.food.slug}?profile=${c.profile.profileId}`}>
                {c.food.canonicalName}
              </a>
            </h2>
            <p>
              {c.profile.label} · {c.profile.foodState}
            </p>
            <small>{sourceBadge(c.profile)}</small>
            {basis === "servings" && canServe && (
              <label>
                Serving for {c.food.canonicalName}
                <select
                  value={
                    portions[c.profile.profileId] ??
                    c.profile.portions[0]?.portionId
                  }
                  onChange={(e) =>
                    setPortions({
                      ...portions,
                      [c.profile.profileId]: e.target.value,
                    })
                  }
                >
                  {c.profile.portions.map((p) => (
                    <option key={p.portionId} value={p.portionId}>
                      {p.label} · {p.grams} g · {p.status}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <p>
              Basis: {basis === "servings" && canServe ? servingGrams[i] : 100}{" "}
              g
            </p>
          </section>
        ))}
      </div>
      <div className="food-comparison-rows">
        {rows.map((r) => (
          <section key={r.id}>
            <h3>
              {r.label} ({r.canonicalUnit})
            </h3>
            <div>
              {columns.map((c, i) => (
                <article key={c.profile.profileId}>
                  <strong>
                    {c.food.canonicalName} · {c.profile.label}
                  </strong>
                  <span>{formatNutrient(r.values[i])}</span>
                  <small>
                    {r.values[i]?.status.replaceAll("_", " ") ??
                      "not available"}
                  </small>
                  {i > 0 && (
                    <small>
                      Difference from first profile:{" "}
                      {r.differences[i] === null
                        ? "Not comparable"
                        : `${new Intl.NumberFormat("en", { maximumSignificantDigits: 3, signDisplay: "always" }).format(r.differences[i]!)} ${r.canonicalUnit}`}
                    </small>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      <InfoCallout title="State and data quality affect comparability">
        Each amount belongs to the displayed preparation state, source release
        and serving basis. Different source methods may affect interpretation.
      </InfoCallout>
    </div>
  );
}
