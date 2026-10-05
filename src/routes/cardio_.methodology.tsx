import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {MethodologyPage} from '../features/cardio/info-pages';
export const Route=createFileRoute('/cardio_/methodology')({head:()=>cardioMetadata('/cardio/methodology'),component:Page});
function Page(){return <MethodologyPage />;}
