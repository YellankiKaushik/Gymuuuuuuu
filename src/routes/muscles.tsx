import { metadataFor } from '../lib/route-metadata'
import { createFileRoute } from '@tanstack/react-router'
import { MuscleCatalogue } from '../features/muscles/catalogue'
import { parseMuscleQuery } from '../features/muscles/query'
export const Route = createFileRoute('/muscles')({ head: () => metadataFor('/muscles'), validateSearch: parseMuscleQuery, component: Page })
function Page() { const query = Route.useSearch(); const navigate = Route.useNavigate(); return <MuscleCatalogue query={query} onChange={(next) => { void navigate({ search: next }) }} /> }
