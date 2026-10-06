import { useState } from "react";
import { useRecipes, downloadRecipeFile } from "./workspace";
import {
  validateRecipeImport,
  restoreRecipeBackup,
  purgeRecipeData,
  exportRawRecipeRecovery,
  saveMealPreferences,
} from "./storage";
import { planRecipeRestoreConflicts } from "./domain";
import { recipeCsvKinds, exportRecipeCsv } from "./editor";
import type { RecipeBackup } from "./schema";
import { matchReviewedTemplates, type PublicTemplate } from "./publication";
export function RecipeSettings() {
  const { data, run } = useRecipes();
  if (!data)
    return (
      <>
        <p role="status">Loading recipe backup controls…</p>
        <button
          className="button secondary"
          onClick={() =>
            void run(
              async () =>
                downloadRecipeFile(
                  await exportRawRecipeRecovery(),
                  "recipe-raw-recovery.json",
                ),
              "Raw recovery exported.",
              true,
            )
          }
        >
          Export raw recovery
        </button>
      </>
    );
  return <RecipeSettingsForm key={data.preferences.updatedAt} />;
}
function RecipeSettingsForm() {
  const { data, run, readOnly } = useRecipes();
  const [preview, setPreview] = useState<RecipeBackup | null>(null),
    [mode, setMode] = useState<
      "keep_existing" | "import_copy" | "replace_local"
    >("keep_existing"),
    [phrase, setPhrase] = useState(""),
    [days, setDays] = useState(String(data?.preferences.defaultPlanDays ?? 7)),
    [excludedIngredients, setExcludedIngredients] = useState(
      data?.preferences.excludedIngredientIds?.join(", ") ?? "",
    ),
    [excludedAllergens, setExcludedAllergens] = useState(
      data?.preferences.excludedAllergenTags?.join(", ") ?? "",
    ),
    [dietary, setDietary] = useState(
      data?.preferences.dietaryPreferences?.join(", ") ?? "",
    ),
    [slots, setSlots] = useState(
      data?.preferences.defaultMealSlots.join(", ") ??
        "meal_breakfast, meal_lunch, meal_dinner",
    );
  if (!data)
    return (
      <>
        <p>Storage is unavailable. Recovery export may still be possible.</p>
        <button
          className="button secondary"
          onClick={() =>
            void run(
              async () =>
                downloadRecipeFile(
                  await exportRawRecipeRecovery(),
                  "recipe-raw-recovery.json",
                ),
              "Recovery exported.",
              true,
            )
          }
        >
          Export raw recovery
        </button>
      </>
    );
  return (
    <>
      <h2>Backup and restore</h2>
      <p>
        JSON preserves identities, every local version, batches, pantry states
        and pending consumption writes. CSV files are readable exports, not
        restorable backups. Export before clearing browser data.
      </p>
      <div className="actions">
        <button
          className="button primary"
          disabled={readOnly}
          onClick={() =>
            downloadRecipeFile(
              JSON.stringify(
                { ...data, exportedAt: new Date().toISOString() },
                null,
                2,
              ),
              "recipes-meal-plans-backup.json",
            )
          }
        >
          Export full JSON backup
        </button>
        <button
          className="button secondary"
          onClick={() =>
            void run(
              async () =>
                downloadRecipeFile(
                  await exportRawRecipeRecovery(),
                  "recipe-raw-recovery.json",
                ),
              "Raw recovery exported; validate repaired data before importing.",
              true,
            )
          }
        >
          Export raw recovery
        </button>
        {recipeCsvKinds.map((kind) => (
          <button
            key={kind}
            className="button secondary"
            disabled={readOnly}
            onClick={() =>
              downloadRecipeFile(
                exportRecipeCsv(data, kind),
                `${kind}.csv`,
                "text/csv",
              )
            }
          >
            Export {kind.replaceAll("_", " ")} CSV
          </button>
        ))}
      </div>
      <label>
        Choose JSON backup to validate
        <input
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(null);
            if (file)
              void run(
                async () => {
                  if (file.size > 20 * 1024 * 1024)
                    throw Error("Backup exceeds 20 MB.");
                  setPreview(await validateRecipeImport(await file.text()));
                },
                "Backup validated. Review conflicts before restoring.",
                true,
              );
          }}
        />
      </label>
      {preview && (
        <section>
          <h3>Restore preview</h3>
          <ul>
            {planRecipeRestoreConflicts(data, preview).map((p) => (
              <li key={p.collection}>
                {p.collection}: {p.added} new, {p.identical} identical,{" "}
                {p.conflicts} conflicts
              </li>
            ))}
          </ul>
          <label>
            Conflict action
            <select
              value={mode}
              onChange={(e) => {
                const v = e.target.value;
                if (
                  v === "keep_existing" ||
                  v === "import_copy" ||
                  v === "replace_local"
                )
                  setMode(v);
              }}
            >
              <option value="keep_existing">
                Keep existing conflicts; add new records
              </option>
              <option value="import_copy">
                Import independent copies of all records
              </option>
              <option value="replace_local">
                Replace this module’s local records
              </option>
            </select>
          </label>
          <p>
            Copies do not automatically log meals. Pending consumed writes
            require an explicit retry. Imported committed links can refer to
            diary records absent from this browser.
          </p>
          <button
            className="button primary"
            onClick={() => {
              if (
                window.confirm(
                  `Confirm ${mode.replaceAll("_", " ")} for recipes and meal plans? ${mode === "replace_local" ? "Existing module records will be replaced." : "Existing records are retained."}`,
                )
              )
                void run(
                  () => restoreRecipeBackup(preview, mode, true),
                  "Validated backup restored atomically.",
                  true,
                ).then((ok) => {
                  if (ok) setPreview(null);
                });
            }}
          >
            Confirm reviewed restore
          </button>
        </section>
      )}
      <h2>Preferences</h2>
      <form
        className="recipe-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(
            () =>
              saveMealPreferences({
                ...data.preferences,
                defaultPlanDays: Number(days),
                excludedIngredientIds: [
                  ...new Set(
                    excludedIngredients
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  ),
                ],
                excludedAllergenTags: [
                  ...new Set(
                    excludedAllergens
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  ),
                ],
                dietaryPreferences: [
                  ...new Set(
                    dietary
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  ),
                ],
                defaultMealSlots: [
                  ...new Set(
                    slots
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  ),
                ],
                updatedAt: new Date().toISOString(),
              }),
            "Preferences saved.",
          );
        }}
      >
        <label>
          Default plan length (1–28 days)
          <input
            type="number"
            min="1"
            max="28"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
        <p>
          Current saved exclusions:{" "}
          {(data.preferences.excludedIngredientIds ?? []).join(", ") || "None"}{" "}
          · allergens:{" "}
          {(data.preferences.excludedAllergenTags ?? []).join(", ") || "None"}.
          Saving uses the values entered below.
        </p>
        <label>
          Excluded food IDs or unresolved ingredient names (comma-separated)
          <input
            value={excludedIngredients}
            onChange={(e) => setExcludedIngredients(e.target.value)}
          />
        </label>
        <label>
          Excluded declared allergen tags (comma-separated)
          <input
            value={excludedAllergens}
            onChange={(e) => setExcludedAllergens(e.target.value)}
          />
        </label>
        <label>
          Dietary preference tags (comma-separated)
          <input value={dietary} onChange={(e) => setDietary(e.target.value)} />
        </label>
        <label>
          Default meal slot IDs (comma-separated, meal_ prefix)
          <input value={slots} onChange={(e) => setSlots(e.target.value)} />
        </label>
        <button className="button secondary" disabled={readOnly}>
          Save preferences
        </button>
      </form>
      <button
        className="button secondary"
        onClick={() =>
          void run(async () => {
            if (!navigator.storage?.persist)
              throw Error("Persistent storage is unavailable in this browser.");
            const granted = await navigator.storage.persist();
            if (!granted)
              throw Error(
                "Browser did not grant persistence. Keep exported backups.",
              );
          }, "Browser storage persistence granted.")
        }
      >
        Request persistent browser storage
      </button>
      <h2>Clear this module</h2>
      <p>
        Recipe and plan clearing leaves the nutrition diary and all other
        modules intact. Previously consumed recipe entries keep their frozen
        snapshots.
      </p>
      <label>
        Type DELETE RECIPES AND PLANS
        <input value={phrase} onChange={(e) => setPhrase(e.target.value)} />
      </label>
      <button
        className="button secondary"
        disabled={phrase !== "DELETE RECIPES AND PLANS"}
        onClick={() => {
          if (
            window.confirm(
              "Have you exported a backup? Permanently clear recipe and meal-plan records on this browser?",
            )
          )
            void run(
              () => purgeRecipeData(phrase),
              "Recipe and meal-plan records cleared.",
              true,
            );
        }}
      >
        Confirm permanent module clearing
      </button>
    </>
  );
}
export function RecipeMethodology() {
  return (
    <>
      <h2>Ingredient arithmetic and yield</h2>
      <p>
        Each ingredient uses an exact food/profile snapshot or a user-entered
        custom-food revision. Its nutrient contribution is per-100-g value ×
        edible grams ÷ 100. Known contributions are summed without treating
        missing or trace values as zero.
      </p>
      <p>
        Measured final edible weight determines density: batch amount ÷ final
        grams × 100. A measured serving weight determines per-serving values;
        otherwise the batch is divided by the reported serving count. Container
        mass is excluded. Cooking water, absorbed oil, discarded portions and
        drained liquids require explicit measurements or uncertainty notes.
      </p>
      <p>
        Cooking retention requires a reviewed exact nutrient, food group, method
        and release match. No approved retention factors are included in this
        release. An already-cooked matching source profile is not adjusted for
        the same cooking step again. Unadjusted values require your explicit
        permission and remain labelled as limited estimates.
      </p>
      <h2>Coverage and calculation grades</h2>
      <p>
        Coverage reports quantified ingredient counts and mass. Unknown masses
        prevent a complete result even when all known masses are quantified. A
        means an authoritative analysed composite; B a supported ingredient
        calculation with measured yield; C measured yield with retention
        limitations; D estimated or incomplete yield; E unresolved material or
        user-entered composition. No analysed Grade A source is published here.
        These grades describe evidence, not dietary quality.
      </p>
      <h2>Versions and planning</h2>
      <p>
        Every saved recipe or meal-plan change creates an immutable version.
        Components, planned meals and consumed diary entries freeze their exact
        version. Scaling preserves calculation precision; cooking times,
        seasoning and equipment do not necessarily scale proportionally. Plans
        cover 1–28 days. Unknown days are excluded from each nutrient average,
        with known-day counts shown. Materially incomplete totals cannot support
        target comparisons.
      </p>
      <h2>Source methodology</h2>
      <p>
        <a
          href="https://www.fao.org/4/y4705e/y4705E23.htm"
          target="_blank"
          rel="noreferrer"
        >
          FAO recipe calculation appendix
        </a>{" "}
        describes ingredient weights, yield and retention.{" "}
        <a
          href="https://www.ars.usda.gov/northeast-area/beltsville-md-bhnrc/beltsville-human-nutrition-research-center/methods-and-application-of-food-composition-laboratory/mafcl-site-pages/nutrient-retention-factors/"
          target="_blank"
          rel="noreferrer"
        >
          USDA nutrient retention source
        </a>{" "}
        is registered for future reviewed ingestion. Source links open only when
        selected.
      </p>
      <h2>Food safety and allergens</h2>
      <p>
        This planner does not assess whether a particular leftover is safe to
        eat. Record preparation and storage information and consult the{" "}
        <a
          href="https://www.fda.gov/consumers/consumer-updates/are-you-storing-food-safely"
          target="_blank"
          rel="noreferrer"
        >
          FDA food storage guidance
        </a>
        . Source declarations do not establish an allergen-free kitchen or
        exclude cross-contamination. Missing declarations remain unknown.
      </p>
    </>
  );
}
export function MealPlanPrivacy() {
  return (
    <>
      <h2>Your browser owns your personal records</h2>
      <p>
        Recipes, plans, batches, favourites, groceries and pending diary writes
        are stored in IndexedDB after hydration. They are absent from server
        rendering, metadata and application server logs. No account, cloud sync
        or automatic personal-data upload is provided.
      </p>
      <p>
        Storage may be removed by browser cleanup, private mode or device loss.
        Export a JSON backup regularly. Import files are validated before
        writes. A failed transaction preserves existing records. Keep-existing
        and import-copy retain original records; confirmed replacement affects
        this module only.
      </p>
      <h2>Planned and consumed are separate</h2>
      <p>
        Only your explicit consumed-serving action writes a recipe to the
        nutrition diary. A recoverable pending record joins the two local
        databases; retry uses the same entry ID to prevent duplicate logging.
        Clearing recipes cannot rewrite or remove historical diary snapshots.
      </p>
    </>
  );
}
export function RecipePublicEmpty() {
  return (
    <>
      <h2>Public recipe unavailable</h2>
      <p>
        No source- and licence-reviewed public recipes have been released. You
        can create your own local recipe from measured ingredients.
      </p>
      <a className="button primary" href="/recipes/create">
        Create a local recipe
      </a>
    </>
  );
}
export function RecipeTemplates({
  templates,
}: {
  templates: readonly PublicTemplate[];
}) {
  const [energy, setEnergy] = useState(""),
    [days, setDays] = useState(""),
    [diet, setDiet] = useState("");
  const matches = matchReviewedTemplates(
    {
      energyKcal: energy ? Number(energy) : undefined,
      days: days ? Number(days) : undefined,
      dietary: diet || undefined,
    },
    templates,
  );
  return (
    <>
      <h2>Meal-prep collections</h2>
      <p>
        Static lunch and snack examples assembled from exact public recipe
        versions. These are not complete daily diets. Personal-use source
        validation; no human or clinical review.
      </p>
      <div className="recipe-controls">
        <label>
          Calculated collection energy (kcal)
          <input
            type="number"
            min="0"
            value={energy}
            onChange={(e) => setEnergy(e.target.value)}
          />
        </label>
        <label>
          Template length (days)
          <input
            type="number"
            min="1"
            max="28"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
        <label>
          Declared dietary tag
          <input value={diet} onChange={(e) => setDiet(e.target.value)} />
        </label>
      </div>
      <p role="status">{matches.length} collections match these criteria.</p>
      <div className="recipe-grid">
        {matches.map(({ template }) => (
          <article className="card" key={template.id}>
            <h3>
              <a href={`/meal-plans/templates/${template.slug}`}>
                {template.title}
              </a>
            </h3>
            <p>
              {template.plan.plannedItems.length} recipe servings ·{" "}
              {template.energyBandKcal.join("–")} kcal ·{" "}
              {template.plan.summary.completeness} nutrient coverage
            </p>
            <p>
              Allergen information is unknown. No dietary safety or nutritional
              adequacy guarantee.
            </p>
          </article>
        ))}
      </div>
      {!matches.length && (
        <p>
          No public collection matches. Change the filters or build a manual
          plan.
        </p>
      )}
      <a className="button primary" href="/meal-plans/create">
        Build a manual plan
      </a>
    </>
  );
}
