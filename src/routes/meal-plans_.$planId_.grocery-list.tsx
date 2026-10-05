import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { GroceryPage } from '../features/recipes-meal-plans/plan-pages';
export const Route = createFileRoute('/meal-plans_/$planId_/grocery-list')({ head: () => ({ meta: [{ title: 'Grocery list | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { const { planId } = Route.useParams(); return <RecipePage title="Grocery list"><GroceryPage planId={planId}/></RecipePage>; }

