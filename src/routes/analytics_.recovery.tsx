import {createFileRoute} from '@tanstack/react-router';
import {metadataFor} from '../lib/route-metadata';
import {ProgressPage} from '../features/progress/workspace';
export const Route=createFileRoute('/analytics_/recovery')({head:()=>({...metadataFor('/analytics/recovery'),meta:[...metadataFor('/analytics/recovery').meta,{name:'robots',content:'noindex,nofollow'}],links:[]}),component:Page});
function Page(){return <ProgressPage page="analytics/recovery"/>;}
