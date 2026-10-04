import { afterEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { backupSchema, sourceSchema, unitValueSchema } from '../src/domain/schemas/foundation'
import { formatUnitValue } from '../src/domain/units/format'
import { encodeCsv, previewBackup, serializeBackup } from '../src/storage/backup/envelope'
import { createRecordStorage } from '../src/storage/indexed-db/adapter'
import { readPreferences, writePreferences } from '../src/storage/preferences/adapter'
import { supportsSchema } from '../src/storage/migrations'
import type { BackupEnvelope, LocalRecord } from '../src/domain/types'

const record: LocalRecord = { id: 'test-session', module: 'workout', schemaVersion: 1, createdAt: '2026-10-04T00:00:00Z', updatedAt: '2026-10-04T00:00:00Z', payload: { note: 'Test fixture only' } }
const envelope: BackupEnvelope = { format: 'fitness-os-backup', schemaVersion: 1, exportedAt: '2026-10-04T00:00:00Z', appVersion: '0.0.0', records: [record], preferences: { theme: 'system', units: 'metric' } }
afterEach(() => vi.unstubAllGlobals())

describe('data validation and portability', () => {
  it('distinguishes reported zero from missing and trace values', () => {
    expect(formatUnitValue(unitValueSchema.parse({ status: 'measured', value: 0, unit: 'g', sourceIds: ['test-source'] }))).toBe('0 g')
    expect(formatUnitValue(unitValueSchema.parse({ status: 'not-available', value: null, unit: 'g', reason: 'Not published' }))).toBe('Not available')
    expect(formatUnitValue(unitValueSchema.parse({ status: 'trace', value: null, unit: 'g', sourceIds: ['test-source'] }))).toBe('Trace')
    expect(unitValueSchema.safeParse({ status: 'not-available', value: 0, unit: 'g', reason: 'Missing' }).success).toBe(false)
    expect(unitValueSchema.safeParse({ status: 'estimated', value: 1, unit: 'g', sourceIds: ['source'] }).success).toBe(false)
  })
  it('converts only for display without changing canonical values', () => {
    const value = unitValueSchema.parse({ status: 'measured', value: 1, unit: 'kg', sourceIds: ['test-source'] })
    expect(formatUnitValue(value, 'imperial')).toBe('2.2 lb')
    expect(value.value).toBe(1)
  })
  it('requires source identity, provenance and review status', () => {
    expect(sourceSchema.safeParse({ sourceId: 'source', title: 'Unsourced' }).success).toBe(false)
  })
  it('round-trips backups and reports conflicts without writes', () => {
    const preview = previewBackup(serializeBackup(envelope), ['test-session'])
    expect(preview.ok).toBe(true)
    if (preview.ok) { expect(preview.counts).toEqual({ workout: 1 }); expect(preview.conflicts).toEqual(['test-session']); expect(preview.envelope).toEqual(envelope) }
  })
  it('rejects invalid JSON, unsupported versions, duplicates and inconsistent timestamps', () => {
    expect(previewBackup('{invalid').ok).toBe(false)
    expect(previewBackup(JSON.stringify({ ...envelope, schemaVersion: 2 })).ok).toBe(false)
    expect(backupSchema.safeParse({ ...envelope, records: [record, record] }).success).toBe(false)
    expect(backupSchema.safeParse({ ...envelope, records: [{ ...record, updatedAt: '2020-01-01T00:00:00Z' }] }).success).toBe(false)
    expect(supportsSchema(2)).toBe(false)
  })
  it('quotes CSV cells and neutralizes spreadsheet formulas while preserving missing values', () => {
    expect(encodeCsv([['=SUM(A1)', 'a,"b"', null, 0]])).toBe('"\'=SUM(A1)","a,""b""","","0"')
  })
})

describe('client-only storage boundary', () => {
  it('does not access browser globals during server execution', async () => {
    expect(readPreferences().ok).toBe(true)
    expect(writePreferences({ theme: 'light', units: 'metric' }).ok).toBe(false)
    await expect(createRecordStorage().list()).rejects.toThrow('browser IndexedDB')
  })
  it('reports storage failures rather than pretending to save', () => {
    vi.stubGlobal('window', { localStorage: { getItem: () => { throw new Error('Denied') }, setItem: () => { throw new Error('Full') } } })
    expect(readPreferences().ok).toBe(false)
    expect(writePreferences({ theme: 'dark', units: 'metric' }).ok).toBe(false)
  })
  it('persists valid records transactionally and rejects invalid writes', async () => {
    vi.stubGlobal('window', { indexedDB: new IDBFactory() })
    const storage = createRecordStorage('test-foundation')
    await storage.put(record)
    expect(await storage.list()).toEqual([record])
    await expect(storage.put({ ...record, id: '' })).rejects.toThrow()
    expect(await storage.list()).toHaveLength(1)
    await storage.remove(record.id)
    expect(await storage.list()).toEqual([])
    storage.close()
  })
})
