import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {HomePage} from '../features/cardio/pages';
export const Route=createFileRoute('/cardio')({head:()=>cardioMetadata('/cardio'),component:Page});
function Page(){return <HomePage />;}
