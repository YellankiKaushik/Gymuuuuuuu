import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { PlanCreate } from '../features/recipes-meal-plans/plan-pages';
export const Route = createFileRoute('/meal-plans_/create')({ head: () => ({ meta: [{ title: 'Create meal plan | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { return <RecipePage title="Create meal plan"><PlanCreate /></RecipePage>; }
