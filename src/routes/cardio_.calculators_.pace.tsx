import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {PacePage} from '../features/cardio/calculator-pages';
export const Route=createFileRoute('/cardio_/calculators_/pace')({head:()=>cardioMetadata('/cardio/calculators/pace'),component:Page});
function Page(){return <PacePage />;}
