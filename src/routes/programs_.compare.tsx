import { createFileRoute } from '@tanstack/react-router'
import { ProgramComparison } from '../features/programs/pages'
import { validateProgramSearch } from '../features/programs/query'
export const Route=createFileRoute('/programs_/compare')({validateSearch:validateProgramSearch,head:()=>({meta:[{title:'Compare programs | Fitness OS'},{name:'robots',content:'noindex'}]}),component:Page})
function Page(){return <ProgramComparison ids={Route.useSearch().compare} />}
