import { createFileRoute } from '@tanstack/react-router'
import { CurrentProgram } from '../features/programs/pages'
export const Route=createFileRoute('/programs_/current')({head:()=>({meta:[{title:'My program | Fitness OS'},{name:'robots',content:'noindex'}]}),component:CurrentProgram})
