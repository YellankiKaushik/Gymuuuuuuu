import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {GuidancePage} from '../features/supplements/info-pages';
export const Route=createFileRoute('/supplements_/privacy')({head:()=>supplementMetadata('/supplements/privacy'),component:Page});
function Page(){return <GuidancePage kind="privacy"/>;}
