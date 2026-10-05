import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { RecipeMethodology } from '../features/recipes-meal-plans/info-pages';
export const Route = createFileRoute('/recipes_/methodology')({ head: () => ({ meta: [{ title: 'Recipe methodology | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { return <RecipePage title="Recipe methodology"><RecipeMethodology /></RecipePage>; }
