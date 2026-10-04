import rawTaxonomy from '../../content/workout-science/taxonomy.json'
import rawRecords from '../../content/workout-science/records.json'
import rawExceptions from '../../content/workout-science/language-exceptions.json'
import { z } from 'zod'
import { anatomyTaxonomy, normalizeTerm } from '../muscles/repository'
import { exerciseIdentities, exerciseIndexes } from '../exercises/repository'
import { scienceSchema, type ScienceTopic } from './schema'
export const scienceTaxonomy = rawTaxonomy
export const scienceIdentities = scienceSchema.array().parse(rawTaxonomy.records)
export const scienceRecords = scienceSchema.array().parse(rawRecords)
const exceptions = z.array(z.strictObject({ topicId: z.string(), path: z.string(), sourceId: z.string(), approvedBy: z.string().min(3), rationale: z.string().min(20) })).parse(rawExceptions)
export function validateScience(records: readonly ScienceTopic[]) {
  const errors: string[] = []
  const ids = new Set<string>(), slugs = new Set<string>(), claimIds = new Set<string>()
  const allTopics = new Set([...scienceIdentities, ...records].map((item) => item.id))
  const muscles = new Set(anatomyTaxonomy.records.map((item) => item.id)), exercises = new Set(exerciseIdentities.map((item) => item.id))
  const byId = new Map(records.map((item) => [item.id, item]))
  for (const record of records) {
    const add = (path: string, message: string) => errors.push(`src/content/workout-science/records.json: ${record.id}.${path}: ${message}. Correct the field or supply a reviewed dependency.`)
    if (ids.has(record.id)) add('id', 'Duplicate ID'); if (slugs.has(record.slug)) add('slug', 'Duplicate slug')
    ids.add(record.id); slugs.add(record.slug)
    const identity = scienceIdentities.find((item) => item.id === record.id)
    if (identity && identity.slug !== record.slug) add('slug', 'Stable slug changed')
    for (const key of ['prerequisiteTopicIds', 'relatedTopicIds', 'comparedTopicIds', 'commonlyConfusedTopicIds'] as const) for (const id of record[key] ?? []) if (!allTopics.has(id) || id === record.id) add(key, `Invalid topic ${id}`)
    if (record.deprecation && (!allTopics.has(record.deprecation.replacementTopicId) || record.deprecation.replacementTopicId === record.id)) add('deprecation', 'Invalid replacement')
    for (const id of [...record.relatedExerciseIds ?? [], ...record.examples?.flatMap((item) => item.relatedExerciseIds ?? []) ?? []]) if (!exercises.has(id) && !exerciseIndexes.byId.has(id)) add('relatedExerciseIds', `Unknown exercise ${id}`)
    for (const id of record.relatedMuscleIds ?? []) if (!muscles.has(id)) add('relatedMuscleIds', `Unknown muscle ${id}`)
    if (record.futureProgramIds?.length) add('futureProgramIds', 'Program references must remain empty until the program contract is implemented')
    const sources = new Set(record.sources?.map((item) => item.id))
    if (sources.size !== (record.sources?.length ?? 0)) add('sources', 'Duplicate source ID')
    for (const key of ['claims', 'goalContexts', 'practicalGuidance', 'commonMistakes', 'myths'] as const) for (const [index, item] of (record[key] ?? []).entries()) for (const id of item.sourceIds) if (!sources.has(id)) add(`${key}.${index}.sourceIds`, `Unknown source ${id}`)
    for (const claim of record.claims ?? []) { if (claimIds.has(claim.id)) add('claims', `Duplicate claim ${claim.id}`); claimIds.add(claim.id) }
    if (record.contentStatus !== 'published') continue
    const guidance = [...['definition', 'summary', 'whyItMatters'].flatMap((key) => { const value = record[key as 'definition' | 'summary' | 'whyItMatters']; return value ? [{ path: key, value }] : [] }), ...['keyTakeaways', 'howItWorks'].flatMap((key) => (record[key as 'keyTakeaways' | 'howItWorks'] ?? []).map((value, index) => ({ path: `${key}.${index}`, value }))), ...Object.entries(record.decisionFramework ?? {}).flatMap(([key, values]) => values.map((value, index) => ({ path: `decisionFramework.${key}.${index}`, value }))), ...(record.claims ?? []).map((item, index) => ({ path: `claims.${index}.claimText`, value: item.claimText })), ...(record.practicalGuidance ?? []).map((item, index) => ({ path: `practicalGuidance.${index}.guidanceText`, value: item.guidanceText })), ...(record.goalContexts ?? []).map((item, index) => ({ path: `goalContexts.${index}.interpretation`, value: item.interpretation })), ...(record.myths ?? []).map((item, index) => ({ path: `myths.${index}.correction`, value: item.correction })), ...(record.commonMistakes ?? []).map((item, index) => ({ path: `commonMistakes.${index}.correction`, value: item.correction }))]
    for (const item of guidance) {
      if (/\b(guaranteed|scientifically proven best|works for everyone|always|never)\b/i.test(item.value) && !exceptions.some((exception) => exception.topicId === record.id && exception.path === item.path && sources.has(exception.sourceId))) add(item.path, 'Universal language needs a sourced approved exception')
      if (/\b(cures?|diagnoses?|treats? (injur|disease)|rehabilitation protocol)\b/i.test(item.value)) add(item.path, 'Medical diagnosis or treatment language is prohibited')
    }
    if (record.practicalGuidance?.some((item) => item.numericValue) && record.claims?.some((claim) => claim.evidenceLevel === 'very-low')) add('practicalGuidance', 'Very-low evidence must not become numeric guidance')
    const today = new Date().toISOString().slice(0, 10)
    if (record.review?.reviewedAt && record.review.reviewedAt > today) add('review.reviewedAt', 'Future review date')
    for (const claim of record.claims ?? []) if (claim.lastVerified > today) add('claims.lastVerified', 'Future verification date')
    if (record.review && record.review.nextReviewDue < record.review.reviewedAt) add('review.nextReviewDue', 'Review due date precedes review')
    if (record.review) { const due = new Date(`${record.review.reviewedAt}T00:00:00Z`); due.setUTCFullYear(due.getUTCFullYear() + (record.category === 'advanced-methods' || record.practicalGuidance?.some((item) => item.numericValue) ? 1 : 2)); if (record.review.nextReviewDue > due.toISOString().slice(0, 10)) add('review.nextReviewDue', 'Review interval exceeds the annual or two-year policy') }
  }
  const visited = new Set<string>()
  function visit(id: string, path: Set<string>) {
    if (path.has(id)) { errors.push(`${id}.prerequisiteTopicIds: Circular prerequisite chain. Remove the cycle.`); return }
    if (visited.has(id)) return
    const next = new Set(path).add(id)
    for (const parent of byId.get(id)?.prerequisiteTopicIds ?? []) visit(parent, next)
    visited.add(id)
  }
  records.forEach((record) => visit(record.id, new Set()))
  return [...new Set(errors)]
}
const errors = [...validateScience(scienceIdentities), ...validateScience(scienceRecords)]
if (errors.length) throw new Error(errors.join('\n'))
export function buildScienceIndexes(records: readonly ScienceTopic[]) {
  const published = records.filter((item) => item.contentStatus === 'published')
  const byId = new Map(published.map((item) => [item.id, item])), bySlug = new Map(published.map((item) => [item.slug, item]))
  const alias = new Map<string, Set<string>>(), category = new Map<string, Set<string>>(), goal = new Map<string, Set<string>>(), experience = new Map<string, Set<string>>(), exercises = new Map<string, Set<string>>(), sourceClaims = new Map<string, Set<string>>()
  const graph = new Map<string, string[]>(), search = new Map<string, string>()
  const add = (index: Map<string, Set<string>>, key: string, id: string) => { const values = index.get(key) ?? new Set<string>(); values.add(id); index.set(key, values) }
  for (const item of published) {
    for (const term of [item.displayName, ...item.aliases, ...item.abbreviations]) add(alias, normalizeTerm(term), item.id)
    add(category, item.category, item.id); item.goalTags.forEach((id) => add(goal, id, item.id)); item.experienceTags.forEach((id) => add(experience, id, item.id))
    item.relatedExerciseIds?.forEach((id) => add(exercises, id, item.id)); item.claims?.forEach((claim) => claim.sourceIds.forEach((id) => add(sourceClaims, id, claim.id)))
    graph.set(item.id, [...item.prerequisiteTopicIds ?? [], ...item.relatedTopicIds ?? [], ...item.comparedTopicIds ?? [], ...item.commonlyConfusedTopicIds ?? []])
    search.set(item.id, normalizeTerm([item.displayName, item.shortTitle, ...item.aliases, ...item.abbreviations, item.definition, ...item.keyTakeaways ?? [], item.category, ...item.goalTags, ...(item.relatedExerciseIds ?? []).map((id) => exerciseIndexes.byId.get(id)?.displayName)].join(' ')))
  }
  const glossary = published.flatMap((item) => [...new Set([item.displayName, ...item.aliases, ...item.abbreviations])].map((term) => ({ term, topic: item }))).sort((a, b) => a.term.localeCompare(b.term))
  return { published, byId, bySlug, alias, category, goal, experience, exercises, sourceClaims, graph, search, glossary }
}
export const scienceIndexes = buildScienceIndexes(scienceRecords)
export function getScienceBySlug(slug: string) { return scienceIndexes.bySlug.get(slug) ?? scienceRecords.find((item) => item.slug === slug && item.contentStatus === 'deprecated') }
export function topicsForExercise(id: string) { return [...scienceIndexes.exercises.get(id) ?? []].flatMap((topicId) => { const topic = scienceIndexes.byId.get(topicId); return topic ? [topic] : [] }) }
export function scienceCoverage() { const today = new Date().toISOString().slice(0, 10); return { identities: scienceIdentities.length, published: scienceIndexes.published.length, byCategory: Object.fromEntries(scienceTaxonomy.categories.map((item) => [item.id, scienceIndexes.category.get(item.id)?.size ?? 0])), reviewDue: scienceIndexes.published.filter((item) => item.review && item.review.nextReviewDue < today).map((item) => item.id) } }
