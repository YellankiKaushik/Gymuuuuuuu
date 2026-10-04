import { describe, expect, it } from 'vitest'
import { anatomyTaxonomy, getMuscleBySlug, getPublishedMuscles, normalizeTerm, validateAnatomy } from '../src/features/muscles/repository'
import { muscleSchema } from '../src/features/muscles/schema'
import { parseMuscleQuery, searchMuscles, serializeMuscleQuery } from '../src/features/muscles/query'
const fixture = muscleSchema.parse({ id: 'muscle_deltoid_posterior', slug: 'posterior-deltoid', displayName: 'Posterior deltoid', anatomicalName: 'Posterior deltoid', aliases: ['Rear delts'], entityType: 'subdivision', contentStatus: 'published', regions: ['region_shoulder'], trainingGroups: ['group_shoulders'], summary: 'Fixture only: this text is not published factual anatomy.', locationSummary: 'Fixture location', practicalImportance: 'Fixture role', jointActions: [{ joint: 'shoulder', motion: 'extension', contributionLevel: 'context-dependent', sourceIds: ['test-source'] }], movementPatterns: ['horizontal-pull'], visibility: ['posterior'], sources: ['test-source'], reviewedAt: '2026-10-04', reviewedBy: 'Test fixture', version: '1.0.0' })
describe('anatomy content gates and canonical IDs', () => {
  it('preserves supplied taxonomy identity and hides incomplete records', () => {
    expect(anatomyTaxonomy.records.some((record) => record.id === 'muscle_rectus_abdominis')).toBe(true)
    expect(anatomyTaxonomy.records.every((record) => record.contentStatus === 'draft')).toBe(true)
    expect(new Set(anatomyTaxonomy.records.map((record) => record.id)).size).toBe(anatomyTaxonomy.records.length)
    expect(getMuscleBySlug('unknown')).toBeUndefined()
    expect(getPublishedMuscles().every((record) => record.reviewedAt && record.sources.length)).toBe(true)
  })
  it('rejects publishing facts without provenance/review and sourced actions', () => {
    expect(muscleSchema.safeParse({ ...fixture, reviewedAt: null }).success).toBe(false)
    expect(muscleSchema.safeParse({ ...fixture, sources: [] }).success).toBe(false)
    expect(muscleSchema.safeParse({ ...fixture, entityType: 'muscle', jointActions: [] }).success).toBe(false)
    expect(muscleSchema.safeParse({ ...fixture, entityType: 'fictional-muscle' }).success).toBe(false)
  })
  it('detects duplicate IDs/slugs, alias collisions, cycles and unresolved references', () => {
    expect(validateAnatomy([fixture], ['test-source'])).toEqual([])
    expect(validateAnatomy([fixture, fixture], ['test-source']).join(' ')).toContain('Duplicate ID')
    expect(validateAnatomy([{ ...fixture, parentIds: [fixture.id] }], ['test-source']).join(' ')).toContain('Parent cycle')
    expect(validateAnatomy([{ ...fixture, parentIds: ['unknown'] }], ['test-source']).join(' ')).toContain('unknown relation')
    expect(validateAnatomy([fixture], []).join(' ')).toContain('unresolved source')
    expect(validateAnatomy([{ ...fixture, mediaIds: ['uncleared'] }], ['test-source']).join(' ')).toContain('unresolved media')
  })
})
describe('muscle queries', () => {
  it('normalizes punctuation and aliases and supports combined filters', () => {
    expect(normalizeTerm('  Rear-DELTS! ')).toBe('rear delts')
    expect(searchMuscles(parseMuscleQuery({ q: 'rear delt' }), [fixture])).toHaveLength(1)
    expect(searchMuscles(parseMuscleQuery({ q: 'deltoid', region: 'region_shoulder', type: 'subdivision', visibility: 'posterior', joint: 'shoulder', action: 'extension', movement: 'horizontal-pull' }), [fixture])).toHaveLength(1)
    expect(searchMuscles(parseMuscleQuery({ region: 'region_lower_leg' }), [fixture])).toEqual([])
  })
  it('round-trips URL state and safely normalizes invalid values', () => {
    const query = parseMuscleQuery({ q: 'rear delt', region: 'region_shoulder', view: 'list', sort: 'relevance' })
    expect(parseMuscleQuery(Object.fromEntries(new URLSearchParams(serializeMuscleQuery(query))))).toEqual(query)
    expect(parseMuscleQuery({ region: 'bad', type: 'made-up', view: 'bad', movement: 'bad' })).toMatchObject({ region: '', type: '', view: 'body', movement: '' })
  })
})
