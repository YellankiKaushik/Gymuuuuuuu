import { createFileRoute } from '@tanstack/react-router'
import { WorkoutEditor } from '../features/workout-tracker/editor'
export const Route=createFileRoute('/workout_/session/$sessionId')({head:()=>({meta:[{title:'Workout | Fitness OS'},{name:'robots',content:'noindex'}]}),component:Page})
function Page(){return <WorkoutEditor id={Route.useParams().sessionId} />}
