import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { RecipeSettings } from '../features/recipes-meal-plans/info-pages';
export const Route = createFileRoute('/meal-plans_/settings')({ head: () => ({ meta: [{ title: 'Meal-plan settings & backup | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { return <RecipePage title="Meal-plan settings & backup"><RecipeSettings /></RecipePage>; }
