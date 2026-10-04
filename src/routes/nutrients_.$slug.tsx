import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/nutrients_/$slug')({ head: () => ({ meta: [{ title: 'Nutrient detail — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/nutrients/$slug'); return module ? <ModulePage module={module} /> : null }
