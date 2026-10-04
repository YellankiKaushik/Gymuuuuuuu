import { createFileRoute, redirect } from '@tanstack/react-router'
import { ExerciseDetail } from '../features/exercises/detail'
import { exerciseMigrations, getExerciseBySlug } from '../features/exercises/repository'
import { appConfig } from '../config/app'
export const Route = createFileRoute('/exercises_/$slug')({ beforeLoad: ({ params }) => { const replacement = exerciseMigrations[params.slug]; if (replacement && getExerciseBySlug(replacement)?.contentStatus === 'published') throw redirect({ to: '/exercises/$slug', params: { slug: replacement } }) }, head: ({ params }) => { const record = getExerciseBySlug(params.slug); const published = record?.contentStatus === 'published'; return { meta: [{ title: `${record?.displayName ?? 'Exercise not available'} | ${appConfig.name}` }, { name: 'description', content: published ? record.summary ?? '' : 'The requested exercise is unavailable.' }, ...(!published ? [{ name: 'robots', content: 'noindex' }] : [])], links: published ? [{ rel: 'canonical', href: new URL(`/exercises/${record.slug}`, appConfig.origin).href }] : [] } }, component: Page })
function Page() { return <ExerciseDetail slug={Route.useParams().slug} /> }
