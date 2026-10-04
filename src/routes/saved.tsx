import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/saved')({ head: () => ({ meta: [{ title: 'Saved items — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/saved'); return module ? <ModulePage module={module} /> : null }
