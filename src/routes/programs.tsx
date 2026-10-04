import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { metadataFor } from '../lib/route-metadata'
import { ProgramCatalogue } from '../features/programs/pages'
import { parseProgramQuery, programQueryParams, validateProgramSearch } from '../features/programs/query'
export const Route = createFileRoute('/programs')({ validateSearch: validateProgramSearch, search: { middlewares: [stripSearchParams(parseProgramQuery({}))] }, head: () => metadataFor('/programs'), component: Page })
function Page() { const query=Route.useSearch(),navigate=Route.useNavigate();return <ProgramCatalogue query={query} change={(next) => { void navigate({ search:programQueryParams(next) }) }} /> }
