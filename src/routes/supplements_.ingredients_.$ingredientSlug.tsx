import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {LibraryPage} from '../features/supplements/info-pages';
export const Route=createFileRoute('/supplements_/ingredients_/$ingredientSlug')({head:()=>supplementMetadata('/supplements/ingredients/$ingredientSlug'),component:Page});
function Page(){return <LibraryPage kind="ingredients" slug={Route.useParams().ingredientSlug}/>;}
