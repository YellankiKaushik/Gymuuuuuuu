import {createFileRoute} from '@tanstack/react-router';
import {metadataFor} from '../lib/route-metadata';
import {ProgressPage} from '../features/progress/workspace';
export const Route=createFileRoute('/analytics_/workouts')({head:()=>({...metadataFor('/analytics/workouts'),meta:[...metadataFor('/analytics/workouts').meta,{name:'robots',content:'noindex,nofollow'}],links:[]}),component:Page});
function Page(){return <ProgressPage page="analytics/workouts"/>;}
