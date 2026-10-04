import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import process from 'node:process'
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
page.on('pageerror', (error) => process.stdout.write(`Page error: ${error.message}\n`))
await page.goto(process.argv[2] ?? 'http://127.0.0.1:3000')
await page.getByRole('button', { name: 'Find a module' }).waitFor()
await page.getByRole('button', { name: 'Find a module' }).click()
process.stdout.write(JSON.stringify(await page.locator('dialog').evaluateAll((dialogs) => dialogs.map((dialog) => ({ open: dialog.open, text: dialog.textContent })))) + '\n')
await page.keyboard.press('Escape')
mkdirSync('docs/screenshots', { recursive: true })
await page.screenshot({ path: 'docs/screenshots/phase-00-desktop.png', fullPage: true })
await page.setViewportSize({ width: 390, height: 844 })
await page.screenshot({ path: 'docs/screenshots/phase-00-mobile.png', fullPage: true })
await browser.close()
