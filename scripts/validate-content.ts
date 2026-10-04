import { anatomyTaxonomy, muscleRecords, validateAnatomy } from '../src/features/muscles/repository'
import { sourceSchema } from '../src/domain/schemas/foundation'
import { sourceRegistry } from '../src/data/sources'
const errors = validateAnatomy(muscleRecords)
sourceSchema.array().parse(sourceRegistry)
for (const [name, entries] of [['regions', anatomyTaxonomy.regions], ['groups', anatomyTaxonomy.trainingGroups], ['identities', anatomyTaxonomy.records]] as const) {
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) errors.push(`Duplicate taxonomy ${name} IDs`)
}
for (const record of anatomyTaxonomy.records) {
  for (const regionId of record.regionIds) if (!anatomyTaxonomy.regions.some((region) => region.id === regionId)) errors.push(`${record.id}: unknown seed region ${regionId}`)
  for (const groupId of record.trainingGroupIds) if (!anatomyTaxonomy.trainingGroups.some((group) => group.id === groupId)) errors.push(`${record.id}: unknown seed group ${groupId}`)
}
if (errors.length) throw new Error(errors.join('\n'))
console.log(`Content validation passed: ${anatomyTaxonomy.records.length} stable anatomy IDs; ${muscleRecords.filter((record) => record.contentStatus === 'published').length} published records.`)
