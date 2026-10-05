import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {GuidancePage} from '../features/supplements/info-pages';
export const Route=createFileRoute('/supplements_/methodology')({head:()=>supplementMetadata('/supplements/methodology'),component:Page});
function Page(){return <GuidancePage kind="methodology"/>;}
