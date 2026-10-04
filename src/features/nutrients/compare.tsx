import { PageHeader } from "../../components/common/page-header";
import { EmptyState } from "../../components/common/states";
import { InfoCallout } from "../../components/common/primitives";
import { nutrientReference, type Nutrient } from "./schema";
import { nutrientIndex } from "./public-index";
export function NutrientComparison({
  records,
  invalid = false,
}: {
  records: Nutrient[];
  invalid?: boolean;
}) {
  if (invalid || records.length < 2 || records.length > 4)
    return (
      <div className="page">
        <PageHeader
          title="Compare nutrient concepts"
          eyebrow="EAT / COMPARE"
          description="Compare the classifications, forms and reviewed context of two to four nutrient topics."
        />
        <EmptyState
          title="Choose reviewed nutrient topics."
          description="A comparison requires two to four distinct published topics. Unlike units are not compared as if one nutrient were larger."
        >
          <a className="button secondary" href="/nutrients">
            Choose nutrient topics
          </a>
        </EmptyState>
      </div>
    );
  return (
    <div className="page nutrient-comparison">
      <PageHeader
        title="Compare nutrient concepts"
        eyebrow="EAT / COMPARE"
        description="Explore conceptual differences without ranking unlike nutrients numerically."
      />
      <div className="nutrient-concept-grid">
        {records.map((n) => (
          <article key={n.id}>
            <h2>
              <a href={`/nutrients/${n.slug}`}>{n.canonicalName}</a>
            </h2>
            <dl>
              <dt>Classification</dt>
              <dd>
                {
                  nutrientReference.groups.find((g) => g.id === n.groupId)
                    ?.label
                }{" "}
                · {n.essentiality.replaceAll("_", " ")}
              </dd>
              <dt>Canonical unit</dt>
              <dd>{n.canonicalUnit}</dd>
              <dt>Forms</dt>
              <dd>
                {n.forms
                  .map(
                    (f) => `${f.name} (${f.relationship.replaceAll("_", " ")})`,
                  )
                  .join("; ") || "No additional reviewed forms"}
              </dd>
              <dt>Reference types</dt>
              <dd>
                {[...new Set(n.referenceValues.map((r) => r.valueType))].join(
                  ", ",
                ) || "No reviewed values available"}
              </dd>
              <dt>Deficiency risk context</dt>
              <dd>
                {n.deficiency?.riskGroups.join("; ") ||
                  "No reviewed groups described"}
              </dd>
              <dt>Upper-limit context</dt>
              <dd>
                {n.referenceValues.some(
                  (r) => ["UL", "TUL"].includes(r.valueType) && r.value != null,
                )
                  ? "Reviewed upper-limit information exists for specific populations."
                  : "No numeric upper-limit entry is supplied; this does not establish unlimited safety."}
              </dd>
              <dt>Food data</dt>
              <dd>
                {nutrientIndex.find((r) => r.id === n.id)?.foodCoverage ?? 0}{" "}
                reviewed profiles in the public ranking index
              </dd>
            </dl>
            <h3>Primary functions</h3>
            <ul>
              {n.functions.map((f, i) => (
                <li key={i}>{f.description}</li>
              ))}
            </ul>
            <h3>Interactions</h3>
            {n.interactions.length ? (
              <ul>
                {n.interactions.map((i, index) => (
                  <li key={index}>
                    {i.counterparty}: {i.description} ·{" "}
                    {i.severity.replaceAll("_", " ")}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reviewed interactions supplied.</p>
            )}
          </article>
        ))}
      </div>
      <InfoCallout title="Concept comparison">
        Different nutrients use different units, forms and physiological roles.
        This view does not produce a combined score or recommend a higher
        intake.
      </InfoCallout>
      <a href="/nutrients/frameworks">Read reference framework definitions</a>
    </div>
  );
}
