import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {MyPlansPage} from '../features/cardio/builders';
export const Route=createFileRoute('/cardio_/custom-plans')({head:()=>cardioMetadata('/cardio/custom-plans'),component:Page});
function Page(){return <MyPlansPage kind="plan"/>;}
