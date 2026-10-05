import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {LibraryPage} from '../features/supplements/info-pages';
export const Route=createFileRoute('/supplements_/evidence_/$claimSlug')({head:()=>supplementMetadata('/supplements/evidence/$claimSlug'),component:Page});
function Page(){return <LibraryPage kind="evidence" slug={Route.useParams().claimSlug}/>;}
