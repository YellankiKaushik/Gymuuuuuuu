import type { RecordStorage } from '../../storage/indexed-db/adapter'
import type { LocalRecord } from '../../domain/types'
import { localProgramInstanceSchema, type LocalProgramInstance, type Program } from './schema'
const kind = 'program-instance'
const toRecord = (instance: LocalProgramInstance): LocalRecord => ({ id: instance.instanceId, module: 'plans', schemaVersion: 1, createdAt: instance.createdAt, updatedAt: instance.updatedAt, payload: { kind, ...instance } })
export async function listProgramInstances(storage: RecordStorage) {
  return (await storage.list()).filter((item) => item.module === 'plans' && item.payload.kind === kind).map((item) => { const { kind: ignored, ...payload } = item.payload; void ignored; return localProgramInstanceSchema.parse(payload) })
}
export async function selectProgram(storage: RecordStorage, program: Program, replaceId?: string) {
  if (program.contentStatus !== 'published') throw new Error('Only reviewed public programs can be selected.')
  const instances = await listProgramInstances(storage), current = instances.find((item) => ['planned','active','paused'].includes(item.status))
  if (current && current.instanceId !== replaceId) throw new Error('Confirm replacement of the current program before selecting another.')
  const now = new Date().toISOString(), instance = localProgramInstanceSchema.parse({ instanceId: crypto.randomUUID(), canonicalProgramId: program.id, canonicalProgramVersion: program.version, selectedAt: now, startDate: null, preferredWeekdays: {}, substitutionSelections: {}, status: 'planned', createdAt: now, updatedAt: now })
  await storage.commit({ put: [...current ? [toRecord({ ...current, status: 'archived', updatedAt: now })] : [], toRecord(instance)] })
  return instance
}
export async function updateProgramInstance(storage: RecordStorage, instance: LocalProgramInstance, program: Program) {
  if (program.id !== instance.canonicalProgramId || program.version !== instance.canonicalProgramVersion) throw new Error('Keep the selected version; review a new version before replacing it.')
  const sessions = program.scheduleModel?.sessions ?? []
  for (const sessionId of Object.keys(instance.preferredWeekdays)) if (!sessions.some((item) => item.id === sessionId)) throw new Error('Unknown session in weekday preferences.')
  for (const [slot, exerciseId] of Object.entries(instance.substitutionSelections)) {
    const [sessionId,blockId,index] = slot.split(':'), prescription = sessions.find((item) => item.id === sessionId)?.exerciseBlocks.find((item) => item.id === blockId)?.prescriptions[Number(index)]
    const group = program.substitutionGroups?.find((item) => item.id === prescription?.substitutionGroupId)
    if (!prescription || !group?.candidateExerciseIds.includes(exerciseId)) throw new Error('Substitution is outside the reviewed alternatives for this slot.')
  }
  await storage.put(toRecord(localProgramInstanceSchema.parse({ ...instance, updatedAt: new Date().toISOString() })))
}
export async function clearCurrentProgram(storage: RecordStorage, instance: LocalProgramInstance) { await storage.put(toRecord({ ...instance, status: 'archived', updatedAt: new Date().toISOString() })) }
