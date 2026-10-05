import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {NewSessionPage} from '../features/cardio/session-pages';
export const Route=createFileRoute('/cardio_/session_/new')({head:()=>cardioMetadata('/cardio/session/new'),component:Page});
function Page(){return <NewSessionPage />;}
