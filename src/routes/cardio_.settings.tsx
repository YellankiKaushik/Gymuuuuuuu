import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {SettingsPage} from '../features/cardio/info-pages';
export const Route=createFileRoute('/cardio_/settings')({head:()=>cardioMetadata('/cardio/settings'),component:Page});
function Page(){return <SettingsPage />;}
