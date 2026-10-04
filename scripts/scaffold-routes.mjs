import { existsSync, writeFileSync } from 'node:fs'
import { modules } from '../src/data/navigation.ts'
for (const module of modules) {
  const segments = module.path.slice(1).split('/')
  if (segments.length > 1 && modules.some((entry) => entry.path === `/${segments[0]}`)) segments[0] += '_'
  const routeId = `/${segments.join('/')}`
  const filename = `src/routes/${segments.join('.')}.tsx`
  if (existsSync(filename)) continue
  const special = module.path === '/settings' ? ['SettingsPage', '../features/settings/page'] : module.path === '/about/sources' ? ['SourcesPage', '../features/sources/page'] : null
  const source = special
    ? `import { createFileRoute } from '@tanstack/react-router'\nimport { ${special[0]} } from '${special[1]}'\nexport const Route = createFileRoute('${routeId}')({ head: () => ({ meta: [{ title: '${module.title} — Fitness OS' }] }), component: ${special[0]} })\n`
    : `import { createFileRoute } from '@tanstack/react-router'\nimport { ModulePage } from '../components/module-page'\nimport { modules } from '../data/navigation'\nexport const Route = createFileRoute('${routeId}')({ head: () => ({ meta: [{ title: '${module.title} — Fitness OS' }] }), component: Page })\nfunction Page() { const module = modules.find((item) => item.path === '${module.path}'); return module ? <ModulePage module={module} /> : null }\n`
  writeFileSync(filename, source)
}
