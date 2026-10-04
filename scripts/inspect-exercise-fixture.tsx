import { readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { ExerciseDetailContent } from '../src/features/exercises/detail'
import { reviewedExerciseFixture } from '../tests/fixtures/exercise'
const css = ['foundation', 'shell', 'catalogue', 'exercises'].map((name) => readFileSync(`src/styles/${name}.css`, 'utf8')).join('\n')
Object.assign(globalThis, { React })
const markup = renderToStaticMarkup(<ExerciseDetailContent record={reviewedExerciseFixture} />)
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext()
const page = await context.newPage()
for (const width of [320, 375, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 1000 })
  await page.setContent(`<!doctype html><html lang="en"><head><title>Engineering fixture inspection</title><style>${css}\n:root{--font-sans: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif}</style></head><body><main>${markup}</main></body></html>`)
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Fixture overflow at ${width}`)
  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => document.documentElement.dataset.theme = value, theme)
    const violations = (await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations
    if (violations.length) throw new Error(JSON.stringify(violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) }))))
  }
  if (width === 320 || width === 1440) { await page.evaluate(() => document.documentElement.dataset.theme = 'light'); await page.screenshot({ path: `docs/screenshots/phase03-detail-${width}.png`, fullPage: true }) }
}
await browser.close()
console.log('Synthetic exercise detail: five viewports, both themes, no overflow or axe violations. No public content was created.')
