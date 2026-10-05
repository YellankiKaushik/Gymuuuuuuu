import {createFileRoute} from '@tanstack/react-router';
import {metadataFor} from '../lib/route-metadata';
import {ProgressPage} from '../features/progress/workspace';
export const Route=createFileRoute('/analytics_/methodology')({head:()=>({...metadataFor('/analytics/methodology'),meta:[...metadataFor('/analytics/methodology').meta,{name:'robots',content:'noindex,nofollow'}],links:[]}),component:Page});
function Page(){return <ProgressPage page="analytics/methodology"/>;}
