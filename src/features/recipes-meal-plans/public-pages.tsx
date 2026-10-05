import type { PublicRecipe } from "./publication";
import type { PublicRecipeSummary } from "./public-records";
import { RecipeCalculation } from "./pages";
export function PublicRecipeCatalogue({
  recipes,
}: {
  recipes: readonly PublicRecipeSummary[];
}) {
  return (
    <section aria-labelledby="public-recipes-title">
      <h2 id="public-recipes-title">Repository recipes</h2>
      <p>
        {recipes.length} original recipes with source-backed ingredients.
        Personal-use publication; no human taste, yield or clinical review.
      </p>
      <div className="recipe-grid">
        {recipes.map((r) => (
          <article className="card" key={r.id}>
            <h3>
              <a href={`/recipes/${r.slug}`}>{r.title}</a>
            </h3>
            <p>
              {r.ingredients.map((i) => `${i.grams} g ${i.name}`).join(" · ")}
            </p>
            <p>
              Calculation grade {r.grade} · {r.coverage} coverage · estimated
              yield
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function PublicRecipeDetail({
  recipe,
}: {
  recipe: PublicRecipe | null;
}) {
  if (!recipe)
    return (
      <section>
        <h2>Public recipe unavailable</h2>
        <p>This recipe has no source-validated public version.</p>
        <a href="/recipes">Browse available recipes</a>
      </section>
    );
  const v = recipe.version;
  return (
    <article>
      <h2>{v.title}</h2>
      <p>
        Version {v.versionNumber} · personal-use publication · source checked{" "}
        {recipe.review.reviewedAt.slice(0, 10)}.
      </p>
      <p>
        No independent human, taste, yield or clinical review.{" "}
        {recipe.review.reviewer}
      </p>
      <h3>Exact ingredients</h3>
      <ul>
        {v.ingredients.map((i) => (
          <li key={i.id}>
            {i.gramWeight} g {i.displayNameSnapshot} ·{" "}
            {i.canonicalFoodRef?.profileState} ·{" "}
            <a href={`/foods/${i.sourceSnapshot?.canonicalFoodRef?.foodSlug}`}>
              Exact food profile
            </a>
          </li>
        ))}
      </ul>
      <h3>Method</h3>
      <ol>
        {v.instructions.map((s) => (
          <li key={s.id}>{s.text}</li>
        ))}
      </ol>
      <p>{v.yieldModel.note}</p>
      <p>
        {v.yieldModel.servings} serving · {v.yieldModel.finalWeightGrams} g
        estimated batch mass.
      </p>
      <h3>Allergens and limitations</h3>
      <ul>
        {v.allergenInfo.map((a) => (
          <li key={a.tag}>
            {a.state}: {a.basis}
          </li>
        ))}
      </ul>
      <RecipeCalculation recipe={v} />
      <h3>Ingredient source snapshots</h3>
      <ul>
        {v.ingredients
          .flatMap((i) => i.sourceSnapshot?.sourceRecords ?? [])
          .map((s, i) => (
            <li key={`${s.sourceRecordId}:${i}`}>
              <a
                href={`https://fdc.nal.usda.gov/food-details/${s.externalFoodId}/nutrients`}
              >
                {s.externalDescription}
              </a>{" "}
              · {s.release} · {s.licenseNote}
            </li>
          ))}
      </ul>
      <a href="/recipes/methodology">Calculation methodology</a>
    </article>
  );
}
