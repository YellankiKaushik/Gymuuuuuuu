import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/tools')({ head: () => ({ meta: [{ title: 'Tools — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/tools'); return module ? <ModulePage module={module} /> : null }
