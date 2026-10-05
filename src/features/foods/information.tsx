import { PageHeader } from "../../components/common/page-header";
import { InfoCallout } from "../../components/common/primitives";
import { foodReference } from "./schema";
import { foodIndex, foodReleaseReport } from "./repository";
export function FoodCategories() {
  return (
    <div className="page">
      <PageHeader
        title="Food categories"
        eyebrow="EAT / BROWSE"
        description="Browse the food library by its stable category structure."
      />
      <div className="entity-grid">
        {foodReference.foodCategories.map((c) => (
          <a
            className="entity-card"
            href={`/foods/categories/${c.id}`}
            key={c.id}
          >
            <h2>{c.label}</h2>
            <p>{c.description}</p>
            <small>
              {foodIndex.filter((f) => f.category === c.id).length} reviewed
              foods
            </small>
          </a>
        ))}
      </div>
    </div>
  );
}
export function FoodSources() {
  return (
    <div className="page food-information">
      <PageHeader
        title="Food composition sources"
        eyebrow="EAT / PROVENANCE"
        description="Source policies guide what can be compiled and published in the food library."
      />
      <InfoCallout title="Current public release">
        {foodReleaseReport.publishedFoods} source-backed foods and{" "}
        {foodReleaseReport.publishedProfiles} machine-validated profiles are
        published for personal use. Source matching and automated checks do not
        constitute independent human or clinical review.
      </InfoCallout>
      {foodReference.sourceRegistry.map((s) => (
        <section className="food-source-record" key={s.id}>
          <h2>{s.name}</h2>
          <p>
            {s.usage} · {s.release}
          </p>
          <p>
            {s.license} · {s.redistribution}
          </p>
          <p>{s.notes}</p>
          <a href={s.url}>Official source</a>
        </section>
      ))}
      <a href="/foods/methodology">Read compilation methodology</a>
    </div>
  );
}
export function FoodMethodology() {
  return (
    <div className="page food-information">
      <PageHeader
        title="How food data is handled"
        eyebrow="EAT / METHODOLOGY"
        description="Clear food identities, explicit preparation states, source-backed numbers and visible uncertainty."
      />
      <section>
        <h2>From identity to reviewed profile</h2>
        <p>
          A food identity is a name and classification. It becomes public only
          after at least one composition profile passes source matching, numeric
          checks and editorial review. Raw, cooked, dried and processed states
          remain separate profiles.
        </p>
      </section>
      <section>
        <h2>A consistent basis</h2>
        <p>
          Composition is stored per 100 g edible portion in canonical units.
          Serving amounts multiply those values by edible grams divided by 100.
          Calculations keep full precision; rounding happens only for display.
          Household portions require a gram weight and source reference.
        </p>
      </section>
      <section>
        <h2>Missing is different from zero</h2>
        <p>
          Measured, calculated, imputed and estimated amounts retain their data
          status. Trace, not detected and not available are distinct nonnumeric
          states. Only an explicit source-reported numeric zero appears as zero.
          Bounds and compiler methods remain visible.
        </p>
      </section>
      <section>
        <h2>Source matching and review</h2>
        <p>
          Dataset releases are pinned to local download checksums before
          compilation. Review checks the food state, description, edible
          portion, nutrient identity, units, source release and reuse rights.
          Close matches require written limitations. Draft identities and
          unapproved profiles are excluded from the public release.
        </p>
      </section>
      <section>
        <h2>Comparison and completeness</h2>
        <p>
          Completeness counts registered nutrients with numeric amounts. It does
          not grade a food. Comparison uses a common 100 g basis or explicitly
          different source-backed servings, retains missing values and does not
          rank a winner.
        </p>
      </section>
      <section>
        <h2>Scope</h2>
        <p>
          This library presents composition records. Personal intake targets and
          nutrition logging belong to later modules. No daily-value percentages
          or intake advice are derived here.
        </p>
      </section>
      <a href="/foods/sources">Sources and release status</a>
      <a href="/foods">Browse reviewed food profiles</a>
    </div>
  );
}
