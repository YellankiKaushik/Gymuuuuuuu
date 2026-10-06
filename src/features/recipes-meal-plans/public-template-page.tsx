import type { PublicTemplate } from "./publication";
export function PublicTemplateDetail({
  template,
}: {
  template: PublicTemplate | null;
}) {
  if (!template)
    return (
      <section>
        <h2>Collection unavailable</h2>
        <a href="/meal-plans/templates">Browse meal-prep collections</a>
      </section>
    );
  return (
    <article>
      <h2>{template.title}</h2>
      <p>
        Version {template.plan.versionNumber} · personal-use publication ·
        source checked {template.review.reviewedAt.slice(0, 10)}. No independent
        human or clinical review.
      </p>
      <h3>Exact menu</h3>
      <ul>
        {template.plan.plannedItems.map((item) => (
          <li key={item.id}>
            <a
              href={`/recipes/${template.recipeLinks.find((r) => r.versionId === item.recipeRef!.recipeVersionId)!.slug}`}
            >
              {item.displayNameSnapshot}
            </a>
            : {item.quantity} serving · {item.gramWeight} g estimated
            ingredient-sum yield ·{" "}
            {item.mealSlotId === "meal_snack" ? "snack" : "lunch"}
          </li>
        ))}
      </ul>
      <h3>Calculated nutrition</h3>
      <p>
        Totals for this collection only. Unavailable nutrients remain
        unavailable. These are not reference intakes.
      </p>
      <div
        className="table-scroll"
        role="region"
        aria-label="Collection nutrition"
        tabIndex={0}
      >
        <table>
          <caption>Known totals from frozen recipe versions</caption>
          <thead>
            <tr>
              <th scope="col">Nutrient</th>
              <th scope="col">Known amount</th>
              <th scope="col">Coverage</th>
            </tr>
          </thead>
          <tbody>
            {template.plan.summary.dailySummaries[0]!.nutrients.map((n) => (
              <tr key={n.nutrientId}>
                <th scope="row">{n.nutrientId.replaceAll("_", " ")}</th>
                <td>
                  {n.value === null
                    ? "Unavailable"
                    : `${Number(n.value.toFixed(2))} ${n.unit}`}
                </td>
                <td>{n.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>Equipment</h3>
      <p>{template.equipment.join(", ")}</p>
      <h3>Limitations</h3>
      <ul>
        {template.limitations.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      <p>{template.substitutionGuidance}</p>
      <details>
        <summary>Sources and exact recipe versions</summary>
        <ul>
          {template.recipeVersionIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
        <p>
          Ingredient source URLs and dataset releases are shown on each linked
          recipe and food profile.
        </p>
        <ul>
          {template.sourceRefs.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </details>
      <a className="button primary" href="/meal-plans/create">
        Build a personal plan
      </a>
    </article>
  );
}
