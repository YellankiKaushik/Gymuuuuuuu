import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { metadataFor } from '../lib/route-metadata'
import { ScienceCatalogue } from '../features/workout-science/catalogue'
import { parseScienceQuery, scienceQueryParams, validateScienceSearch } from '../features/workout-science/query'
export const Route = createFileRoute('/learn_/workout-science_/methods')({ validateSearch: validateScienceSearch, search: { middlewares: [stripSearchParams(parseScienceQuery({}))] }, head: () => metadataFor('/learn/workout-science/methods'), component: Page })
function Page() { const query = Route.useSearch(), navigate = Route.useNavigate(); return <ScienceCatalogue methods query={query} onChange={(next) => { void navigate({ search: scienceQueryParams(next) }) }} /> }
