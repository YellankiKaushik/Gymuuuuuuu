import {createFileRoute} from '@tanstack/react-router';
import {supplementMetadata} from '../features/supplements/metadata';
import {ComparePage} from '../features/supplements/info-pages';
export const Route=createFileRoute('/supplements_/compare')({head:()=>supplementMetadata('/supplements/compare'),component:Page});
function Page(){return <ComparePage />;}
