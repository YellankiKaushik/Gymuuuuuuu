import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {BuilderPage} from '../features/cardio/builders';
export const Route=createFileRoute('/conditioning_/custom')({head:()=>cardioMetadata('/conditioning/custom'),component:Page});
function Page(){return <BuilderPage kind="routine"/>;}
