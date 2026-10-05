import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { PlanCatalogue } from '../features/recipes-meal-plans/plan-pages';
export const Route = createFileRoute('/meal-plans')({ head: () => ({ meta: [{ title: 'Meal plans | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { return <RecipePage title="Meal plans"><PlanCatalogue /></RecipePage>; }
