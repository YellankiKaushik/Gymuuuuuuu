import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {HistoryPage} from '../features/cardio/pages';
export const Route=createFileRoute('/cardio_/history')({head:()=>cardioMetadata('/cardio/history'),component:Page});
function Page(){return <HistoryPage />;}
