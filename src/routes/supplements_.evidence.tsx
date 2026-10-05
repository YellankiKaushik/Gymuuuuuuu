import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {LibraryPage} from '../features/supplements/info-pages';
export const Route=createFileRoute('/supplements_/evidence')({head:()=>supplementMetadata('/supplements/evidence'),component:Page});
function Page(){return <LibraryPage kind="evidence"/>;}
