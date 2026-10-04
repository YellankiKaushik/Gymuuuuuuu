// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ExerciseDetailContent } from '../src/features/exercises/detail'
import { reviewedExerciseFixture as fixture } from './fixtures/exercise'
afterEach(cleanup)
it('retains semantic steps and safety when media loads or fails and supports gym mode', () => {
  const { container } = render(<ExerciseDetailContent record={fixture} />)
  expect(container.querySelector('iframe')).toBeNull()
  expect(container.querySelectorAll('#execution ol li')).toHaveLength(2)
  fireEvent.click(screen.getByRole('button', { name: 'Gym mode' }))
  expect(container.querySelector('.gym-mode')).not.toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Load video' }))
  const iframe = container.querySelector('iframe')!
  expect(iframe.src).toContain('youtube-nocookie.com')
  // Cross-origin player restrictions do not reliably emit an iframe error event.
  fireEvent.click(screen.getByRole('button', { name: 'Video unavailable? Use written steps' }))
  expect(container.querySelector('iframe')).toBeNull()
  expect(screen.getByText('Fixture execution step one')).toBeTruthy()
  expect(screen.getByText('Fixture stop signal')).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Watch on YouTube' })).toBeTruthy()
})
