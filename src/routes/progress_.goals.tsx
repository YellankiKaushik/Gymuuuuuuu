import {createFileRoute} from '@tanstack/react-router';
import {metadataFor} from '../lib/route-metadata';
import {ProgressPage} from '../features/progress/workspace';
export const Route=createFileRoute('/progress_/goals')({head:()=>({...metadataFor('/progress/goals'),meta:[...metadataFor('/progress/goals').meta,{name:'robots',content:'noindex,nofollow'}],links:[]}),component:Page});
function Page(){return <ProgressPage page="progress/goals"/>;}
