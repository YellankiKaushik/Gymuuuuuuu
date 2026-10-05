import { metadataFor } from '../lib/route-metadata'
import { createFileRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'
export const Route = createFileRoute('/saved')({ head: () => ({ ...metadataFor('/saved'), meta: [...metadataFor('/saved').meta, { name: 'robots', content: 'noindex,follow' }], links: [] }), component: () => <Outlet /> })
