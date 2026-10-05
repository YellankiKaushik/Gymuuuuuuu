import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {EventsPage} from '../features/supplements/event-pages';
export const Route=createFileRoute('/supplements_/adverse-events')({head:()=>supplementMetadata('/supplements/adverse-events'),component:Page});
function Page(){return <EventsPage />;}
