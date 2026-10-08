import { describe, expect, it } from 'vitest'
import { groupFor, modules, navigationItems } from '../src/data/navigation'
import { searchNavigation } from '../src/lib/navigation-search'
import { preferencesSchema } from '../src/domain/schemas/foundation'
describe('shell manifest', () => {
  it('has unique identities and hrefs and valid relationships', () => {
    expect(new Set(navigationItems.map((item) => item.id)).size).toBe(navigationItems.length)
    expect(new Set(navigationItems.map((item) => item.href)).size).toBe(navigationItems.length)
    for (const item of navigationItems) {
      expect(item.href === '/' || modules.some((module) => module.path === item.href)).toBe(true)
      if (item.groupId) expect(navigationItems.some((parent) => parent.id === item.groupId)).toBe(true)
    }
  })
  it('has exactly the five contracted mobile destinations', () => {
    expect(navigationItems.filter((item) => item.mobilePrimary).map((item) => item.href)).toEqual(['/', '/learn', '/programs', '/foods', '/progress'])
  })
  it('matches navigation aliases and keeps detail routes out of navigation search', () => {
    for (const [query, href] of [['calorie', '/diet-planning'], ['vitamins', '/nutrients'], ['sleep', '/recovery'], ['log workout', '/workout'], ['history', '/workout/history']]) expect(searchNavigation(query ?? '').some((item) => item.href === href)).toBe(true)
    expect(searchNavigation('').some((item) => item.href.includes('$'))).toBe(false)
    expect(searchNavigation('not-a-real-module')).toEqual([])
  })
  it('resolves deep entity navigation and validates sidebar preferences compatibly', () => {
    expect(groupFor('/exercises/unknown')).toBe('learn')
    expect(groupFor('/programs/unknown')).toBe('train')
    expect(groupFor('/settings/data/restore')).toBe('settings')
    expect(preferencesSchema.safeParse({ theme: 'system', units: 'metric' }).success).toBe(true)
    expect(preferencesSchema.safeParse({ theme: 'system', units: 'metric', sidebarCollapsed: 'yes' }).success).toBe(false)
  })
})

