import { createFileRoute } from '@tanstack/react-router'
import { WorkoutSummary } from '../features/workout-tracker/history'
export const Route=createFileRoute('/workout_/summary/$sessionId')({head:()=>({meta:[{title:'Workout | Fitness OS'},{name:'robots',content:'noindex'}]}),component:Page})
function Page(){return <WorkoutSummary id={Route.useParams().sessionId} />}
