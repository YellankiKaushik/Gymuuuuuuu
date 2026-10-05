import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { PlanDetail } from '../features/recipes-meal-plans/plan-pages';
export const Route = createFileRoute('/meal-plans_/$planId')({ head: () => ({ meta: [{ title: 'Local meal plan | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { const { planId } = Route.useParams(); return <RecipePage title="Local meal plan"><PlanDetail planId={planId}/></RecipePage>; }
