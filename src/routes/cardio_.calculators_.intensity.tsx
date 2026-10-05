import {createFileRoute} from '@tanstack/react-router';
import {cardioMetadata} from '../features/cardio/metadata';
import {IntensityPage} from '../features/cardio/calculator-pages';
export const Route=createFileRoute('/cardio_/calculators_/intensity')({head:()=>cardioMetadata('/cardio/calculators/intensity'),component:Page});
function Page(){return <IntensityPage />;}
