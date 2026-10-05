import { appConfig } from "../../config/app";
import { Icon } from "../../components/common/icon";
import verifiedSources from "../../content/provenance/verified-sources.json";
export function SourcesPage() {
  return (
    <div className="page sources-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">KNOWLEDGE WITH CONTEXT</span>
          <h1>Sources & methodology</h1>
          <p>Useful knowledge should show where it comes from.</p>
        </div>
      </div>
      <div className="sources-grid">
        <section className="settings-card">
          <span className="privacy-icon">
            <Icon name="book" size={27} />
          </span>
          <h2>Evidence is part of the content.</h2>
          <p>
            Reviewed library records show publishers, links, review dates and
            known limitations. Draft factual content stays hidden while review
            is pending.
          </p>
          <h3>Training evidence</h3>
          <p>
            Workout science separates exact claims from practical examples. Each
            published claim identifies its studied population, evidence
            strength, confidence and limitations.
          </p>
          <a className="methodology-link" href="/learn/workout-science">
            Explore workout science
          </a>
          <h3>Our source hierarchy</h3>
          <ol className="source-hierarchy">
            <li>
              <strong>Government datasets & guidelines</strong>
              <span>Primary composition data and published guidance.</span>
            </li>
            <li>
              <strong>Professional bodies & peer-reviewed research</strong>
              <span>
                Reviewed evidence with its population and method limitations.
              </span>
            </li>
            <li>
              <strong>Academic & qualified practitioner material</strong>
              <span>
                Contextual education and carefully reviewed demonstrations.
              </span>
            </li>
          </ol>
        </section>
        <div>
          <section className="settings-card">
            <h2>Uncertainty stays visible.</h2>
            <p>
              Measured, calculated, estimated, trace, not measured and not
              available are distinct values. A missing value never becomes zero.
            </p>
            <h2>Content stays connected.</h2>
            <p>
              Stable IDs link records across modules. Sources are kept in
              repository-owned files so updates can be reviewed and historical
              records stay intact.
            </p>
          </section>
          <section className="method-note">
            <Icon name="help" size={21} />
            <div>
              <strong>An educational and organizational tool</strong>
              <p>
                {appConfig.name} is not a medical, diagnostic, treatment,
                rehabilitation or emergency system.
              </p>
            </div>
          </section>
        </div>
      </div>
      <section className="settings-card">
        <h2>What the review labels mean</h2>
        <p>
          Personal-use publication means sources were checked and automated
          validation passed. Codex performs that machine review; it is not an
          independent human or clinical reviewer.
        </p>
        <p>
          Published reviewed content would require a separate, named human
          review and its recorded attestation. No current record claims that
          level. Drafts and records awaiting source or rights checks remain
          unavailable.
        </p>
      </section>
      <section
        className="settings-card"
        style={{ marginTop: "1.5rem", overflowWrap: "anywhere" }}
      >
        <h2>Public source directory</h2>
        {verifiedSources.map((source) => (
          <article
            key={source.id}
            style={{
              paddingBlock: "1rem",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <h3>
              <a href={source.url}>{source.title}</a>
            </h3>
            <p>
              {source.publisher} · {source.evidenceType.replaceAll("_", " ")}
            </p>
            <p>
              {source.sourceVersion ?? "Source version not specified"}
              {source.sourceDate ? ` · Source date ${source.sourceDate}` : ""}
            </p>
            <p>Source checked {source.lastReviewedAt} · machine verification</p>
            <details>
              <summary>Reuse and limitations</summary>
              <p>{source.reuse.replaceAll("_", " ")}</p>
              <p>{source.rightsReference}</p>
              <ul>
                {source.limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </details>
          </article>
        ))}
      </section>
    </div>
  );
}
