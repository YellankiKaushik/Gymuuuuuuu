import rawTaxonomy from "../../content/workout-science/taxonomy.json";
import rawIndex from "../../content/workout-science/index.json";
import { normalizeTerm } from "../muscles/public-repository";
import { exerciseIndexes } from "../exercises/repository";
import type { ScienceDiscoveryTopic } from "./index-schema";
import { scienceIndexSchema } from "./index-schema";
export const scienceTaxonomy = rawTaxonomy;
export const scienceIdentities = scienceIndexSchema
  .array()
  .parse(rawTaxonomy.records);
export const scienceRecords: ScienceDiscoveryTopic[] = scienceIndexSchema
  .array()
  .refine(
    (rows) =>
      rows.every((r) => ["published", "deprecated"].includes(r.contentStatus)),
    "Only publishable science entries may enter discovery",
  )
  .parse(rawIndex);
export function buildScienceIndexes(records: readonly ScienceDiscoveryTopic[]) {
  const published = records.filter(
    (item) => item.contentStatus === "published",
  );
  const byId = new Map(published.map((item) => [item.id, item])),
    bySlug = new Map(published.map((item) => [item.slug, item]));
  const alias = new Map<string, Set<string>>(),
    category = new Map<string, Set<string>>(),
    goal = new Map<string, Set<string>>(),
    experience = new Map<string, Set<string>>(),
    exercises = new Map<string, Set<string>>(),
    sourceClaims = new Map<string, Set<string>>();
  const graph = new Map<string, string[]>(),
    search = new Map<string, string>();
  const add = (index: Map<string, Set<string>>, key: string, id: string) => {
    const values = index.get(key) ?? new Set<string>();
    values.add(id);
    index.set(key, values);
  };
  for (const item of published) {
    for (const term of [
      item.displayName,
      ...item.aliases,
      ...item.abbreviations,
    ])
      add(alias, normalizeTerm(term), item.id);
    add(category, item.category, item.id);
    item.goalTags.forEach((id) => add(goal, id, item.id));
    item.experienceTags.forEach((id) => add(experience, id, item.id));
    item.relatedExerciseIds?.forEach((id) => add(exercises, id, item.id));
    item.claims?.forEach((claim) =>
      claim.sourceIds.forEach((id) => add(sourceClaims, id, claim.id)),
    );
    graph.set(item.id, [
      ...(item.prerequisiteTopicIds ?? []),
      ...(item.relatedTopicIds ?? []),
      ...(item.comparedTopicIds ?? []),
      ...(item.commonlyConfusedTopicIds ?? []),
    ]);
    search.set(
      item.id,
      normalizeTerm(
        [
          item.displayName,
          item.shortTitle,
          ...item.aliases,
          ...item.abbreviations,
          item.definition,
          ...(item.keyTakeaways ?? []),
          item.category,
          ...item.goalTags,
          ...(item.relatedExerciseIds ?? []).map(
            (id) => exerciseIndexes.byId.get(id)?.displayName,
          ),
        ].join(" "),
      ),
    );
  }
  const glossary = published
    .flatMap((item) =>
      [
        ...new Set([item.displayName, ...item.aliases, ...item.abbreviations]),
      ].map((term) => ({ term, topic: item })),
    )
    .sort((a, b) => a.term.localeCompare(b.term));
  return {
    published,
    byId,
    bySlug,
    alias,
    category,
    goal,
    experience,
    exercises,
    sourceClaims,
    graph,
    search,
    glossary,
  };
}
export const scienceIndexes = buildScienceIndexes(scienceRecords);
export function getScienceBySlug(slug: string) {
  return (
    scienceIndexes.bySlug.get(slug) ??
    scienceRecords.find(
      (item) => item.slug === slug && item.contentStatus === "deprecated",
    )
  );
}
export function topicsForExercise(id: string) {
  return [...(scienceIndexes.exercises.get(id) ?? [])].flatMap((topicId) => {
    const topic = scienceIndexes.byId.get(topicId);
    return topic ? [topic] : [];
  });
}
export function scienceCoverage() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    identities: scienceIdentities.length,
    published: scienceIndexes.published.length,
    byCategory: Object.fromEntries(
      scienceTaxonomy.categories.map((item) => [
        item.id,
        scienceIndexes.category.get(item.id)?.size ?? 0,
      ]),
    ),
    reviewDue: scienceIndexes.published
      .filter((item) => item.review && item.review.nextReviewDue < today)
      .map((item) => item.id),
  };
}
