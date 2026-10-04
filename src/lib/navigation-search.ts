import { navigationItems } from '../data/navigation'
export function searchNavigation(query: string) {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  return navigationItems.filter((entry) => entry.visibility !== 'contextual' && tokens.every((token) => `${entry.label} ${entry.description} ${entry.aliases.join(' ')}`.toLowerCase().includes(token))).sort((a, b) => a.order - b.order)
}
