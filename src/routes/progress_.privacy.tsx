import {createFileRoute} from '@tanstack/react-router';
import {metadataFor} from '../lib/route-metadata';
import {ProgressPage} from '../features/progress/workspace';
export const Route=createFileRoute('/progress_/privacy')({head:()=>({...metadataFor('/progress/privacy'),meta:[...metadataFor('/progress/privacy').meta,{name:'robots',content:'noindex,nofollow'}],links:[]}),component:Page});
function Page(){return <ProgressPage page="progress/privacy"/>;}
