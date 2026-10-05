import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {LibraryPage} from '../features/supplements/info-pages';
export const Route=createFileRoute('/supplements_/ingredients')({head:()=>supplementMetadata('/supplements/ingredients'),component:Page});
function Page(){return <LibraryPage kind="ingredients"/>;}
