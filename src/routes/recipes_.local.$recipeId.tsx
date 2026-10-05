import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { RecipeDetail } from '../features/recipes-meal-plans/pages';
export const Route = createFileRoute('/recipes_/local/$recipeId')({ head: () => ({ meta: [{ title: 'Local recipe | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { const { recipeId } = Route.useParams(); return <RecipePage title="Local recipe"><RecipeDetail recipeId={recipeId}/></RecipePage>; }
