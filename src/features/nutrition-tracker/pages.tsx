import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "../../components/common/page-header";
import { foodIndex, getFoodProfile } from "../foods/repository";
import { searchFoods, parseFoodQuery } from "../foods/query";
import { readDietBackup } from "../diet-planning/storage";
import type { DietPlan } from "../diet-planning/domain";
import type { CompositionProfile } from "../foods/schema";
import { useNutrition } from "./workspace";
import {
  aggregateNutritionDay,
  bindDayTargetSnapshot,
  calculateLoggedNutrients,
  calculateLoggedNutrientSnapshot,
  formatNutritionEnergy,
  formatNutritionMass,
  editQuickAddSnapshot,
  compareDayTotalsToTargets,
  consumedInstant,
  copyNutritionDaySnapshot,
  copyNutritionEntrySnapshot,
  copyNutritionMealSnapshot,
  createCanonicalFoodLogSnapshot,
  createCustomFoodLogSnapshot,
  createQuickAddSnapshot,
  createNutritionRestorePlan,
  exactMassAmount,
  exportNutritionCsv,
  formatNutritionValue,
  macroIds,
  makeNutritionDay,
  newNutritionId,
  resolveVerifiedFoodPortion,
  serializeNutritionBackup,
  validateNutritionBackupImport,
  type EntryContext,
} from "./domain";
import {
  nutritionReference,
  customRevisionSchema,
  foodEntrySchema,
  nutritionNutrients,
  type FoodEntry,
  type NutritionBackup,
  type CustomFood,
  type HydrationEntry,
  type NutritionDay,
} from "./schema";
import {
  deleteAllNutrition,
  purgeNutritionEntry,
  readNutritionBackup,
  removeFavourite,
  replaceNutritionDayTarget,
  restoreNutritionBackup,
  saveCustomFood,
  saveFavourite,
  saveFoodEntries,
  saveFoodEntry,
  saveHydrationEntry,
  saveNutritionPreferences,
  setCustomFoodArchived,
  softDeleteNutritionEntry,
} from "./storage";

function usePlans() {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  useEffect(() => {
    void readDietBackup()
      .then((b) => setPlans(b.plans.filter((p) => p.status !== "archived")))
      .catch(() => setPlans([]));
  }, []);
  return plans;
}
function download(text: string, name: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type })),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}
function FluidEdit({
  entry,
  dayFor,
}: {
  entry: HydrationEntry;
  dayFor: (date: string) => NutritionDay;
}) {
  const w = useNutrition(),
    [editing, setEditing] = useState(false),
    [volume, setVolume] = useState(String(entry.volumeMl)),
    [note, setNote] = useState(entry.note ?? ""),
    [date, setDate] = useState(entry.localDate),
    [time, setTime] = useState(() =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: entry.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(new Date(entry.occurredAtUtc)),
    );
  return entry.deletedAt ? null : (
    <>
      <button className="button secondary" onClick={() => setEditing(!editing)}>
        {editing ? "Cancel fluid editing" : "Edit fluid"}
      </button>
      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void w
              .run(() => {
                if (
                  date !== entry.localDate &&
                  !window.confirm("Move this fluid entry to the selected day?")
                )
                  throw Error("Date move cancelled.");
                return saveHydrationEntry(
                  {
                    ...entry,
                    volumeMl: Number(volume),
                    note,
                    localDate: date,
                    occurredAtUtc: consumedInstant(date, time, entry.timeZone),
                  },
                  dayFor(date),
                  entry.updatedAt,
                );
              }, "Fluid changes saved on this device.")
              .then((ok) => {
                if (ok) setEditing(false);
              });
          }}
        >
          <label>
            Edit fluid volume (mL)
            <input
              required
              type="number"
              min="0.000001"
              max="10000"
              step="any"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />
          </label>
          <label>
            Edit fluid date
            <input
              required
              type="date"
              max={w.date}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Edit fluid time
            <input
              required
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <label>
            Edit fluid note
            <textarea
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button className="button primary">Save fluid changes</button>
        </form>
      )}
    </>
  );
}
const nutritionLabel = (id: string) =>
  nutritionNutrients.find((n) => n.id === id)?.label ?? id;
export function NutritionLayoutNav() {
  return (
    <nav aria-label="Nutrition workspace" className="nutrition-nav">
      {[
        ["/nutrition", "Today"],
        ["/nutrition/add", "Add food or fluid"],
        ["/nutrition/history", "History"],
        ["/nutrition/custom-foods", "Custom foods"],
        ["/nutrition/settings", "Settings & backup"],
        ["/nutrition/methodology", "Methodology"],
        ["/nutrition/privacy", "Privacy"],
      ].map(([href, label]) => (
        <Link key={href} to={href!}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
export function NutritionDayPage({ selectedDate }: { selectedDate?: string }) {
  const w = useNutrition(),
    plans = usePlans(),
    date = selectedDate ?? w.date,
    [editing, setEditing] = useState<FoodEntry | null>(null),
    [quantity, setQuantity] = useState(""),
    [editNote, setEditNote] = useState(""),
    [editDate, setEditDate] = useState(""),
    [editTime, setEditTime] = useState(""),
    [editQuick, setEditQuick] = useState<Record<string, string>>({}),
    [editMeal, setEditMeal] = useState(""),
    [copyDate, setCopyDate] = useState(""),
    [copyTime, setCopyTime] = useState(""),
    [reason, setReason] = useState(""),
    [replacement, setReplacement] = useState("");
  if (!w.data || !date)
    return (
      <>
        <PageHeader
          title="Nutrition diary"
          description="Optional food and fluid records saved in this browser."
        />
        <p>Opening local nutrition storage…</p>
      </>
    );
  const data = w.data,
    day = data.days.find((d) => d.localDate === date),
    entries = data.foodEntries.filter((e) => e.localDate === date),
    fluids = data.hydrationEntries.filter((e) => e.localDate === date),
    totals = aggregateNutritionDay(entries),
    target = day?.targetSnapshot,
    comparisons = compareDayTotalsToTargets(totals, target ?? null);
  const displayAmount = (value: number | null, unit: string) =>
    unit === "kcal"
      ? formatNutritionEnergy(value, data.preferences.energyUnit)
      : formatNutritionValue(value, unit);
  const displayMass = (grams: number) =>
    formatNutritionMass(grams, data.preferences.massUnit);
  const context = (destination: string, meal: string): EntryContext => {
    const time =
      copyTime ||
      (destination === w.date
        ? new Intl.DateTimeFormat("en-GB", {
            timeZone: w.zone,
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          }).format(new Date())
        : "");
    if (!time)
      throw Error(
        "Choose a consumed local time when copying to a historical date.",
      );
    return {
      localDate: destination,
      occurredAtUtc: consumedInstant(destination, time, w.zone),
      timeZone: w.zone,
      localTime: time,
      mealSlotId: meal,
      mealLabelSnapshot:
        data.preferences.mealSlots.find((s) => s.id === meal)?.label ??
        "Historical meal",
    };
  };
  const newDay = (destination: string) =>
    makeNutritionDay(
      destination,
      w.zone,
      bindDayTargetSnapshot(
        plans.find((p) => p.id === data.preferences.currentDietPlanId) ?? null,
      ),
    );
  const repeat = (e: FoodEntry) =>
    w.run(
      () =>
        saveFoodEntries(
          [
            copyNutritionEntrySnapshot(
              e,
              context(copyDate || date, e.mealSlotId),
            ),
          ],
          newDay(copyDate || date),
        ),
      "Copied stored snapshot with a new entry ID.",
    );
  const copy = (meal?: string) =>
    w.run(() => {
      if (!copyDate) throw Error("Choose a destination date before copying.");
      const ctx = context(copyDate, meal ?? "meal_other");
      return saveFoodEntries(
        meal
          ? copyNutritionMealSnapshot(entries, date, meal, ctx)
          : copyNutritionDaySnapshot(entries, date, ctx),
        newDay(copyDate),
      );
    }, "Copied stored nutrition snapshots.");
  return (
    <div className="page nutrition-workspace">
      <PageHeader
        title={`Nutrition diary · ${date}`}
        description="Known totals reflect recorded food values. Coverage describes data completeness, not adequacy."
      />
      <div className="nutrition-actions">
        <Link className="button primary" to="/nutrition/add">
          Add food or fluid
        </Link>
        <Link className="button secondary" to="/nutrition/history">
          Choose another day
        </Link>
      </div>
      <section aria-labelledby="daily-totals">
        <h2 id="daily-totals">Daily energy & macros</h2>
        <div className="nutrition-totals">
          {macroIds.map((id) => {
            const row = totals.find((t) => t.nutrientId === id)!;
            const comparison = comparisons.find((c) => c.nutrientId === id)!;
            return (
              <article className="card" key={id}>
                <h3>{nutritionLabel(id)}</h3>
                {comparison.target !== null && (
                  <p>
                    Target: {displayAmount(comparison.target, row.unit)}. Known
                    total minus target:{" "}
                    {displayAmount(comparison.difference, row.unit)}
                    {comparison.partial ? " · incomplete data" : ""}.
                  </p>
                )}
                <strong>{displayAmount(row.knownTotal, row.unit)}</strong>
                <p>
                  {row.completeness.replace("_", " ")} · {row.quantifiedEntries}
                  /{row.eligibleEntries} quantified
                </p>
              </article>
            );
          })}
        </div>
        <p>
          Frozen target:{" "}
          {target
            ? `${target.title} · ${target.energyKcal} kcal · protein ${target.proteinGrams} g · carbohydrate ${target.carbohydrateGrams} g · fat ${target.fatGrams} g · fiber ${target.fiberGrams} g`
            : "No target bound to this day."}
        </p>
        {target && (
          <p>
            Formula {target.formulaVersion}; reference data{" "}
            {target.referenceDataVersion}. Actual needs and intake estimates
            remain uncertain.
          </p>
        )}
        {day && (
          <details>
            <summary>Replace this day’s frozen target</summary>
            <label>
              Replacement plan
              <select
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
              >
                <option value="">No target</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Audit reason
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={1000}
              />
            </label>
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                void w.run(
                  () =>
                    replaceNutritionDayTarget(
                      date,
                      bindDayTargetSnapshot(
                        plans.find((p) => p.id === replacement) ?? null,
                      ),
                      reason,
                      window.confirm(
                        "Replace this historical day’s frozen target? Existing food entries will retain their snapshots.",
                      ),
                    ),
                  "Day target replaced with an audit record.",
                )
              }
            >
              Replace target with confirmation
            </button>
          </details>
        )}
      </section>
      <section>
        <h2>Meal diary</h2>
        <label>
          Copy destination date
          <input
            type="date"
            max={w.date}
            value={copyDate}
            onChange={(e) => setCopyDate(e.target.value)}
          />
        </label>
        <label>
          Copied consumed local time
          <input
            type="time"
            value={copyTime}
            onChange={(e) => setCopyTime(e.target.value)}
          />
        </label>
        <button className="button secondary" onClick={() => void copy()}>
          Copy entire day
        </button>
        {[
          ...new Set([
            ...data.preferences.mealSlots
              .filter((s) => s.visible)
              .map((s) => s.id),
            ...entries.map((e) => e.mealSlotId),
          ]),
        ].map((meal) => (
          <section key={meal} className="nutrition-meal">
            <h3>
              {data.preferences.mealSlots.find((s) => s.id === meal)?.label ??
                entries.find((e) => e.mealSlotId === meal)?.mealLabelSnapshot ??
                "Historical meal"}
            </h3>
            <button
              className="button secondary"
              onClick={() => void copy(meal)}
            >
              Copy{" "}
              {data.preferences.mealSlots.find((s) => s.id === meal)?.label ??
                "meal"}
            </button>
            {entries
              .filter((e) => e.mealSlotId === meal)
              .map((e) => (
                <article key={e.id} className="card">
                  <h4>
                    {e.displayNameSnapshot}
                    {e.deletedAt ? " · Deleted" : ""}
                  </h4>
                  <p>
                    {e.amount.gramWeight === null
                      ? "Mass unavailable"
                      : displayMass(e.amount.gramWeight)}{" "}
                    · {e.sourceKind.replaceAll("_", " ")} ·{" "}
                    {e.localTime ?? e.occurredAtUtc}
                  </p>
                  <p>
                    {macroIds
                      .map((id) => {
                        const n = e.nutrients.find((n) => n.nutrientId === id);
                        return `${nutritionLabel(id)}: ${formatNutritionValue(n?.loggedValue ?? null, n?.unit ?? (id === "energy_kcal" ? "kcal" : "g"))}`;
                      })
                      .join(" · ")}
                  </p>
                  <details>
                    <summary>Snapshot, nutrients & provenance</summary>
                    <p>
                      {e.canonicalFoodRef
                        ? `${e.canonicalFoodRef.profileState} · ${e.canonicalFoodRef.sourceDatabase} · ${e.canonicalFoodRef.sourceRelease} · reviewed ${e.canonicalFoodRef.profileReviewedAt}`
                        : e.customFoodRef
                          ? `Custom revision ${e.customFoodRef.revisionId} · ${e.customFoodRef.sourceType}`
                          : e.recipeRef
                            ? `Recipe version ${e.recipeRef.versionNumber} · ${e.recipeRef.recipeVersionId} · Grade ${e.recipeRef.calculationGrade} · ${e.recipeRef.methodologyVersion}`
                            : "Quick add: explicitly entered values only; no composition source."}
                    </p>
                    <p>{e.note}</p>
                    <ul>
                      {e.nutrients.map((n) => (
                        <li key={n.nutrientId}>
                          {nutritionLabel(n.nutrientId)}:{" "}
                          {formatNutritionValue(n.loggedValue, n.unit)} ·{" "}
                          {n.sourceStatus} ·{" "}
                          {n.dataCompleteness ?? "source snapshot"} ·{" "}
                          {n.sourceRecordId}
                        </li>
                      ))}
                    </ul>
                  </details>
                  <div className="nutrition-actions">
                    {e.deletedAt ? (
                      <>
                        <button
                          className="button secondary"
                          onClick={() =>
                            void w.run(
                              () => softDeleteNutritionEntry(e.id, true),
                              "Entry restored.",
                            )
                          }
                        >
                          Undo deletion
                        </button>
                        <button
                          className="button secondary"
                          onClick={() =>
                            void w.run(
                              () =>
                                purgeNutritionEntry(
                                  e.id,
                                  window.confirm(
                                    "Permanently delete this nutrition entry? Export a backup first.",
                                  ),
                                ),
                              "Entry permanently deleted.",
                            )
                          }
                        >
                          Permanently delete entry
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="button secondary"
                          onClick={() => {
                            setEditing(e);
                            setQuantity(
                              String(
                                e.amount.gramWeight ??
                                  e.nutrients.find(
                                    (n) => n.nutrientId === "energy_kcal",
                                  )?.loggedValue ??
                                  0,
                              ),
                            );
                            setEditNote(e.note ?? "");
                            setEditDate(e.localDate);
                            setEditTime(
                              e.localTime ??
                                new Intl.DateTimeFormat("en-GB", {
                                  timeZone: e.timeZone,
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hourCycle: "h23",
                                }).format(new Date(e.occurredAtUtc)),
                            );
                            setEditQuick(
                              Object.fromEntries(
                                e.nutrients.map((n) => [
                                  n.nutrientId,
                                  n.loggedValue === null
                                    ? ""
                                    : String(n.loggedValue),
                                ]),
                              ),
                            );
                            setEditMeal(e.mealSlotId);
                          }}
                        >
                          Edit entry
                        </button>
                        <button
                          className="button secondary"
                          onClick={() => void repeat(e)}
                        >
                          Repeat snapshot
                        </button>
                        <button
                          className="button secondary"
                          onClick={() =>
                            void w.run(
                              () => softDeleteNutritionEntry(e.id),
                              "Entry deleted. Undo is available in its meal.",
                            )
                          }
                        >
                          Delete entry
                        </button>
                        {e.sourceKind !== "quick_add" &&
                          e.sourceKind !== "recipe" && (
                            <button
                              className="button secondary"
                              onClick={() =>
                                void w.run(() => {
                                  if (e.amount.gramWeight === null)
                                    throw Error("Favourite needs known mass.");
                                  return saveFavourite({
                                    id: newNutritionId("nutrition_favourite"),
                                    sourceKind: e.sourceKind as
                                      "canonical_food" | "custom_food",
                                    canonicalFoodRef: e.canonicalFoodRef,
                                    customFoodRef: e.customFoodRef,
                                    displayName: e.displayNameSnapshot,
                                    amount: {
                                      ...e.amount,
                                      gramWeight: e.amount.gramWeight,
                                      conversionKind: e.amount
                                        .conversionKind as "exact_mass",
                                    },
                                    entrySnapshot: e,
                                    defaultMealSlotId: e.mealSlotId,
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                  });
                                }, "Favourite saved with its original profile snapshot.")
                              }
                            >
                              Favourite snapshot
                            </button>
                          )}
                      </>
                    )}
                  </div>
                </article>
              ))}
          </section>
        ))}
      </section>
      {editing && (
        <section className="card" aria-labelledby="edit-entry">
          <h2 id="edit-entry">Edit {editing.displayNameSnapshot}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void w
                .run(() => {
                  const amount =
                      editing.sourceKind === "quick_add"
                        ? editing.amount
                        : exactMassAmount(Number(quantity), "g"),
                    nutrients =
                      editing.sourceKind === "quick_add"
                        ? editQuickAddSnapshot(
                            editing,
                            Object.fromEntries(
                              macroIds
                                .filter(
                                  (id) =>
                                    id === "energy_kcal" ||
                                    editQuick[id]?.trim(),
                                )
                                .map((id) => [
                                  id,
                                  Number(
                                    id === "energy_kcal"
                                      ? quantity
                                      : editQuick[id],
                                  ),
                                ]),
                            ),
                          ).nutrients
                        : calculateLoggedNutrients(
                            editing.nutrients,
                            amount.gramWeight!,
                          );
                  const changedDate = editDate !== editing.localDate;
                  if (
                    changedDate &&
                    !window.confirm(
                      "Move this consumed entry to the selected date? Nutrient snapshots are retained.",
                    )
                  )
                    throw Error("Date move cancelled.");
                  const ctx = {
                    localDate: editDate,
                    occurredAtUtc: consumedInstant(
                      editDate,
                      editTime,
                      editing.timeZone,
                    ),
                    localTime: editTime,
                    mealSlotId: editMeal,
                    mealLabelSnapshot:
                      data.preferences.mealSlots.find((s) => s.id === editMeal)
                        ?.label ?? editing.mealLabelSnapshot,
                  };
                  return saveFoodEntry(
                    foodEntrySchema.parse({
                      ...editing,
                      ...ctx,
                      amount,
                      nutrients,
                      note: editNote,
                    }),
                    newDay(editDate),
                    editing.revision,
                  );
                }, "Entry updated using its stored nutrient snapshot.")
                .then((ok) => {
                  if (ok) setEditing(null);
                });
            }}
          >
            <label>
              {editing.sourceKind === "quick_add"
                ? "Entered calories (kcal)"
                : "Consumed mass (g)"}
              <input
                required
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            {editing.sourceKind === "quick_add" &&
              macroIds
                .filter((id) => id !== "energy_kcal")
                .map((id) => (
                  <label key={id}>
                    Edit {nutritionLabel(id)} (g, optional)
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={editQuick[id] ?? ""}
                      onChange={(e) =>
                        setEditQuick({ ...editQuick, [id]: e.target.value })
                      }
                    />
                  </label>
                ))}
            <label>
              Consumed local time
              <input
                required
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
              />
            </label>
            <label>
              Consumed date
              <input
                required
                type="date"
                max={w.date}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </label>
            <label>
              Meal
              <select
                value={editMeal}
                onChange={(e) => setEditMeal(e.target.value)}
              >
                {data.preferences.mealSlots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Entry note
              <textarea
                maxLength={1000}
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />
            </label>
            <button className="button primary">Save entry changes</button>
            <button
              type="button"
              className="button secondary"
              onClick={() => setEditing(null)}
            >
              Cancel editing
            </button>
          </form>
        </section>
      )}
      <section>
        <h2>Fluids</h2>
        <p>
          {fluids
            .filter((e) => e.deletedAt === null)
            .reduce((sum, e) => sum + e.volumeMl, 0)}{" "}
          mL recorded. Plain water and noncaloric fluids are separate from food
          moisture.
        </p>
        {fluids.map((e) => (
          <article key={e.id} className="card">
            <h3>
              {e.kind.replaceAll("_", " ")} · {e.volumeMl} mL
              {e.deletedAt ? " · Deleted" : ""}
            </h3>
            <p>{e.note}</p>
            <FluidEdit key={e.updatedAt} entry={e} dayFor={newDay} />
            <button
              className="button secondary"
              onClick={() =>
                void w.run(
                  () => softDeleteNutritionEntry(e.id, !!e.deletedAt),
                  e.deletedAt
                    ? "Fluid restored."
                    : "Fluid deleted; undo remains available.",
                )
              }
            >
              {e.deletedAt ? "Undo fluid deletion" : "Delete fluid"}
            </button>
            {e.deletedAt && (
              <button
                className="button secondary"
                onClick={() =>
                  void w.run(
                    () =>
                      purgeNutritionEntry(
                        e.id,
                        window.confirm("Permanently delete this fluid entry?"),
                      ),
                    "Fluid permanently deleted.",
                  )
                }
              >
                Permanently delete fluid
              </button>
            )}
          </article>
        ))}
      </section>
      <details>
        <summary>All nutrient totals & completeness</summary>
        <div className="nutrition-table">
          <table>
            <caption>Known totals for {date}</caption>
            <thead>
              <tr>
                <th>Nutrient</th>
                <th>Known amount</th>
                <th>Data coverage</th>
                <th>Trace / missing / flagged</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((t) => (
                <tr key={t.nutrientId}>
                  <th scope="row">{nutritionLabel(t.nutrientId)}</th>
                  <td>{formatNutritionValue(t.knownTotal, t.unit)}</td>
                  <td>
                    {t.completeness} ·{" "}
                    {t.coveragePercent === null
                      ? "Not applicable"
                      : `${t.coveragePercent.toFixed(0)}%`}
                  </td>
                  <td>
                    {t.traceEntries} / {t.unavailableEntries} /{" "}
                    {t.flaggedEntries}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="nutrition-nutrient-cards">
          {totals.map((t) => (
            <article className="card" key={t.nutrientId}>
              <h3>{nutritionLabel(t.nutrientId)}</h3>
              <dl>
                <dt>Known amount</dt>
                <dd>{formatNutritionValue(t.knownTotal, t.unit)}</dd>
                <dt>Data completeness</dt>
                <dd>
                  {t.completeness} · {t.quantifiedEntries}/{t.eligibleEntries}{" "}
                  quantified
                </dd>
                <dt>Trace / missing / flagged entries</dt>
                <dd>
                  {t.traceEntries} / {t.unavailableEntries} / {t.flaggedEntries}
                </dd>
              </dl>
            </article>
          ))}
        </div>
        <p>
          No reviewed framework values with verified food/form scope are
          available for diary comparison.{" "}
          <Link to="/nutrients/reference-intakes" search={{ framework: "" }}>
            Explore source references
          </Link>
          .
        </p>
      </details>
    </div>
  );
}
export function NutritionAddPage() {
  const w = useNutrition();
  return w.data && w.date && w.zone ? (
    <NutritionAddForm />
  ) : (
    <>
      <PageHeader title="Add food or fluid" />
      <p>Opening local storage…</p>
    </>
  );
}
function NutritionAddForm() {
  const w = useNutrition(),
    plans = usePlans(),
    [kind, setKind] = useState("quick"),
    [description, setDescription] = useState(""),
    [date, setDate] = useState(w.date),
    [time, setTime] = useState(() =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: w.zone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(new Date()),
    ),
    [meal, setMeal] = useState("meal_breakfast"),
    [values, setValues] = useState<Record<string, string>>({}),
    [foodId, setFoodId] = useState(""),
    [profileId, setProfileId] = useState(""),
    [selectedProfile, setSelectedProfile] = useState<CompositionProfile | null>(
      null,
    ),
    [profileError, setProfileError] = useState<string | null>(null),
    [profileAttempt, setProfileAttempt] = useState(0),
    [quantity, setQuantity] = useState(""),
    [unit, setUnit] = useState<string>(w.data?.preferences.massUnit ?? "g"),
    [note, setNote] = useState(""),
    [search, setSearch] = useState(""),
    [debouncedSearch, setDebouncedSearch] = useState(""),
    [searchPage, setSearchPage] = useState(1);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    let cancelled = false;
    void getFoodProfile(profileId).then(
      (result) => {
        if (!cancelled) {
          setSelectedProfile(result?.profile ?? null);
          setProfileError(null);
        }
      },
      () => {
        if (!cancelled) {
          setSelectedProfile(null);
          setProfileError(
            "Public food data could not be loaded. Your saved records have not changed.",
          );
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [profileId, profileAttempt]);
  if (!w.data)
    return (
      <>
        <PageHeader title="Add food or fluid" />
        <p>Opening local storage…</p>
      </>
    );
  const data = w.data,
    food = data.customFoods.find((f) => f.id === foodId),
    revision = data.customFoodRevisions.find(
      (r) => r.id === food?.currentRevisionId,
    ),
    searchResult = searchFoods(
      parseFoodQuery({ q: debouncedSearch, page: searchPage }),
      foodIndex,
    ),
    matches = searchResult.rows;
  const context = (): EntryContext => ({
    localDate: date,
    timeZone: w.zone,
    localTime: time,
    occurredAtUtc: consumedInstant(date, time, w.zone),
    mealSlotId: meal,
    mealLabelSnapshot:
      data.preferences.mealSlots.find((s) => s.id === meal)?.label ?? "Meal",
    note,
  });
  const day = () =>
    makeNutritionDay(
      date,
      w.zone,
      bindDayTargetSnapshot(
        plans.find((p) => p.id === data.preferences.currentDietPlanId) ?? null,
      ),
    );
  const preview = (() => {
    try {
      if (kind === "canonical" && selectedProfile?.profileId === profileId) {
        const amount = unit.startsWith("portion_")
          ? resolveVerifiedFoodPortion(selectedProfile, unit, Number(quantity))
          : exactMassAmount(Number(quantity), unit);
        return calculateLoggedNutrientSnapshot(
          selectedProfile,
          amount.gramWeight!,
        );
      }
      if (kind === "custom" && food && revision)
        return createCustomFoodLogSnapshot(
          revision,
          food.name,
          food.brand ?? null,
          Number(quantity),
          context(),
        ).nutrients;
      return null;
    } catch {
      return null;
    }
  })();
  const save = (event: FormEvent) => {
    event.preventDefault();
    void w
      .run(async () => {
        const ctx = context();
        if (kind === "fluid") {
          const now = new Date().toISOString();
          return saveHydrationEntry(
            {
              id: newNutritionId("hydration"),
              schemaVersion: 1,
              localDate: date,
              timeZone: w.zone,
              occurredAtUtc: ctx.occurredAtUtc,
              kind: unit === "other" ? "other_noncaloric_fluid" : "plain_water",
              volumeMl: Number(quantity),
              note,
              createdAt: now,
              updatedAt: now,
              deletedAt: null,
            },
            day(),
          );
        }
        let entry: FoodEntry;
        if (kind === "quick") {
          const amounts: Partial<Record<(typeof macroIds)[number], number>> =
            {};
          for (const id of macroIds)
            if (values[id]?.trim()) amounts[id] = Number(values[id]);
          entry = createQuickAddSnapshot(description, amounts, ctx);
        } else if (kind === "custom") {
          if (!food || !revision) throw Error("Choose an active custom food.");
          entry = createCustomFoodLogSnapshot(
            revision,
            food.name,
            food.brand ?? null,
            Number(quantity),
            ctx,
          );
        } else {
          const resolved = await getFoodProfile(profileId);
          if (!resolved)
            throw Error("Choose a published approved food profile.");
          const amount = unit.startsWith("portion_")
            ? resolveVerifiedFoodPortion(
                resolved.profile,
                unit,
                Number(quantity),
              )
            : exactMassAmount(Number(quantity), unit);
          entry = createCanonicalFoodLogSnapshot(
            resolved.food,
            profileId,
            amount,
            ctx,
          );
        }
        return saveFoodEntry(entry, day());
      }, "Saved on this device. Historical source values and day targets are frozen.")
      .then((ok) => {
        if (ok) {
          setDescription("");
          setValues({});
          setQuantity("");
          setNote("");
        }
      });
  };
  return (
    <div className="page nutrition-workspace">
      <PageHeader
        title="Add food or fluid"
        description="Enter what you consumed. Tracking is optional; nothing is sent to a fitness API."
      />
      <form className="card nutrition-form" onSubmit={save}>
        <label>
          Entry type
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setUnit(e.target.value === "fluid" ? "water" : "g");
              setFoodId("");
              setQuantity("");
            }}
          >
            <option value="quick">Quick add · explicit calories</option>
            <option value="canonical">Reviewed food profile</option>
            <option value="custom">
              Custom food · label or personal calculation
            </option>
            <option value="fluid">Water or noncaloric fluid</option>
          </select>
        </label>
        <label>
          Consumed date
          <input
            required
            type="date"
            max={w.date}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          Consumed local time
          <input
            required
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
        <p>
          Time zone: {w.zone}. The recorded date remains stable when you travel.
        </p>
        {kind !== "fluid" && (
          <label>
            Meal slot
            <select value={meal} onChange={(e) => setMeal(e.target.value)}>
              {data.preferences.mealSlots
                .filter((s) => s.visible)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
            </select>
          </label>
        )}
        {kind === "quick" && (
          <>
            <label>
              Quick-add description
              <input
                required
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            {macroIds.map((id) => (
              <label key={id}>
                {nutritionLabel(id)} ({id === "energy_kcal" ? "kcal" : "g"})
                {id === "energy_kcal" ? " · required" : " · optional"}
                <input
                  required={id === "energy_kcal"}
                  type="number"
                  min="0"
                  step="any"
                  value={values[id] ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, [id]: e.target.value })
                  }
                />
              </label>
            ))}
            <p>
              Unentered macros and micronutrients remain unavailable. Mass is
              unavailable; energy is never inferred from macros.
            </p>
          </>
        )}
        {kind === "canonical" && (
          <>
            <label>
              Search reviewed foods
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSearchPage(1);
                }}
              />
            </label>
            {matches.length === 0 ? (
              <p>
                No reviewed food profiles match this search. You can enter your
                own label as a custom food or use quick add.
              </p>
            ) : (
              <label>
                Exact food profile
                <select
                  required
                  value={profileId}
                  onChange={(e) => {
                    setSelectedProfile(null);
                    setProfileError(null);
                    setProfileId(e.target.value);
                  }}
                >
                  <option value="">Choose a profile</option>
                  {matches.map(({ food: f, profile: p }) => (
                    <option key={p.id} value={p.id}>
                      {f.name} · {p.label} · {p.state} · {p.sources.join(", ")}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {profileError ? (
              <div role="alert">
                <p>{profileError}</p>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setProfileError(null);
                    setProfileAttempt((attempt) => attempt + 1);
                  }}
                >
                  Retry food data
                </button>
              </div>
            ) : profileId && selectedProfile?.profileId !== profileId ? (
              <p role="status">Loading public food data…</p>
            ) : null}
            {searchResult.total > 30 && (
              <>
                <p>
                  {searchResult.total} approved profiles · page {searchPage}
                </p>
                <button
                  type="button"
                  className="button secondary"
                  disabled={searchPage === 1}
                  onClick={() => setSearchPage(searchPage - 1)}
                >
                  Previous food results
                </button>
                <button
                  type="button"
                  className="button secondary"
                  disabled={searchPage * 30 >= searchResult.total}
                  onClick={() => setSearchPage(searchPage + 1)}
                >
                  Next food results
                </button>
              </>
            )}
            <label>
              Mass unit
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                {["g", "kg", "oz", "lb"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
                {selectedProfile?.portions
                  .filter((p) => p.status !== "estimated")
                  .map((p) => (
                    <option key={p.portionId} value={p.portionId}>
                      {p.label} · {p.grams} g · {p.status}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Consumed mass
              <input
                required
                type="number"
                min="0.000001"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <p>
              Generic cups, tablespoons and mL cannot be treated as food mass.
            </p>
          </>
        )}
        {kind === "custom" && (
          <>
            <label>
              Custom food
              <select
                required
                value={foodId}
                onChange={(e) => setFoodId(e.target.value)}
              >
                <option value="">Choose a custom food</option>
                {data.customFoods
                  .filter((f) => f.status === "active")
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.brand}
                    </option>
                  ))}
              </select>
            </label>
            <Link to="/nutrition/custom-foods">
              Create or revise a custom food
            </Link>
            {revision && (
              <p>
                Revision {revision.revisionNumber} ·{" "}
                {revision.serving.description} = {revision.serving.gramWeight} g
                · {revision.sourceType}
              </p>
            )}
            <label>
              Number of servings
              <input
                required
                type="number"
                min="0.000001"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
          </>
        )}
        {kind === "fluid" && (
          <>
            <label>
              Fluid kind
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="water">Plain water</option>
                <option value="other">Other noncaloric fluid</option>
              </select>
            </label>
            <label>
              Fluid volume (mL)
              <input
                required
                type="number"
                min="1"
                max="10000"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <p>Fluids do not add food nutrients or infer hydration adequacy.</p>
          </>
        )}
        <label>
          Optional log note
          <textarea
            maxLength={kind === "fluid" ? 500 : 1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        {selectedProfile?.profileId === profileId && kind === "canonical" && (
          <p>
            Profile: {selectedProfile.label} · {selectedProfile.foodState}.{" "}
            {selectedProfile.sourceRecords
              .map((s) => `${s.sourceId} · release ${s.release}`)
              .join("; ")}
            . Reviewed {selectedProfile.review.reviewedAt}.
          </p>
        )}
        {preview && (
          <section aria-labelledby="nutrition-preview">
            <h2 id="nutrition-preview">Nutrient preview</h2>
            <p>The saved entry uses this same snapshot calculation.</p>
            <ul>
              {macroIds.map((id) => {
                const n = preview.find((n) => n.nutrientId === id);
                return (
                  <li key={id}>
                    {nutritionLabel(id)}:{" "}
                    {formatNutritionValue(
                      n?.loggedValue ?? null,
                      n?.unit ?? "g",
                    )}{" "}
                    · {n?.sourceStatus ?? "not_available"}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        <button
          className="button primary"
          disabled={kind === "canonical" && !preview}
        >
          Save consumed entry
        </button>
      </form>
      <section>
        <h2>Favourites</h2>
        {data.favourites.length === 0 && (
          <p>Save a food snapshot as a favourite from your diary.</p>
        )}
        {data.favourites.map((f) => (
          <article className="card" key={f.id}>
            <h3>{f.displayName}</h3>
            <p>{f.amount.gramWeight} g · original snapshot</p>
            <button
              className="button secondary"
              onClick={() =>
                void w.run(
                  () =>
                    saveFoodEntries(
                      [copyNutritionEntrySnapshot(f.entrySnapshot, context())],
                      day(),
                    ),
                  "Favourite snapshot logged.",
                )
              }
            >
              Log favourite snapshot
            </button>
            <button
              className="button secondary"
              onClick={() =>
                void w.run(() => removeFavourite(f.id), "Favourite removed.")
              }
            >
              Remove favourite
            </button>
          </article>
        ))}
      </section>
      <section>
        <h2>Recent foods</h2>
        {[
          ...new Map(
            [...data.foodEntries]
              .filter((e) => e.deletedAt === null)
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((e) => [
                e.canonicalFoodRef?.profileId ??
                  e.customFoodRef?.revisionId ??
                  e.id,
                e,
              ]),
          ).values(),
        ]
          .slice(0, 12)
          .map((e) => (
            <button
              key={e.id}
              className="button secondary"
              onClick={() =>
                void w.run(
                  () =>
                    saveFoodEntries(
                      [copyNutritionEntrySnapshot(e, context())],
                      day(),
                    ),
                  "Recent snapshot logged.",
                )
              }
            >
              {e.displayNameSnapshot} · repeat
            </button>
          ))}
      </section>
      <Link to="/nutrition">Return to today’s diary</Link>
    </div>
  );
}
export function NutritionHistoryPage() {
  const w = useNutrition(),
    [date, setDate] = useState(""),
    [page, setPage] = useState(0);
  const days = [...(w.data?.days ?? [])].sort((a, b) =>
    b.localDate.localeCompare(a.localDate),
  );
  return (
    <div className="page nutrition-workspace">
      <PageHeader
        title="Nutrition history"
        description="Historical days retain their recorded dates, sources and target snapshots."
      />
      <label>
        Open a date
        <input
          type="date"
          max={w.date}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      {date && (
        <Link
          className="button secondary"
          to="/nutrition/day/$date"
          params={{ date }}
        >
          Open selected day
        </Link>
      )}
      {days.length === 0 && <p>No nutrition days recorded yet.</p>}
      {days.slice(page * 30, page * 30 + 30).map((d) => (
        <article className="card" key={d.localDate}>
          <h2>
            <Link to="/nutrition/day/$date" params={{ date: d.localDate }}>
              {d.localDate}
            </Link>
          </h2>
          <p>
            {d.targetSnapshot?.title ?? "No target"} · {d.timeZone}
          </p>
          <p>
            {formatNutritionValue(
              aggregateNutritionDay(w.data!.foodEntries, d.localDate).find(
                (n) => n.nutrientId === "energy_kcal",
              )?.knownTotal ?? null,
              "kcal",
            )}{" "}
            known energy
          </p>
        </article>
      ))}
      <button
        className="button secondary"
        disabled={page === 0}
        onClick={() => setPage(page - 1)}
      >
        Previous days
      </button>
      <button
        className="button secondary"
        disabled={(page + 1) * 30 >= days.length}
        onClick={() => setPage(page + 1)}
      >
        Next days
      </button>
    </div>
  );
}
export function CustomFoodPage({ selectedId }: { selectedId?: string }) {
  const w = useNutrition(),
    existing = w.data?.customFoods.find((f) => f.id === selectedId);
  return w.data ? (
    <CustomFoodForm
      key={existing?.currentRevisionId ?? selectedId ?? "new"}
      selectedId={selectedId}
    />
  ) : (
    <>
      <PageHeader title="Custom foods" />
      <p>Opening local storage…</p>
    </>
  );
}
function CustomFoodForm({ selectedId }: { selectedId?: string }) {
  const w = useNutrition(),
    existing = w.data?.customFoods.find((f) => f.id === selectedId),
    original = w.data?.customFoodRevisions.find(
      (r) => r.id === existing?.currentRevisionId,
    ),
    [name, setName] = useState(existing?.name ?? ""),
    [brand, setBrand] = useState(existing?.brand ?? ""),
    [serving, setServing] = useState(original?.serving.description ?? ""),
    [grams, setGrams] = useState(
      original ? String(original.serving.gramWeight) : "",
    ),
    [basis, setBasis] = useState<"per_serving" | "per_100g">(
      original?.basis ?? "per_serving",
    ),
    [source, setSource] = useState<CustomFoodRevisionSource>(
      original?.sourceType ?? "nutrition_label",
    ),
    [note, setNote] = useState(original?.sourceNote ?? ""),
    [values, setValues] = useState<Record<string, string>>(() =>
      Object.fromEntries(
        original?.nutrients.map((n) => [n.nutrientId, String(n.value)]) ?? [],
      ),
    );
  type CustomFoodRevisionSource =
    | "nutrition_label"
    | "manufacturer_document"
    | "personal_calculation"
    | "other";
  const save = (e: FormEvent) => {
    e.preventDefault();
    void w
      .run(
        () => {
          const now = new Date().toISOString(),
            id = existing?.id ?? newNutritionId("custom_food"),
            revisionId = newNutritionId("custom_food_revision");
          const food: CustomFood = {
            id,
            currentRevisionId: revisionId,
            name: name.trim(),
            normalizedName: name.trim().toLocaleLowerCase(),
            brand: brand.trim() || null,
            status: existing?.status ?? "active",
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          };
          const revision = customRevisionSchema.parse({
            id: revisionId,
            customFoodId: id,
            revisionNumber:
              Math.max(
                0,
                ...(w.data?.customFoodRevisions
                  .filter((r) => r.customFoodId === id)
                  .map((r) => r.revisionNumber) ?? []),
              ) + 1,
            basis,
            serving: { description: serving.trim(), gramWeight: Number(grams) },
            sourceType: source,
            sourceNote: note,
            nutrients: nutritionNutrients
              .filter((n) => values[n.id]?.trim())
              .map((n) => ({
                nutrientId: n.id,
                unit: n.canonicalUnit,
                value: Number(values[n.id]),
              })),
            createdAt: now,
          });
          if (!revision.nutrients.length)
            throw Error("Enter at least one absolute nutrient amount.");
          return saveCustomFood(food, revision, existing?.updatedAt);
        },
        existing
          ? "New immutable revision saved. Earlier logs retain their values."
          : "Custom food saved on this device.",
      )
      .then((ok) => {
        if (ok && !existing) {
          setName("");
          setBrand("");
          setServing("");
          setGrams("");
          setValues({});
          setNote("");
        }
      });
  };
  return (
    <div className="page nutrition-workspace">
      <PageHeader
        title={existing ? `Custom food · ${existing.name}` : "Custom foods"}
        description="Your own label or documented calculation. These records remain private and do not become public food facts."
      />
      {selectedId && !existing && w.data ? (
        <p>Custom food unavailable.</p>
      ) : (
        <form className="card nutrition-form" onSubmit={save}>
          <h2>{existing ? "Create a new revision" : "Create a custom food"}</h2>
          <label>
            Custom food name
            <input
              required
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Brand (optional)
            <input
              maxLength={120}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </label>
          <label>
            Serving description
            <input
              required
              maxLength={160}
              value={serving}
              onChange={(e) => setServing(e.target.value)}
            />
          </label>
          <label>
            Serving mass (g)
            <input
              required
              type="number"
              min="0.000001"
              max="10000"
              step="any"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
          </label>
          <label>
            Nutrient basis
            <select
              value={basis}
              onChange={(e) => setBasis(e.target.value as typeof basis)}
            >
              <option value="per_serving">Per described serving</option>
              <option value="per_100g">Per 100 g</option>
            </select>
          </label>
          <label>
            Custom source type
            <select
              value={source}
              onChange={(e) =>
                setSource(e.target.value as CustomFoodRevisionSource)
              }
            >
              {[
                "nutrition_label",
                "manufacturer_document",
                "personal_calculation",
                "other",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Source note
            <textarea
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <p>
            Enter absolute amounts. Leave unknown values blank; explicitly
            measured or label-reported zero may be entered as 0. Percent Daily
            Value is not converted automatically.
          </p>
          {macroIds.map((id) => (
            <label key={id}>
              {nutritionLabel(id)} ({id === "energy_kcal" ? "kcal" : "g"})
              <input
                type="number"
                min="0"
                step="any"
                value={values[id] ?? ""}
                onChange={(e) => setValues({ ...values, [id]: e.target.value })}
              />
            </label>
          ))}
          <details>
            <summary>Other nutrient amounts</summary>
            {nutritionNutrients
              .filter((n) => !macroIds.some((id) => id === n.id))
              .map((n) => (
                <label key={n.id}>
                  {n.label} ({n.canonicalUnit})
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={values[n.id] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [n.id]: e.target.value })
                    }
                  />
                </label>
              ))}
          </details>
          <button className="button primary">Save custom food revision</button>
        </form>
      )}
      <section>
        <h2>Saved custom foods</h2>
        {w.data?.customFoods.map((f) => (
          <article key={f.id} className="card">
            <h3>
              <Link
                to="/nutrition/custom-foods/$customFoodId"
                params={{ customFoodId: f.id }}
              >
                {f.name}
              </Link>
            </h3>
            <p>
              {f.brand} · {f.status} ·{" "}
              {
                w.data?.customFoodRevisions.filter(
                  (r) => r.customFoodId === f.id,
                ).length
              }{" "}
              revisions
            </p>
            <button
              className="button secondary"
              onClick={() =>
                void w.run(
                  () => setCustomFoodArchived(f.id, f.status !== "archived"),
                  f.status === "archived"
                    ? "Custom food reactivated."
                    : "Custom food archived. Historical logs retained.",
                )
              }
            >
              {f.status === "archived" ? "Reactivate" : "Archive custom food"}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
export function NutritionSettingsPage() {
  const w = useNutrition(),
    plans = usePlans(),
    [preview, setPreview] = useState<NutritionBackup | null>(null),
    [restoreMode, setRestoreMode] = useState<
      "keep_existing" | "duplicate_conflicts"
    >("keep_existing"),
    [phrase, setPhrase] = useState(""),
    [importPreferences, setImportPreferences] = useState(false),
    [storage, setStorage] = useState("");
  if (!w.data)
    return (
      <>
        <PageHeader title="Nutrition settings & backup" />
        <p>Opening local storage…</p>
      </>
    );
  const data = w.data,
    savePreferences = (change: Partial<typeof data.preferences>) =>
      w.run(
        () =>
          saveNutritionPreferences({
            ...data.preferences,
            ...change,
            updatedAt: new Date().toISOString(),
          }),
        "Nutrition preferences saved. Existing days retain their snapshots.",
      );
  const previewFile = async (file: File) => {
    await w.run(async () => {
      if (file.size > 20 * 1024 * 1024) throw Error("Backup exceeds 20 MB.");
      setPreview(validateNutritionBackupImport(await file.text()));
    }, "Backup validated. Review conflicts before restoring.");
  };
  return (
    <div className="page nutrition-workspace">
      <PageHeader
        title="Nutrition settings & backup"
        description="Back up your browser records before clearing site data or changing devices."
      />
      <section className="card">
        <h2>Future-day targets</h2>
        <label>
          Diet plan for newly recorded days
          <select
            value={data.preferences.currentDietPlanId ?? ""}
            onChange={(e) =>
              void savePreferences({
                currentDietPlanId: e.target.value || null,
              })
            }
          >
            <option value="">No diet target</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <Link to="/diet-planning/plans">Manage diet plans</Link>
        <p>
          A day freezes this selection on its first food or fluid record. Older
          days only change through explicit replacement.
        </p>
        <label>
          Preferred mass display
          <select
            value={data.preferences.massUnit}
            onChange={(e) =>
              void savePreferences({ massUnit: e.target.value as "g" | "oz" })
            }
          >
            <option value="g">g</option>
            <option value="oz">oz</option>
          </select>
        </label>
        <label>
          Preferred energy display
          <select
            value={data.preferences.energyUnit}
            onChange={(e) =>
              void savePreferences({
                energyUnit: e.target.value as "kcal" | "kJ",
              })
            }
          >
            <option value="kcal">kcal</option>
            <option value="kJ">kJ</option>
          </select>
        </label>
        <p>
          Storage and calculations retain g and source kcal. Reviewed food-scope
          reference comparisons are currently unavailable.
        </p>
      </section>
      <section className="card">
        <h2>Meal slots</h2>
        {[...data.preferences.mealSlots]
          .sort((a, b) => a.order - b.order)
          .map((s, index) => (
            <div className="nutrition-slot" key={s.id}>
              <label>
                Label for {s.id}
                <input
                  maxLength={60}
                  defaultValue={s.label}
                  onBlur={(e) => {
                    if (e.target.value !== s.label)
                      void savePreferences({
                        mealSlots: data.preferences.mealSlots.map((v) =>
                          v.id === s.id ? { ...v, label: e.target.value } : v,
                        ),
                      });
                  }}
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={s.visible}
                  onChange={(e) =>
                    void savePreferences({
                      mealSlots: data.preferences.mealSlots.map((v) =>
                        v.id === s.id ? { ...v, visible: e.target.checked } : v,
                      ),
                    })
                  }
                />{" "}
                Visible
              </label>
              <button
                disabled={index === 0}
                className="button secondary"
                onClick={() => {
                  const slots = [...data.preferences.mealSlots],
                    previous = slots[index - 1];
                  if (previous)
                    void savePreferences({
                      mealSlots: slots.map((v) =>
                        v.id === s.id
                          ? { ...v, order: previous.order }
                          : v.id === previous.id
                            ? { ...v, order: s.order }
                            : v,
                      ),
                    });
                }}
              >
                Move {s.label} up
              </button>
            </div>
          ))}
        <button
          className="button secondary"
          disabled={data.preferences.mealSlots.length >= 12}
          onClick={() =>
            void savePreferences({
              mealSlots: [
                ...data.preferences.mealSlots,
                {
                  id: `meal_custom_${crypto.randomUUID().replaceAll("-", "")}`,
                  label: "Custom meal",
                  visible: true,
                  order:
                    Math.max(
                      ...data.preferences.mealSlots.map((s) => s.order),
                    ) + 1,
                },
              ],
            })
          }
        >
          Add custom meal slot
        </button>
      </section>
      <section className="card">
        <h2>Export & restore</h2>
        <button
          className="button primary"
          onClick={() =>
            void w.run(
              async () =>
                download(
                  serializeNutritionBackup(await readNutritionBackup()),
                  "fitness-os-nutrition-backup.json",
                ),
              "Nutrition JSON backup exported.",
            )
          }
        >
          Export nutrition JSON
        </button>
        {nutritionReference.csvExports.map((kind) => (
          <button
            className="button secondary"
            key={kind}
            onClick={() =>
              void w.run(
                async () =>
                  download(
                    exportNutritionCsv(await readNutritionBackup(), kind),
                    `${kind}.csv`,
                    "text/csv",
                  ),
                "CSV exported.",
              )
            }
          >
            Export {kind.replaceAll("_", " ")} CSV
          </button>
        ))}
        <label>
          Preview nutrition JSON backup
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void previewFile(file);
              e.target.value = "";
            }}
          />
        </label>
        {preview && (
          <>
            <h3>Restore preview</h3>
            <label>
              <input
                type="checkbox"
                checked={importPreferences}
                onChange={(e) => setImportPreferences(e.target.checked)}
              />{" "}
              Import meal slots and future-day preferences from this backup
            </label>
            <p>
              {preview.foodEntries.length} food entries;{" "}
              {preview.customFoods.length} custom foods;{" "}
              {preview.hydrationEntries.length} fluid entries. Existing
              preferences and frozen day snapshots are retained.
            </p>
            <ul>
              {createNutritionRestorePlan(data, preview).map((p) => (
                <li key={p.collection}>
                  {p.collection}: {p.added} new, {p.identical} identical,{" "}
                  {p.conflicts} conflicts
                </li>
              ))}
            </ul>
            <label>
              Restore conflict handling
              <select
                value={restoreMode}
                onChange={(e) =>
                  setRestoreMode(e.target.value as typeof restoreMode)
                }
              >
                <option value="keep_existing">Keep existing identities</option>
                <option value="duplicate_conflicts">
                  Import copies with new entry/custom-food identities
                </option>
              </select>
            </label>
            <button
              className="button primary"
              onClick={() =>
                void w
                  .run(
                    () =>
                      restoreNutritionBackup(
                        preview,
                        restoreMode,
                        window.confirm(
                          "Apply this validated nutrition restore? Existing records and day targets will be retained.",
                        ),
                        importPreferences ? "import" : "keep",
                      ),
                    "Nutrition restore completed atomically.",
                  )
                  .then((ok) => {
                    if (ok) setPreview(null);
                  })
              }
            >
              Confirm nutrition restore
            </button>
            <button
              className="button secondary"
              onClick={() => setPreview(null)}
            >
              Cancel restore preview
            </button>
          </>
        )}
      </section>
      <section className="card">
        <h2>Browser storage</h2>
        <p>
          Persistent storage may reduce automatic eviction. It does not protect
          against site-data deletion or replace backups.
        </p>
        <button
          className="button secondary"
          onClick={() =>
            void w.run(async () => {
              if (!navigator.storage?.persist) {
                setStorage(
                  "Persistent storage is unsupported in this browser.",
                );
                return;
              }
              const granted = await navigator.storage.persist();
              const estimate = await navigator.storage.estimate();
              setStorage(
                `${granted ? "Persistence granted" : "Persistence was not granted"} · ${estimate.usage ?? 0} bytes used; ${estimate.quota ?? 0} bytes quota.`,
              );
            }, "Browser storage request completed.")
          }
        >
          Request persistent storage
        </button>
        <p role="status">{storage}</p>
      </section>
      <section className="card">
        <h2>Delete nutrition records</h2>
        <p>
          Export your JSON backup first. This removes nutrition logs, custom
          foods, revisions, favourites, day snapshots and preferences from this
          browser.
        </p>
        <label>
          Type DELETE NUTRITION
          <input value={phrase} onChange={(e) => setPhrase(e.target.value)} />
        </label>
        <button
          className="button secondary"
          onClick={() =>
            void w
              .run(() => {
                if (
                  !window.confirm(
                    "Permanently clear all nutrition records? Workout records and diet plans are retained.",
                  )
                )
                  throw Error("Deletion cancelled.");
                return deleteAllNutrition(phrase);
              }, "Nutrition records cleared. Workout records and diet plans retained.")
              .then((ok) => {
                if (ok) setPhrase("");
              })
          }
        >
          Permanently clear nutrition
        </button>
      </section>
    </div>
  );
}
export function NutritionInformationPage({
  privacy = false,
}: {
  privacy?: boolean;
}) {
  return (
    <div className="page nutrition-workspace">
      <PageHeader
        title={privacy ? "Nutrition privacy" : "Nutrition methodology"}
        description={
          privacy
            ? "Optional records belong to this browser."
            : "Transparent food snapshots, arithmetic and missing-data handling."
        }
      />
      {privacy ? (
        <>
          <h2>Device-local records</h2>
          <p>
            Food, fluid, custom-food and day-target records use IndexedDB. They
            are read after browser hydration and are excluded from server
            rendering, metadata and server logs. No account or cloud storage is
            used.
          </p>
          <h2>Backup before clearing storage</h2>
          <p>
            Clearing site data, switching browsers or device loss can remove
            records. Export JSON for restore; CSV is intended for inspection.
            Persistent storage cannot replace backups.
          </p>
          <Link to="/nutrition/settings">
            Open nutrition backup & deletion controls
          </Link>
        </>
      ) : (
        <>
          <h2>Source snapshots</h2>
          <p>
            Canonical food entries require published identities and an approved
            exact preparation profile. Every log captures source release, review
            date, per-100-g values and consumed amounts. Historical entries
            never silently update when a catalogue profile changes. Custom-food
            revisions remain user-entered, and earlier logs retain their
            original revision.
          </p>
          <h2>Known amounts and coverage</h2>
          <p>
            Logged amount = per-100-g value × consumed grams ÷ 100. Zero is
            quantified. Trace remains unquantified; missing and unquantified
            not-detected values remain unavailable. Measured, calculated,
            imputed, estimated and user-entered amounts stay visibly distinct.
            Totals omit deleted entries. Coverage is the proportion of eligible
            entries with quantified values, not a measure of nutrient adequacy.
            Quick add contributes only the nutrients explicitly entered.
          </p>
          <h2>Targets and references</h2>
          <p>
            A day freezes its selected diet target at the first food or fluid
            record. Replacement requires confirmation and an audit reason.
            Population reference values require matching units, age, framework
            version and food/form scope. EAR/AR are excluded from personal
            progress. DV is a label reference; UL/TUL are informational limits,
            not goals. Diary records do not diagnose deficiencies or hydration
            status.
          </p>
          <h2>Mass and fluids</h2>
          <p>
            Exact mass uses 1 kg = 1000 g, 1 oz = 28.349523125 g and 1 lb =
            453.59237 g. Generic volume-to-mass conversion is prohibited. Food
            moisture in g remains separate from plain water and noncaloric fluid
            volume in mL.
          </p>
          <h2>Sources</h2>
          <ul>
            {nutritionReference.sources.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
