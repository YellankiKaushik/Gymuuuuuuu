import { readFileSync, writeFileSync } from 'node:fs'
import { modules } from '../src/data/navigation.ts'
for (const module of modules) {
  const segments = module.path.slice(1).split('/')
  if (segments.length > 1 && modules.some((entry) => entry.path === `/${segments[0]}`)) segments[0] += '_'
  const filename = `src/routes/${segments.join('.')}.tsx`
  let source = readFileSync(filename, 'utf8')
  source = `import { metadataFor } from '../lib/route-metadata'\n${source}`
  source = source.replace(/head: \(\) => \(\{ meta: \[\{ title: '[^']*' \}\] \}\)/, `head: () => metadataFor('${module.path}')`)
  writeFileSync(filename, source)
}
const homePath = 'src/components/home.tsx'
let home = readFileSync(homePath, 'utf8')
home = `import { appConfig } from '../config/app'\nimport { LinkCard } from './common/primitives'\nimport { navigationItems } from '../data/navigation'\n${home}`
home = home.replace("href: '/train'", "href: '/programs'").replace("href: '/eat'", "href: '/foods'")
home = home.replace('Phase 00 · Foundation', 'Local-first foundation').replace('PHASE 00 · CURRENT', 'FOUNDATION · IN PLACE').replace('PHASE 01 · NEXT', 'INTERFACE · NEXT').replace('PHASE 02 ONWARD', 'LIBRARIES & TOOLS').replace('This is the Phase 00 foundation. Feature pages are intentional placeholders while the application takes shape.', 'Verified content and practical tools will be added as the application grows. Every factual record will show sources and review information.')
home = home.replace('href="/track"', 'href="/progress"').replace('Progress on your terms', 'Progress on your terms')
home = home.replace('<div className="page-heading"><div><div className="eyebrow">A STRONGER FOUNDATION</div>', '<div className="page-heading"><div><div className="eyebrow">{appConfig.name.toUpperCase()} / A STRONGER FOUNDATION</div>')
home = home.replace('</div>\n  </div>\n}', '</div>\n    <section className="explore-section"><div className="section-heading"><div><h2>Explore by module</h2><p>Training, nutrition, recovery and optional tracking, connected in one place.</p></div></div><div className="module-directory">{["/muscles", "/exercises", "/programs", "/foods", "/nutrients", "/recovery", "/tools"].map((href) => { const entry = navigationItems.find((item) => item.href === href); return entry && <LinkCard key={href} title={entry.label} href={href} icon={entry.icon} /> })}</div></section>\n  </div>\n}')
writeFileSync(homePath, home)
