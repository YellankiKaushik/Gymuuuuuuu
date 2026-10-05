import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {ProductEditorPage} from '../features/supplements/product-pages';
export const Route=createFileRoute('/supplements_/products_/create')({head:()=>supplementMetadata('/supplements/products/create'),component:Page});
function Page(){return <ProductEditorPage />;}
