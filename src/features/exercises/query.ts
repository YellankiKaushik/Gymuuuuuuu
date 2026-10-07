import { z } from 'zod'
import { anatomyTaxonomy, normalizeTerm } from '../muscles/public-repository'
import { buildExerciseIndexes, exerciseIndexes, exerciseTaxonomy, getPublishedExercises } from './repository'
import { difficulties, environments, exerciseTypes, goals, lateralities, mechanics, type Exercise } from './schema'

const filterValues = {
  type: [...exerciseTypes], muscle: anatomyTaxonomy.records.map((item) => item.id), movement: exerciseTaxonomy.movementPatterns.map((item) => item.id), equipment: exerciseTaxonomy.equipment.map((item) => item.id), difficulty: [...difficulties], mechanics: [...mechanics], laterality: [...lateralities], environment: [...environments], goal: [...goals], video: ['yes', 'no'],
}
export const exerciseFilterKeys = Object.keys(filterValues) as (keyof typeof filterValues)[]
export type ExerciseQuery = { q: string; view: 'cards' | 'list'; sort: 'relevance' | 'az' | 'difficulty' | 'reviewed' } & Record<keyof typeof filterValues, string[]>
export function parseExerciseQuery(raw: Record<string, unknown>): ExerciseQuery {
  const filters = Object.fromEntries(exerciseFilterKeys.map((key) => {
    const value = typeof raw[key] === 'string' ? raw[key].split(',') : Array.isArray(raw[key]) ? raw[key] : []
    return [key, [...new Set(value.filter((item): item is string => typeof item === 'string' && (filterValues[key] as readonly string[]).includes(item)))]]
  })) as Record<keyof typeof filterValues, string[]>
  return { ...filters, q: z.string().max(200).catch('').parse(raw.q), view: z.enum(['cards', 'list']).catch('cards').parse(raw.view), sort: z.enum(['relevance', 'az', 'difficulty', 'reviewed']).catch('relevance').parse(raw.sort) }
}
export function exerciseQuerySearch(query: ExerciseQuery) { return Object.fromEntries(Object.entries(query).filter(([, value]) => Array.isArray(value) ? value.length : value).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])) }
const publishedRecords = getPublishedExercises()
const fixtureIndexes = new WeakMap<readonly Exercise[], ReturnType<typeof buildExerciseIndexes>>()
export function searchExercises(query: ExerciseQuery, records: readonly Exercise[] = publishedRecords) {
  let index = records === publishedRecords ? exerciseIndexes : fixtureIndexes.get(records)
  if (!index) { index = buildExerciseIndexes(records); fixtureIndexes.set(records, index) }
  const terms = normalizeTerm(query.q).split(' ').filter(Boolean)
  const match = (selected: string[], values: readonly string[]) => !selected.length || selected.some((id) => values.includes(id))
  const results = records.filter((record) => {
    const text = index.search.get(record.id) ?? ''
    return terms.every((term) => text.includes(term)) && match(query.type, [record.exerciseType]) && match(query.muscle, record.muscleRoles?.filter((role) => role.role === 'primary' || role.role === 'context-dependent').map((role) => role.muscleId) ?? []) && match(query.movement, record.movementPatternIds) && match(query.equipment, record.equipmentIds) && match(query.difficulty, record.difficulty ? [record.difficulty] : []) && match(query.mechanics, record.mechanics ? [record.mechanics] : []) && match(query.laterality, record.laterality ? [record.laterality] : []) && match(query.environment, record.environmentTags ?? []) && match(query.goal, record.goalTags ?? []) && match(query.video, [record.media?.some((media) => media.kind === 'video' && media.reviewStatus === 'reviewed') ? 'yes' : 'no'])
  })
  const rank = (record: Exercise) => normalizeTerm(record.displayName) === normalizeTerm(query.q) ? 3 : normalizeTerm(record.displayName).startsWith(normalizeTerm(query.q)) ? 2 : record.aliases.some((alias) => normalizeTerm(alias) === normalizeTerm(query.q)) ? 1 : 0
  return results.sort((a, b) => {
    if (query.sort === 'relevance' && terms.length) { const difference = rank(b) - rank(a); if (difference) return difference }
    if (query.sort === 'difficulty') { const difference = difficulties.indexOf(a.difficulty ?? 'specialist') - difficulties.indexOf(b.difficulty ?? 'specialist'); if (difference) return difference }
    if (query.sort === 'reviewed') { const difference = (b.review?.techniqueReviewedAt ?? '').localeCompare(a.review?.techniqueReviewedAt ?? ''); if (difference) return difference }
    return a.displayName.localeCompare(b.displayName)
  })
}
