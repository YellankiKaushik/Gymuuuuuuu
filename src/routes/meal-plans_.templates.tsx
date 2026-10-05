import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { RecipeTemplates } from '../features/recipes-meal-plans/info-pages';
export const Route = createFileRoute('/meal-plans_/templates')({ head: () => ({ meta: [{ title: 'Meal-plan templates | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { return <RecipePage title="Meal-plan templates"><RecipeTemplates /></RecipePage>; }
