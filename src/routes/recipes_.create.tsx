import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { RecipeBuilder } from '../features/recipes-meal-plans/pages';
export const Route = createFileRoute('/recipes_/create')({ head: () => ({ meta: [{ title: 'Create recipe | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { return <RecipePage title="Create recipe"><RecipeBuilder /></RecipePage>; }
