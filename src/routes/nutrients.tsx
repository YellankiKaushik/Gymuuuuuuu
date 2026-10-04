import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/nutrients')({ head: () => ({ meta: [{ title: 'Nutrient encyclopedia — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/nutrients'); return module ? <ModulePage module={module} /> : null }
