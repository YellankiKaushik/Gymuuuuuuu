import { createFileRoute } from '@tanstack/react-router'
import { WorkoutHistory } from '../features/workout-tracker/history'
export const Route=createFileRoute('/workout_/history')({head:()=>({meta:[{title:'Workout history | Fitness OS'},{name:'robots',content:'noindex'}]}),component:WorkoutHistory})
