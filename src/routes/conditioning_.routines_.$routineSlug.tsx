import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {KnowledgePage} from '../features/cardio/info-pages';
export const Route=createFileRoute('/conditioning_/routines_/$routineSlug')({head:()=>cardioMetadata('/conditioning/routines/$routineSlug'),component:Page});
function Page(){return <KnowledgePage kind="routine" slug={Route.useParams().routineSlug}/>;}
