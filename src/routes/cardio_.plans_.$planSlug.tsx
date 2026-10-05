import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {KnowledgePage} from '../features/cardio/info-pages';
export const Route=createFileRoute('/cardio_/plans_/$planSlug')({head:()=>cardioMetadata('/cardio/plans/$planSlug'),component:Page});
function Page(){return <KnowledgePage kind="plans" slug={Route.useParams().planSlug}/>;}
