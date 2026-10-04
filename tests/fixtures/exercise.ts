import { exerciseSchema } from '../../src/features/exercises/schema'
// Synthetic engineering fixture only. This is never imported into repository content.
export const reviewedExerciseFixture = exerciseSchema.parse({
  id: 'exercise_test_fixture', slug: 'test-fixture', displayName: 'Fixture exercise', canonicalName: 'Fixture canonical name', aliases: ['Fixture alias'], exerciseType: 'bodyweight-strength', contentStatus: 'published', reviewRequired: false,
  version: '1.0', movementPatternIds: ['pattern_horizontal_push'], equipmentIds: ['equipment_bodyweight'], difficulty: 'foundation', mechanics: 'compound', laterality: 'bilateral', environmentTags: ['home'], goalTags: ['general-fitness'], summary: 'Synthetic template fixture, never published as exercise guidance.',
  muscleRoles: [{ muscleId: 'muscle_pectoralis_major', role: 'primary', sourceIds: ['fixture_source'] }],
  technique: { setup: ['Fixture setup instruction'], executionSteps: ['Fixture execution step one', 'Fixture execution step two'], finishOrReset: 'Fixture reset instruction', keyCheckpoints: ['Fixture checkpoint'], coachingCues: ['Fixture cue'] },
  mistakes: [{ mistake: 'Fixture observation', whyItMatters: 'Fixture explanation', correction: 'Fixture correction', severity: 'safety', sourceIds: ['fixture_source'] }],
  programmingGuidance: [{ context: 'general-fitness', guidanceStatus: 'context-dependent', qualifier: 'Fixture context only', sourceIds: ['fixture_source'] }],
  safety: { notMedicalAdvice: true, stopSignals: ['Fixture stop signal'] },
  media: [{ id: 'fixture_media', kind: 'video', provider: 'YouTube', url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE', embedAllowed: true, captionsAvailable: true, reviewStatus: 'reviewed', reviewedAt: '2026-08-05', credit: 'Synthetic test credit', license: 'Synthetic test license', whySelected: 'Engineering fixture; not reviewed exercise footage' }],
  sources: [{ id: 'fixture_source', title: 'Synthetic test source', publisher: 'Test suite', sourceType: 'other', url: 'https://example.org/fixture', reviewedAt: '2026-08-05' }],
  review: { contentReviewer: 'Synthetic reviewer', techniqueReviewedAt: '2026-08-05', anatomyReviewedAt: '2026-08-05', safetyReviewedAt: '2026-08-05', mediaReviewedAt: '2026-08-05', nextReviewDue: '2027-08-05' },
})
