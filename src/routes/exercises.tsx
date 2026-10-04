import { metadataFor } from '../lib/route-metadata'
import { createFileRoute } from '@tanstack/react-router'
import { ExerciseCatalogue } from '../features/exercises/catalogue'
import { parseExerciseQuery } from '../features/exercises/query'
export const Route = createFileRoute('/exercises')({ head: () => metadataFor('/exercises'), validateSearch: parseExerciseQuery, component: Page })
function Page() { const query = Route.useSearch(); const navigate = Route.useNavigate(); return <ExerciseCatalogue query={query} onChange={(next) => { void navigate({ search: next, replace: true }) }} /> }
