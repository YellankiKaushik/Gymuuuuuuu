import { z } from 'zod'

export const idSchema = z.string().min(1).max(160).regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/)
export const isoDateSchema = z.iso.date()
export const canonicalUnitSchema = z.enum(['g', 'kcal', 's', 'm', 'kg', 'cm'])
export const sourceSchema = z.object({
  sourceId: idSchema,
  publisher: z.string().min(1),
  title: z.string().min(1),
  url: z.url().refine((url) => /^https?:\/\//.test(url), 'Source must use HTTP or HTTPS'),
  sourceType: z.enum(['government', 'professional-body', 'research', 'academic', 'practitioner', 'demonstration', 'documentation']),
  publishedAt: isoDateSchema.optional(),
  datasetVersion: z.string().optional(),
  accessedAt: isoDateSchema,
  reviewedAt: isoDateSchema.nullable(),
  usageNote: z.string().min(1),
  quality: z.enum(['primary', 'reviewed', 'limited', 'unverified']),
  supportedFields: z.array(z.string().min(1)),
  limitations: z.string(),
  reviewerStatus: z.enum(['draft', 'verified', 'needs-review', 'deprecated']),
}).strict()

export const unitValueSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('measured'), value: z.number().finite().nonnegative(), unit: canonicalUnitSchema, sourceIds: z.array(idSchema).min(1) }).strict(),
  z.object({ status: z.literal('calculated'), value: z.number().finite().nonnegative(), unit: canonicalUnitSchema, method: z.string().min(1), sourceIds: z.array(idSchema).min(1) }).strict(),
  z.object({ status: z.literal('estimated'), value: z.number().finite().nonnegative(), unit: canonicalUnitSchema, limitation: z.string().min(1), sourceIds: z.array(idSchema).min(1) }).strict(),
  z.object({ status: z.literal('trace'), value: z.null(), unit: canonicalUnitSchema, sourceIds: z.array(idSchema).min(1) }).strict(),
  z.object({ status: z.literal('not-measured'), value: z.null(), unit: canonicalUnitSchema, reason: z.string().min(1) }).strict(),
  z.object({ status: z.literal('not-available'), value: z.null(), unit: canonicalUnitSchema, reason: z.string().min(1) }).strict(),
])

export const recordModuleSchema = z.enum(['workout', 'plans', 'cardio', 'nutrition', 'body', 'sleep', 'recovery', 'saved', 'notes', 'presets'])
export const localRecordSchema = z.object({
  id: idSchema,
  module: recordModuleSchema,
  schemaVersion: z.literal(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  payload: z.record(z.string(), z.unknown()),
}).strict().refine((record) => record.updatedAt >= record.createdAt, 'updatedAt cannot precede createdAt')

export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  units: z.enum(['metric', 'imperial']),
  sidebarCollapsed: z.boolean().optional(),
  anatomyView: z.enum(['body', 'list']).optional(),
  exerciseView: z.enum(['cards', 'list']).optional(),
}).strict()

export const backupSchema = z.object({
  format: z.literal('fitness-os-backup'),
  schemaVersion: z.literal(1),
  exportedAt: z.iso.datetime(),
  appVersion: z.string().min(1),
  records: z.array(localRecordSchema).max(100000),
  preferences: preferencesSchema,
}).strict().superRefine((backup, context) => {
  const seen = new Set<string>()
  backup.records.forEach((record, index) => {
    if (seen.has(record.id)) context.addIssue({ code: 'custom', path: ['records', index, 'id'], message: 'Duplicate record ID' })
    seen.add(record.id)
  })
})
