import { metadataFor } from '../lib/route-metadata'
import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/progress')({ head: () => metadataFor('/progress'), component: Page })
function Page() { const module = modules.find((item) => item.path === '/progress'); return module ? <ModulePage module={module} /> : null }
