import { createFileRoute } from '@tanstack/react-router'
import { WorkoutSettings } from '../features/workout-tracker/settings'
export const Route=createFileRoute('/workout_/settings')({head:()=>({meta:[{title:'Workout settings | Fitness OS'},{name:'robots',content:'noindex'}]}),component:WorkoutSettings})
