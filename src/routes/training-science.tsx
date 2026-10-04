import { metadataFor } from '../lib/route-metadata'
import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/training-science')({ head: () => metadataFor('/training-science'), component: Page })
function Page() { const module = modules.find((item) => item.path === '/training-science'); return module ? <ModulePage module={module} /> : null }
