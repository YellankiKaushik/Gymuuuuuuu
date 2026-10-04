import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/recovery')({ head: () => ({ meta: [{ title: 'Recovery & sleep — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/recovery'); return module ? <ModulePage module={module} /> : null }
