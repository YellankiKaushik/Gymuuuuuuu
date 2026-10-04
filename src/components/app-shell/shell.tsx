import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { findModule, primaryNavigation } from '../../data/navigation'
import { Icon } from '../common/icon'
import { ModuleFinder } from './module-finder'
import { usePreferences } from './preferences'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const module = findModule(pathname)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [finderOpen, setFinderOpen] = useState(false)
  const { preferences, hydrated, update } = usePreferences()
  return <div className="app-layout">
    <a className="skip-link" href="#main-content">Skip to content</a>
    {mobileOpen && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside id="primary-navigation" className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <a href="/" className="brand" aria-label="Fitness OS overview"><span className="brand-mark"><span /><span /><span /></span><span>fitness<span className="brand-os">OS</span><small>KNOWLEDGE MEETS ACTION</small></span></a>
      <button className="mobile-nav-close icon-button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><Icon name="close" /></button>
      <span className="nav-label">YOUR WORKSPACE</span>
      <nav aria-label="Primary navigation">{primaryNavigation.map((item) => {
        const active = item.path === '/' ? pathname === '/' : pathname === item.path || module?.domain === item.title
        return <a key={item.path} href={item.path} className={`nav-item ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined} onClick={() => setMobileOpen(false)}><Icon name={item.icon} size={20} /><span>{item.title}</span>{active && <span className="nav-active-dot" />}</a>
      })}</nav>
      <div className="sidebar-bottom"><div className="local-note"><Icon name="shield" size={21} /><div><strong>Your space. Your data.</strong><p>Private by design.<br />Stored on your device.</p></div></div><a href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`} aria-current={pathname === '/settings' ? 'page' : undefined}><Icon name="settings" /><span>Settings</span></a><a href="/about/sources" className={`nav-item ${pathname === '/about/sources' ? 'active' : ''}`} aria-current={pathname === '/about/sources' ? 'page' : undefined}><Icon name="help" /><span>Sources & methodology</span></a><div className="sidebar-version"><span className="status-dot" />Phase 00 · Foundation<span>v0.0</span></div></div>
    </aside>
    <div className="main-column"><header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" disabled={!hydrated} aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="primary-navigation" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button><span>Workspace</span><Icon name="chevron" size={14} /><strong>{module?.title ?? (pathname === '/' ? 'Overview' : 'Page unavailable')}</strong></div><div className="topbar-actions"><button className="finder-trigger" aria-label="Find a module" disabled={!hydrated} onClick={() => setFinderOpen(true)}><Icon name="search" size={17} /><span>Find a module</span><span className="search-hint">/</span></button><div className="topbar-divider" /><button className="icon-button theme-toggle" aria-label={`Switch to ${preferences.theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => update({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })}><Icon name={preferences.theme === 'dark' ? 'sun' : 'moon'} size={19} /></button><span className="local-badge"><Icon name="lock" size={13} />Device local</span></div></header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="site-footer"><span>Built for knowledge. Designed for ownership.</span><a href="/about/sources">Evidence & methodology<Icon name="external" size={13} /></a></footer>
    </div>{finderOpen && <ModuleFinder close={() => setFinderOpen(false)} />}
  </div>
}
