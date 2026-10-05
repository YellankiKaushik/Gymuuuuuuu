import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {SettingsPage} from '../features/supplements/info-pages';
export const Route=createFileRoute('/supplements_/settings')({head:()=>supplementMetadata('/supplements/settings'),component:Page});
function Page(){return <SettingsPage />;}
