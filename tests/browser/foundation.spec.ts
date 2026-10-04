import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { modules } from '../../src/data/navigation'

test('contract routes render server-side without personal data', async ({ request }) => {
  for (const module of [{ path: '/', title: 'Your fitness, connected.' }, ...modules]) {
    const response = await request.get(module.path.replace('$slug', 'foundation-placeholder'))
    expect(response.ok(), module.path).toBe(true)
    expect(await response.text(), module.path).toContain((module.path === '/training-science' ? 'Workout science' : module.title).replace('&', '&amp;'))
    if (module.path === '/training-science') expect(response.url()).toContain('/learn/workout-science')
  }
})
test('desktop navigation, module finder and preference persistence', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your fitness, connected.')
  await page.getByRole('button', { name: 'Find a module' }).click()
  await page.getByRole('combobox', { name: 'Search module names' }).fill('food')
  await page.getByRole('option').filter({ hasText: 'Eat' }).first().click()
  await expect(page).toHaveURL(/\/foods$/)
  await page.getByRole('link', { name: 'Settings', exact: true }).click()
  await page.getByRole('radio', { name: 'Dark', exact: true }).check()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('radio', { name: /Imperial/ }).check()
  await page.reload()
  await expect(page.getByRole('radio', { name: 'Dark', exact: true })).toBeChecked()
  await expect(page.getByRole('radio', { name: /Imperial/ })).toBeChecked()
  await expect(page.getByRole('status').last()).toBeVisible()
  expect(errors).toEqual([])
})
test('mobile navigation, keyboard focus, no overflow and accessible themes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await page.getByRole('navigation', { name: 'Mobile primary navigation' }).getByRole('link', { name: 'Train', exact: true }).click()
  await expect(page).toHaveURL(/\/programs$/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  for (const path of ['/', '/settings', '/about/sources', '/exercises']) {
    await page.goto(path)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBe(true)
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(result.violations, path).toEqual([])
  }
  await page.goto('/settings')
  await page.getByRole('radio', { name: 'Dark', exact: true }).check()
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
})
