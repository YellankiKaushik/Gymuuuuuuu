import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/programs_/$slug')({ head: () => ({ meta: [{ title: 'Program detail — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/programs/$slug'); return module ? <ModulePage module={module} /> : null }
