import { metadataFor } from '../lib/route-metadata'
import { createFileRoute } from '@tanstack/react-router'
import { LearnHub } from '../features/workout-science/learn-hub'
export const Route = createFileRoute('/learn')({ head: () => metadataFor('/learn'), component: Page })
function Page() { return <LearnHub /> }
