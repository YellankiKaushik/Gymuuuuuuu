import { useEffect, useState, type ReactNode } from "react";
import { PageHeader, SectionNav } from "../../components/common/page-header";
import { useRecipes, RecipeWorkspace, downloadRecipeFile } from "./workspace";
import { recipeDraft } from "./editor";
import {
  ingredientFromFoodEntry,
  unresolvedIngredient,
  componentIngredient,
  scaleRecipe,
  buildRecipeLogSnapshot,
} from "./domain";
import {
  archiveRecipeEntity,
  saveRecipeVersion,
  prepareConsumptionIntent,
  commitConsumptionIntent,
  setRecipeFavourite,
} from "./storage";
import {
  createCustomFoodLogSnapshot,
  newNutritionId,
  localDateAt,
  consumedInstant,
  makeNutritionDay,
} from "../nutrition-tracker/domain";
import { readNutritionBackup } from "../nutrition-tracker/storage";
import type { NutritionBackup } from "../nutrition-tracker/schema";
import { recipeVersionSchema } from "./schema";
import { readDietBackup } from "../diet-planning/storage";
import { bindDayTargetSnapshot } from "../nutrition-tracker/domain";
import { recipeExclusionWarnings } from "./publication";
import { foodIndex, getFoodProfile } from "../foods/repository";
import {
  createCanonicalFoodLogSnapshot,
  exactMassAmount,
} from "../nutrition-tracker/domain";
import {
  cookingMethodSchema,
  type Ingredient,
  type RecipeVersion,
} from "./schema";
export function RecipePage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="page recipe-page">
      <PageHeader
        title={title}
        eyebrow="Fitness OS · Meals"
        description="Local recipes and manual meal plans. Calculations show what is known and what is missing."
      />
      <SectionNav
        label="Recipes and meal plans"
        items={[
          { label: "Recipes", href: "/recipes" },
          { label: "Create recipe", href: "/recipes/create" },
          { label: "Meal plans", href: "/meal-plans" },
          { label: "Methodology", href: "/recipes/methodology" },
          { label: "Backup & settings", href: "/meal-plans/settings" },
          { label: "Privacy", href: "/meal-plans/privacy" },
        ]}
      />
      <RecipeWorkspace>{children}</RecipeWorkspace>
    </div>
  );
}
export function useRecipeNutrition() {
  const [nutrition, setNutrition] = useState<NutritionBackup | null>(null);
  useEffect(() => {
    void readNutritionBackup()
      .then(setNutrition)
      .catch(() => {
        setNutrition(null);
      });
  }, []);
  return nutrition;
}
export function RecipeCatalogue() {
  const { data, readOnly, run } = useRecipes();
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("active"),
    [sort, setSort] = useState("recent"),
    [grade, setGrade] = useState(""),
    [favourites, setFavourites] = useState(false),
    [filters, setFilters] = useState<Record<string, string>>({});
  if (!data) return <p role="status">Loading local recipe records…</p>;
  const records = data.recipeIdentities
    .filter((id) => id.status === status)
    .map((id) => ({
      id,
      v: data.recipeVersions.find((v) => v.id === id.currentVersionId)!,
    }))
    .filter(
      ({ id, v }) =>
        `${v.title} ${v.description ?? ""} ${v.ingredients.map((l) => l.displayNameSnapshot).join(" ")} ${Object.values(v.tags).flat().join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (!grade || v.calculation.grade === grade) &&
        (!favourites || data.favourites.some((f) => f.referenceId === id.id)) &&
        Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          if (key === "visibility") return id.visibility === value;
          if (key === "prep" || key === "cook") {
            const n = key === "prep" ? v.prepMinutes : v.cookMinutes;
            return n !== null && n !== undefined && n <= Number(value);
          }
          if (key === "difficulty") return v.tags.difficulty === value;
          if (key === "source") return v.source.kind === value;
          if (key === "allergen")
            return v.allergenInfo.some(
              (a) =>
                a.tag.toLowerCase().includes(value.toLowerCase()) &&
                a.state !== "unknown",
            );
          const values =
            key === "meal"
              ? v.tags.mealTypes
              : key === "diet"
                ? v.tags.dietary
                : v.tags.equipment;
          return values.some((tag) =>
            tag.toLowerCase().includes(value.toLowerCase()),
          );
        }) &&
        (sort === "energy" || sort === "protein"
          ? v.calculation.batchNutrients.some(
              (n) =>
                n.nutrientId ===
                  (sort === "energy" ? "energy_kcal" : "protein_g") &&
                n.perServingValue !== null,
            )
          : sort === "prep"
            ? v.prepMinutes !== null && v.prepMinutes !== undefined
            : true),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.v.title.localeCompare(b.v.title)
        : sort === "prep"
          ? a.v.prepMinutes! - b.v.prepMinutes!
          : sort === "energy" || sort === "protein"
            ? a.v.calculation.batchNutrients.find(
                (n) =>
                  n.nutrientId ===
                  (sort === "energy" ? "energy_kcal" : "protein_g"),
              )!.perServingValue! -
              b.v.calculation.batchNutrients.find(
                (n) =>
                  n.nutrientId ===
                  (sort === "energy" ? "energy_kcal" : "protein_g"),
              )!.perServingValue!
            : b.id.updatedAt.localeCompare(a.id.updatedAt),
    );
  return (
    <>
      <div className="recipe-controls">
        <label>
          Search title, ingredient or tag
          <input value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <label>
          Records
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Recent</option>
            <option value="name">Name</option>
            <option value="prep">Preparation time (known values)</option>
            <option value="energy">Energy per serving (known values)</option>
            <option value="protein">Protein per serving (known values)</option>
          </select>
        </label>
        <label>
          Calculation grade
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="">All grades</option>
            {["A", "B", "C", "D", "E"].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={favourites}
            onChange={(e) => setFavourites(e.target.checked)}
          />{" "}
          Favourites
        </label>
      </div>
      <details>
        <summary>More recipe filters</summary>
        <div className="recipe-controls">
          {[
            ["visibility", "Visibility (local or published_reference)"],
            ["meal", "Meal type"],
            ["prep", "Maximum preparation minutes"],
            ["cook", "Maximum cooking minutes"],
            ["difficulty", "Difficulty"],
            ["diet", "Dietary tag"],
            ["allergen", "Declared allergen"],
            ["equipment", "Equipment"],
            ["source", "Source kind"],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={filters[key!] ?? ""}
                onChange={(e) =>
                  setFilters({ ...filters, [key!]: e.target.value })
                }
              />
            </label>
          ))}
        </div>
      </details>
      <p className="notice">
        No reviewed public recipes are published yet. Your own recipes stay on
        this browser. <a href="/nutrition/custom-foods">Create a custom food</a>{" "}
        to enter values from your own source.
      </p>
      {records.length === 0 && <p>No matching local recipes.</p>}
      <div className="recipe-grid">
        {records.map(({ id, v }) => (
          <article className="recipe-card" key={id.id}>
            <h2>
              <a href={`/recipes/local/${id.id}`}>{v.title}</a>
            </h2>
            <p>
              Version {v.versionNumber} · Grade {v.calculation.grade} ·{" "}
              {v.calculation.status}
            </p>
            <p>
              {v.ingredients.length} ingredients ·{" "}
              {v.yieldModel.servings ?? "Unknown"} servings
            </p>
            <div className="actions">
              <button
                className="button secondary"
                disabled={readOnly}
                onClick={() =>
                  void run(
                    () =>
                      setRecipeFavourite(
                        id.id,
                        !data.favourites.some((f) => f.referenceId === id.id),
                      ),
                    "Favourite updated.",
                  )
                }
              >
                Toggle favourite
              </button>
              <button
                className="button secondary"
                disabled={readOnly}
                onClick={() => {
                  if (
                    window.confirm(
                      `${id.status === "active" ? "Archive" : "Reactivate"} this recipe? Historical versions are retained.`,
                    )
                  )
                    void run(
                      () =>
                        archiveRecipeEntity(
                          "recipe",
                          id.id,
                          id.status === "active",
                        ),
                      "Recipe status updated.",
                    );
                }}
              >
                {id.status === "active" ? "Archive" : "Reactivate"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
export function RecipeBuilder({ recipeId }: { recipeId?: string }) {
  const { data } = useRecipes();
  if (!data) return <p role="status">Loading recipe editor…</p>;
  const identity = data.recipeIdentities.find((r) => r.id === recipeId),
    previous = data.recipeVersions.find(
      (v) => v.id === identity?.currentVersionId,
    );
  if (recipeId && !previous) return <p>This local recipe is unavailable.</p>;
  return <RecipeBuilderForm key={previous?.id ?? "new"} previous={previous} />;
}
function RecipeBuilderForm({ previous }: { previous?: RecipeVersion }) {
  const { data, readOnly, run } = useRecipes(),
    nutrition = useRecipeNutrition();
  const [title, setTitle] = useState(previous?.title ?? ""),
    [lines, setLines] = useState<Ingredient[]>(previous?.ingredients ?? []),
    [instructions, setInstructions] = useState(
      previous?.instructions.map((s) => s.text).join("\n") ?? "",
    ),
    [reason, setReason] = useState(""),
    [method, setMethod] = useState<
      RecipeVersion["methodology"]["cookingMethod"]
    >(previous?.methodology.cookingMethod ?? "no_cook"),
    [unadjusted, setUnadjusted] = useState(
      previous?.methodology.allowUnadjustedRetention ?? false,
    ),
    [yieldMode, setYieldMode] = useState<RecipeVersion["yieldModel"]["mode"]>(
      previous?.yieldModel.mode ?? "measured_final_weight",
    ),
    [mass, setMass] = useState(
      String(previous?.yieldModel.finalWeightGrams ?? ""),
    ),
    [servings, setServings] = useState(
      String(previous?.yieldModel.servings ?? ""),
    ),
    [servingMass, setServingMass] = useState(
      String(previous?.yieldModel.servingWeightGrams ?? ""),
    ),
    [measured, setMeasured] = useState(
      previous?.yieldModel.measuredAt?.slice(0, 16) ?? "",
    ),
    [yieldNote, setYieldNote] = useState(previous?.yieldModel.note ?? ""),
    [picker, setPicker] = useState("unresolved"),
    [name, setName] = useState(""),
    [grams, setGrams] = useState(""),
    [error, setError] = useState(""),
    [preview, setPreview] = useState<RecipeVersion | null>(null);
  const [metadata, setMetadata] = useState({
    description: previous?.description ?? "",
    prep: String(previous?.prepMinutes ?? ""),
    cook: String(previous?.cookMinutes ?? ""),
    meal: previous?.tags.mealTypes.join(", ") ?? "",
    cuisine: previous?.tags.cuisines.join(", ") ?? "",
    diet: previous?.tags.dietary.join(", ") ?? "",
    equipment: previous?.tags.equipment.join(", ") ?? "",
    storage: previous?.storageNotes ?? "",
    allergens:
      previous?.allergenInfo
        .filter((a) => a.state === "contains")
        .map((a) => a.tag)
        .join(", ") ?? "",
  });
  if (!data) return null;
  const nullable = (s: string) => (s.trim() ? Number(s) : null);
  const make = () => {
    const v = recipeDraft(title.trim(), lines, {
      recipeId: previous?.recipeId,
      versionNumber: previous
        ? Math.max(
            ...data.recipeVersions
              .filter((v) => v.recipeId === previous.recipeId)
              .map((v) => v.versionNumber),
          ) + 1
        : 1,
      instructions,
      cookingMethod: method,
      allowUnadjustedRetention: unadjusted,
      reason: reason.trim() || (previous ? "" : "Created manually"),
      yieldModel: {
        mode: yieldMode,
        finalWeightGrams: nullable(mass),
        servings: nullable(servings),
        servingWeightGrams: nullable(servingMass),
        tolerancePercent: 2,
        measuredAt: measured ? new Date(`${measured}:00Z`).toISOString() : null,
        note: yieldNote,
      },
    });
    const tags = (text: string) => [
      ...new Set(
        text
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
    return recipeVersionSchema.parse({
      ...v,
      description: metadata.description,
      prepMinutes: nullable(metadata.prep),
      cookMinutes: nullable(metadata.cook),
      storageNotes: metadata.storage,
      tags: {
        ...v.tags,
        mealTypes: tags(metadata.meal),
        cuisines: tags(metadata.cuisine),
        dietary: tags(metadata.diet),
        equipment: tags(metadata.equipment),
      },
      equipment: tags(metadata.equipment),
      allergenInfo: [
        ...v.allergenInfo,
        ...tags(metadata.allergens).map((tag) => ({
          tag,
          state: "contains",
          basis: "Explicit user declaration; not independently verified.",
        })),
      ],
    });
  };
  const add = async () => {
    try {
      const amount = Number(grams);
      if (!Number.isFinite(amount) || amount <= 0)
        throw Error("Enter a positive edible mass in grams.");
      let line: Ingredient;
      if (picker === "unresolved")
        line = unresolvedIngredient(
          name.trim(),
          amount,
          "g",
          amount,
          lines.length,
        );
      else if (picker.startsWith("custom:")) {
        const id = nutrition?.customFoods.find((f) => f.id === picker.slice(7)),
          rev = nutrition?.customFoodRevisions.find(
            (r) => r.id === id?.currentRevisionId,
          );
        if (!id || !rev) throw Error("Custom food revision unavailable.");
        const now = new Date().toISOString(),
          zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const entry = createCustomFoodLogSnapshot(
          rev,
          id.name,
          id.brand ?? null,
          amount / rev.serving.gramWeight,
          {
            localDate: localDateAt(new Date(), zone),
            timeZone: zone,
            occurredAtUtc: now,
            mealSlotId: "meal_lunch",
            mealLabelSnapshot: "Ingredient source",
            now,
          },
        );
        line = ingredientFromFoodEntry(entry, lines.length, rev);
      } else if (picker.startsWith("food:")) {
        const resolved = await getFoodProfile(picker.slice(5));
        if (!resolved) throw Error("Approved food/profile unavailable.");
        const now = new Date().toISOString(),
          zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        line = ingredientFromFoodEntry(
          createCanonicalFoodLogSnapshot(
            resolved.food,
            resolved.profile.profileId,
            exactMassAmount(amount, "g"),
            {
              localDate: localDateAt(new Date(), zone),
              timeZone: zone,
              occurredAtUtc: now,
              mealSlotId: "meal_lunch",
              mealLabelSnapshot: "Ingredient source",
              now,
            },
          ),
          lines.length,
          undefined,
          resolved.food.allergenTags,
        );
      } else {
        const component = data.recipeVersions.find(
          (v) => v.id === picker.slice(7),
        );
        if (!component) throw Error("Component version unavailable.");
        line = componentIngredient(
          component,
          amount,
          lines.length,
          previous?.recipeId ?? "recipe_new",
          data.recipeVersions,
        );
      }
      setLines([...lines, line]);
      setError("");
      setName("");
      setGrams("");
      setPreview(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Ingredient unavailable.",
      );
    }
  };
  return (
    <>
      <p className="notice">
        Use measured edible weights. Generic cups and cooking losses are not
        converted automatically. Unknown ingredient composition stays unknown.
        No retention factors are published; cooked recipes must either keep
        clearly labelled unadjusted values or show unavailable nutrients.
      </p>
      {error && <p role="alert">{error}</p>}
      <form
        className="recipe-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const v = make(),
              old = data.recipeIdentities.find((r) => r.id === v.recipeId),
              now = new Date().toISOString();
            void run(
              () =>
                saveRecipeVersion(
                  {
                    id: v.recipeId,
                    schemaVersion: 1,
                    visibility: "local",
                    title: v.title,
                    currentVersionId: v.id,
                    status: old?.status ?? "active",
                    createdAt: old?.createdAt ?? now,
                    updatedAt: now,
                  },
                  v,
                  old?.updatedAt,
                ),
              `Recipe version ${v.versionNumber} saved locally.`,
            ).then((ok) => {
              if (ok) window.location.assign(`/recipes/local/${v.recipeId}`);
            });
          } catch (cause) {
            setError(
              cause instanceof Error
                ? cause.message
                : "Recipe validation failed.",
            );
          }
        }}
      >
        <label>
          Recipe title
          <input
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <fieldset>
          <legend>Ingredients</legend>
          <label>
            Ingredient source
            <select value={picker} onChange={(e) => setPicker(e.target.value)}>
              <option value="unresolved">
                Unresolved · no nutrient values
              </option>
              {foodIndex.flatMap((f) =>
                f.profiles.map((p) => (
                  <option key={p.id} value={`food:${p.id}`}>
                    {f.name} · {p.state} · exact approved profile
                  </option>
                )),
              )}
              {nutrition?.customFoods
                .filter((f) => f.status === "active")
                .map((f) => (
                  <option key={f.id} value={`custom:${f.id}`}>
                    {f.name} · custom food
                  </option>
                ))}
              {data.recipeIdentities
                .filter(
                  (r) => r.id !== previous?.recipeId && r.status === "active",
                )
                .map((r) => (
                  <option key={r.id} value={`recipe:${r.currentVersionId}`}>
                    {r.title} · exact recipe version
                  </option>
                ))}
            </select>
          </label>
          {picker === "unresolved" && (
            <label>
              Ingredient name
              <input
                value={name}
                maxLength={200}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
          <label>
            Edible mass (g)
            <input
              type="number"
              min="0.001"
              step="any"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="button secondary"
            onClick={add}
            disabled={readOnly}
          >
            Add ingredient
          </button>
          <ol>
            {lines.map((l, i) => (
              <li key={l.id}>
                {l.displayNameSnapshot} — {l.gramWeight ?? "Unknown"} g (
                {l.kind.replaceAll("_", " ")}){" "}
                <button
                  type="button"
                  className="button secondary"
                  disabled={i === 0}
                  onClick={() => {
                    const copy = [...lines];
                    [copy[i - 1], copy[i]] = [copy[i]!, copy[i - 1]!];
                    setLines(copy);
                  }}
                >
                  Move up
                </button>{" "}
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Remove this ingredient from the unsaved recipe?",
                      )
                    )
                      setLines(lines.filter((_, n) => n !== i));
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ol>
        </fieldset>
        <label>
          Instructions (one step per line)
          <textarea
            required
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </label>
        <label>
          Cooking method
          <select
            value={method}
            onChange={(e) =>
              setMethod(cookingMethodSchema.parse(e.target.value))
            }
          >
            {cookingMethodSchema.options.map((m) => (
              <option key={m} value={m}>
                {m.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={unadjusted}
            onChange={(e) => setUnadjusted(e.target.checked)}
          />{" "}
          Explicitly permit unadjusted estimates when retention data is missing
        </label>
        <fieldset>
          <legend>Yield and servings</legend>
          <label>
            Yield basis
            <select
              value={yieldMode}
              onChange={(e) =>
                setYieldMode(
                  e.target.value as RecipeVersion["yieldModel"]["mode"],
                )
              }
            >
              {[
                "measured_final_weight",
                "measured_servings",
                "estimated_sum_ingredients",
                "serving_count_only",
                "unavailable",
              ].map((m) => (
                <option key={m} value={m}>
                  {m.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label>
            Final edible mass, without container (g)
            <input
              type="number"
              step="any"
              min="0.001"
              value={mass}
              onChange={(e) => setMass(e.target.value)}
            />
          </label>
          <label>
            Serving count
            <input
              type="number"
              step="any"
              min="0.001"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </label>
          <label>
            Measured serving mass (g), optional
            <input
              type="number"
              min="0.001"
              step="any"
              value={servingMass}
              onChange={(e) => setServingMass(e.target.value)}
            />
          </label>
          <label>
            Measurement date and time (UTC)
            <input
              type="datetime-local"
              value={measured}
              onChange={(e) => setMeasured(e.target.value)}
            />
          </label>
          <label>
            Yield note / reconciliation reason
            <textarea
              value={yieldNote}
              onChange={(e) => setYieldNote(e.target.value)}
            />
          </label>
        </fieldset>
        <details>
          <summary>Recipe description, time, tags and declarations</summary>
          {Object.entries(metadata).map(([key, value]) => (
            <label key={key}>
              {key === "allergens"
                ? "Declared contained allergens (comma-separated; unknown status remains)"
                : key === "prep"
                  ? "Preparation minutes (optional)"
                  : key === "cook"
                    ? "Cooking minutes (optional)"
                    : `${key} (user-entered)`}
              <input
                value={value}
                onChange={(e) =>
                  setMetadata({ ...metadata, [key]: e.target.value })
                }
              />
            </label>
          ))}
        </details>
        <label>
          Reason for this version
          <input
            required={!!previous}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <div className="actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              try {
                setPreview(make());
                setError("");
              } catch (cause) {
                setError(
                  cause instanceof Error ? cause.message : "Invalid recipe.",
                );
              }
            }}
          >
            Preview calculation
          </button>
          <button className="button primary" disabled={readOnly}>
            Save immutable recipe version
          </button>
        </div>
      </form>
      {preview && <RecipeCalculation recipe={preview} />}
    </>
  );
}
export function RecipeCalculation({ recipe }: { recipe: RecipeVersion }) {
  return (
    <section>
      <h2>Calculation · Grade {recipe.calculation.grade}</h2>
      <p>
        {recipe.calculation.status} ·{" "}
        {recipe.calculation.method.replaceAll("_", " ")} ·{" "}
        {recipe.calculation.methodologyVersion}
      </p>
      <p>
        Grades describe calculation evidence, not the healthfulness of a recipe.
        Known totals can omit unmeasured nutrients.
      </p>
      <div className="recipe-table-wrap">
        <table>
          <caption>
            Recipe nutrient values and known ingredient mass coverage
          </caption>
          <thead>
            <tr>
              <th scope="col">Nutrient</th>
              <th scope="col">Batch</th>
              <th scope="col">Per 100 g</th>
              <th scope="col">Per serving</th>
              <th scope="col">Coverage</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {recipe.calculation.batchNutrients.map((n) => (
              <tr key={n.nutrientId}>
                <th scope="row">
                  {n.nutrientId.replaceAll("_", " ")} ({n.unit})
                </th>
                <td>{formatRecipeValue(n.batchValue)}</td>
                <td>{formatRecipeValue(n.per100gValue)}</td>
                <td>{formatRecipeValue(n.perServingValue)}</td>
                <td>
                  {n.massCoveragePercent.toFixed(1)}% ·{" "}
                  {n.quantifiedIngredients}/{n.eligibleIngredients} lines
                </td>
                <td>{n.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {recipe.calculation.warnings?.length ? (
        <ul>
          {recipe.calculation.warnings.map((w) => (
            <li key={w}>{w.replaceAll("_", " ")}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
export function formatRecipeValue(n: number | null) {
  return n === null
    ? "Unavailable"
    : new Intl.NumberFormat("en", { maximumFractionDigits: 3 }).format(n);
}
export function RecipeDetail({ recipeId }: { recipeId: string }) {
  const { data } = useRecipes();
  const [versionId, setVersionId] = useState(""),
    [scale, setScale] = useState("");
  if (!data) return <p role="status">Loading local recipe…</p>;
  const id = data.recipeIdentities.find((i) => i.id === recipeId),
    versions = data.recipeVersions.filter((v) => v.recipeId === recipeId),
    recipe = versions.find((v) => v.id === (versionId || id?.currentVersionId));
  if (!id || !recipe) return <p>This recipe is unavailable on this browser.</p>;
  let scaled: ReturnType<typeof scaleRecipe> | null = null;
  try {
    if (scale) scaled = scaleRecipe(recipe, Number(scale));
  } catch {
    /* Invalid input remains unsaved. */
  }
  return (
    <>
      <h2>{recipe.title}</h2>
      <label>
        Version
        <select
          value={recipe.id}
          onChange={(e) => setVersionId(e.target.value)}
        >
          {versions.map((v) => (
            <option key={v.id} value={v.id}>
              Version {v.versionNumber} · {v.revisionReason}
            </option>
          ))}
        </select>
      </label>
      <p>
        Source: {recipe.source.kind.replaceAll("_", " ")} ·{" "}
        {recipe.source.licenceStatus.replaceAll("_", " ")} ·{" "}
        {recipe.source.reviewedAt ?? "Not independently reviewed"}
      </p>
      <div className="actions">
        <a className="button primary" href={`/recipes/local/${id.id}/edit`}>
          Create a revised version
        </a>
        <button className="button secondary" onClick={() => window.print()}>
          Print recipe
        </button>
        <button
          className="button secondary"
          onClick={() =>
            downloadRecipeFile(
              JSON.stringify(recipe, null, 2),
              `${recipe.id}.json`,
            )
          }
        >
          Export this version
        </button>
      </div>
      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients.map((l) => (
          <li key={l.id}>
            {l.displayNameSnapshot}: {l.gramWeight ?? "Unknown"} g ·{" "}
            {l.kind.replaceAll("_", " ")}
            {l.customFoodRef && ` · revision ${l.customFoodRef.revisionId}`}
            {l.canonicalFoodRef &&
              ` · ${l.canonicalFoodRef.sourceDatabase} ${l.canonicalFoodRef.sourceRelease}`}
          </li>
        ))}
      </ul>
      <h3>Instructions</h3>
      <ol>
        {recipe.instructions.map((s) => (
          <li key={s.id}>{s.text}</li>
        ))}
      </ol>
      <p className="notice">
        Allergen information is unknown unless explicitly sourced. Ingredient
        declarations do not guarantee freedom from allergens or
        cross-contamination.
      </p>
      <label>
        Scale preview: desired servings
        <input
          type="number"
          min="0.001"
          step="any"
          value={scale}
          onChange={(e) => setScale(e.target.value)}
        />
      </label>
      {scaled && (
        <>
          <p>{scaled.warning}</p>
          <ul>
            {scaled.ingredients.map((l) => (
              <li key={l.id}>
                {l.name}: {formatRecipeValue(l.grams)} g {l.practicalGrams}
              </li>
            ))}
          </ul>
        </>
      )}
      <p>
        Yield: {recipe.yieldModel.finalWeightGrams ?? "Unavailable"} g ·{" "}
        {recipe.yieldModel.servings ?? "Unknown"} servings ·{" "}
        {recipe.yieldModel.mode.replaceAll("_", " ")} · yield factor{" "}
        {formatRecipeValue(recipe.yieldModel.yieldFactor ?? null)}
      </p>
      <p>
        Preparation: {recipe.prepMinutes ?? "Not recorded"} min · Cooking:{" "}
        {recipe.cookMinutes ?? "Not recorded"} min · Equipment:{" "}
        {recipe.equipment?.join(", ") || "Not declared"}
      </p>
      <p>{recipe.description}</p>
      <p>
        Storage notes (user-entered): {recipe.storageNotes || "Not recorded"}
      </p>
      <p>Dietary tags: {recipe.tags.dietary.join(", ") || "Not declared"}</p>
      <ul>
        {recipeExclusionWarnings(
          recipe,
          data.preferences.excludedIngredientIds ?? [],
          data.preferences.excludedAllergenTags ?? [],
        ).map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <details>
        <summary>Complete calculation arithmetic and source snapshots</summary>
        <pre className="recipe-snapshot">
          {JSON.stringify(
            {
              ingredients: recipe.ingredients,
              yield: recipe.yieldModel,
              methodology: recipe.methodology,
            },
            null,
            2,
          )}
        </pre>
      </details>
      <a className="button secondary" href="/meal-plans">
        Add servings to a manual meal plan
      </a>
      <RecipeCalculation recipe={recipe} />
      <RecipeLogForm recipe={recipe} />
    </>
  );
}
export function RecipeLogForm({
  recipe,
  plannedItemRef,
}: {
  recipe: RecipeVersion;
  plannedItemRef?: { planVersionId: string; plannedItemId: string };
}) {
  const { data, run, readOnly } = useRecipes(),
    nutrition = useRecipeNutrition();
  const [servings, setServings] = useState("1"),
    [date, setDate] = useState(""),
    [time, setTime] = useState(""),
    [meal, setMeal] = useState("meal_lunch");
  if (!nutrition || !data)
    return (
      <p>Nutrition storage must be available to log a consumed serving.</p>
    );
  const pending = data.consumptionIntents.filter(
    (i) => i.recipeVersionId === recipe.id && i.stage === "pending",
  );
  return (
    <section className="no-print">
      <h2>Log an actually consumed serving</h2>
      <p>
        Planning does not create a diary record. Logging freezes this recipe
        version and its source information.
      </p>
      <form
        className="recipe-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            const zone = Intl.DateTimeFormat().resolvedOptions().timeZone,
              utc = consumedInstant(date, time, zone),
              now = new Date().toISOString(),
              entry = buildRecipeLogSnapshot(
                recipe,
                Number(servings),
                {
                  localDate: date,
                  localTime: time,
                  occurredAtUtc: utc,
                  timeZone: zone,
                  mealSlotId: meal,
                  mealLabelSnapshot:
                    nutrition.preferences.mealSlots.find((m) => m.id === meal)
                      ?.label ?? meal,
                  now,
                },
                plannedItemRef,
              ),
              id = newNutritionId("intent");
            const target = nutrition.preferences.currentDietPlanId
              ? bindDayTargetSnapshot(
                  (await readDietBackup()).plans.find(
                    (p) => p.id === nutrition.preferences.currentDietPlanId,
                  ) ?? null,
                )
              : null;
            await prepareConsumptionIntent({
              id,
              kind: "consumption_intent",
              schemaVersion: 1,
              recipeVersionId: recipe.id,
              planVersionId: plannedItemRef?.planVersionId ?? null,
              plannedItemId: plannedItemRef?.plannedItemId ?? null,
              entry,
              day: makeNutritionDay(date, zone, target),
              stage: "pending",
              requestedAt: now,
              updatedAt: now,
              error: null,
            });
            return commitConsumptionIntent(id);
          }, "Consumed recipe saved to nutrition diary.");
        }}
      >
        <label>
          Consumed servings
          <input
            required
            type="number"
            min="0.001"
            step="any"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </label>
        <label>
          Consumed date
          <input
            required
            type="date"
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
        <label>
          Meal
          <select value={meal} onChange={(e) => setMeal(e.target.value)}>
            {nutrition.preferences.mealSlots
              .filter((m) => m.visible)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
          </select>
        </label>
        <button className="button primary" disabled={readOnly}>
          Log consumed serving
        </button>
      </form>
      {pending.map((i) => (
        <p key={i.id}>
          Pending diary write: {i.error ?? "Ready to retry"}{" "}
          <button
            className="button secondary"
            onClick={() =>
              void run(
                () => commitConsumptionIntent(i.id),
                "Pending diary entry completed.",
              )
            }
          >
            Retry safely
          </button>
        </p>
      ))}
    </section>
  );
}
