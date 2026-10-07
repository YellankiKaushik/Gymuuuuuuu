import rawTaxonomy from '../../content/exercises/taxonomy.json'
import rawRecords from '../../content/exercises/records.json'
import { anatomyTaxonomy, muscleRecords, normalizeTerm } from '../muscles/public-repository'
import { exerciseSchema, type Exercise } from './schema'

export const exerciseTaxonomy = rawTaxonomy
export const exerciseIdentities = rawTaxonomy.records.map((record) => exerciseSchema.parse({ ...record, version: rawTaxonomy.metadata.version }))
export const exerciseRecords = exerciseSchema.array().parse(rawRecords)
export const exerciseMigrations: Readonly<Record<string, string>> = {}
export function validateExercises(records: readonly Exercise[], today = new Date().toISOString().slice(0, 10)) {
  const errors: string[] = []
  const ids = new Set<string>(), slugs = new Set<string>()
  const knownIds = new Set([...exerciseIdentities, ...records].map((record) => record.id))
  const muscleIds = new Set(anatomyTaxonomy.records.map((record) => record.id))
  const patterns = new Set(exerciseTaxonomy.movementPatterns.map((item) => item.id))
  const equipment = new Set(exerciseTaxonomy.equipment.map((item) => item.id))
  const byId = new Map(records.map((record) => [record.id, record]))
  for (const record of records) {
    if (ids.has(record.id)) errors.push(`${record.id}: duplicate ID`)
    if (slugs.has(record.slug)) errors.push(`${record.id}: duplicate slug ${record.slug}`)
    ids.add(record.id); slugs.add(record.slug)
    const identity = exerciseIdentities.find((item) => item.id === record.id)
    if (identity && identity.slug !== record.slug) errors.push(`${record.id}: stable slug changed`)
    const slugOwner = exerciseIdentities.find((item) => item.slug === record.slug)
    if (slugOwner && slugOwner.id !== record.id) errors.push(`${record.id}: slug belongs to ${slugOwner.id}`)
    if (new Set(record.media?.map((media) => media.id)).size !== (record.media?.length ?? 0)) errors.push(`${record.id}: duplicate media ID`)
    for (const id of record.movementPatternIds) if (!patterns.has(id)) errors.push(`${record.id}: unknown movement ${id}`)
    for (const id of record.equipmentIds) if (!equipment.has(id)) errors.push(`${record.id}: unknown equipment ${id}`)
    for (const role of record.muscleRoles ?? []) {
      if (!muscleIds.has(role.muscleId)) errors.push(`${record.id}: unknown muscle ${role.muscleId}`)
      if (muscleRecords.some((muscle) => muscle.id === role.muscleId && muscle.contentStatus === 'deprecated')) errors.push(`${record.id}: deprecated muscle ${role.muscleId}`)
      if (role.role === 'context-dependent' && !role.qualifier) errors.push(`${record.id}: context-dependent role needs qualifier`)
    }
    for (const id of Object.values(record.relationships ?? {}).flat()) {
      if (id === record.id || !knownIds.has(id)) errors.push(`${record.id}: invalid relationship ${id}`)
      if (record.contentStatus === 'published' && byId.get(id)?.contentStatus !== 'published') errors.push(`${record.id}: unpublished relationship target ${id}`)
    }
    const sourceIds = new Set(record.sources?.map((source) => source.id))
    if (sourceIds.size !== (record.sources?.length ?? 0)) errors.push(`${record.id}: duplicate source ID`)
    const claims = [...record.muscleRoles ?? [], ...record.jointActions ?? [], ...record.mistakes ?? [], ...record.programmingGuidance ?? []]
    for (const claim of claims) for (const id of claim.sourceIds) if (!sourceIds.has(id)) errors.push(`${record.id}: unresolved source ${id}`)
    if (record.contentStatus === 'published') {
      if (record.review?.nextReviewDue && record.review.nextReviewDue < today) errors.push(`${record.id}: critical review overdue`)
      const twoYearsAgo = new Date(`${today}T00:00:00Z`); twoYearsAgo.setUTCFullYear(twoYearsAgo.getUTCFullYear() - 2)
      for (const date of [record.review?.techniqueReviewedAt, record.review?.anatomyReviewedAt, record.review?.safetyReviewedAt, record.review?.mediaReviewedAt]) if (date && date < twoYearsAgo.toISOString().slice(0, 10)) errors.push(`${record.id}: critical review older than 24 months`)
      for (const date of [record.review?.techniqueReviewedAt, record.review?.anatomyReviewedAt, record.review?.safetyReviewedAt, record.review?.mediaReviewedAt, ...record.sources?.map((source) => source.reviewedAt) ?? [], ...record.media?.map((media) => media.reviewedAt) ?? []]) if (date && date > today) errors.push(`${record.id}: future review date`)
      if (!record.sources?.some((source) => source.sourceType !== 'video-review')) errors.push(`${record.id}: video cannot be sole factual evidence`)
    }
  }
  return [...new Set(errors)]
}
const integrityErrors = [...validateExercises(exerciseIdentities), ...validateExercises(exerciseRecords)]
if (integrityErrors.length) throw new Error(`Exercise validation failed: ${integrityErrors.join('; ')}`)
export function buildExerciseIndexes(records: readonly Exercise[]) {
  const byId = new Map(records.map((record) => [record.id, record]))
  const bySlug = new Map(records.map((record) => [record.slug, record]))
  const aliases = new Map<string, Set<string>>()
  const movement = new Map<string, Set<string>>(), equipment = new Map<string, Set<string>>(), muscle = new Map<string, Set<string>>()
  const relationships = new Map<string, string[]>(), search = new Map<string, string>()
  function add(index: Map<string, Set<string>>, key: string, id: string) { const set = index.get(key) ?? new Set<string>(); set.add(id); index.set(key, set) }
  for (const record of records) {
    for (const alias of [record.displayName, record.slug, record.canonicalName ?? '', ...record.aliases]) if (alias) add(aliases, normalizeTerm(alias), record.id)
    record.movementPatternIds.forEach((id) => add(movement, id, record.id))
    record.equipmentIds.forEach((id) => add(equipment, id, record.id))
    record.muscleRoles?.forEach((role) => add(muscle, role.muscleId, record.id))
    relationships.set(record.id, Object.values(record.relationships ?? {}).flat())
    const muscleTerms = (record.muscleRoles ?? []).flatMap((role) => { const item = anatomyTaxonomy.records.find((candidate) => candidate.id === role.muscleId); const reviewed = muscleRecords.find((candidate) => candidate.id === role.muscleId); return item ? [item.displayName, ...reviewed?.aliases ?? []] : [] })
    search.set(record.id, normalizeTerm([record.displayName, record.canonicalName, ...record.aliases, ...record.goalTags ?? [], ...muscleTerms, ...record.movementPatternIds.map((id) => exerciseTaxonomy.movementPatterns.find((item) => item.id === id)?.displayName), ...record.equipmentIds.map((id) => exerciseTaxonomy.equipment.find((item) => item.id === id)?.displayName)].join(' ')))
  }
  return { byId, bySlug, aliases, movement, equipment, muscle, relationships, search }
}
export const exerciseIndexes = buildExerciseIndexes(exerciseRecords)
export function getPublishedExercises() { return exerciseRecords.filter((record) => record.contentStatus === 'published') }
export function getExerciseBySlug(slug: string) { const item = exerciseIndexes.bySlug.get(slug); return item && ['published', 'deprecated'].includes(item.contentStatus) ? item : undefined }
export function exercisesForMuscle(id: string) { return getPublishedExercises().filter((record) => record.muscleRoles?.some((role) => role.muscleId === id)) }
export function exerciseCoverage() {
  const published = getPublishedExercises()
  const withPrimaryIn = (ids: readonly string[]) => published.filter((record) => record.muscleRoles?.some((role) => role.role === 'primary' && ids.includes(role.muscleId))).length
  return { identities: exerciseIdentities.length, published: published.length, byMovement: Object.fromEntries(exerciseTaxonomy.movementPatterns.map((pattern) => [pattern.id, published.filter((record) => record.movementPatternIds.includes(pattern.id)).length])), byEquipment: Object.fromEntries(exerciseTaxonomy.equipment.map((item) => [item.id, published.filter((record) => record.equipmentIds.includes(item.id)).length])), byRegion: Object.fromEntries(anatomyTaxonomy.regions.map((item) => [item.id, withPrimaryIn(anatomyTaxonomy.records.filter((muscle) => muscle.regionIds.includes(item.id)).map((muscle) => muscle.id))])), byTrainingGroup: Object.fromEntries(anatomyTaxonomy.trainingGroups.map((item) => [item.id, withPrimaryIn(anatomyTaxonomy.records.filter((muscle) => muscle.trainingGroupIds.includes(item.id)).map((muscle) => muscle.id))])), missingRegressions: published.filter((record) => record.difficulty !== 'foundation' && !record.relationships?.regressionIds?.length).map((record) => record.id), missingMedia: published.filter((record) => !record.media?.some((media) => media.reviewStatus === 'reviewed')).map((record) => record.id), missingReview: published.filter((record) => !record.review?.techniqueReviewedAt).map((record) => record.id) }
}
