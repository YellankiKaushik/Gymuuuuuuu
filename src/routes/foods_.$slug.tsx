import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/foods_/$slug')({ head: () => ({ meta: [{ title: 'Food detail — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/foods/$slug'); return module ? <ModulePage module={module} /> : null }
