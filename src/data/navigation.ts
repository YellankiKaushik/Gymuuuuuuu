export type Domain = 'Learn' | 'Train' | 'Eat' | 'Recover' | 'Track' | 'Tools' | 'Saved' | 'System'
export interface ModuleDefinition { path: string; title: string; domain: Domain; phase: number; description: string }
export const modules: readonly ModuleDefinition[] = [
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
  { path: '/cardio', title: 'Cardio & conditioning', domain: 'Train', phase: 7, description: 'Explore conditioning methods, planning and optional session logs.' },
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
  { path: '/recovery', title: 'Recovery & sleep', domain: 'Recover', phase: 13, description: 'Explore sleep, fatigue, rest and optional recovery records.' },
  { path: '/mobility', title: 'Mobility', domain: 'Recover', phase: 14, description: 'Warm-ups, cooldowns and movement-preparation routines.' },
  { path: '/supplements', title: 'Supplement evidence', domain: 'Learn', phase: 15, description: 'A careful reference for evidence, limitations and safety concerns.' },
  { path: '/track', title: 'Track', domain: 'Track', phase: 1, description: 'Your optional, device-local personal space.' },
  { path: '/progress', title: 'Progress', domain: 'Track', phase: 16, description: 'Connect body, training, nutrition and recovery trends.' },
  { path: '/tools', title: 'Tools', domain: 'Tools', phase: 17, description: 'Calculators, timers, unit converters and comparisons.' },
  { path: '/saved', title: 'Saved items', domain: 'Saved', phase: 17, description: 'A future home for your favourites and saved plans.' },
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
  train: ['/workout', '/workout/history', '/cardio'], eat: ['/diet-planning', '/recipes', '/nutrition'], recover: ['/mobility'],
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
    visibility: (module.path.includes('$') || module.path.startsWith('/nutrition/') || ['/train', '/eat', '/track', '/training-science','/diet','/nutrition-log'].includes(module.path) ? 'contextual' : 'secondary') as 'contextual' | 'secondary', mobilePrimary: false, order: index + 20,
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

