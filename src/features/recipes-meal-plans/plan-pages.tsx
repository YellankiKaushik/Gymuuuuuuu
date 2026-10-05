import { useState } from "react";
import { foodIndex, getFoodProfile } from "../foods/repository";
import {
  createCanonicalFoodLogSnapshot,
  exactMassAmount,
} from "../nutrition-tracker/domain";
import { recipeExclusionWarnings } from "./publication";
import { useRecipes } from "./workspace";
import { mealPlanDraft } from "./editor";
import {
  saveMealPlanVersion,
  archiveRecipeEntity,
  saveGroceryList,
  updateGroceryItem,
} from "./storage";
import {
  recalculateMealPlan,
  plannedRecipeItem,
  plannedFoodItem,
  planDates,
  aggregateGroceryRequirements,
  comparePlanWithTarget,
  allocateBatchServings,
  mealPlanInsights,
  compareMealPlanReferences,
} from "./domain";
import {
  newNutritionId,
  localDateAt,
  createCustomFoodLogSnapshot,
  bindDayTargetSnapshot,
} from "../nutrition-tracker/domain";
import { readDietBackup } from "../diet-planning/storage";
import { useRecipeNutrition, RecipeLogForm, formatRecipeValue } from "./pages";
import {
  plannedItemSchema,
  type MealPlanVersion,
  type PlannedItem,
  type Batch,
} from "./schema";
export function PlanCatalogue() {
  const { data, run, readOnly } = useRecipes();
  const [archived, setArchived] = useState(false);
  if (!data) return <p role="status">Loading meal plans…</p>;
  return (
    <>
      <p>
        Build a calendar manually. Planned nutrition remains separate from the
        consumed diary.
      </p>
      <a className="button primary" href="/meal-plans/create">
        Create meal plan
      </a>{" "}
      <a className="button secondary" href="/meal-plans/templates">
        Template matcher
      </a>
      <label>
        <input
          type="checkbox"
          checked={archived}
          onChange={(e) => setArchived(e.target.checked)}
        />{" "}
        Show archived plans
      </label>
      <div className="recipe-grid">
        {data.mealPlanIdentities
          .filter((p) => p.status === (archived ? "archived" : "active"))
          .map((p) => {
            const v = data.mealPlanVersions.find(
              (v) => v.id === p.currentVersionId,
            )!;
            return (
              <article className="recipe-card" key={p.id}>
                <h2>
                  <a href={`/meal-plans/${p.id}`}>{p.title}</a>
                </h2>
                <p>
                  {v.startDate} · {v.dayCount} days · Version {v.versionNumber}{" "}
                  · {v.summary.completeness}
                </p>
                <button
                  className="button secondary"
                  disabled={readOnly}
                  onClick={() => {
                    if (
                      window.confirm(
                        `${archived ? "Reactivate" : "Archive"} this plan? All versions are retained.`,
                      )
                    )
                      void run(
                        () => archiveRecipeEntity("meal_plan", p.id, !archived),
                        "Meal-plan status updated.",
                      );
                  }}
                >
                  {archived ? "Reactivate" : "Archive"}
                </button>
              </article>
            );
          })}
      </div>
    </>
  );
}
export function PlanCreate() {
  const { data, run, readOnly } = useRecipes();
  const [title, setTitle] = useState(""),
    [date, setDate] = useState(""),
    [days, setDays] = useState("7");
  if (!data) return <p role="status">Loading meal-plan settings…</p>;
  return (
    <form
      className="recipe-form"
      onSubmit={(e) => {
        e.preventDefault();
        void run(async () => {
          const p = mealPlanDraft(
              title.trim(),
              date,
              Number(days),
              Intl.DateTimeFormat().resolvedOptions().timeZone,
              data.preferences.defaultMealSlots,
            ),
            now = new Date().toISOString();
          const saved = await saveMealPlanVersion(
            {
              id: p.mealPlanId,
              schemaVersion: 1,
              title: p.title,
              currentVersionId: p.id,
              status: "active",
              createdAt: now,
              updatedAt: now,
            },
            p,
            [],
          );
          window.location.assign(`/meal-plans/${p.mealPlanId}`);
          return saved;
        }, "Meal plan created locally.");
      }}
    >
      <label>
        Plan title
        <input
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        Start date
        <input
          required
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <label>
        Number of days (1–28)
        <input
          required
          type="number"
          min="1"
          max="28"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
      </label>
      <button className="button primary" disabled={readOnly}>
        Create manual plan
      </button>
    </form>
  );
}
export function PlanDetail({ planId }: { planId: string }) {
  const { data } = useRecipes();
  const [versionId, setVersionId] = useState("");
  if (!data) return <p role="status">Loading meal plan…</p>;
  const identity = data.mealPlanIdentities.find((p) => p.id === planId),
    versions = data.mealPlanVersions.filter((p) => p.mealPlanId === planId),
    version = versions.find(
      (v) => v.id === (versionId || identity?.currentVersionId),
    );
  if (!version) return <p>This meal plan is unavailable on this browser.</p>;
  return (
    <>
      <label>
        View immutable version
        <select
          value={version.id}
          onChange={(e) => setVersionId(e.target.value)}
        >
          {versions.map((v) => (
            <option key={v.id} value={v.id}>
              Version {v.versionNumber}: {v.revisionReason}
            </option>
          ))}
        </select>
      </label>
      <PlanEditor key={version.id} original={version} />
    </>
  );
}
function PlanEditor({ original }: { original: MealPlanVersion }) {
  const { data, run, readOnly } = useRecipes(),
    nutrition = useRecipeNutrition();
  const [draft, setDraft] = useState(original),
    [batches, setBatches] = useState<Batch[]>(
      data?.batchInstances.filter((b) => b.mealPlanVersionId === original.id) ??
        [],
    ),
    [choice, setChoice] = useState("placeholder"),
    [name, setName] = useState(""),
    [quantity, setQuantity] = useState("1"),
    [date, setDate] = useState(original.startDate),
    [slot, setSlot] = useState(original.mealSlots[0]!),
    [reason, setReason] = useState(""),
    [error, setError] = useState(""),
    [copyDate, setCopyDate] = useState(original.startDate),
    [copyTo, setCopyTo] = useState(original.startDate),
    [logItem, setLogItem] = useState<PlannedItem | null>(null);
  if (!data) return null;
  const dates = planDates(draft.startDate, draft.dayCount),
    calculated = recalculateMealPlan(draft),
    identity = data.mealPlanIdentities.find(
      (i) => i.id === original.mealPlanId,
    )!;
  const updateItems = (items: PlannedItem[]) =>
    setDraft({ ...draft, plannedItems: items });
  const add = async () => {
    try {
      let item: PlannedItem;
      if (choice === "placeholder")
        item = plannedItemSchema.parse({
          id: newNutritionId("pitem"),
          localDate: date,
          mealSlotId: slot,
          kind: "placeholder",
          displayNameSnapshot: name.trim(),
          quantity: Number(quantity),
          quantityUnit: "unresolved",
          gramWeight: null,
          nutrients: [],
          completeness: "unavailable",
          loggedEntryIds: [],
        });
      else if (choice.startsWith("custom:")) {
        const f = nutrition?.customFoods.find((f) => f.id === choice.slice(7)),
          rev = nutrition?.customFoodRevisions.find(
            (r) => r.id === f?.currentRevisionId,
          );
        if (!f || !rev) throw Error("Custom food unavailable.");
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone,
          now = new Date().toISOString();
        item = plannedFoodItem(
          createCustomFoodLogSnapshot(
            rev,
            f.name,
            f.brand ?? null,
            Number(quantity),
            {
              localDate: localDateAt(new Date(), zone),
              timeZone: zone,
              occurredAtUtc: now,
              mealSlotId: slot,
              mealLabelSnapshot: slot,
              now,
            },
          ),
          date,
          slot,
          rev,
        );
      } else if (choice.startsWith("food:")) {
        const resolved = await getFoodProfile(choice.slice(5));
        if (!resolved) throw Error("Approved exact food profile unavailable.");
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone,
          now = new Date().toISOString();
        item = plannedFoodItem(
          createCanonicalFoodLogSnapshot(
            resolved.food,
            resolved.profile.profileId,
            exactMassAmount(Number(quantity), "g"),
            {
              localDate: localDateAt(new Date(), zone),
              timeZone: zone,
              occurredAtUtc: now,
              mealSlotId: slot,
              mealLabelSnapshot: slot,
              now,
            },
          ),
          date,
          slot,
        );
      } else {
        const r = data.recipeVersions.find((r) => r.id === choice.slice(7));
        if (!r) throw Error("Recipe version unavailable.");
        item = plannedRecipeItem(r, Number(quantity), date, slot);
      }
      updateItems([...draft.plannedItems, item]);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Planned item invalid.",
      );
    }
  };
  const editQuantity = (item: PlannedItem, value: number) => {
    if (!Number.isFinite(value) || value <= 0 || item.batchAllocationId) return;
    const factor = value / item.quantity;
    updateItems(
      draft.plannedItems.map((i) =>
        i.id === item.id
          ? {
              ...i,
              quantity: value,
              gramWeight: i.gramWeight ? i.gramWeight * factor : i.gramWeight,
              nutrients: i.nutrients.map((n) => ({
                ...n,
                value: n.value === null ? null : n.value * factor,
              })),
            }
          : i,
      ),
    );
  };
  const save = () =>
    void run(async () => {
      if (!reason.trim()) throw Error("Record a reason for the new version.");
      const id = newNutritionId("mpver"),
        batchMap = new Map(batches.map((b) => [b.id, newNutritionId("batch")])),
        now = new Date().toISOString(),
        v = recalculateMealPlan({
          ...draft,
          id,
          versionNumber:
            Math.max(
              ...data.mealPlanVersions
                .filter((v) => v.mealPlanId === original.mealPlanId)
                .map((v) => v.versionNumber),
            ) + 1,
          batchIds: batches.map((b) => batchMap.get(b.id)!),
          createdAt: now,
          revisionReason: reason,
          summary: { ...draft.summary, calculatedAt: now },
        });
      return saveMealPlanVersion(
        { ...identity, title: v.title, currentVersionId: id, updatedAt: now },
        v,
        batches.map((b) => ({
          ...b,
          id: batchMap.get(b.id)!,
          mealPlanVersionId: id,
        })),
        identity.updatedAt,
      );
    }, "New meal-plan version saved. Historical nutrition is retained.");
  return (
    <>
      <h2>{draft.title}</h2>
      <p>
        Choose a recipe/custom-food serving count or an approved food mass in
        grams. Exclusions are informational and never certify medical or
        allergen safety.
      </p>
      <ul>
        {[
          ...new Set(
            draft.plannedItems.flatMap((item) => {
              const recipe = data.recipeVersions.find(
                (v) => v.id === item.recipeRef?.recipeVersionId,
              );
              return recipe
                ? recipeExclusionWarnings(
                    recipe,
                    data.preferences.excludedIngredientIds ?? [],
                    data.preferences.excludedAllergenTags ?? [],
                  )
                : item.kind === "placeholder"
                  ? ["Unresolved planned ingredients; exclusions are unknown."]
                  : [];
            }),
          ),
        ].map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <div className="actions">
        <a
          className="button secondary"
          href={`/meal-plans/${original.mealPlanId}/grocery-list`}
        >
          Grocery lists
        </a>
        <button className="button secondary" onClick={() => window.print()}>
          Print calendar
        </button>
        <button
          className="button secondary"
          disabled={readOnly}
          onClick={() =>
            void run(async () => {
              const p = recalculateMealPlan({
                  ...draft,
                  id: newNutritionId("mpver"),
                  mealPlanId: newNutritionId("mplan"),
                  versionNumber: 1,
                  batchIds: [],
                  plannedItems: draft.plannedItems.map((i) => ({
                    ...i,
                    id: newNutritionId("pitem"),
                    batchAllocationId: null,
                    loggedEntryIds: [],
                  })),
                  title: `${draft.title} copy`.slice(0, 200),
                  revisionReason: "Duplicated manually",
                }),
                now = new Date().toISOString();
              return saveMealPlanVersion(
                {
                  id: p.mealPlanId,
                  schemaVersion: 1,
                  title: p.title,
                  currentVersionId: p.id,
                  status: "active",
                  createdAt: now,
                  updatedAt: now,
                },
                p,
                [],
              );
            }, "Independent plan copy saved.")
          }
        >
          Duplicate plan
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <fieldset className="recipe-form no-print">
        <legend>Add planned item</legend>
        <label>
          Item
          <select
            aria-label="Item"
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
          >
            <option value="placeholder">Unresolved placeholder</option>
            {foodIndex.flatMap((f) =>
              f.profiles.map((p) => (
                <option key={p.id} value={`food:${p.id}`}>
                  {f.name} · {p.state} · grams
                </option>
              )),
            )}
            {data.recipeIdentities
              .filter((r) => r.status === "active")
              .map((r) => (
                <option key={r.id} value={`recipe:${r.currentVersionId}`}>
                  {r.title} · current recipe version
                </option>
              ))}
            {nutrition?.customFoods
              .filter((f) => f.status === "active")
              .map((f) => (
                <option key={f.id} value={`custom:${f.id}`}>
                  {f.name} · custom-food serving
                </option>
              ))}
          </select>
        </label>
        {choice === "placeholder" && (
          <label>
            Placeholder name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <label>
          Serving equivalents / quantity
          <input
            type="number"
            min="0.001"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
        <label>
          Day
          <select value={date} onChange={(e) => setDate(e.target.value)}>
            {dates.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Meal
          <select value={slot} onChange={(e) => setSlot(e.target.value)}>
            {draft.mealSlots.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <button
          className="button secondary"
          type="button"
          disabled={readOnly}
          onClick={add}
        >
          Add planned item
        </button>
      </fieldset>
      <div className="recipe-grid">
        {dates.map((day) => (
          <section className="recipe-card" key={day}>
            <h3>{day}</h3>
            {draft.plannedItems
              .filter((i) => i.localDate === day)
              .map((item) => (
                <article className="planned-item" key={item.id}>
                  <h4>{item.displayNameSnapshot}</h4>
                  <p>
                    {item.mealSlotId.replace(/^meal_/, "").replaceAll("_", " ")}{" "}
                    · {item.completeness}
                    {item.batchAllocationId ? " · batch allocation" : ""}
                  </p>
                  <p>
                    {
                      data.consumptionIntents.filter(
                        (i) =>
                          i.planVersionId === original.id &&
                          i.plannedItemId === item.id &&
                          i.stage === "committed",
                      ).length
                    }{" "}
                    committed consumed-entry links. The planned nutrition is
                    unchanged.
                  </p>
                  <label>
                    Quantity
                    <input
                      aria-label={`Quantity for ${item.displayNameSnapshot}`}
                      type="number"
                      step="any"
                      min="0.001"
                      disabled={!!item.batchAllocationId}
                      value={item.quantity}
                      onChange={(e) =>
                        editQuantity(item, Number(e.target.value))
                      }
                    />
                  </label>
                  <label>
                    Move to day
                    <select
                      value={item.localDate}
                      disabled={!!item.batchAllocationId}
                      onChange={(e) =>
                        updateItems(
                          draft.plannedItems.map((i) =>
                            i.id === item.id
                              ? { ...i, localDate: e.target.value }
                              : i,
                          ),
                        )
                      }
                    >
                      {dates.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Move to meal
                    <select
                      value={item.mealSlotId}
                      onChange={(e) =>
                        updateItems(
                          draft.plannedItems.map((i) =>
                            i.id === item.id
                              ? { ...i, mealSlotId: e.target.value }
                              : i,
                          ),
                        )
                      }
                    >
                      {draft.mealSlots.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Item note
                    <input
                      value={item.note ?? ""}
                      onChange={(e) =>
                        updateItems(
                          draft.plannedItems.map((i) =>
                            i.id === item.id
                              ? { ...i, note: e.target.value }
                              : i,
                          ),
                        )
                      }
                    />
                  </label>
                  <div className="actions">
                    <button
                      className="button secondary"
                      onClick={() =>
                        updateItems([
                          ...draft.plannedItems,
                          {
                            ...structuredClone(item),
                            id: newNutritionId("pitem"),
                            batchAllocationId: null,
                            loggedEntryIds: [],
                          },
                        ])
                      }
                    >
                      Duplicate item
                    </button>
                    <button
                      className="button secondary"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Remove this planned item from the draft?",
                          )
                        ) {
                          updateItems(
                            draft.plannedItems.filter((i) => i.id !== item.id),
                          );
                          setBatches(
                            batches.map((b) => ({
                              ...b,
                              allocations: b.allocations.filter(
                                (a) => a.plannedItemId !== item.id,
                              ),
                            })),
                          );
                        }
                      }}
                    >
                      Remove
                    </button>
                    {item.kind === "recipe" && (
                      <button
                        className="button secondary"
                        onClick={() => setLogItem(item)}
                      >
                        Log consumed…
                      </button>
                    )}
                    {item.recipeRef && !item.batchAllocationId && (
                      <button
                        className="button secondary"
                        onClick={() => {
                          const total = Number(
                            window.prompt(
                              "Total batch serving equivalents (at least the planned quantity)",
                              String(item.quantity),
                            ),
                          );
                          try {
                            allocateBatchServings(total, [item.quantity]);
                            const allocation = newNutritionId("alloc");
                            setBatches([
                              ...batches,
                              {
                                id: newNutritionId("batch"),
                                mealPlanVersionId: draft.id,
                                recipeVersionId:
                                  item.recipeRef!.recipeVersionId,
                                recipeSnapshot: item.recipeRef!,
                                productionDate: item.localDate,
                                totalServingEquivalents: total,
                                allocations: [
                                  {
                                    id: allocation,
                                    plannedItemId: item.id,
                                    servingEquivalents: item.quantity,
                                  },
                                ],
                              },
                            ]);
                            updateItems(
                              draft.plannedItems.map((i) =>
                                i.id === item.id
                                  ? { ...i, batchAllocationId: allocation }
                                  : i,
                              ),
                            );
                            setError("");
                          } catch (cause) {
                            setError(
                              cause instanceof Error
                                ? cause.message
                                : "Invalid batch.",
                            );
                          }
                        }}
                      >
                        Prepare a batch
                      </button>
                    )}
                  </div>
                </article>
              ))}
            <p>
              {calculated.summary.dailySummaries.find(
                (d) => d.localDate === day,
              )?.itemCount ?? 0}{" "}
              planned items
            </p>
            <ul>
              {calculated.summary.dailySummaries
                .find((d) => d.localDate === day)
                ?.nutrients.filter((n) =>
                  [
                    "energy_kcal",
                    "protein_g",
                    "fat_total_g",
                    "carbohydrate_total_g",
                    "fiber_total_g",
                  ].includes(n.nutrientId),
                )
                .map((n) => (
                  <li key={n.nutrientId}>
                    {n.nutrientId}: {formatRecipeValue(n.value)} {n.unit} ·{" "}
                    {n.status}
                  </li>
                ))}
            </ul>
            {draft.targetSnapshot && (
              <ul>
                {comparePlanWithTarget(
                  calculated.summary.dailySummaries.find(
                    (d) => d.localDate === day,
                  )!,
                  draft.targetSnapshot,
                ).map((n) => (
                  <li key={n.nutrientId}>
                    {n.nutrientId} difference: {formatRecipeValue(n.difference)}{" "}
                    {n.reason}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <fieldset className="recipe-form no-print">
        <legend>Copy or repeat a day</legend>
        <label>
          Source day
          <select
            value={copyDate}
            onChange={(e) => setCopyDate(e.target.value)}
          >
            {dates.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Destination day
          <select value={copyTo} onChange={(e) => setCopyTo(e.target.value)}>
            {dates.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <button
          className="button secondary"
          onClick={() =>
            updateItems([
              ...draft.plannedItems,
              ...draft.plannedItems
                .filter((i) => i.localDate === copyDate)
                .map((i) => ({
                  ...structuredClone(i),
                  id: newNutritionId("pitem"),
                  localDate: copyTo,
                  batchAllocationId: null,
                  loggedEntryIds: [],
                })),
            ])
          }
        >
          Copy day as separate meals
        </button>
        <button
          className="button secondary"
          onClick={() => {
            if (
              window.confirm(
                "Append independent copies of the source meals to every other day? Existing meals are retained.",
              )
            )
              updateItems([
                ...draft.plannedItems,
                ...dates
                  .filter((d) => d !== copyDate)
                  .flatMap((localDate) =>
                    draft.plannedItems
                      .filter((i) => i.localDate === copyDate)
                      .map((i) => ({
                        ...structuredClone(i),
                        id: newNutritionId("pitem"),
                        localDate,
                        batchAllocationId: null,
                        loggedEntryIds: [],
                      })),
                  ),
              ]);
          }}
        >
          Repeat source day across calendar
        </button>
      </fieldset>
      <section>
        <h3>Batch production and leftovers</h3>
        {batches.map((b) => {
          const remaining = allocateBatchServings(
            b.totalServingEquivalents,
            b.allocations.map((a) => a.servingEquivalents),
          ).remaining;
          return (
            <div className="recipe-card" key={b.id}>
              <p>
                {b.productionDate} · {b.totalServingEquivalents} produced ·{" "}
                {remaining} available
              </p>
              <label>
                Storage note
                <input
                  value={b.storageNote ?? ""}
                  onChange={(e) =>
                    setBatches(
                      batches.map((v) =>
                        v.id === b.id
                          ? { ...v, storageNote: e.target.value }
                          : v,
                      ),
                    )
                  }
                />
              </label>
              <button
                className="button secondary"
                disabled={remaining <= 0}
                onClick={() => {
                  try {
                    const count = Number(quantity);
                    allocateBatchServings(b.totalServingEquivalents, [
                      ...b.allocations.map((a) => a.servingEquivalents),
                      count,
                    ]);
                    if (date < b.productionDate)
                      throw Error("Leftover date precedes production.");
                    const recipe = data.recipeVersions.find(
                      (r) => r.id === b.recipeVersionId,
                    )!;
                    const item = plannedRecipeItem(recipe, count, date, slot),
                      alloc = {
                        id: newNutritionId("alloc"),
                        plannedItemId: item.id,
                        servingEquivalents: count,
                      };
                    item.batchAllocationId = alloc.id;
                    updateItems([...draft.plannedItems, item]);
                    setBatches(
                      batches.map((v) =>
                        v.id === b.id
                          ? { ...v, allocations: [...v.allocations, alloc] }
                          : v,
                      ),
                    );
                    setError("");
                  } catch (cause) {
                    setError(
                      cause instanceof Error
                        ? cause.message
                        : "Allocation invalid.",
                    );
                  }
                }}
              >
                Allocate leftovers using selected day, meal and quantity
              </button>
            </div>
          );
        })}
      </section>
      <section>
        <h3>Average planned nutrition</h3>
        <p>Only known days enter each average. Missing days are not zeros.</p>
        <ul>
          {calculated.summary.averageNutrients
            .filter((n) => n.value !== null)
            .map((n) => (
              <li key={n.nutrientId}>
                {n.nutrientId}: {formatRecipeValue(n.value)} {n.unit} ·{" "}
                {n.status} · {n.knownDays}/{n.totalDays} known days
              </li>
            ))}
        </ul>
      </section>
      <section>
        <h3>Plan coverage and variety</h3>
        <p>
          {mealPlanInsights(calculated).unresolvedItems} unresolved items ·{" "}
          {mealPlanInsights(calculated).distinctSources} distinct recorded
          sources. Known-energy range:{" "}
          {formatRecipeValue(mealPlanInsights(calculated).minimumKnownEnergy)}–
          {formatRecipeValue(mealPlanInsights(calculated).maximumKnownEnergy)}{" "}
          kcal across {mealPlanInsights(calculated).knownEnergyDays} known days.
          This range may omit missing contributions.
        </p>
        <h4>Largest known energy contributions</h4>
        <ul>
          {mealPlanInsights(calculated).contributors.map((i) => (
            <li key={i.id}>
              {i.name}: {formatRecipeValue(i.energyKcal)} kcal · {i.status}
            </li>
          ))}
        </ul>
        <h4>Frozen nutrient references</h4>
        {draft.referenceSnapshots.length === 0 ? (
          <p>
            No compatible approved references are bound. Unpublished reference
            values remain unavailable.
          </p>
        ) : (
          <ul>
            {compareMealPlanReferences(calculated).map((c) => (
              <li
                key={`${c.reference.nutrientId}:${c.reference.referenceType}`}
              >
                {c.reference.nutrientId} · {c.reference.referenceType}:{" "}
                {formatRecipeValue(c.percent)}% ·{" "}
                {c.partial
                  ? "Incomplete planned data"
                  : "Informational comparison"}{" "}
                · {c.reference.frameworkId}
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="recipe-form no-print">
        <button
          className="button secondary"
          onClick={() =>
            void run(async () => {
              const plans = await readDietBackup(),
                active = plans.plans.find((p) => p.status === "current");
              if (!active) throw Error("Create an active diet plan first.");
              setDraft({
                ...draft,
                targetSnapshot: bindDayTargetSnapshot(active),
              });
            }, "Diet target frozen in draft. Save a new version to persist it.")
          }
        >
          Bind active diet-planning target
        </button>
        <button
          className="button secondary"
          disabled={!nutrition?.days.some((d) => d.referenceSnapshots.length)}
          onClick={() => {
            const source = nutrition?.days
              .filter((d) => d.referenceSnapshots.length)
              .sort((a, b) => b.localDate.localeCompare(a.localDate))[0];
            if (
              source &&
              window.confirm(
                `Bind compatible frozen reference snapshots from diary day ${source.localDate}? Save a new plan version to persist them.`,
              )
            )
              setDraft({
                ...draft,
                referenceSnapshots: structuredClone(source.referenceSnapshots),
              });
          }}
        >
          Bind latest compatible diary reference snapshots
        </button>
        <label>
          Reason for revised plan
          <input value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        <button className="button primary" disabled={readOnly} onClick={save}>
          Save new meal-plan version
        </button>
      </div>
      {logItem?.recipeRef &&
        (() => {
          const recipe = data.recipeVersions.find(
            (r) => r.id === logItem.recipeRef!.recipeVersionId,
          );
          return recipe ? (
            <RecipeLogForm
              recipe={recipe}
              plannedItemRef={
                original.plannedItems.some((i) => i.id === logItem.id)
                  ? { planVersionId: original.id, plannedItemId: logItem.id }
                  : undefined
              }
            />
          ) : (
            <p>Save this draft before logging its item.</p>
          );
        })()}
    </>
  );
}
export function GroceryPage({ planId }: { planId: string }) {
  const { data, run, readOnly } = useRecipes();
  const [selected, setSelected] = useState("");
  if (!data) return <p role="status">Loading grocery lists…</p>;
  const identity = data.mealPlanIdentities.find((p) => p.id === planId),
    plan = data.mealPlanVersions.find(
      (p) => p.id === identity?.currentVersionId,
    ),
    lists = data.groceryLists
      .filter((l) =>
        data.mealPlanVersions.some(
          (p) => p.mealPlanId === planId && p.id === l.mealPlanVersionId,
        ),
      )
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)),
    list = lists.find((l) => l.id === selected) ?? lists[0];
  if (!plan) return <p>Plan unavailable.</p>;
  return (
    <>
      <h2>{plan.title} groceries</h2>
      <p>
        Exact food/profile/state and edible mass determine merge groups.
        Unresolved ingredients stay separate. Package quantities are entered
        manually.
      </p>
      <div className="actions">
        <button
          className="button primary"
          disabled={readOnly}
          onClick={() => {
            const previous = lists.find((l) => l.mealPlanVersionId === plan.id);
            if (
              !previous ||
              window.confirm(
                "Generate another grocery list? Existing lists are retained and compatible pantry states are copied.",
              )
            )
              void run(
                () =>
                  saveGroceryList(
                    aggregateGroceryRequirements(
                      plan,
                      data.batchInstances,
                      previous,
                    ),
                    !!previous,
                  ),
                "Grocery list generated.",
              );
          }}
        >
          Generate for current plan version
        </button>
        <button className="button secondary" onClick={() => window.print()}>
          Print grocery list
        </button>
      </div>
      <label>
        Saved grocery list
        <select
          value={list?.id ?? ""}
          onChange={(e) => setSelected(e.target.value)}
        >
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.generatedAt} · {l.mealPlanVersionId}
            </option>
          ))}
        </select>
      </label>
      {list?.items.map((item) => (
        <GroceryItem
          key={`${list.id}:${item.id}`}
          item={item}
          listId={list.id}
        />
      ))}
    </>
  );
}
function GroceryItem({
  item,
  listId,
}: {
  item: NonNullable<
    ReturnType<typeof aggregateGroceryRequirements>
  >["items"][number];
  listId: string;
}) {
  const { run, readOnly } = useRecipes();
  const [onHand, setOnHand] = useState(String(item.onHandGrams ?? "")),
    [purchased, setPurchased] = useState(item.purchased),
    [packages, setPackages] = useState(item.practicalPurchaseQuantity ?? ""),
    [section, setSection] = useState(item.storeSection),
    [note, setNote] = useState(item.note ?? "");
  return (
    <form
      className="recipe-card recipe-form"
      onSubmit={(e) => {
        e.preventDefault();
        void run(
          () =>
            updateGroceryItem(listId, item.id, {
              onHandGrams: onHand.trim() ? Number(onHand) : null,
              purchased,
              practicalPurchaseQuantity: packages,
              storeSection: section,
              note,
            }),
          "Pantry and purchase state saved.",
        );
      }}
    >
      <h3>{item.displayName}</h3>
      <p>
        Required: {formatRecipeValue(item.requiredGrams)} g · Remaining:{" "}
        {formatRecipeValue(item.remainingGrams)} g
      </p>
      <p>{item.qualityFlags?.join(", ")}</p>
      <label>
        On hand (g)
        <input
          type="number"
          min="0"
          step="any"
          value={onHand}
          onChange={(e) => setOnHand(e.target.value)}
        />
      </label>
      <label>
        Manual package/purchase quantity
        <input value={packages} onChange={(e) => setPackages(e.target.value)} />
      </label>
      <label>
        Store section
        <input
          required
          value={section}
          onChange={(e) => setSection(e.target.value)}
        />
      </label>
      <label>
        Note
        <input value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <label>
        <input
          type="checkbox"
          checked={purchased}
          onChange={(e) => setPurchased(e.target.checked)}
        />{" "}
        Purchased
      </label>
      <button className="button secondary" disabled={readOnly}>
        Save grocery state
      </button>
    </form>
  );
}
