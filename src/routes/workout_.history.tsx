import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/workout_/history')({ head: () => ({ meta: [{ title: 'Workout history — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/workout/history'); return module ? <ModulePage module={module} /> : null }
