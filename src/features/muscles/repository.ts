import rawTaxonomy from '../../content/muscles/taxonomy.json'
import rawRecords from '../../content/muscles/records.json'
import { muscleSchema, taxonomySchema, type Muscle } from './schema'
import { sourceRegistry } from '../../data/sources'

export const anatomyTaxonomy = taxonomySchema.parse(rawTaxonomy)
export function normalizeTerm(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }
export function validateAnatomy(records: readonly Muscle[], sourceIds = sourceRegistry.map((source) => source.sourceId), mediaIds: readonly string[] = []): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  const slugs = new Set<string>()
  const aliases = new Map<string, string>()
  const allIds = new Set([...anatomyTaxonomy.records.map((record) => record.id), ...records.map((record) => record.id)])
  for (const record of records) {
    if (ids.has(record.id)) errors.push(`Duplicate ID: ${record.id}`)
    if (slugs.has(record.slug)) errors.push(`Duplicate slug: ${record.slug}`)
    ids.add(record.id); slugs.add(record.slug)
    for (const region of record.regions) if (!anatomyTaxonomy.regions.some((item) => item.id === region)) errors.push(`${record.id}: unknown region ${region}`)
    for (const group of record.trainingGroups) if (!anatomyTaxonomy.trainingGroups.some((item) => item.id === group)) errors.push(`${record.id}: unknown training group ${group}`)
    for (const relation of [...record.parentIds, ...record.childIds, ...record.relationships.map((item) => item.relatedMuscleId), ...(record.replacementId ? [record.replacementId] : [])]) if (!allIds.has(relation)) errors.push(`${record.id}: unknown relation ${relation}`)
    const refs = [...record.sources, ...record.jointActions.flatMap((item) => item.sourceIds), ...record.relationships.flatMap((item) => item.sourceIds), ...record.misconceptions.flatMap((item) => item.sourceIds)]
    for (const source of refs) if (!sourceIds.includes(source)) errors.push(`${record.id}: unresolved source ${source}`)
    for (const media of record.mediaIds) if (!mediaIds.includes(media)) errors.push(`${record.id}: unresolved media ${media}`)
    for (const alias of [record.slug, record.displayName, ...record.aliases]) {
      const term = normalizeTerm(alias)
      if (aliases.has(term) && aliases.get(term) !== record.id) errors.push(`Alias collision: ${alias}`)
      aliases.set(term, record.id)
    }
  }
  const byId = new Map(records.map((record) => [record.id, record]))
  const visited = new Set<string>()
  function walk(id: string, path: Set<string>) {
    if (path.has(id)) { errors.push(`Parent cycle: ${id}`); return }
    if (visited.has(id)) return
    const next = new Set(path).add(id)
    for (const parent of byId.get(id)?.parentIds ?? []) walk(parent, next)
    visited.add(id)
  }
  records.forEach((record) => walk(record.id, new Set()))
  return [...new Set(errors)]
}
export const muscleRecords = muscleSchema.array().parse(rawRecords)
const integrityErrors = validateAnatomy(muscleRecords)
if (integrityErrors.length) throw new Error(`Anatomy content failed validation: ${integrityErrors.join('; ')}`)
const bySlug = new Map(muscleRecords.map((record) => [record.slug, record]))
export function getPublishedMuscles() { return muscleRecords.filter((record) => record.contentStatus === 'published') }
export function getMuscleBySlug(slug: string): Muscle | undefined { const record = bySlug.get(slug); return record?.contentStatus === 'published' || record?.contentStatus === 'deprecated' ? record : undefined }
export function getMusclesByRegion(regionId: string) { return getPublishedMuscles().filter((record) => record.regions.includes(regionId)) }
export function getRelatedMuscles(id: string) { const record = muscleRecords.find((item) => item.id === id); return (record?.relationships ?? []).flatMap((relation) => { const item = muscleRecords.find((candidate) => candidate.id === relation.relatedMuscleId && candidate.contentStatus === 'published'); return item ? [{ record: item, relation }] : [] }) }
export function getJointActionsForMuscle(id: string) { return muscleRecords.find((record) => record.id === id)?.jointActions ?? [] }
export function getAnatomySources(ids: readonly string[]) { return sourceRegistry.filter((source) => ids.includes(source.sourceId)) }
