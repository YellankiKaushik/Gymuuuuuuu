import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {KnowledgePage} from '../features/cardio/info-pages';
export const Route=createFileRoute('/cardio_/modalities')({head:()=>cardioMetadata('/cardio/modalities'),component:Page});
function Page(){return <KnowledgePage kind="modalities"/>;}
