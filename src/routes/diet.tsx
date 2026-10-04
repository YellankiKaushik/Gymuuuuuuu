import { metadataFor } from '../lib/route-metadata'
import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/diet')({ head: () => metadataFor('/diet'), component: Page })
function Page() { const module = modules.find((item) => item.path === '/diet'); return module ? <ModulePage module={module} /> : null }
