import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/recipes')({ head: () => ({ meta: [{ title: 'Meals & recipes — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/recipes'); return module ? <ModulePage module={module} /> : null }
