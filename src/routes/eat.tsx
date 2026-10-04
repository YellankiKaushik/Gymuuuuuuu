import { metadataFor } from '../lib/route-metadata'
import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/eat')({ head: () => metadataFor('/eat'), component: Page })
function Page() { const module = modules.find((item) => item.path === '/eat'); return module ? <ModulePage module={module} /> : null }
