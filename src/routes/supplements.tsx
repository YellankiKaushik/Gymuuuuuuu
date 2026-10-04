import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/supplements')({ head: () => ({ meta: [{ title: 'Supplement evidence — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/supplements'); return module ? <ModulePage module={module} /> : null }
