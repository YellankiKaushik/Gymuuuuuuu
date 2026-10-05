import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {PrivacyPage} from '../features/cardio/info-pages';
export const Route=createFileRoute('/cardio_/privacy')({head:()=>cardioMetadata('/cardio/privacy'),component:Page});
function Page(){return <PrivacyPage />;}
