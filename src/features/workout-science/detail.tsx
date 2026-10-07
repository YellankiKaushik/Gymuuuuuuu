import type { ScienceDiscoveryTopic } from "./index-schema";
import { PageHeader, SectionNav } from "../../components/common/page-header";
import { NotFoundState } from "../../components/common/states";
import { InfoCallout, StatusBadge } from "../../components/common/primitives";
import { exerciseIndexes } from "../exercises/repository";
import {
  EvidenceConfidenceBadge,
  scienceWords,
  topicConfidence,
} from "./catalogue";
import { scienceIndexes } from "./public-repository";
import type { ScienceTopic } from "./schema";
const anchors = [
  "overview",
  "why-it-matters",
  "decision-framework",
  "how-it-works",
  "goal-context",
  "examples",
  "mistakes",
  "evidence",
  "limitations",
  "related",
  "sources",
];
const frameworkLabels = {
  solves: "Use this concept to solve",
  prioritizeWhen: "Prioritize it when",
  deprioritizeWhen: "Do not prioritize it when",
  adjustmentLevers: "Main adjustment levers",
  watchFor: "Watch for",
  cannotTellYou: "What it cannot tell you",
};
export function DecisionFrameworkCard({ topic }: { topic: ScienceTopic }) {
  return (
    <section id="decision-framework" tabIndex={-1}>
      <h2>Practical decision framework</h2>
      <div className="decision-grid">
        {topic.decisionFramework &&
          Object.entries(topic.decisionFramework).map(([key, values]) => (
            <div className="mistake-card" key={key}>
              <h3>{frameworkLabels[key as keyof typeof frameworkLabels]}</h3>
              <ul>
                {values.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </section>
  );
}
export function AtomicClaimList({ topic }: { topic: ScienceTopic }) {
  return (
    <section id="evidence" tabIndex={-1}>
      <h2>Evidence & applicability</h2>
      {topic.claims?.map((claim) => (
        <details className="claim-details" key={claim.id}>
          <summary>
            <EvidenceConfidenceBadge value={claim.evidenceLevel} />
            {claim.claimText}
          </summary>
          <dl className="fact-list">
            <div>
              <dt>Outcome</dt>
              <dd>{scienceWords(claim.outcome)}</dd>
            </div>
            <div>
              <dt>Population studied</dt>
              <dd>{claim.population.map(scienceWords).join(" · ")}</dd>
            </div>
            <div>
              <dt>Direction</dt>
              <dd>{scienceWords(claim.direction)}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>
                <EvidenceConfidenceBadge value={claim.confidence} />
              </dd>
            </div>
            <div>
              <dt>Effect qualifier</dt>
              <dd>
                {claim.effectQualifier ?? "No additional qualifier supplied"}
              </dd>
            </div>
          </dl>
          <h3>Limits of this claim</h3>
          <ul>
            {claim.limitations.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
          <p>Verified {claim.lastVerified}</p>
          <p>
            Sources:{" "}
            {claim.sourceIds.map((id) => (
              <a className="claim-source" key={id} href={`#source-${id}`}>
                {id}
              </a>
            ))}
          </p>
        </details>
      ))}
    </section>
  );
}
export function TopicComparison({
  topics,
}: {
  topics: readonly ScienceDiscoveryTopic[];
}) {
  if (topics.length < 2) return null;
  const shared =
    topics[0]?.goalTags.filter((goal) =>
      topics.every((topic) => topic.goalTags.includes(goal)),
    ) ?? [];
  return (
    <section className="topic-comparison">
      <h2>Compare related concepts</h2>
      <p>
        Shared goal contexts:{" "}
        {shared.map(scienceWords).join(" · ") || "None specified"}. Review each
        concept’s applicability and limitations when interpreting differences.
      </p>
      <div className="comparison-grid">
        {topics.map((topic) => (
          <div className="mistake-card" key={topic.id}>
            <h3>
              <a href={`/learn/workout-science/${topic.slug}`}>
                {topic.displayName}
              </a>
            </h3>
            <p>{topic.definition}</p>
            <h4>Practical levers</h4>
            <ul>
              {topic.decisionFramework?.adjustmentLevers.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
            <h4>Limitations</h4>
            <ul>
              {topic.limitations?.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
export function ScienceTopicContent({ topic }: { topic: ScienceTopic }) {
  const overdue = Boolean(
    topic.review &&
    topic.review.nextReviewDue < new Date().toISOString().slice(0, 10),
  );
  const relatedIds = [
    ...(topic.prerequisiteTopicIds ?? []),
    ...(topic.relatedTopicIds ?? []),
    ...(topic.commonlyConfusedTopicIds ?? []),
  ];
  const comparisons = [
    topic,
    ...(topic.comparedTopicIds?.flatMap((id) => {
      const item = scienceIndexes.byId.get(id);
      return item ? [item] : [];
    }) ?? []),
  ];
  const sourceLinks = (ids: readonly string[]) => (
    <p>
      Sources:{" "}
      {ids.map((id) => (
        <a className="claim-source" key={id} href={`#source-${id}`}>
          {id}
        </a>
      ))}
    </p>
  );
  return (
    <article className="page detail-page">
      <PageHeader
        title={topic.displayName}
        eyebrow="LEARN / WORKOUT SCIENCE"
        description={topic.definition ?? undefined}
        metadata={
          <>
            <StatusBadge>{scienceWords(topic.category)}</StatusBadge>
            <StatusBadge>{scienceWords(topic.contentType)}</StatusBadge>
            <EvidenceConfidenceBadge value={topicConfidence(topic)} />
            <span>{topic.goalTags.map(scienceWords).join(" · ")}</span>
            <span>{topic.experienceTags.map(scienceWords).join(" · ")}</span>
            <span>Reviewed {topic.review?.reviewedAt}</span>
            {overdue && <StatusBadge>Review due</StatusBadge>}
          </>
        }
      />
      <SectionNav
        items={anchors.map((id) => ({
          label: scienceWords(id),
          href: `#${id}`,
        }))}
      />
      <div className="reading-column">
        <InfoCallout>
          Personal-use publication after source verification and machine
          validation. No independent human or clinical review is claimed.
        </InfoCallout>
        <section id="overview" tabIndex={-1}>
          <h2>Quick answer</h2>
          <p>{topic.definition}</p>
          <p>{topic.summary}</p>
          <h3>Key takeaways</h3>
          <ul>
            {topic.keyTakeaways?.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
          {topic.abbreviations.length > 0 && (
            <p>
              Abbreviations used for this topic:{" "}
              {topic.abbreviations.join(", ")} — {topic.displayName}.
            </p>
          )}
        </section>
        <section id="why-it-matters" tabIndex={-1}>
          <h2>Why it matters</h2>
          <p>{topic.whyItMatters}</p>
        </section>
        <DecisionFrameworkCard topic={topic} />
        <section id="how-it-works" tabIndex={-1}>
          <h2>How it works</h2>
          {topic.howItWorks?.map((value) => (
            <p key={value}>{value}</p>
          ))}
        </section>
        <section id="goal-context" tabIndex={-1}>
          <h2>Goal context</h2>
          <div className="goal-context-grid">
            {topic.goalContexts?.map((context) => (
              <div className="mistake-card" key={context.goal}>
                <h3>{scienceWords(context.goal)}</h3>
                <p>{context.interpretation}</p>
                <ul>
                  {context.qualifiers.map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
                {sourceLinks(context.sourceIds)}
              </div>
            ))}
          </div>
          {topic.practicalGuidance?.map((item) => (
            <div className="mistake-card" key={item.context}>
              <h3>{item.context}</h3>
              <p>{item.guidanceText}</p>
              {item.numericValue && (
                <p>
                  <strong>
                    {item.numericValue.valueType === "single"
                      ? item.numericValue.minimum
                      : item.numericValue.valueType === "range"
                        ? `${item.numericValue.minimum}–${item.numericValue.maximum}`
                        : item.numericValue.valueType === "upper-bound"
                          ? `Upper bound: ${item.numericValue.maximum}`
                          : `Lower bound: ${item.numericValue.minimum}`}{" "}
                    {item.numericValue.unit}
                  </strong>
                </p>
              )}
              <ul>
                {item.qualifiers.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
              {sourceLinks(item.sourceIds)}
            </div>
          ))}
        </section>
        <section id="examples" tabIndex={-1}>
          <h2>Illustrative examples</h2>
          {topic.examples?.map((example) => (
            <div key={example.title} className="mistake-card">
              <h3>{example.title}</h3>
              <p>{example.scenario}</p>
              <ol>
                {example.steps.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ol>
              <InfoCallout>
                Illustrative example — not a personal training prescription.
              </InfoCallout>
            </div>
          ))}
        </section>
        <section id="mistakes" tabIndex={-1}>
          <h2>Common mistakes & misconceptions</h2>
          {topic.commonMistakes?.map((item) => (
            <div className="mistake-card" key={item.mistake}>
              <h3>{item.mistake}</h3>
              <p>{item.whyItMatters}</p>
              <p>
                <strong>Correction:</strong> {item.correction}
              </p>
              {sourceLinks(item.sourceIds)}
            </div>
          ))}
          {topic.myths?.map((item) => (
            <div className="mistake-card" key={item.myth}>
              <h3>{item.myth}</h3>
              <p>{item.correction}</p>
              <EvidenceConfidenceBadge value={item.evidenceLevel} />
              <ul>
                {item.limitations.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
              {sourceLinks(item.sourceIds)}
            </div>
          ))}
        </section>
        <AtomicClaimList topic={topic} />
        <section id="limitations" tabIndex={-1}>
          <h2>Limitations & uncertainty</h2>
          <ul>
            {topic.limitations?.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
          <InfoCallout>
            This article teaches concepts and evidence interpretation. It does
            not produce a personalized program, diagnosis or treatment.
          </InfoCallout>
        </section>
        <section id="related" tabIndex={-1}>
          <h2>Connected learning</h2>
          <ul>
            {[...new Set(relatedIds)].map((id) => {
              const item = scienceIndexes.byId.get(id);
              return item ? (
                <li key={id}>
                  <a href={`/learn/workout-science/${item.slug}`}>
                    {item.displayName}
                  </a>
                  {topic.prerequisiteTopicIds?.includes(id)
                    ? " — prerequisite"
                    : topic.commonlyConfusedTopicIds?.includes(id)
                      ? " — terminology distinction"
                      : ""}
                </li>
              ) : null;
            })}
          </ul>
          <h3>Related exercises</h3>
          <ul>
            {topic.relatedExerciseIds?.map((id) => {
              const item = exerciseIndexes.byId.get(id);
              return item?.contentStatus === "published" ? (
                <li key={id}>
                  <a href={`/exercises/${item.slug}`}>{item.displayName}</a>
                </li>
              ) : null;
            })}
          </ul>
        </section>
        <TopicComparison topics={comparisons} />
        <section id="sources" tabIndex={-1}>
          <h2>Sources & review</h2>
          <p>
            Version {topic.version} · Subject review:{" "}
            {topic.review?.subjectReviewerRole} · Editorial review:{" "}
            {topic.review?.editorialReviewerRole} · Next review:{" "}
            {topic.review?.nextReviewDue}
          </p>
          <ol className="source-list">
            {topic.sources?.map((source) => (
              <li key={source.id} id={`source-${source.id}`} tabIndex={-1}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                </a>
                <p>
                  {source.authorsOrOrganization} · {source.year} ·{" "}
                  {scienceWords(source.sourceType)}
                </p>
                <p>
                  {source.doi && `DOI: ${source.doi} · `}
                  {source.pmid && `PMID: ${source.pmid} · `}Accessed{" "}
                  {source.accessedAt}
                </p>
                <p>{source.notes}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
export function ScienceDetail({ topic }: { topic: ScienceTopic | null }) {
  if (!topic) return <NotFoundState />;
  if (topic.contentStatus === "deprecated")
    return (
      <div className="page">
        <PageHeader
          title="This topic has been replaced"
          description={topic.deprecation?.migrationNote}
        />
        <a className="button secondary" href="/learn/workout-science">
          Browse current topics
        </a>
      </div>
    );
  return <ScienceTopicContent topic={topic} />;
}
