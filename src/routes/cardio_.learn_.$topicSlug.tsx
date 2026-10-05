import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {KnowledgePage} from '../features/cardio/info-pages';
export const Route=createFileRoute('/cardio_/learn_/$topicSlug')({head:()=>cardioMetadata('/cardio/learn/$topicSlug'),component:Page});
function Page(){return <KnowledgePage kind="learn" slug={Route.useParams().topicSlug}/>;}
