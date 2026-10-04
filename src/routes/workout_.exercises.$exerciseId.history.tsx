import { createFileRoute } from '@tanstack/react-router'
import { WorkoutHistory } from '../features/workout-tracker/history'
export const Route=createFileRoute('/workout_/exercises/$exerciseId/history')({head:()=>({meta:[{title:'Workout | Fitness OS'},{name:'robots',content:'noindex'}]}),component:Page})
function Page(){return <WorkoutHistory exerciseId={Route.useParams().exerciseId} />}
