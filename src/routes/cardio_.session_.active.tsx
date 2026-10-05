import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {ActiveSessionPage} from '../features/cardio/session-pages';
export const Route=createFileRoute('/cardio_/session_/active')({head:()=>cardioMetadata('/cardio/session/active'),component:Page});
function Page(){return <ActiveSessionPage />;}
