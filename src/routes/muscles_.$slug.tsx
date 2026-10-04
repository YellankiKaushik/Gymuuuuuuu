import { createFileRoute } from '@tanstack/react-router'
import { MuscleDetail } from '../features/muscles/detail'
import { getMuscleBySlug } from '../features/muscles/repository'
import { appConfig } from '../config/app'
export const Route = createFileRoute('/muscles_/$slug')({ head: ({ params }) => { const record = getMuscleBySlug(params.slug); return { meta: [{ title: `${record?.displayName ?? 'Muscle not available'} | ${appConfig.name}` }, { name: 'description', content: record?.summary ?? 'The requested anatomy record is unavailable.' }, ...(!record ? [{ name: 'robots', content: 'noindex' }] : [])], links: record ? [{ rel: 'canonical', href: new URL(`/muscles/${record.slug}`, appConfig.origin).href }] : [] } }, component: Page })
function Page() { return <MuscleDetail slug={Route.useParams().slug} /> }
