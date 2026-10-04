import { metadataFor } from '../lib/route-metadata'
import { createFileRoute } from '@tanstack/react-router'
import { SourcesPage } from '../features/sources/page'
export const Route = createFileRoute('/about/sources')({ head: () => metadataFor('/about/sources'), component: SourcesPage })
