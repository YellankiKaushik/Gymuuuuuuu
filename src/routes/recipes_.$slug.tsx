import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/recipes_/$slug')({ head: () => ({ meta: [{ title: 'Recipe detail — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/recipes/$slug'); return module ? <ModulePage module={module} /> : null }
