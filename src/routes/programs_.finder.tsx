import { createFileRoute } from '@tanstack/react-router'
import { ProgramFinder } from '../features/programs/pages'
export const Route=createFileRoute('/programs_/finder')({head:()=>({meta:[{title:'Program finder | Fitness OS'},{name:'robots',content:'noindex'}]}),component:ProgramFinder})
