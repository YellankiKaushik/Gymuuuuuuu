export type Domain = 'Learn' | 'Train' | 'Eat' | 'Recover' | 'Track' | 'Tools' | 'Saved' | 'System'
export interface ModuleDefinition { path: string; title: string; domain: Domain; phase: number; description: string }
export const modules: readonly ModuleDefinition[] = [
{path:"/search",title:"Search Fitness OS",domain:'Tools',phase:16,description:'Search the verified local index of published Fitness OS content.'},
{path:"/search/settings",title:"Search settings",domain:'System',phase:16,description:'Control optional private indexing, saved history, exports and device-local search data.'},
{path:"/saved/favourites",title:"Favourites",domain:'Saved',phase:16,description:'Return to stable references saved on this device.'},
{path:"/saved/collections",title:"Saved collections",domain:'Saved',phase:16,description:'Organize stable references into browser-local collections.'},
{path:"/saved/collections/$collectionId",title:"Saved collection",domain:'Saved',phase:16,description:'Review and organize a browser-local collection.'},
{path:"/recent",title:"Recent activity",domain:'Saved',phase:16,description:'Review and clear optional local search and viewing history.'},
{path:"/compare",title:"Saved comparisons",domain:'Saved',phase:16,description:'Compare two to four compatible items without selecting a winner.'},
{path:"/compare/$family",title:"Compare one item family",domain:'Saved',phase:16,description:'Compare two to four references in the same evidence family.'},
{path:"/dashboard",title:"Body progress dashboard",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/progress/weight",title:"Body weight",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/progress/measurements",title:"Circumference measurements",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/progress/body-composition",title:"External body composition reports",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/progress/photos",title:"Private progress photos",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/progress/goals",title:"Progress goals",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/analytics",title:"Analytics",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/analytics/workouts",title:"Workout analytics",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/analytics/strength",title:"Strength analytics",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/analytics/nutrition",title:"Nutrition analytics",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/analytics/recovery",title:"Recovery analytics",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/analytics/cardio",title:"Cardio analytics",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/analytics/data-quality",title:"Data quality",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/analytics/methodology",title:"Metric methodology",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/progress/settings",title:"Progress backup & settings",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/progress/privacy",title:"Progress privacy",domain:'Track',phase:15,description:'Optional browser-local body progress records and source-labelled analytics.'},
{path:"/supplements/ingredients",title:"Ingredient library",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/ingredients/$ingredientSlug",title:"Reviewed supplement ingredient",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/compare",title:"Compare supplement evidence",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/evidence",title:"Claim-level evidence",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/evidence/$claimSlug",title:"Reviewed supplement claim",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/safety",title:"Supplement safety",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/quality",title:"Supplement quality",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/anti-doping",title:"Supplement anti-doping",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/frameworks",title:"Supplement frameworks",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/methodology",title:"Supplement methodology",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/privacy",title:"Supplement privacy",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/products",title:"My products & intake",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/products/create",title:"Capture product label",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/products/$productId",title:"Product label versions",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/trials",title:"Personal supplement trials",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/trials/create",title:"Create personal trial",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/trials/$trialId",title:"Personal trial record",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/adverse-events",title:"Suspected adverse events",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
{path:"/supplements/settings",title:"Supplement backup & settings",domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},
  {path:"/cardio/learn",title:"Cardio learning library",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/learn/$topicSlug",title:"Reviewed cardio topic",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/modalities",title:"Reviewed activity guidance",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/modalities/$modalitySlug",title:"Reviewed modality",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/plans",title:"Reviewed cardio plan finder",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/plans/$planSlug",title:"Reviewed cardio plan",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/custom-plans",title:"My cardio plans",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/custom-plans/create",title:"Build my cardio plan",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/conditioning",title:"Conditioning routines",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/conditioning/routines/$routineSlug",title:"Reviewed conditioning routine",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/conditioning/custom",title:"Build my conditioning routine",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/session/new",title:"Start or record cardio",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/session/active",title:"Active cardio session",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/history",title:"Cardio history",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/history/$sessionId",title:"Cardio session record",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/progress",title:"Cardio observations over time",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/calculators/pace",title:"Pace & speed calculator",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/calculators/intensity",title:"Intensity methods",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/methodology",title:"Cardio methodology",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/settings",title:"Cardio settings & backup",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  {path:"/cardio/privacy",title:"Cardio local data & privacy",domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},
  { path: '/recovery/check-in', title: 'Daily recovery check-in', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/recovery/history', title: 'Recovery history', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/recovery/topics', title: 'Recovery topics', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/recovery/topics/$topicSlug', title: 'Recovery topic', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/sleep', title: 'Sleep', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/sleep/log', title: 'Sleep diary', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/sleep/history', title: 'Sleep history', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/sleep/methodology', title: 'Sleep methodology', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/mobility/routines/$routineSlug', title: 'Reviewed mobility routine', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/mobility/session/$routineId', title: 'Routine session', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/mobility/history', title: 'Mobility history', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/mobility/custom', title: 'My mobility routines', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/mobility/custom/create', title: 'Build a local routine', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/warm-ups', title: 'Warm-ups', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/warm-ups/$routineSlug', title: 'Reviewed warm-up', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/recovery/settings', title: 'Recovery backup and settings', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/recovery/privacy', title: 'Recovery privacy', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },
  { path: '/learn', title: 'Learn', domain: 'Learn', phase: 1, description: 'A connected home for fitness and nutrition knowledge.' },
  { path: '/muscles', title: 'Muscle library', domain: 'Learn', phase: 2, description: 'Explore muscle groups, anatomy and their relationship to movement.' },
  { path: '/muscles/$slug', title: 'Muscle detail', domain: 'Learn', phase: 2, description: 'Anatomy, function, related exercises and reviewed sources.' },
  { path: '/exercises', title: 'Exercise library', domain: 'Learn', phase: 3, description: 'Discover exercises by muscle, equipment and movement pattern.' },
  { path: '/exercises/$slug', title: 'Exercise detail', domain: 'Learn', phase: 3, description: 'Setup, execution, cues, variations and reviewed demonstration links.' },
  { path: '/training-science', title: 'Training science', domain: 'Learn', phase: 4, description: 'Understand the principles behind training and programming.' },
  { path: '/learn/workout-science', title: 'Workout science', domain: 'Learn', phase: 4, description: 'Explore training principles, evidence, learning paths and limitations.' },
  { path: '/learn/workout-science/$slug', title: 'Science topic', domain: 'Learn', phase: 4, description: 'Practical training concepts with sourced claims and population limits.' },
  { path: '/learn/workout-science/methods', title: 'Advanced training methods', domain: 'Learn', phase: 4, description: 'Reviewed methods, costs, prerequisites and evidence.' },
  { path: '/learn/workout-science/glossary', title: 'Training glossary', domain: 'Learn', phase: 4, description: 'Reviewed terminology and abbreviations.' },
  { path: '/train', title: 'Train', domain: 'Train', phase: 1, description: 'Connect training knowledge with planning and execution.' },
  { path: '/programs', title: 'Workout programs', domain: 'Train', phase: 5, description: 'Find programs and build a schedule around your goals.' },
  { path: '/programs/$slug', title: 'Program detail', domain: 'Train', phase: 5, description: 'Weekly schedules, progression and exercise substitutions.' },
  { path: '/workout', title: 'Workout workspace', domain: 'Train', phase: 6, description: 'A future home for your sessions, sets and optional training logs.' },
  { path: '/workout/history', title: 'Workout history', domain: 'Track', phase: 6, description: 'Review your device-local sessions and training records.' },
  { path: '/cardio', title: 'Cardio & conditioning', domain: 'Train', phase: 13, description: 'Explore conditioning methods, planning and optional session logs.' },
  { path: '/eat', title: 'Eat', domain: 'Eat', phase: 1, description: 'Connect food knowledge with practical nutrition planning.' },
  { path: '/foods', title: 'Food encyclopedia', domain: 'Eat', phase: 7, description: 'Discover foods with transparent composition data and sources.' },
  { path: '/foods/$slug', title: 'Food detail', domain: 'Eat', phase: 7, description: 'Food composition per 100 g and clearly defined serving masses.' },
  { path: '/foods/categories', title: 'Food categories', domain: 'Eat', phase: 7, description: 'Browse reviewed foods by category.' },
  { path: '/foods/compare', title: 'Compare food profiles', domain: 'Eat', phase: 7, description: 'Compare preparation profiles on an explicit serving basis.' },
  { path: '/foods/sources', title: 'Food composition sources', domain: 'Eat', phase: 7, description: 'Dataset releases and reuse policies.' },
  { path: '/foods/methodology', title: 'Food data methodology', domain: 'Eat', phase: 7, description: 'Matching, units, missing data and review.' },
  { path: '/nutrients', title: 'Nutrient encyclopedia', domain: 'Eat', phase: 8, description: 'Explore nutrients, food relationships and source limitations.' },
  { path: '/nutrients/$slug', title: 'Nutrient detail', domain: 'Eat', phase: 8, description: 'Functions, food sources and population reference values.' },
  { path: '/nutrients/reference-intakes', title: 'Reference Intake Explorer', domain: 'Eat', phase: 8, description: 'Inspect source-reviewed population references.' },
  { path: '/nutrients/frameworks', title: 'Reference frameworks', domain: 'Eat', phase: 8, description: 'Separate authorities, versions and value definitions.' },
  { path: '/nutrients/glossary', title: 'Nutrient glossary', domain: 'Eat', phase: 8, description: 'Reference terminology, units and equivalents.' },
  { path: '/nutrients/methodology', title: 'Nutrient methodology', domain: 'Eat', phase: 8, description: 'Source-backed claims, food ranking and conversion safeguards.' },
  { path: '/diet', title: 'Diet planning', domain: 'Eat', phase: 9, description: 'Open the healthy-adult target planner.' },
  { path: '/diet-planning', title: 'Diet planning', domain: 'Eat', phase: 9, description: 'Transparent starting targets and optional local snapshots.' },
  { path: '/diet-planning/energy', title: 'Energy planner', domain: 'Eat', phase: 9, description: 'Adult NASEM energy estimates with model uncertainty.' },
  { path: '/diet-planning/goal', title: 'Goal planner', domain: 'Eat', phase: 9, description: 'Explicit goal adjustments and BMI safety context.' },
  { path: '/diet-planning/macros', title: 'Macro planner', domain: 'Eat', phase: 9, description: 'Contextual protein, fat, carbohydrate and fibre targets.' },
  { path: '/diet-planning/meal-distribution', title: 'Meal distribution', domain: 'Eat', phase: 9, description: 'Reconciled target allocations across planning slots.' },
  { path: '/diet-planning/plans', title: 'Saved diet plans', domain: 'Eat', phase: 9, description: 'Device-local target snapshots, comparison and backup.' },
  { path: '/diet-planning/plans/$planId', title: 'Saved diet plan', domain: 'Eat', phase: 9, description: 'Private saved target and formula provenance.' },
  { path: '/diet-planning/methodology', title: 'Diet planning methodology', domain: 'Eat', phase: 9, description: 'Exact formulas, references and versioning.' },
  { path: '/diet-planning/safety', title: 'Diet planning safety', domain: 'Eat', phase: 9, description: 'Eligibility, unsupported uses and planning boundaries.' },
  { path: '/recipes', title: 'Meals & recipes', domain: 'Eat', phase: 11, description: 'Practical recipes and meal templates connected to food data.' },
  { path: '/recipes/$slug', title: 'Recipe detail', domain: 'Eat', phase: 11, description: 'Ingredients, instructions, substitutions and calculated nutrition.' },
  { path: '/recipes/create', title: 'Create recipe', domain: 'Eat', phase: 11, description: 'Local recipes, immutable meal planning and source-aware calculations.' },
  { path: '/recipes/local/$recipeId', title: 'Local recipe', domain: 'Eat', phase: 11, description: 'Local recipes, immutable meal planning and source-aware calculations.' },
  { path: '/recipes/local/$recipeId/edit', title: 'Edit local recipe', domain: 'Eat', phase: 11, description: 'Local recipes, immutable meal planning and source-aware calculations.' },
  { path: '/recipes/methodology', title: 'Recipe methodology', domain: 'Eat', phase: 11, description: 'Local recipes, immutable meal planning and source-aware calculations.' },
  { path: '/meal-plans', title: 'Meal plans', domain: 'Eat', phase: 11, description: 'Local recipes, immutable meal planning and source-aware calculations.' },
  { path: '/meal-plans/create', title: 'Create meal plan', domain: 'Eat', phase: 11, description: 'Local recipes, immutable meal planning and source-aware calculations.' },
  { path: '/meal-plans/$planId', title: 'Local meal plan', domain: 'Eat', phase: 11, description: 'Local recipes, immutable meal planning and source-aware calculations.' },
  { path: '/meal-plans/$planId/grocery-list', title: 'Grocery list', domain: 'Eat', phase: 11, description: 'Local recipes, immutable meal planning and source-aware calculations.' },
  { path: '/meal-plans/templates/$templateSlug', title: 'Meal-prep collection', domain: 'Eat', phase: 11, description: 'Original source-validated lunch and snack collection; not a complete daily diet.' },
  { path: '/meal-plans/templates', title: 'Meal-plan templates', domain: 'Eat', phase: 11, description: 'Local recipes, immutable meal planning and source-aware calculations.' },
  { path: '/meal-plans/settings', title: 'Meal-plan settings & backup', domain: 'Eat', phase: 11, description: 'Local recipes, immutable meal planning and source-aware calculations.' },
  { path: '/meal-plans/privacy', title: 'Meal-plan privacy', domain: 'Eat', phase: 11, description: 'Local recipes, immutable meal planning and source-aware calculations.' },
  { path: '/nutrition-log', title: 'Nutrition diary', domain: 'Track', phase: 10, description: 'Open your optional local nutrition diary.' },
  { path: '/nutrition', title: 'Nutrition diary', domain: 'Eat', phase: 10, description: 'Optional food and fluid snapshots saved in this browser.' },
  { path: '/nutrition/add', title: 'Add food or fluid', domain: 'Eat', phase: 10, description: 'Record consumed amounts with exact source snapshots.' },
  { path: '/nutrition/day/$date', title: 'Nutrition diary', domain: 'Eat', phase: 10, description: 'Inspect a device-local day and frozen targets.' },
  { path: '/nutrition/history', title: 'Nutrition history', domain: 'Eat', phase: 10, description: 'Review local nutrition days.' },
  { path: '/nutrition/custom-foods', title: 'Custom foods', domain: 'Eat', phase: 10, description: 'Private labels and immutable revisions.' },
  { path: '/nutrition/custom-foods/$customFoodId', title: 'Custom foods', domain: 'Eat', phase: 10, description: 'Inspect and revise a private food.' },
  { path: '/nutrition/settings', title: 'Nutrition settings & backup', domain: 'Eat', phase: 10, description: 'Meal slots, targets, export, restore and deletion.' },
  { path: '/nutrition/methodology', title: 'Nutrition methodology', domain: 'Eat', phase: 10, description: 'Snapshot arithmetic, source statuses and scope.' },
  { path: '/nutrition/privacy', title: 'Nutrition privacy', domain: 'Eat', phase: 10, description: 'Browser ownership, persistence and backup.' },
  { path: '/recovery', title: 'Recovery & sleep', domain: 'Recover', phase: 12, description: 'Explore sleep, fatigue, rest and optional recovery records.' },
  { path: '/mobility', title: 'Mobility', domain: 'Recover', phase: 12, description: 'Warm-ups, cooldowns and movement-preparation routines.' },
  { path: '/supplements', title: 'Supplement evidence', domain: 'Learn', phase: 14, description: 'A careful reference for evidence, limitations and safety concerns.' },
  { path: '/track', title: 'Track', domain: 'Track', phase: 1, description: 'Your optional, device-local personal space.' },
  { path: '/progress', title: 'Progress', domain: 'Track', phase: 15, description: 'Optional body progress records and source-labelled analytics.' },
  { path: '/tools', title: 'Tools', domain: 'Tools', phase: 17, description: 'Calculators, timers, unit converters and comparisons.' },
  { path: '/saved', title: 'Saved items', domain: 'Saved', phase: 16, description: 'Manage favourites, collections, comparisons and recent history on this device.' },
  { path: '/settings', title: 'Settings', domain: 'System', phase: 0, description: 'Appearance, display units and your local data boundaries.' },
  { path: '/about/sources', title: 'Sources & methodology', domain: 'System', phase: 0, description: 'How knowledge will be reviewed, attributed and maintained.' },
]
export function findModule(path: string): ModuleDefinition | undefined {
  return modules.find((module) => module.path === path) ?? modules.find((module) => {const parts=module.path.split('/'),actual=path.split('/');return module.path.includes('$')&&parts.length===actual.length&&parts.every((part,index)=>part.startsWith('$')?!!actual[index]:part===actual[index])})
}
export const primaryNavigation = [
  { title: 'Home', path: '/', icon: 'home' },
  { title: 'Learn', path: '/learn', icon: 'book' },
  { title: 'Train', path: '/programs', icon: 'dumbbell' },
  { title: 'Eat', path: '/foods', icon: 'leaf' },
  { title: 'Recover', path: '/recovery', icon: 'moon' },
  { title: 'Progress', path: '/progress', icon: 'chart' },
  { title: 'Tools', path: '/tools', icon: 'tools' },
  { title: 'Saved', path: '/saved', icon: 'bookmark' },
] as const

export interface NavigationItem {
  id: string
  label: string
  href: string
  description: string
  icon: import('../components/common/icon').IconName
  aliases: readonly string[]
  groupId?: string
  visibility: 'primary' | 'secondary' | 'contextual'
  mobilePrimary: boolean
  order: number
}
const groupPaths: Record<string, readonly string[]> = {
  learn: ['/muscles', '/exercises', '/learn/workout-science', '/nutrients', '/supplements'],
  train: ['/workout', '/workout/history', '/cardio', '/conditioning'], eat: ['/diet-planning', '/recipes', '/nutrition'], recover: ['/mobility'],
}
const aliases: Record<string, readonly string[]> = {
  '/diet-planning': ['calorie', 'energy', 'macros', 'targets'], '/tools': ['calorie', 'calculator', 'timer', 'compare'],
  '/nutrients': ['vitamin', 'vitamins', 'minerals', 'protein'], '/recovery': ['sleep', 'rest', 'soreness'],
  '/workout': ['log workout', 'sets', 'session'], '/workout/history': ['history', 'past sessions'], '/exercises': ['exercise', 'movement'],
  '/learn/workout-science': ['training science', 'rpe', 'rir', 'volume', 'progressive overload', 'methods'],
}
const groupIds: Record<string, string> = { Home: 'home', Learn: 'learn', Train: 'train', Eat: 'eat', Recover: 'recover', Progress: 'progress', Tools: 'tools', Saved: 'saved' }
export const navigationItems: readonly NavigationItem[] = [
  ...primaryNavigation.map((entry, index) => ({
    id: groupIds[entry.title] ?? entry.title.toLowerCase(), label: entry.title, href: entry.path, icon: entry.icon,
    description: findModule(entry.path)?.description ?? 'Your fitness workspace overview.', aliases: aliases[entry.path] ?? [],
    visibility: (index < 6 ? 'primary' : 'secondary') as 'primary' | 'secondary',
    mobilePrimary: ['Home', 'Learn', 'Train', 'Eat', 'Progress'].includes(entry.title), order: index,
  })),
  ...modules.filter((module) => !primaryNavigation.some((entry) => entry.path === module.path)).map((module, index) => ({
    id: `${['/train', '/eat', '/track'].includes(module.path) ? 'hub-' : ''}${module.path.slice(1).replaceAll('/', '-').replace('$', '')}`, label: module.title, href: module.path,
    description: module.description, icon: (module.domain === 'Eat' ? 'leaf' : module.domain === 'Train' ? 'dumbbell' : module.domain === 'Recover' ? 'moon' : module.domain === 'Track' ? 'chart' : module.path === '/settings' ? 'settings' : module.path === '/about/sources' ? 'help' : 'book') as NavigationItem['icon'],
    aliases: aliases[module.path] ?? [], groupId: Object.entries(groupPaths).find(([, paths]) => paths.includes(module.path))?.[0],
    visibility: (module.path.includes('$') || module.path.startsWith('/cardio/') || module.path.startsWith('/conditioning/') || module.path.startsWith('/recovery/') || module.path.startsWith('/sleep/') || module.path.startsWith('/mobility/') || module.path.startsWith('/warm-ups/') || module.path.startsWith('/nutrition/') || module.path.startsWith('/recipes/') || module.path.startsWith('/meal-plans/') || ['/train', '/eat', '/track', '/training-science','/diet','/nutrition-log'].includes(module.path) ? 'contextual' : 'secondary') as 'contextual' | 'secondary', mobilePrimary: false, order: index + 20,
  })),
]
export const mobileMorePaths = ['/recovery', '/mobility', '/tools', '/saved', '/settings', '/about/sources'] as const
export function navigationFor(path: string): NavigationItem | undefined {
  const module = findModule(path)
  return navigationItems.find((entry) => entry.href === (module?.path ?? path))
}
export function groupFor(path: string): string | undefined {
  const entry = navigationFor(path)
  if (entry?.groupId) return entry.groupId
  const ancestor = navigationItems.filter((item) => item.groupId && item.href !== path && path.startsWith(`${item.href}/`)).sort((a, b) => b.href.length - a.href.length)[0]
  if (ancestor) return ancestor.groupId
  if (findModule(path)?.path.includes('$slug')) {
    const catalogue = navigationFor(path.slice(0, path.lastIndexOf('/')))
    return catalogue?.groupId ?? catalogue?.id
  }
  return entry?.id
}
