import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { MealPlanPrivacy } from '../features/recipes-meal-plans/info-pages';
export const Route = createFileRoute('/meal-plans_/privacy')({ head: () => ({ meta: [{ title: 'Meal-plan privacy | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { return <RecipePage title="Meal-plan privacy"><MealPlanPrivacy /></RecipePage>; }
