import { useEffect, useRef, useState } from "react";
import { usePreferences } from "../../components/app-shell/preferences";
import { PageHeader } from "../../components/common/page-header";
import { EmptyState } from "../../components/common/states";
import { InfoCallout } from "../../components/common/primitives";
import { nutrientReference } from "./schema";
import { nutrientIndex, type NutrientIndexEntry } from "./public-index";
import {
  parseNutrientQuery,
  searchNutrients,
  type NutrientQuery,
} from "./query";
const words = (s: string) => s.replaceAll("_", " ");
function Filters({
  query,
  change,
}: {
  query: NutrientQuery;
  change: (q: Partial<NutrientQuery>) => void;
}) {
  return (
    <div className="nutrient-filter-fields">
      <label>
        Topic group
        <select
          aria-label="Topic group"
          value={query.group}
          onChange={(e) => change({ group: e.target.value })}
        >
          <option value="">All groups</option>
          {nutrientReference.groups.map((g) => (
            <option value={g.id} key={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Classification
        <select
          aria-label="Classification"
          value={query.essentiality}
          onChange={(e) => change({ essentiality: e.target.value })}
        >
          <option value="">All classifications</option>
          {[
            "essential",
            "essential_class",
            "essential_family",
            "vitamin_form",
            "vitamin_precursor",
            "beneficial_component",
            "beneficial_trace_element",
            "reference_framework_dependent",
            "nonessential",
            "nonessential_measure",
            "not_a_nutrient",
          ].map((id) => (
            <option key={id} value={id}>
              {words(id)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Reference information available
        <select
          aria-label="Reference information available"
          value={query.framework}
          onChange={(e) => change({ framework: e.target.value })}
        >
          <option value="">Any framework</option>
          {nutrientReference.referenceFrameworks.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Verified food data
        <select
          aria-label="Verified food data"
          value={query.food}
          onChange={(e) =>
            change({ food: e.target.value as NutrientQuery["food"] })
          }
        >
          <option value="all">Any availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Not available</option>
        </select>
      </label>
    </div>
  );
}
function FilterDialog({
  query,
  change,
  close,
}: {
  query: NutrientQuery;
  change: (q: Partial<NutrientQuery>) => void;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null,
      dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      window.setTimeout(() => {
        if (opener?.isConnected) opener.focus();
      }, 0);
    };
  }, []);
  return (
    <dialog
      className="filter-dialog"
      ref={ref}
      onCancel={close}
      aria-labelledby="nutrient-filter-title"
    >
      <div className="dialog-heading">
        <h2 id="nutrient-filter-title">Nutrient filters</h2>
        <button className="button secondary" onClick={close}>
          Close
        </button>
      </div>
      <Filters query={query} change={change} />
      <button className="button primary" onClick={close}>
        Show topics
      </button>
    </dialog>
  );
}
export function NutrientCatalogue({
  query,
  onChange,
  entries = nutrientIndex,
}: {
  query: NutrientQuery;
  onChange: (q: NutrientQuery) => void;
  entries?: NutrientIndexEntry[];
}) {
  const { hydrated } = usePreferences(),
    [filters, setFilters] = useState(false),
    [compare, setCompare] = useState<string[]>([]),
    results = searchNutrients(query, entries),
    change = (next: Partial<NutrientQuery>) => onChange({ ...query, ...next });
  return (
    <div className="page catalogue-page">
      <PageHeader
        title="Understand your nutrients."
        eyebrow="EAT / NUTRIENT LIBRARY"
        description="Explore nutrient concepts, forms and reviewed population references. Follow food data back to its source."
      />
      <nav className="nutrient-links" aria-label="Nutrient reference pages">
        <a href="/nutrients/reference-intakes">Reference Intake Explorer</a>
        <a href="/nutrients/frameworks">Reference frameworks</a>
        <a href="/nutrients/glossary">Glossary</a>
        <a href="/nutrients/methodology">Methodology</a>
      </nav>
      <div className="catalogue-toolbar">
        <label className="search-field">
          <input
            aria-label="Search nutrient topics"
            placeholder="Nutrient, vitamin number or abbreviation…"
            value={query.q}
            disabled={!hydrated}
            onChange={(e) => change({ q: e.target.value })}
          />
        </label>
        <button className="button secondary" onClick={(event) => { event.currentTarget.focus(); setFilters(true) }}>
          Nutrient filters
        </button>
        <label>
          Sort topics
          <select
            value={query.sort}
            aria-label="Sort topics"
            onChange={(e) =>
              change({ sort: e.target.value as NutrientQuery["sort"] })
            }
          >
            <option value="az">A–Z</option>
            <option value="group">Topic group</option>
          </select>
        </label>
      </div>
      <nav className="nutrient-groups" aria-label="Browse nutrient groups">
        {nutrientReference.groups.map((g) => (
          <a key={g.id} href={`/nutrients/categories/${g.id}`}>
            {g.label}
          </a>
        ))}
        <button
          className="filter-chip"
          aria-pressed={query.kind === "fat_component"}
          onClick={() =>
            change({
              kind: query.kind === "fat_component" ? "" : "fat_component",
            })
          }
        >
          Fat classes
        </button>
        <button
          className="filter-chip"
          aria-pressed={query.kind === "dietary_component"}
          onClick={() =>
            change({
              kind:
                query.kind === "dietary_component" ? "" : "dietary_component",
            })
          }
        >
          Dietary components
        </button>
      </nav>
      <div className="desktop-filter-fields">
        <Filters query={query} change={change} />
      </div>
      <div
        className="active-filters"
        role="group"
        aria-label="Active nutrient filters"
      >
        {(["group", "kind", "essentiality", "framework"] as const)
          .filter((k) => query[k])
          .map((k) => (
            <button
              key={k}
              className="filter-chip"
              onClick={() => change({ [k]: "" })}
            >
              Remove {words(k)}: {words(query[k])}
            </button>
          ))}
        <button
          className="text-button"
          onClick={() => onChange(parseNutrientQuery({}))}
        >
          Clear nutrient filters
        </button>
      </div>
      <p role="status">{results.length} reviewed nutrient topics</p>
      {compare.length > 0 && (
        <div className="nutrient-compare-tray">
          <span>{compare.length} of 4 selected</span>
          {compare.length >= 2 && (
            <a
              className="button secondary"
              href={`/nutrients/compare?topics=${compare.join(",")}`}
            >
              Compare concepts
            </a>
          )}
          <button className="text-button" onClick={() => setCompare([])}>
            Clear comparison
          </button>
        </div>
      )}
      {results.length ? (
        <div className="entity-grid">
          {results.map((n) => (
            <article className="entity-card" key={n.id}>
              <small>
                {nutrientReference.groups.find((g) => g.id === n.group)?.label}
              </small>
              <a href={`/nutrients/${n.slug}`}>
                <h2>{n.name}</h2>
              </a>
              <p>{n.aliases.slice(0, 2).join(" · ")}</p>
              <p>
                {n.unit} · {words(n.essentiality)}
              </p>
              <small>
                {n.frameworks.length
                  ? `${n.frameworks.length} reference frameworks`
                  : "Reference values not available"}{" "}
                · {n.foodCoverage} reviewed food profiles
              </small>
              <label className="food-check">
                <input
                  type="checkbox"
                  checked={compare.includes(n.id)}
                  disabled={!compare.includes(n.id) && compare.length >= 4}
                  onChange={(e) =>
                    setCompare(
                      e.target.checked
                        ? [...compare, n.id]
                        : compare.filter((id) => id !== n.id),
                    )
                  }
                />
                Compare {n.name}
              </label>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            entries.length
              ? "No reviewed topics match."
              : "Reviewed nutrient articles are being prepared."
          }
          description="Stable topic identities stay hidden until their functions, forms, sources, reference values and medical boundaries pass review."
        >
          <a className="button secondary" href="/nutrients/frameworks">
            Explore reference frameworks
          </a>
        </EmptyState>
      )}
      <InfoCallout title="Reference values need context">
        A framework's value type, unit, population and version travel with every
        reference. The encyclopedia does not diagnose deficiencies or prescribe
        supplements.
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
