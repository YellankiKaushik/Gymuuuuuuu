import { backupSchema } from '../../domain/schemas/foundation'
import type { BackupEnvelope } from '../../domain/types'

export type ImportPreview = { ok: true; envelope: BackupEnvelope; counts: Record<string, number>; conflicts: string[] } | { ok: false; errors: string[] }

// Pure dry run. This function never writes, replaces or merges local data.
export function previewBackup(raw: string, existingIds: readonly string[] = []): ImportPreview {
  if (raw.length > 20 * 1024 * 1024) return { ok: false, errors: ['Backup exceeds the 20 MB validation limit.'] }
  let input: unknown
  try { input = JSON.parse(raw) as unknown } catch { return { ok: false, errors: ['The file is not valid JSON. Existing data has not changed.'] } }
  const result = backupSchema.safeParse(input)
  if (!result.success) return { ok: false, errors: result.error.issues.map((issue) => `${issue.path.join('.') || 'backup'}: ${issue.message}`) }
  const counts: Record<string, number> = {}
  for (const record of result.data.records) counts[record.module] = (counts[record.module] ?? 0) + 1
  const existing = new Set(existingIds)
  return { ok: true, envelope: result.data, counts, conflicts: result.data.records.filter((record) => existing.has(record.id)).map((record) => record.id) }
}

export function serializeBackup(envelope: BackupEnvelope): string {
  return JSON.stringify(backupSchema.parse(envelope), null, 2)
}

// CSV fields are quoted and formula-like values are neutralized for spreadsheet safety.
export function encodeCsv(rows: readonly (readonly (string | number | null)[])[]): string {
  return rows.map((row) => row.map((value) => {
    const raw = value === null ? '' : String(value)
    const safe = typeof value === 'string' && /^[\s]*[=+@-]/.test(raw) ? `'${raw}` : raw
    return `"${safe.replaceAll('"', '""')}"`
  }).join(',')).join('\r\n')
}
