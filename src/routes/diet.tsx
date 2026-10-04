import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/diet')({ head: () => ({ meta: [{ title: 'Diet planning — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/diet'); return module ? <ModulePage module={module} /> : null }
