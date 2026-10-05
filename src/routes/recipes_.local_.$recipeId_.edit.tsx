import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { RecipeBuilder } from '../features/recipes-meal-plans/pages';
export const Route = createFileRoute('/recipes_/local_/$recipeId_/edit')({ head: () => ({ meta: [{ title: 'Edit local recipe | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { const { recipeId } = Route.useParams(); return <RecipePage title="Edit local recipe"><RecipeBuilder recipeId={recipeId}/></RecipePage>; }

