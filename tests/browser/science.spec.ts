import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test('science URL filters, history, methods and glossary are accessible', async ({ page }) => {
  await page.goto('/training-science'); await expect(page).toHaveURL(/\/learn\/workout-science$/)
  await expect(page.getByRole('button', { name: 'Find a module' })).toBeEnabled()
  await page.getByRole('button', { name: 'Foundations', exact: true }).click()
  await page.getByRole('button', { name: 'Training variables', exact: true }).click()
  await page.reload(); await expect(page.getByRole('button', { name: 'Foundations', exact: true })).toHaveAttribute('aria-pressed','true')
  await expect(page.getByRole('button', { name: 'Find a module' })).toBeEnabled()
  await page.getByRole('button', { name: 'Training variables', exact: true }).click()
  await page.goBack(); await expect(page.getByRole('button', { name: 'Training variables', exact: true })).toHaveAttribute('aria-pressed','true')
  await page.getByRole('button', { name: 'Clear science filters' }).click(); await expect(page).toHaveURL(/\/learn\/workout-science$/)
  await page.getByRole('button', { name: 'Filters', exact: true }).click(); await expect(page.getByRole('dialog', { name: 'Science filters' })).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Filters', exact: true })).toBeFocused()
  for (const path of ['/learn/workout-science','/learn/workout-science/methods','/learn/workout-science/glossary']) { await page.goto(path); expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]) }
  await page.goto('/learn/workout-science/training-volume'); await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible(); await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex')
})
test('science methods and glossary reflow at 320 pixels and dark theme', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 }); await page.goto('/settings'); await page.getByRole('radio', { name: 'Dark', exact: true }).check()
  for (const path of ['/learn/workout-science?category=fake','/learn/workout-science/methods','/learn/workout-science/glossary']) { await page.goto(path); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]) }
})
