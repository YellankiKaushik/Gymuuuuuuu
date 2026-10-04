import { z } from 'zod'
import { anatomyTaxonomy, getPublishedMuscles, normalizeTerm } from './repository'
import { entityTypeSchema, visibilitySchema, movementPatterns, type Muscle } from './schema'
export const muscleQuerySchema = z.object({
  q: z.string().max(200).catch(''), region: z.string().refine((id) => id === '' || anatomyTaxonomy.regions.some((region) => region.id === id)).catch(''),
  type: z.union([z.literal(''), entityTypeSchema]).catch(''), visibility: z.union([z.literal(''), visibilitySchema]).catch(''),
  joint: z.string().max(60).catch(''), action: z.string().max(60).catch(''), movement: z.union([z.literal(''), z.enum(movementPatterns)]).catch(''),
  depth: z.enum(['', 'foundation', 'practical', 'advanced']).catch(''), view: z.enum(['body', 'list']).catch('body'), sort: z.enum(['relevance', 'az', 'region']).catch('az'),
})
export type MuscleQuery = z.infer<typeof muscleQuerySchema>
export function parseMuscleQuery(input: Record<string, unknown>): MuscleQuery { return muscleQuerySchema.parse(input) }
export function serializeMuscleQuery(query: MuscleQuery) { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value) params.set(key, value) }); return params.toString() }
export const misconceptionAliases: Record<string, string> = { 'lower abs': 'rectus abdominis', 'inner chest': 'pectoralis major', 'rear delt': 'posterior deltoid', 'side delt': 'middle deltoid', lats: 'latissimus dorsi' }
export function searchMuscles(query: MuscleQuery, records: readonly Muscle[] = getPublishedMuscles()) {
  const term = normalizeTerm(query.q)
  const corrected = misconceptionAliases[term] ?? term
  return records.filter((record) => {
    const text = normalizeTerm([record.displayName, record.anatomicalName, record.latinName ?? '', ...record.aliases, ...record.regions.map((id) => anatomyTaxonomy.regions.find((region) => region.id === id)?.displayName ?? ''), ...record.trainingGroups.map((id) => anatomyTaxonomy.trainingGroups.find((group) => group.id === id)?.displayName ?? ''), ...record.movementPatterns, ...record.jointActions.flatMap((action) => [action.joint, action.motion])].join(' '))
    return corrected.split(' ').filter(Boolean).every((word) => text.includes(word)) && (!query.region || record.regions.includes(query.region)) && (!query.type || record.entityType === query.type) && (!query.visibility || record.visibility.includes(query.visibility)) && (!query.joint || record.jointActions.some((action) => action.joint === query.joint)) && (!query.action || record.jointActions.some((action) => action.motion === query.action)) && (!query.movement || record.movementPatterns.includes(query.movement)) && (!query.depth || record.depth === query.depth)
  }).sort((a, b) => query.sort === 'region' ? (a.regions[0] ?? '').localeCompare(b.regions[0] ?? '') || a.displayName.localeCompare(b.displayName) : query.sort === 'relevance' && term ? Number(normalizeTerm(b.displayName).includes(corrected)) - Number(normalizeTerm(a.displayName).includes(corrected)) || a.displayName.localeCompare(b.displayName) : a.displayName.localeCompare(b.displayName))
}
