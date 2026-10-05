import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { RecipePublicEmpty } from '../features/recipes-meal-plans/info-pages';
export const Route = createFileRoute('/recipes_/$slug')({ head: () => ({ meta: [{ title: 'Recipe detail | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { return <RecipePage title="Recipe detail"><RecipePublicEmpty /></RecipePage>; }
