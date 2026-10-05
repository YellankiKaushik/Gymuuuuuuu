import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {ProductsPage} from '../features/supplements/product-pages';
export const Route=createFileRoute('/supplements_/products')({head:()=>supplementMetadata('/supplements/products'),component:Page});
function Page(){return <ProductsPage />;}
