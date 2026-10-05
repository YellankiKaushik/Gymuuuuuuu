import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {TrialsPage} from '../features/supplements/trial-pages';
export const Route=createFileRoute('/supplements_/trials')({head:()=>supplementMetadata('/supplements/trials'),component:Page});
function Page(){return <TrialsPage />;}
