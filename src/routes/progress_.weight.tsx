import {createFileRoute} from '@tanstack/react-router';
import {metadataFor} from '../lib/route-metadata';
import {ProgressPage} from '../features/progress/workspace';
export const Route=createFileRoute('/progress_/weight')({head:()=>({...metadataFor('/progress/weight'),meta:[...metadataFor('/progress/weight').meta,{name:'robots',content:'noindex,nofollow'}],links:[]}),component:Page});
function Page(){return <ProgressPage page="progress/weight"/>;}
