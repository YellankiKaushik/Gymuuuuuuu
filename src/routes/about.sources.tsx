import { createFileRoute } from '@tanstack/react-router'
import { SourcesPage } from '../features/sources/page'
export const Route = createFileRoute('/about/sources')({ head: () => ({ meta: [{ title: 'Sources & methodology — Fitness OS' }] }), component: SourcesPage })
