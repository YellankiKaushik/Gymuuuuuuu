import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "../../components/common/page-header";
import { InfoCallout } from "../../components/common/primitives";
import { usePreferences } from "../../components/app-shell/preferences";
import {
  dietReference,
  isCurrentFormula,
  defaultDietSettings,
  type DietBackup,
  type DietPlan,
} from "./domain";
import {
  readDietBackup,
  mutateDietPlans,
  watchDietChanges,
  exportDietBackup,
  exportDietCsv,
  previewDietImport,
  downloadDietFile,
} from "./storage";
import {
  boundaryText,
  DietSources,
  DietResult,
  MealSummary,
  EquationText,
  RecalculateDietButton,
} from "./workspace";

function useDietRecords() {
  const [backup, setBackup] = useState<DietBackup>(),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      void readDietBackup()
        .then((value) => {
          if (active) {
            setBackup(value);
            setError("");
            setLoading(false);
          }
        })
        .catch((reason) => {
          if (active) {
            setError(
              reason instanceof Error
                ? reason.message
                : "Could not read plans.",
            );
            setLoading(false);
          }
        });
    };
    refresh();
    const unsubscribe = watchDietChanges(refresh);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  return { backup, error, loading };
}
export function DietOverview() {
  const { backup, error, loading } = useDietRecords(),
    current = backup?.plans.find((p) => p.status === "current");
  return (
    <div className="page diet-page">
      <PageHeader
        title="Diet planning"
        eyebrow="EAT / LOCAL WORKSPACE"
        description="A transparent starting estimate for healthy adults, with explicit assumptions and optional local plans."
      />
      <InfoCallout title="Eligibility">{boundaryText}</InfoCallout>
      <div className="actions">
        <Link to="/diet-planning/energy" className="button primary">
          Start planning
        </Link>
        <Link to="/diet-planning/plans" className="button secondary">
          Saved plans
        </Link>
      </div>
      <p role="status">{loading ? "Loading device-local plans…" : error}</p>
      {current ? (
        <DietResult plan={current} />
      ) : (
        !loading &&
        !error && (
          <section className="diet-result">
            <h2>No current plan</h2>
            <p>
              Calculate without saving, or select a saved plan as current.
              Population references and your chosen targets remain distinct.
            </p>
          </section>
        )
      )}
      <p>
        Plans stay on this browser. Clearing site data removes them unless you
        have a backup.
      </p>
    </div>
  );
}
export function DietInformation({ kind }: { kind: "methodology" | "safety" }) {
  return (
    <div className="page diet-page">
      <PageHeader
        title={
          kind === "safety"
            ? "Planning safety boundaries"
            : "Diet planning methodology"
        }
        eyebrow="EAT / METHODS"
        description="Know what the calculation represents before using its output."
      />
      {kind === "safety" ? (
        <>
          <InfoCallout title="Unsupported uses">{boundaryText}</InfoCallout>
          <p>
            Available for ages {dietReference.populationScope.minimumAgeYears}–
            {dietReference.populationScope.maximumAgeYears}, nonpregnant and
            nonlactating adults. Required measurements and the equation sex
            variable must be entered explicitly.
          </p>
          <p>
            Targets below {dietReference.safetyRules.absoluteMinimumKcalPerDay}{" "}
            kcal/day are blocked. This minimum is a software boundary, not a
            guarantee of nutritional adequacy. Fat-loss planning is blocked
            below BMI{" "}
            {dietReference.safetyRules.blockLossGoalWhenCurrentBmiBelow}; goal
            weights below that boundary are also blocked.
          </p>
          <p>
            BMI cannot distinguish muscle from fat and is not a diagnosis.
            Higher BMI brings contextual review, never a condition-specific
            diet. The planner collects no diagnosis history.
          </p>
          <p>
            Percentage adjustments do not forecast a date. Workouts do not add
            calories to the target. A single weigh-in never changes a saved
            plan.
          </p>
        </>
      ) : (
        <>
          <nav aria-label="Methodology contents" className="diet-nav">
            <a href="#energy">Energy equations</a>
            <a href="#allocation">Allocation</a>
            <a href="#versions">Versions</a>
            <a href="#sources">Sources</a>
          </nav>
          <section id="energy">
            <h2>NASEM 2023 adult EER</h2>
            <p>
              Age in years, height in cm and weight in kg are used directly in
              sex- and activity-specific equations. No activity multiplier is
              added. PAL covers all daily activity, not just workouts.
            </p>
            {(["male", "female"] as const).map((sex) => (
              <section key={sex}>
                <h3>{sex === "male" ? "Male" : "Female"} source equations</h3>
                {dietReference.activityCategories.map((c) => (
                  <div key={c.id}>
                    <h4>
                      {c.label} (PAL {c.palMin} to less than {c.palMaxExclusive}
                      )
                    </h4>
                    <EquationText
                      sex={sex}
                      activity={
                        c.id as
                          "inactive" | "active" | "low_active" | "very_active"
                      }
                    />
                  </div>
                ))}
                <p>
                  Model RMSE{" "}
                  {dietReference.energyModel.performance[sex].rmseKcalPerDay}{" "}
                  kcal/day; reported mean absolute percentage error
                  approximately{" "}
                  {dietReference.energyModel.performance[sex].mapePercent}%. A
                  model-performance statistic is not a guaranteed personal
                  confidence interval.
                </p>
              </section>
            ))}
            <p>
              Unrounded maintenance is preserved. Goal adjustments use that
              value; energy headlines round to the nearest 25 kcal afterward.
              Macros use the rounded daily target to reconcile its energy
              budget. Weight trends over time provide context; this phase does
              not calibrate targets.
            </p>
          </section>
          <section id="allocation">
            <h2>Allocation and units</h2>
            <p>
              Protein uses an explicit calculation weight and selected source
              context. Fat uses an energy percentage; carbohydrate uses the
              remaining energy. Energy per gram: protein{" "}
              {dietReference.macroRules.energyPerGramKcal.protein}, carbohydrate{" "}
              {dietReference.macroRules.energyPerGramKcal.carbohydrate}, fat{" "}
              {dietReference.macroRules.energyPerGramKcal.fat} kcal.
            </p>
            <p>
              Fibre benchmark: {dietReference.macroRules.fiberGramsPer1000Kcal}{" "}
              g per 1000 kcal. This is separate from population-specific age/sex
              reference data. No bodyweight water formula is used.
            </p>
            <p>
              Adult AMDR context:{" "}
              {Object.entries(dietReference.macroRules.adultAmdrPercentEnergy)
                .map(([key, r]) => `${key} ${r.min}–${r.max}%`)
                .join("; ")}
              . Allocations outside the selected reference range are labelled;
              they are not forced into range.
            </p>
            <p>
              Even meals resolve rounding in the final slot. Custom percentages
              or grams must reconcile. Even distribution is a planning
              convenience. No food menu is generated.
            </p>
          </section>
          <section id="versions">
            <h2>Saved snapshots and consent</h2>
            <p>
              Formula set phase09_diet_targets v{dietReference.schemaVersion};
              model {dietReference.energyModel.id} v
              {dietReference.energyModel.version}. Old versions keep their saved
              results. Duplicate and recalculate requires stored or fresh inputs
              and a fresh eligibility acknowledgement.
            </p>
            <p>
              Personal inputs are stored only if you choose that option.
              Redacted plans retain targets, source IDs and versions, with no
              hidden reconstruction of inputs. Imports are validated before a
              transaction; conflicting replacement requires confirmation. Macro
              reconciliation tolerance is 5 kcal and meal total mass tolerance
              is 0.1 g.
            </p>
          </section>
        </>
      )}
      <section id="sources">
        <h2>Source register</h2>
        <DietSources
          ids={
            kind === "safety"
              ? ["nasem_energy_2023", "niddk_body_weight_planner"]
              : [
                  "nasem_energy_2023",
                  "niddk_body_weight_planner",
                  "nasem_macronutrients_2005",
                  "issn_protein_2017",
                  "acsm_nutrition_performance_2016",
                ]
          }
        />
        <p>
          Energy equations, constants and activity-model limitations are linked
          to the primary reference materials.
          Engineering source checking is distinct from professional review of
          your circumstances.
        </p>
      </section>
    </div>
  );
}
export function DietPlans({ planId }: { planId?: string }) {
  const { backup, error, loading } = useDietRecords(),
    { hydrated } = usePreferences(),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState<string[]>([]),
    [includeInputs, setIncludeInputs] = useState(false),
    [preview, setPreview] = useState<ReturnType<typeof previewDietImport>>(),
    [conflictMode, setConflictMode] = useState<"keep" | "replace">("keep"),
    [pending, setPending] = useState<{
      action: "deleted" | "archived" | "set_current";
      plan: DietPlan;
    }>(),
    [edit, setEdit] = useState<DietPlan>();
  const plan = planId ? backup?.plans.find((p) => p.id === planId) : undefined;
  const feedbackRequest = useRef(0);
  useEffect(
    () => () => {
      feedbackRequest.current++;
    },
    [],
  );
  async function action(operation: () => Promise<void>, success: string) {
    const request = ++feedbackRequest.current;
    setBusy(true);
    try {
      await operation();
      if (request === feedbackRequest.current) setMessage(success);
      return true;
    } catch (reason) {
      if (request === feedbackRequest.current)
        setMessage(
          reason instanceof Error
            ? reason.message
            : "Operation failed. Existing plans were preserved.",
        );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function exportFile(format: "json" | "csv") {
    if (!backup) return;
    const request = ++feedbackRequest.current;
    try {
      downloadDietFile(
        format === "json"
          ? exportDietBackup(backup, includeInputs)
          : exportDietCsv(backup),
        `fitness-os-diet-plans.${format}`,
        format === "json" ? "application/json" : "text/csv",
      );
      await mutateDietPlans({ action: "exported" });
      if (request === feedbackRequest.current)
        setMessage(
          "Export prepared locally. Keep a safe copy of the downloaded file.",
        );
    } catch (reason) {
      if (request === feedbackRequest.current)
        setMessage(reason instanceof Error ? reason.message : "Export failed.");
    }
  }
  return (
    <div className="page diet-page">
      <PageHeader
        title={planId ? "Saved diet plan" : "Saved diet plans"}
        eyebrow="EAT / DEVICE-LOCAL"
        description="Versioned target snapshots. Selecting a current plan preserves other plans."
      />
      <p role="status">{loading ? "Loading local plans…" : error || message}</p>
      {!loading && !error && planId && !plan && (
        <InfoCallout title="Plan not found">
          This plan is unavailable in this browser.{" "}
          <Link to="/diet-planning/plans">Return to saved plans</Link>.
        </InfoCallout>
      )}
      {plan && (
        <>
          <h2>{plan.name}</h2>
          <p>
            Status: {plan.status}. Created {plan.createdAt}. Updated{" "}
            {plan.updatedAt}.
          </p>
          {!isCurrentFormula(plan) && (
            <InfoCallout title="Older formula version">
              This plan was calculated with an older formula version. Its
              results are preserved. Duplicate and recalculate to use the
              current formulas.
            </InfoCallout>
          )}
          <DietResult plan={plan} />
          <MealSummary plan={plan} />
          {plan.dietPreferences && (
            <p>
              Plan pattern: {plan.dietPreferences.pattern ?? "unspecified"};
              cuisines:{" "}
              {plan.dietPreferences.cuisinePreferences?.join(", ") ||
                "none entered"}
              ; exclusions:{" "}
              {plan.dietPreferences.excludedFoodIds?.join(", ") ||
                "none entered"}
              ; allergy note:{" "}
              {plan.dietPreferences.allergenNotes ?? "none entered"}. No
              allergen-safety guarantee.
            </p>
          )}
          <div className="actions">
            <RecalculateDietButton plan={plan} />
            <button
              disabled={busy}
              onClick={() => {
                void action(
                  () =>
                    mutateDietPlans({
                      action: "created",
                      plan: {
                        ...plan,
                        id: `dietplan_${crypto.randomUUID()}`,
                        name: (plan.name + " copy").slice(0, 100),
                        status: "saved",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      },
                    }),
                  "Snapshot duplicated; original preserved.",
                );
              }}
            >
              Duplicate snapshot
            </button>
            <button disabled={busy} onClick={() => setEdit(plan)}>
              Edit name and notes
            </button>
            {plan.status !== "current" && (
              <button
                onClick={() => setPending({ action: "set_current", plan })}
              >
                Set current
              </button>
            )}
            <button onClick={() => setPending({ action: "archived", plan })}>
              Archive
            </button>
            <button onClick={() => setPending({ action: "deleted", plan })}>
              Delete
            </button>
          </div>
          <p>{plan.notes}</p>
        </>
      )}
      {!planId && backup && (
        <>
          <section className="diet-plan-list">
            <h2>Plans ({backup.plans.length})</h2>
            {backup.plans.length === 0 ? (
              <p>
                No saved plans.{" "}
                <Link to="/diet-planning/energy">Start planning</Link>.
              </p>
            ) : (
              backup.plans.map((p) => (
                <article className="diet-result" key={p.id}>
                  <h3>
                    <Link
                      to="/diet-planning/plans/$planId"
                      params={{ planId: p.id }}
                    >
                      {p.name}
                    </Link>
                  </h3>
                  <p>
                    {p.status} · {p.goal.replaceAll("_", " ")} ·{" "}
                    {p.energy.targetKcal} kcal/day
                  </p>
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      disabled={
                        !selected.includes(p.id) && selected.length >= 4
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, p.id]
                            : selected.filter((id) => id !== p.id),
                        )
                      }
                    />
                    Compare {p.name}
                  </label>
                </article>
              ))
            )}
          </section>
          {selected.length >= 2 && (
            <section className="diet-result">
              <h2>Plan comparison</h2>
              <div
                className="diet-table"
                tabIndex={0}
                role="region"
                aria-label="Plan comparison table"
              >
                <table>
                  <caption>Saved snapshots, same daily target units</caption>
                  <thead>
                    <tr>
                      <th scope="col">Plan</th>
                      <th scope="col">Energy kcal</th>
                      <th scope="col">Protein g</th>
                      <th scope="col">Fat g</th>
                      <th scope="col">Carbohydrate g</th>
                      <th scope="col">Formula</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backup.plans
                      .filter((p) => selected.includes(p.id))
                      .map((p) => (
                        <tr key={p.id}>
                          <th scope="row">{p.name}</th>
                          <td>{p.energy.targetKcal}</td>
                          <td>{p.macros.protein.selected.toFixed(1)}</td>
                          <td>{p.macros.fat.selected.toFixed(1)}</td>
                          <td>{p.macros.carbohydrate.selected.toFixed(1)}</td>
                          <td>{p.provenance.formulaSetVersion}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <section className="diet-result">
            <h2>Backup and restore</h2>
            <label>
              <input
                type="checkbox"
                checked={includeInputs}
                onChange={(e) => setIncludeInputs(e.target.checked)}
              />
              Include stored personal inputs in JSON export (CSV contains
              targets only)
            </label>
            <div className="actions">
              <button disabled={busy} onClick={() => void exportFile("json")}>
                Export JSON backup
              </button>
              <button disabled={busy} onClick={() => void exportFile("csv")}>
                Export CSV summary
              </button>
            </div>
            <label>
              Preview JSON backup
              <input
                type="file"
                accept=".json,application/json"
                disabled={busy}
                onChange={(e) => {
                  const request = ++feedbackRequest.current;
                  const file = e.target.files?.[0];
                  setPreview(undefined);
                  setMessage("");
                  if (file) {
                    if (file.size > 20 * 1024 * 1024) {
                      setMessage("Backup exceeds the 20 MB import limit.");
                      return;
                    }
                    void file
                      .text()
                      .then((text) => {
                        if (request !== feedbackRequest.current) return;
                        setPreview(previewDietImport(text, backup));
                        setMessage("Backup validated. No records written yet.");
                      })
                      .catch(() => {
                        if (request !== feedbackRequest.current) return;
                        setMessage(
                          "Backup could not be read or validated. Choose a valid Fitness OS JSON backup. No saved plans were changed.",
                        );
                      });
                  }
                }}
              />
            </label>
            {preview && (
              <div>
                <h3>Import preview</h3>
                <p>
                  {preview.backup.plans.length} plans;{" "}
                  {preview.conflicts.length} ID conflicts. Existing unrelated
                  plans will be retained.
                </p>
                <label>
                  Conflicting IDs
                  <select
                    value={conflictMode}
                    onChange={(e) =>
                      setConflictMode(e.target.value as "keep" | "replace")
                    }
                  >
                    <option value="keep">
                      Keep existing records and current plan
                    </option>
                    <option value="replace">
                      Replace matching IDs and select imported current plan
                    </option>
                  </select>
                </label>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (
                      conflictMode === "replace" &&
                      !window.confirm(
                        "Replace matching plan snapshots and update the current plan? Export a backup first.",
                      )
                    )
                      return;
                    void action(
                      () =>
                        mutateDietPlans({
                          action: "imported",
                          backup: preview.backup,
                          conflicts: conflictMode,
                        }),
                      "Import saved locally. Unrelated plans retained.",
                    ).then((ok) => {
                      if (ok) setPreview(undefined);
                    });
                  }}
                >
                  Restore validated backup
                </button>
                <button onClick={() => setPreview(undefined)}>
                  Cancel import
                </button>
              </div>
            )}
          </section>
        </>
      )}
      {pending && (
        <section className="diet-result" aria-label="Confirm plan action">
          <h2>Confirm {pending.action.replaceAll("_", " ")}</h2>
          <p>
            {pending.action === "deleted"
              ? "Permanently remove this plan? Export a backup first."
              : pending.action === "archived"
                ? "Archive this plan? If current, no plan will remain selected."
                : "Make this the current target? The previous plan remains saved."}{" "}
            {pending.plan.name}
          </p>
          <div className="actions">
            <button
              disabled={busy}
              onClick={() =>
                void action(
                  () =>
                    mutateDietPlans({
                      action: pending.action,
                      planId: pending.plan.id,
                      expectedUpdatedAt: pending.plan.updatedAt,
                    }),
                  "Plan action saved on this device.",
                ).then((ok) => {
                  if (ok) setPending(undefined);
                })
              }
            >
              Confirm {pending.action.replaceAll("_", " ")}
            </button>
            <button disabled={busy} onClick={() => setPending(undefined)}>
              Cancel
            </button>
          </div>
        </section>
      )}
      {edit && (
        <section className="diet-result">
          <h2>Edit saved metadata</h2>
          <label>
            Plan name
            <input
              maxLength={100}
              value={edit.name}
              onChange={(e) => setEdit({ ...edit, name: e.target.value })}
            />
          </label>
          <label>
            Notes
            <textarea
              maxLength={2000}
              value={edit.notes ?? ""}
              onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
            />
          </label>
          <p>
            Targets remain a snapshot. Use Duplicate and recalculate to change
            assumptions.
          </p>
          <div className="actions">
            <button
              disabled={busy || !hydrated}
              onClick={() =>
                void action(
                  () =>
                    mutateDietPlans({
                      action: "updated",
                      plan: edit,
                      expectedUpdatedAt: edit.updatedAt,
                    }),
                  "Metadata saved; calculation preserved.",
                ).then((ok) => {
                  if (ok) setEdit(undefined);
                })
              }
            >
              Save metadata
            </button>
            <button onClick={() => setEdit(undefined)}>Cancel</button>
          </div>
        </section>
      )}
    </div>
  );
}
export { defaultDietSettings };
