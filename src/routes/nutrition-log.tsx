import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/nutrition-log')({ head: () => ({ meta: [{ title: 'Nutrition log — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/nutrition-log'); return module ? <ModulePage module={module} /> : null }
