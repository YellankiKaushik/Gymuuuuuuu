import { createFileRoute } from '@tanstack/react-router'
import { WorkoutStart } from '../features/workout-tracker/start'
export const Route=createFileRoute('/workout')({head:()=>({meta:[{title:'Workout workspace | Fitness OS'},{name:'robots',content:'noindex'}]}),component:WorkoutStart})
