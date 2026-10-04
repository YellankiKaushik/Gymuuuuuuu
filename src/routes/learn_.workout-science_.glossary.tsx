import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { metadataFor } from '../lib/route-metadata'
import { ScienceGlossary } from '../features/workout-science/glossary'
import { parseScienceQuery, scienceQueryParams, validateScienceSearch } from '../features/workout-science/query'
export const Route = createFileRoute('/learn_/workout-science_/glossary')({ validateSearch: validateScienceSearch, search: { middlewares: [stripSearchParams(parseScienceQuery({}))] }, head: () => metadataFor('/learn/workout-science/glossary'), component: Page })
function Page() { const query = Route.useSearch(), navigate = Route.useNavigate(); return <ScienceGlossary query={query} onChange={(next) => { void navigate({ search: scienceQueryParams(next) }) }} /> }
