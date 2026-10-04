import type { z } from 'zod'
import type { backupSchema, canonicalUnitSchema, localRecordSchema, preferencesSchema, sourceSchema, unitValueSchema } from '../schemas/foundation'

export type EntityId = string & { readonly __entityId: unique symbol }
export type Slug = string & { readonly __slug: unique symbol }
export type SourceMetadata = z.infer<typeof sourceSchema>
export type CanonicalUnit = z.infer<typeof canonicalUnitSchema>
export type UnitValue = z.infer<typeof unitValueSchema>
export type LocalRecord = z.infer<typeof localRecordSchema>
export type Preferences = z.infer<typeof preferencesSchema>
export type BackupEnvelope = z.infer<typeof backupSchema>

export interface KnowledgeEntity {
  id: EntityId
  slug: Slug
  name: string
  aliases: string[]
  sourceIds: string[]
  reviewedAt: string | null
  status: 'draft' | 'verified' | 'needs-review' | 'deprecated'
  relatedIds: EntityId[]
}
