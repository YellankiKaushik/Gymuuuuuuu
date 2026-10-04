// Offline source pinning helper. No runtime network access or automatic matching.
import process from 'node:process'
import console from 'node:console'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
const [input,sourceId,release,license]=process.argv.slice(2)
const allowed=['usda_fdc_foundation_2026_04','usda_fdc_fndds_2021_2023','usda_fdc_sr_legacy_2018']
if(!input||!allowed.includes(sourceId)||!release||!license)throw Error('Usage: node scripts/prepare-food-source.mjs local-download.json allowed-source-id release license-note')
const bytes=readFileSync(resolve(input)),data=JSON.parse(bytes.toString('utf8'))
if(!data || typeof data!=='object')throw Error('Expected official JSON dataset')
const sha256=createHash('sha256').update(bytes).digest('hex')
mkdirSync('data-imports/foods',{recursive:true})
writeFileSync(`data-imports/foods/${sha256}.manifest.json`,JSON.stringify({schemaVersion:1,sourceId,release,license,sha256,bytes:bytes.length,downloadedFile:resolve(input),transformVersion:'1.0.0',reviewStatus:'unreviewed',notice:'Manual identity matching, unit normalization, numeric review and editorial signoff required before publication.'},null,2)+'\n')
console.log(`Pinned local source ${sha256}; no public records changed.`)
