import { createFileRoute } from '@tanstack/react-router';
import { RecipePage } from '../features/recipes-meal-plans/pages';
import { RecipeCatalogue } from '../features/recipes-meal-plans/pages';
export const Route = createFileRoute('/recipes')({ head: () => ({ meta: [{ title: 'Meals & recipes | Fitness OS' }, { name: 'robots', content: 'noindex' }] }), component: Page });
function Page() { return <RecipePage title="Meals & recipes"><RecipeCatalogue /></RecipePage>; }
