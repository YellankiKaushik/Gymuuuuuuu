import React from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { ProgramContent } from '../src/features/programs/pages'
import { programFixture } from '../tests/fixtures/program'
Object.assign(globalThis,{React})
const css=['foundation','shell','catalogue','programs'].map(name=>readFileSync(`src/styles/${name}.css`,'utf8')).join('\n')
const markup=renderToStaticMarkup(<><h1>Synthetic program fixture</h1><ProgramContent program={programFixture} /></>)
const browser=await chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext(),page=await context.newPage()
for(const width of [320,375,768,1024,1440]){await page.setViewportSize({width,height:1000});await page.setContent(`<!doctype html><html lang="en"><head><title>Engineering fixture</title><style>${css}:root{--font-sans:'Segoe UI',Arial,sans-serif}</style></head><body><main>${markup}</main></body></html>`);if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(`Overflow ${width}`);for(const theme of ['light','dark']){await page.evaluate(value=>document.documentElement.dataset.theme=value,theme);const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations;if(violations.length)throw new Error(JSON.stringify(violations.map(item=>({id:item.id,targets:item.nodes.map(node=>node.target)}))))}if(width===320||width===1440)await page.screenshot({path:`docs/screenshots/phase05-detail-${width}.png`,fullPage:true})}
await browser.close()
console.log('Program fixture passed five viewport widths and both themes.')

