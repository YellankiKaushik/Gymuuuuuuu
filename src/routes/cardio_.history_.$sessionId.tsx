import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {SessionDetailPage} from '../features/cardio/session-pages';
export const Route=createFileRoute('/cardio_/history_/$sessionId')({head:()=>cardioMetadata('/cardio/history/$sessionId'),component:Page});
function Page(){return <SessionDetailPage sessionId={Route.useParams().sessionId}/>;}
