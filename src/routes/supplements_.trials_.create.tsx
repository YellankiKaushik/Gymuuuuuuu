import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {TrialEditorPage} from '../features/supplements/trial-pages';
export const Route=createFileRoute('/supplements_/trials_/create')({head:()=>supplementMetadata('/supplements/trials/create'),component:Page});
function Page(){return <TrialEditorPage />;}
