import { useEffect, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Icon } from '../common/icon'
import { ModuleFinder } from './module-finder'
import { usePreferences } from './preferences'
import { Brand, Breadcrumbs, DesktopSidebar, MobileBottomNav, ResponsiveNavDialog } from './navigation'

export function AppShell({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [navigation, setNavigation] = useState<'tablet' | 'more' | null>(null)
  const [finderOpen, setFinderOpen] = useState(false)
  const { preferences, hydrated, update } = usePreferences()
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      const target = event.target
      const editable = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !editable)) { event.preventDefault(); setFinderOpen(true) }
    }
    window.addEventListener('keydown', shortcut)
    const openSearch = () => setFinderOpen(true)
    window.addEventListener('fitness-os:open-search', openSearch)
    return () => { window.removeEventListener('keydown', shortcut); window.removeEventListener('fitness-os:open-search', openSearch) }
  }, [])
  return <div className={`app-layout ${preferences.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}><a className="skip-link" href="#main-content">Skip to content</a><DesktopSidebar pathname={pathname} /><div className="main-column"><header className="topbar"><div className="desktop-context"><button className="tablet-menu icon-button" disabled={!hydrated} aria-label="Open navigation" onClick={() => setNavigation('tablet')}><Icon name="menu" /></button><Breadcrumbs pathname={pathname} /></div><div className="mobile-brand"><Brand /></div><div className="topbar-actions"><button className="finder-trigger" aria-label="Find a module" disabled={!hydrated} onClick={() => setFinderOpen(true)}><Icon name="search" size={19} /><span>Find a module</span><kbd className="search-hint">Ctrl K</kbd></button><div className="topbar-divider" /><button className="icon-button theme-toggle" disabled={!hydrated} title={`Theme: ${preferences.theme}`} aria-label={`Switch to ${preferences.theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => update({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })}><Icon name={preferences.theme === 'dark' ? 'sun' : 'moon'} size={20} /></button><span className="local-badge"><Icon name="lock" size={14} />Device local</span><button className="more-trigger icon-button" aria-label="More destinations" disabled={!hydrated} onClick={() => setNavigation('more')}><Icon name="menu" /></button>{actions}</div></header><main id="main-content" tabIndex={-1}>{children}</main><footer className="site-footer"><span>Built for knowledge. Designed for ownership.</span><a href="/about/sources">Evidence & methodology<Icon name="external" size={15} /></a></footer></div><MobileBottomNav pathname={pathname} />{finderOpen && <ModuleFinder close={() => setFinderOpen(false)} />}{navigation && <ResponsiveNavDialog pathname={pathname} mode={navigation} close={() => setNavigation(null)} />}</div>
}
