import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {TrialEditorPage} from '../features/supplements/trial-pages';
export const Route=createFileRoute('/supplements_/trials_/$trialId')({head:()=>supplementMetadata('/supplements/trials/$trialId'),component:Page});
function Page(){return <TrialEditorPage trialId={Route.useParams().trialId}/>;}
