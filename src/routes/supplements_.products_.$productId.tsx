import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {ProductEditorPage} from '../features/supplements/product-pages';
export const Route=createFileRoute('/supplements_/products_/$productId')({head:()=>supplementMetadata('/supplements/products/$productId'),component:Page});
function Page(){return <ProductEditorPage productId={Route.useParams().productId}/>;}
