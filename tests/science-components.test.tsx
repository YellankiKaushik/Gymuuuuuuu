// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ScienceTopicContent, TopicComparison } from '../src/features/workout-science/detail'
import { scienceFixture as fixture } from './fixtures/science'
afterEach(cleanup)
it('puts the framework before deeper evidence and preserves population/limitations', () => { const { container } = render(<ScienceTopicContent topic={fixture} />); const sections = [...container.querySelectorAll('section[id]')].map((section) => section.id); expect(sections.indexOf('decision-framework')).toBeLessThan(sections.indexOf('evidence')); const summary = container.querySelector('#evidence summary')!; fireEvent.click(summary); expect(screen.getByText('Population studied')).toBeTruthy(); expect(screen.getByText('Synthetic test evidence only')).toBeTruthy(); expect(screen.getByText('Practice framework')).toBeTruthy() })
it('renders comparisons as separate readable concepts with shared goal context', () => { render(<TopicComparison topics={[fixture, { ...fixture, id: 'science_other', slug: 'other', displayName: 'Other concept' }]} />); expect(screen.getByRole('heading', { name: 'Compare related concepts' })).toBeTruthy(); expect(screen.getByRole('link', { name: 'Other concept' })).toBeTruthy() })
