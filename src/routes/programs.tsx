import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/programs')({ head: () => ({ meta: [{ title: 'Workout programs — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/programs'); return module ? <ModulePage module={module} /> : null }
