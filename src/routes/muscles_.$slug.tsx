import { metadataFor } from '../lib/route-metadata'
import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/muscles_/$slug')({ head: () => metadataFor('/muscles/$slug'), component: Page })
function Page() { const module = modules.find((item) => item.path === '/muscles/$slug'); return module ? <ModulePage module={module} /> : null }
