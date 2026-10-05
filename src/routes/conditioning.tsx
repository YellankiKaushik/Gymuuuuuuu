import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {ConditioningPage} from '../features/cardio/info-pages';
export const Route=createFileRoute('/conditioning')({head:()=>cardioMetadata('/conditioning'),component:Page});
function Page(){return <ConditioningPage />;}
