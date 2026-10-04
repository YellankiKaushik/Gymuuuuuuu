import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/learn')({ head: () => ({ meta: [{ title: 'Learn — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/learn'); return module ? <ModulePage module={module} /> : null }
