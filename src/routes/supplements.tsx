import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {HomePage} from '../features/supplements/info-pages';
export const Route=createFileRoute('/supplements')({head:()=>supplementMetadata('/supplements'),component:Page});
function Page(){return <HomePage />;}
