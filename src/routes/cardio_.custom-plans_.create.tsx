import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {BuilderPage} from '../features/cardio/builders';
export const Route=createFileRoute('/cardio_/custom-plans_/create')({head:()=>cardioMetadata('/cardio/custom-plans/create'),component:Page});
function Page(){return <BuilderPage kind="plan"/>;}
