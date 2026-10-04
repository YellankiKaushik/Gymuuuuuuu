import { z } from 'zod'
export const entityTypeSchema = z.enum(['region', 'training-group', 'anatomical-group', 'muscle', 'subdivision'])
export const visibilitySchema = z.enum(['anterior', 'posterior', 'lateral', 'deep', 'multiple'])
export const contributionSchema = z.enum(['primary', 'secondary', 'supporting', 'stabilizing', 'context-dependent'])
export const movementPatterns = ['horizontal-push', 'horizontal-pull', 'vertical-push', 'vertical-pull', 'squat', 'hinge', 'lunge', 'carry', 'rotation', 'anti-rotation', 'flexion', 'extension', 'abduction', 'adduction', 'scapular-elevation-depression', 'scapular-protraction-retraction', 'locomotion', 'breathing-bracing'] as const
const strings = z.array(z.string().min(1))
const optionalText = z.string().min(1).nullable().optional()
export const muscleSchema = z.object({
  id: z.string().regex(/^muscle_[a-z0-9_]+$/), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  displayName: z.string().min(2), anatomicalName: z.string().min(2), latinName: optionalText, aliases: strings.default([]),
  entityType: entityTypeSchema, contentStatus: z.enum(['draft', 'review-needed', 'reviewed', 'published', 'deprecated']),
  confidence: z.enum(['high', 'moderate', 'limited']).optional(), laterality: z.enum(['midline', 'bilateral', 'left', 'right', 'not-applicable']).optional(),
  regions: z.array(z.string().regex(/^region_[a-z0-9_]+$/)).min(1), trainingGroups: strings.default([]),
  parentIds: strings.default([]), childIds: strings.default([]), visibility: z.array(visibilitySchema).default([]), depth: z.enum(['foundation', 'practical', 'advanced']).default('foundation'),
  summary: z.string().min(20), locationSummary: optionalText, practicalImportance: optionalText,
  structure: z.object({ subdivisions: strings.optional(), proximalAttachmentSummary: optionalText, distalAttachmentSummary: optionalText, jointCrossings: strings.optional(), fiberDirection: optionalText, innervationSummary: optionalText }).strict().optional(),
  jointActions: z.array(z.object({ joint: z.string().min(1), motion: z.string().min(1), plane: optionalText, contributionLevel: contributionSchema, qualifier: optionalText, sourceIds: strings.min(1) }).strict()).default([]),
  movementPatterns: z.array(z.enum(movementPatterns)).default([]),
  trainingRelevance: z.object({ compoundCategories: strings.optional(), isolationCategories: strings.optional(), stabilizationContexts: strings.optional(), notes: strings.optional() }).strict().optional(),
  relationships: z.array(z.object({ relatedMuscleId: z.string().min(1), context: z.string().min(1), role: z.enum(['agonist', 'antagonist', 'synergist', 'stabilizer', 'neighbor', 'commonly-confused']), note: optionalText, sourceIds: strings.min(1) }).strict()).default([]),
  misconceptions: z.array(z.object({ claim: z.string().min(1), correction: z.string().min(1), severity: z.enum(['minor', 'misleading', 'safety-relevant']), sourceIds: strings.min(1) }).strict()).default([]),
  cautions: strings.default([]), mediaIds: strings.default([]), sources: strings.min(1), reviewedBy: optionalText, reviewedAt: z.iso.date().nullable().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/), replacementId: optionalText,
}).strict().superRefine((record, context) => {
  if (record.contentStatus !== 'published') return
  for (const field of ['reviewedBy', 'reviewedAt', 'locationSummary', 'practicalImportance'] as const) if (!record[field]) context.addIssue({ code: 'custom', path: [field], message: 'Published records require this field' })
  if (record.entityType === 'muscle' && !record.jointActions.length) context.addIssue({ code: 'custom', path: ['jointActions'], message: 'A published muscle requires sourced actions' })
  if (record.entityType === 'muscle' && (!record.structure?.proximalAttachmentSummary || !record.structure?.distalAttachmentSummary)) context.addIssue({ code: 'custom', path: ['structure'], message: 'A published muscle requires sourced attachment summaries' })
})
export type Muscle = z.infer<typeof muscleSchema>
export const taxonomySchema = z.object({
  metadata: z.object({ title: z.string(), purpose: z.string(), version: z.string(), date: z.iso.date(), publicationRule: z.string() }),
  regions: z.array(z.object({ id: z.string(), displayName: z.string(), defaultVisibility: visibilitySchema })),
  trainingGroups: z.array(z.object({ id: z.string(), displayName: z.string(), regionIds: strings })),
  records: z.array(z.object({ id: z.string(), slug: z.string(), displayName: z.string(), entityType: entityTypeSchema, regionIds: strings, trainingGroupIds: strings, contentStatus: z.literal('draft') })),
})
