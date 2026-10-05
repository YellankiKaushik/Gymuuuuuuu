import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {ProgressPage} from '../features/cardio/pages';
export const Route=createFileRoute('/cardio_/progress')({head:()=>cardioMetadata('/cardio/progress'),component:Page});
function Page(){return <ProgressPage />;}
