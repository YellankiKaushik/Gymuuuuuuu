import {createFileRoute} from '@tanstack/react-router';
import {metadataFor} from '../lib/route-metadata';
import {ProgressPage} from '../features/progress/workspace';
export const Route=createFileRoute('/dashboard')({head:()=>({...metadataFor('/dashboard'),meta:[...metadataFor('/dashboard').meta,{name:'robots',content:'noindex,nofollow'}],links:[]}),component:Page});
function Page(){return <ProgressPage page="dashboard"/>;}
