import {createFileRoute} from '@tanstack/react-router';
import {metadataFor} from '../lib/route-metadata';
import {ProgressPage} from '../features/progress/workspace';
export const Route=createFileRoute('/progress_/body-composition')({head:()=>({...metadataFor('/progress/body-composition'),meta:[...metadataFor('/progress/body-composition').meta,{name:'robots',content:'noindex,nofollow'}],links:[]}),component:Page});
function Page(){return <ProgressPage page="progress/body-composition"/>;}
