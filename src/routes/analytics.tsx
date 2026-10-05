import {createFileRoute} from '@tanstack/react-router';
import {metadataFor} from '../lib/route-metadata';
import {ProgressPage} from '../features/progress/workspace';
export const Route=createFileRoute('/analytics')({head:()=>({...metadataFor('/analytics'),meta:[...metadataFor('/analytics').meta,{name:'robots',content:'noindex,nofollow'}],links:[]}),component:Page});
function Page(){return <ProgressPage page="analytics"/>;}
