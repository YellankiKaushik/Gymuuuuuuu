import { createFileRoute } from '@tanstack/react-router'
import { ModulePage } from '../components/module-page'
import { modules } from '../data/navigation'
export const Route = createFileRoute('/training-science')({ head: () => ({ meta: [{ title: 'Training science — Fitness OS' }] }), component: Page })
function Page() { const module = modules.find((item) => item.path === '/training-science'); return module ? <ModulePage module={module} /> : null }
