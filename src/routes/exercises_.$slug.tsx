import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/exercises_/$slug')({ head: () => ({ meta: [{ title: 'Exercise detail — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/exercises/$slug'); return module ? <ModulePage module={module} /> : null }
