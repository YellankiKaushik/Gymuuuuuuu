import { PageHeader } from "../../components/common/page-header";
import { InfoCallout } from "../../components/common/primitives";
import { nutrientReference } from "./schema";
import { frameworkDatasets } from "./frameworks";
import { getFrameworkGlossary, nutrientReleaseReport } from "./public-index";
export function NutrientFrameworks() {
  return (
    <div className="page nutrient-information">
      <PageHeader
        title="Reference frameworks"
        eyebrow="EAT / AUTHORITIES"
        description="Reference systems answer different population and labelling questions. Keep their authority, version and value type together."
      />
      <InfoCallout title="Population references are not prescriptions">
        These frameworks do not establish a specific person's medical needs.
        Switching authorities does not make their definitions or values
        interchangeable.
      </InfoCallout>
      {nutrientReference.referenceFrameworks.map((f) => {
        const dataset = frameworkDatasets.find((d) => d.id === f.id),
          source = nutrientReference.sourceRegistry.find(
            (s) => s.id === f.sourceId,
          );
        return (
          <section className="nutrient-source" key={f.id}>
            <h2>{f.label}</h2>
            <p>{f.notes}</p>
            <p>
              Value types:{" "}
              {f.valueTypes.map((t) => (
                <a
                  className="nutrient-term-link"
                  href={`/nutrients/glossary#term-${t.toLowerCase()}`}
                  key={t}
                >
                  {t}
                </a>
              ))}
            </p>
            <p>
              {source?.authority} · Dataset version:{" "}
              {dataset?.version ?? "Not configured"}
            </p>
            <p>
              {dataset?.status === "approved"
                ? "Reference dataset approved."
                : "No approved reference table has been imported."}
            </p>
            <p>{source?.rights}</p>
            <a href={source?.url}>Official framework source</a>
          </section>
        );
      })}
      <div className="nutrient-links">
        <a href="/nutrients/reference-intakes">
          Open the Reference Intake Explorer
        </a>
        <a href="/nutrients/glossary">Expand reference terminology</a>
      </div>
    </div>
  );
}
export function NutrientGlossary() {
  return (
    <div className="page nutrient-information">
      <PageHeader
        title="Nutrient reference glossary"
        eyebrow="EAT / TERMINOLOGY"
        description="Expand the terms used in nutrient units and population reference tables."
      />
      {getFrameworkGlossary().map((g) => (
        <section
          className="nutrient-glossary-entry"
          id={`term-${g.term.toLowerCase()}`}
          key={g.term}
        >
          <h2>
            {g.term} · {g.name}
          </h2>
          <p>{g.description}</p>
          <a href={g.sourceUrl}>Primary source definition</a>
        </section>
      ))}
      <a href="/nutrients/frameworks">Reference framework context</a>
    </div>
  );
}
export function NutrientMethodology() {
  return (
    <div className="page nutrient-information">
      <PageHeader
        title="Nutrient methodology"
        eyebrow="EAT / EVIDENCE AND UNITS"
        description="How topics, claims, units, reference frameworks and food composition stay connected."
      />
      <section>
        <h2>Publication and sources</h2>
        <p>
          Identities become public only after source-backed functions, forms,
          claims, medical boundaries and scientific/editorial review. Every
          material claim carries its population, evidence level, sources and
          limitations.
        </p>
        <p>
          Current public release: {nutrientReleaseReport.published} reviewed
          topics and {nutrientReleaseReport.referenceRows} reviewed reference
          rows. The source-checked glossary explains framework terminology while
          draft nutrient articles remain hidden.
        </p>
      </section>
      <section>
        <h2>Separate authorities and populations</h2>
        <p>
          Each reference belongs to one versioned authority and an explicit age
          range, sex scope and life stage. Ages are resolved in inclusive
          complete-month bands. Ambiguous overlapping rows are rejected.
          Framework values are never averaged.
        </p>
      </section>
      <section>
        <h2>Units and equivalents</h2>
        <p>
          Grams, milligrams and micrograms scale only within the same nutrient
          concept. Retinol activity equivalents, dietary folate equivalents,
          niacin equivalents and source-defined vitamin E forms retain their
          meaning. Different forms require an explicitly reviewed, source-backed
          conversion scoped to nutrient, form, framework and version.
        </p>
        <p>
          A vitamin D microgram/IU conversion also requires an approved rule. No
          conversion factor or absorption percentage is inferred from a matching
          display name.
        </p>
      </section>
      <section>
        <h2>Reference percentages</h2>
        <p>
          A reference percentage divides a compatible numeric amount by a
          selected positive scalar daily or label reference and multiplies by
          100. It must name the authority, version and population. Ranges,
          body-weight-based rows, missing amounts and incompatible forms do not
          supply scalar denominators. A UL percentage is upper-limit
          information, never a progress goal.
        </p>
        <p>
          Above 100% is not automatically dangerous; below 100% does not
          diagnose deficiency.
        </p>
      </section>
      <section>
        <h2>Food-source ranking</h2>
        <p>
          Food amounts come from source-verified composition profiles. Ranking
          uses an explicit per-100-g, per-100-kcal or source-backed-portion
          basis, preserves preparation labels, source release and data status,
          and can exclude estimated/imputed inputs. Missing measurements and
          zero-energy denominators are excluded from incompatible ranking bases.
        </p>
        <p>
          Composition amount, absorption and practical serving contribution are
          different questions. No first-ranked food is described as universally
          best.
        </p>
      </section>
      <section>
        <h2>Private selections</h2>
        <p>
          The Reference Intake Explorer keeps age, sex and life stage transient
          unless you explicitly remember them on this device. Remembered
          selections live in IndexedDB. The selected framework ID is a small
          local preference. These selections do not enter URLs, remote requests,
          server rendering or metadata.
        </p>
      </section>
      <section>
        <h2>Medical boundaries</h2>
        <p>
          Symptoms cannot diagnose a deficiency. Interactions are non-exhaustive
          and do not advise medication changes. An absent upper-limit entry does
          not establish unlimited safety. Nutrient education does not generate
          supplement doses or blood-test interpretations.
        </p>
      </section>
      <div className="nutrient-links">
        <a href="/nutrients/frameworks">Authorities and framework versions</a>
        <a href="/foods/methodology">Food composition methodology</a>
        <a href="/nutrients">Browse reviewed topics</a>
      </div>
    </div>
  );
}
