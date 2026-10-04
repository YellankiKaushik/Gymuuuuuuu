import { useEffect, useRef, useState } from "react";
import { usePreferences } from "../../components/app-shell/preferences";
import { PageHeader } from "../../components/common/page-header";
import { EmptyState } from "../../components/common/states";
import { InfoCallout } from "../../components/common/primitives";
import { foodReference } from "./schema";
import { foodIndex } from "./repository";
import { searchFoods, parseFoodQuery, type FoodQuery } from "./query";
import type { FoodIndexEntry } from "./domain";
const words = (s: string) => s.replaceAll("_", " ");
function FilterFields({
  query,
  change,
}: {
  query: FoodQuery;
  change: (q: Partial<FoodQuery>) => void;
}) {
  const fields = [
    ["category", "Category", foodReference.foodCategories],
    [
      "subgroup",
      "Subgroup",
      foodReference.foodSubgroups.filter(
        (s) => !query.category || s.categoryId === query.category,
      ),
    ],
    [
      "state",
      "Preparation state",
      foodReference.foodStates.map((id) => ({ id, label: words(id) })),
    ],
    [
      "tag",
      "Dietary tag",
      foodReference.dietaryTags.map((id) => ({ id, label: words(id) })),
    ],
    [
      "allergen",
      "Reported allergen tag",
      foodReference.allergenTags.map((id) => ({ id, label: words(id) })),
    ],
    [
      "source",
      "Composition source",
      foodReference.sourceRegistry
        .filter((s) => s.id.startsWith("usda"))
        .map((s) => ({ id: s.id, label: s.name })),
    ],
  ] as const;
  return (
    <div className="food-filter-fields">
      {fields.map(([key, label, items]) => (
        <label key={key}>
          {label}
          <select
            aria-label={label}
            value={query[key]}
            onChange={(e) =>
              change({
                [key]: e.target.value,
                ...(key === "category" ? { subgroup: "" } : {}),
              })
            }
          >
            <option value="">All</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label>
        Minimum reported numeric nutrients
        <input
          type="number"
          min="0"
          max="44"
          value={query.complete}
          onChange={(e) => change({ complete: Number(e.target.value) })}
        />
      </label>
      <label>
        Estimated and imputed values
        <select
          value={query.estimates}
          onChange={(e) =>
            change({ estimates: e.target.value as FoodQuery["estimates"] })
          }
        >
          <option value="include">Include with status</option>
          <option value="exclude">
            Exclude from numeric filters and sorts
          </option>
        </select>
      </label>
      <label>
        Numeric filter, per 100 g
        <select
          value={query.nutrient}
          onChange={(e) =>
            change({ nutrient: e.target.value as FoodQuery["nutrient"] })
          }
        >
          <option value="">None</option>
          {foodReference.nutrientRegistry
            .filter((n) =>
              [
                "energy_kcal",
                "protein_g",
                "carbohydrate_total_g",
                "fat_total_g",
                "fiber_total_g",
              ].includes(n.id),
            )
            .map((n) => (
              <option key={n.id} value={n.id}>
                {n.label} ({n.canonicalUnit})
              </option>
            ))}
        </select>
      </label>
      {query.nutrient && (
        <>
          <label>
            Minimum
            <input
              type="number"
              min="0"
              value={query.minimum}
              onChange={(e) => change({ minimum: e.target.value })}
            />
          </label>
          <label>
            Maximum
            <input
              type="number"
              min="0"
              value={query.maximum}
              onChange={(e) => change({ maximum: e.target.value })}
            />
          </label>
        </>
      )}
    </div>
  );
}
function FilterDialog({
  query,
  change,
  close,
}: {
  query: FoodQuery;
  change: (q: Partial<FoodQuery>) => void;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      opener?.focus();
    };
  }, []);
  return (
    <dialog
      className="filter-dialog"
      ref={ref}
      onCancel={close}
      aria-labelledby="food-filters-title"
    >
      <div className="dialog-heading">
        <h2 id="food-filters-title">Food filters</h2>
        <button className="button secondary" onClick={close}>
          Close
        </button>
      </div>
      <FilterFields query={query} change={change} />
      <button className="button primary" onClick={close}>
        Show results
      </button>
    </dialog>
  );
}
export function FoodCatalogue({
  query,
  onChange,
  entries = foodIndex,
}: {
  query: FoodQuery;
  onChange: (q: FoodQuery) => void;
  entries?: FoodIndexEntry[];
}) {
  const { hydrated } = usePreferences();
  const [filters, setFilters] = useState(false),
    [compare, setCompare] = useState<string[]>([]);
  const change = (q: Partial<FoodQuery>) =>
    onChange({ ...query, ...q, page: 1 });
  const results = searchFoods(query, entries);
  return (
    <div className="page catalogue-page">
      <PageHeader
        eyebrow="EAT / FOOD LIBRARY"
        title="Know what’s in your food."
        description="Explore source-reviewed foods, preparation states and nutrient data. Every number carries its source and status."
      />
      <div className="food-library-links">
        <a href="/foods/categories">Browse categories</a>
        <a href="/foods/sources">Composition sources</a>
        <a href="/foods/methodology">How we handle data</a>
      </div>
      <div className="catalogue-toolbar">
        <label className="search-field">
          <input
            aria-label="Search foods"
            disabled={!hydrated}
            placeholder="Food, regional name or alias…"
            value={query.q}
            onChange={(e) => change({ q: e.target.value })}
          />
        </label>
        <button className="button secondary" onClick={() => setFilters(true)}>
          Food filters
        </button>
        <label>
          Sort food profiles
          <select
            value={query.sort}
            onChange={(e) =>
              change({ sort: e.target.value as FoodQuery["sort"] })
            }
          >
            <option value="relevance">Relevance</option>
            <option value="az">A–Z</option>
            {[
              "energy_kcal",
              "protein_g",
              "carbohydrate_total_g",
              "fat_total_g",
              "fiber_total_g",
            ].map((id) => (
              <option key={id} value={id}>
                {foodReference.nutrientRegistry.find((n) => n.id === id)?.label}{" "}
                per 100 g, descending
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="food-layout">
        <aside className="food-desktop-filters" aria-label="Food filters">
          <FilterFields query={query} change={change} />
          <button
            className="text-button"
            onClick={() => onChange(parseFoodQuery({}))}
          >
            Clear food filters
          </button>
        </aside>
        <div>
          <p role="status">{results.total} reviewed food profiles</p>
          <div className="active-filters" role="group" aria-label="Active food filters">
            {(
              [
                "category",
                "subgroup",
                "state",
                "tag",
                "allergen",
                "source",
                "nutrient",
              ] as const
            )
              .filter((key) => query[key])
              .map((key) => (
                <button
                  key={key}
                  className="filter-chip"
                  onClick={() => change({ [key]: "" })}
                >
                  Remove {words(key)}: {words(query[key])}
                </button>
              ))}
          </div>
          {compare.length > 0 && (
            <div className="food-compare-tray">
              <span>{compare.length} of 4 selected</span>
              <a
                className="button secondary"
                aria-disabled={compare.length < 2}
                href={
                  compare.length >= 2
                    ? `/foods/compare?profiles=${compare.join(",")}`
                    : undefined
                }
              >
                Compare selected profiles
              </a>
              <button className="text-button" onClick={() => setCompare([])}>
                Clear selection
              </button>
            </div>
          )}
          {results.total ? (
            <>
              <div className="entity-grid">
                {results.rows.map(({ food: f, profile: p }) => (
                  <article className="entity-card" key={p.id}>
                    <small>{words(p.state)} · Per 100 g edible portion</small>
                    <a href={`/foods/${f.slug}?profile=${p.id}`}>
                      <h2>{f.name}</h2>
                    </a>
                    <p>{p.label}</p>
                    <dl className="food-card-nutrients">
                      {[
                        "energy_kcal",
                        "protein_g",
                        "carbohydrate_total_g",
                        "fat_total_g",
                      ].map((id) => {
                        const n = p.summary[id];
                        return (
                          <div key={id}>
                            <dt>
                              {
                                foodReference.nutrientRegistry.find(
                                  (r) => r.id === id,
                                )?.label
                              }
                            </dt>
                            <dd>
                              {n?.value != null
                                ? `${new Intl.NumberFormat("en", { maximumSignificantDigits: 3 }).format(n.value)} ${n.unit}`
                                : n?.status === "trace"
                                  ? "Trace"
                                  : n?.status === "not_detected"
                                    ? "Not detected"
                                    : "Not available"}
                              {n?.value != null && (
                                <small>{words(n.status)}</small>
                              )}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                    <p className="muted">
                      {p.completeness} numeric nutrients ·{" "}
                      {p.sources
                        .map(
                          (id) =>
                            foodReference.sourceRegistry.find(
                              (s) => s.id === id,
                            )?.release,
                        )
                        .join(", ")}
                    </p>
                    <label className="food-check">
                      <input
                        type="checkbox"
                        checked={compare.includes(p.id)}
                        disabled={
                          !compare.includes(p.id) && compare.length >= 4
                        }
                        onChange={(e) =>
                          setCompare(
                            e.target.checked
                              ? [...compare, p.id]
                              : compare.filter((id) => id !== p.id),
                          )
                        }
                      />
                      Compare {f.name}, {p.label}
                    </label>
                  </article>
                ))}
              </div>
              <div className="food-pagination">
                <button
                  className="button secondary"
                  disabled={query.page <= 1}
                  onClick={() => onChange({ ...query, page: query.page - 1 })}
                >
                  Previous page
                </button>
                <span>
                  Page {query.page} of{" "}
                  {Math.max(1, Math.ceil(results.total / 30))}
                </span>
                <button
                  className="button secondary"
                  disabled={query.page * 30 >= results.total}
                  onClick={() => onChange({ ...query, page: query.page + 1 })}
                >
                  Next page
                </button>
              </div>
            </>
          ) : (
            <EmptyState
              title={
                entries.length
                  ? "No reviewed profiles match."
                  : "Reviewed food profiles are being prepared."
              }
              description="Draft food identities have no verified nutrient values. They appear here only after source matching, numeric checks and editorial review."
            >
              <button
                className="button secondary"
                onClick={() => onChange(parseFoodQuery({}))}
              >
                Clear food filters
              </button>
              <a className="button secondary" href="/foods/methodology">
                Read the methodology
              </a>
            </EmptyState>
          )}
        </div>
      </div>
      <InfoCallout title="Missing data stays missing">
        Not available, trace, and not detected are distinct from a
        source-reported numeric zero. Different preparation states remain
        separate profiles.
      </InfoCallout>
      {filters && (
        <FilterDialog
          query={query}
          change={change}
          close={() => setFilters(false)}
        />
      )}
    </div>
  );
}
