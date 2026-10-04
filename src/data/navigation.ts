export type Domain = 'Learn' | 'Train' | 'Eat' | 'Recover' | 'Track' | 'Tools' | 'Saved' | 'System'
export interface ModuleDefinition { path: string; title: string; domain: Domain; phase: number; description: string }
export const modules: readonly ModuleDefinition[] = [
  { path: '/learn', title: 'Learn', domain: 'Learn', phase: 1, description: 'A connected home for fitness and nutrition knowledge.' },
  { path: '/muscles', title: 'Muscle library', domain: 'Learn', phase: 2, description: 'Explore muscle groups, anatomy and their relationship to movement.' },
  { path: '/muscles/$slug', title: 'Muscle detail', domain: 'Learn', phase: 2, description: 'Anatomy, function, related exercises and reviewed sources.' },
  { path: '/exercises', title: 'Exercise library', domain: 'Learn', phase: 3, description: 'Discover exercises by muscle, equipment and movement pattern.' },
  { path: '/exercises/$slug', title: 'Exercise detail', domain: 'Learn', phase: 3, description: 'Setup, execution, cues, variations and reviewed demonstration links.' },
  { path: '/training-science', title: 'Training science', domain: 'Learn', phase: 4, description: 'Understand the principles behind training and programming.' },
  { path: '/train', title: 'Train', domain: 'Train', phase: 1, description: 'Connect training knowledge with planning and execution.' },
  { path: '/programs', title: 'Workout programs', domain: 'Train', phase: 5, description: 'Find programs and build a schedule around your goals.' },
  { path: '/programs/$slug', title: 'Program detail', domain: 'Train', phase: 5, description: 'Weekly schedules, progression and exercise substitutions.' },
  { path: '/workout', title: 'Workout workspace', domain: 'Train', phase: 6, description: 'A future home for your sessions, sets and optional training logs.' },
  { path: '/workout/history', title: 'Workout history', domain: 'Track', phase: 6, description: 'Review your device-local sessions and training records.' },
  { path: '/cardio', title: 'Cardio & conditioning', domain: 'Train', phase: 7, description: 'Explore conditioning methods, planning and optional session logs.' },
  { path: '/eat', title: 'Eat', domain: 'Eat', phase: 1, description: 'Connect food knowledge with practical nutrition planning.' },
  { path: '/foods', title: 'Food encyclopedia', domain: 'Eat', phase: 8, description: 'Discover foods with transparent composition data and sources.' },
  { path: '/foods/$slug', title: 'Food detail', domain: 'Eat', phase: 8, description: 'Food composition per 100 g and clearly defined serving masses.' },
  { path: '/nutrients', title: 'Nutrient encyclopedia', domain: 'Eat', phase: 9, description: 'Explore nutrients, food relationships and source limitations.' },
  { path: '/nutrients/$slug', title: 'Nutrient detail', domain: 'Eat', phase: 9, description: 'Functions, food sources and evidence-aware intake guidance.' },
  { path: '/diet', title: 'Diet planning', domain: 'Eat', phase: 10, description: 'Transparent planning estimates with methods, units and assumptions.' },
  { path: '/recipes', title: 'Meals & recipes', domain: 'Eat', phase: 11, description: 'Practical recipes and meal templates connected to food data.' },
  { path: '/recipes/$slug', title: 'Recipe detail', domain: 'Eat', phase: 11, description: 'Ingredients, instructions, substitutions and calculated nutrition.' },
  { path: '/nutrition-log', title: 'Nutrition log', domain: 'Track', phase: 12, description: 'Optional food logging, saved privately in this browser.' },
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
  return modules.find((module) => module.path === path) ?? modules.find((module) => module.path.includes('$slug') && path.startsWith(module.path.replace('$slug', '')))
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
  learn: ['/muscles', '/exercises', '/training-science', '/nutrients', '/supplements'],
  train: ['/workout', '/workout/history', '/cardio'], eat: ['/diet', '/recipes', '/nutrition-log'], recover: ['/mobility'],
}
const aliases: Record<string, readonly string[]> = {
  '/diet': ['calorie', 'energy', 'macros', 'targets'], '/tools': ['calorie', 'calculator', 'timer', 'compare'],
  '/nutrients': ['vitamin', 'vitamins', 'minerals', 'protein'], '/recovery': ['sleep', 'rest', 'soreness'],
  '/workout': ['log workout', 'sets', 'session'], '/workout/history': ['history', 'past sessions'], '/exercises': ['exercise', 'movement'],
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
    visibility: (module.path.includes('$') || ['/train', '/eat', '/track'].includes(module.path) ? 'contextual' : 'secondary') as 'contextual' | 'secondary', mobilePrimary: false, order: index + 20,
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
  if (findModule(path)?.path.includes('$slug')) {
    const catalogue = navigationFor(path.slice(0, path.lastIndexOf('/')))
    return catalogue?.groupId ?? catalogue?.id
  }
  return entry?.id
}
