import {createFileRoute} from '@tanstack/react-router';
import {metadataFor} from '../lib/route-metadata';
import {ProgressPage} from '../features/progress/workspace';
export const Route=createFileRoute('/analytics_/data-quality')({head:()=>({...metadataFor('/analytics/data-quality'),meta:[...metadataFor('/analytics/data-quality').meta,{name:'robots',content:'noindex,nofollow'}],links:[]}),component:Page});
function Page(){return <ProgressPage page="analytics/data-quality"/>;}
