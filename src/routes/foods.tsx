import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/foods')({ head: () => ({ meta: [{ title: 'Food encyclopedia — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/foods'); return module ? <ModulePage module={module} /> : null }
