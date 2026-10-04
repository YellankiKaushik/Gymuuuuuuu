import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/muscles')({ head: () => ({ meta: [{ title: 'Muscle library — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/muscles'); return module ? <ModulePage module={module} /> : null }
