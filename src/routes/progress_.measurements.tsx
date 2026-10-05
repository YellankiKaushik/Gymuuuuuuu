import {createFileRoute} from '@tanstack/react-router';
import {metadataFor} from '../lib/route-metadata';
import {ProgressPage} from '../features/progress/workspace';
export const Route=createFileRoute('/progress_/measurements')({head:()=>({...metadataFor('/progress/measurements'),meta:[...metadataFor('/progress/measurements').meta,{name:'robots',content:'noindex,nofollow'}],links:[]}),component:Page});
function Page(){return <ProgressPage page="progress/measurements"/>;}
