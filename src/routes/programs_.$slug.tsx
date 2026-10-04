import { createFileRoute } from '@tanstack/react-router'
import { metadataFor } from '../lib/route-metadata'
import { ProgramDetail } from '../features/programs/pages'
import { getProgramBySlug } from '../features/programs/repository'
export const Route = createFileRoute('/programs_/$slug')({ head: ({ params }) => { const program=getProgramBySlug(params.slug);return program?.contentStatus === 'published' ? { meta:[{ title:`${program.displayName} | Fitness OS` },{ name:'description',content:program.summary ?? '' }] } : metadataFor('/programs/$slug') },component:Page })
function Page(){return <ProgramDetail slug={Route.useParams().slug} />}
