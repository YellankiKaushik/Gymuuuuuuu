import { useEffect, useRef, useState } from 'react'
import { appConfig } from '../../config/app'
import { groupFor, mobileMorePaths, navigationItems, navigationFor } from '../../data/navigation'
import { Icon } from '../common/icon'
import { usePreferences } from './preferences'

export function Brand() {
  return <a href="/" className="brand" aria-label={`${appConfig.name} home`}><span className="brand-mark"><span /><span /><span /></span><span className="brand-name">{appConfig.name}<small>KNOWLEDGE MEETS ACTION</small></span></a>
}
export function NavigationLinks({ pathname, collapsed = false, onNavigate }: { pathname: string; collapsed?: boolean; onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState<readonly string[]>([])
  const activeGroup = groupFor(pathname)
  const primary = navigationItems.filter((entry) => entry.visibility === 'primary' || ['tools', 'saved'].includes(entry.id))
  return <nav aria-label="Primary navigation">{primary.map((item) => {
    const children = navigationItems.filter((entry) => entry.groupId === item.id)
    const isOpen = activeGroup === item.id || expanded.includes(item.id)
    const active = item.href === pathname || activeGroup === item.id
    return <div className="nav-group" key={item.id}><div className="nav-group-heading"><a href={item.href} title={collapsed ? item.label : undefined} aria-label={item.label} className={`nav-item ${active ? 'active' : ''}`} aria-current={item.href === pathname ? 'page' : undefined} onClick={onNavigate}><Icon name={item.icon} /><span>{item.label}</span>{active && <span className="nav-active-dot" />}</a>{!collapsed && children.length > 0 && <button className="nav-expand" aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label} group`} aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? expanded.filter((id) => id !== item.id) : [...expanded, item.id])}><Icon name={isOpen ? 'down' : 'chevron'} size={16} /></button>}</div>{!collapsed && isOpen && children.length > 0 && <div className="nav-children">{children.map((child) => <a key={child.id} href={child.href} onClick={onNavigate} className={child.href === pathname || pathname.startsWith(child.href + '/') ? 'active' : ''} aria-current={child.href === pathname ? 'page' : undefined}>{child.label}</a>)}</div>}</div>
  })}</nav>
}
export function DesktopSidebar({ pathname }: { pathname: string }) {
  const { preferences, update, hydrated } = usePreferences()
  const collapsed = preferences.sidebarCollapsed ?? false
  return <aside className={`sidebar desktop-sidebar ${collapsed ? 'collapsed' : ''}`}><Brand /><span className="nav-label">YOUR WORKSPACE</span><NavigationLinks pathname={pathname} collapsed={collapsed} /><div className="sidebar-bottom"><div className="local-note"><Icon name="shield" size={21} /><div><strong>Your space. Your data.</strong><p>Private by design.<br />Stored on your device.</p></div></div>{['/about/sources', '/settings'].map((href) => { const entry = navigationFor(href); return entry && <a href={href} key={href} className={`nav-item ${pathname === href ? 'active' : ''}`} aria-label={entry.label} title={collapsed ? entry.label : undefined} aria-current={pathname === href ? 'page' : undefined}><Icon name={entry.icon} /><span>{entry.label}</span></a> })}<button className="nav-item collapse-control" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} disabled={!hydrated} onClick={() => update({ sidebarCollapsed: !collapsed })}><Icon name={collapsed ? 'chevron' : 'menu'} /><span>Collapse sidebar</span></button><div className="sidebar-version"><span className="status-dot" />Device-local storage<span>v{appConfig.version}</span></div></div></aside>
}
export function MobileBottomNav({ pathname }: { pathname: string }) {
  const group = groupFor(pathname)
  return <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation">{navigationItems.filter((entry) => entry.mobilePrimary).map((entry) => <a href={entry.href} key={entry.id} className={group === entry.id ? 'active' : ''} aria-current={group === entry.id ? 'page' : undefined}><Icon name={entry.icon} size={21} /><span>{entry.label}</span></a>)}</nav>
}
export function ResponsiveNavDialog({ pathname, close, mode }: { pathname: string; close: () => void; mode: 'tablet' | 'more' }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const dialog = ref.current; const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null; dialog?.showModal(); return () => { dialog?.close(); window.setTimeout(() => { if (opener?.isConnected) opener.focus() }, 0) } }, [])
  return <dialog className={`navigation-dialog ${mode}`} ref={ref} aria-labelledby="nav-dialog-title" onCancel={close} onClick={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close() }}><div className="dialog-heading"><h2 id="nav-dialog-title">{mode === 'more' ? 'More from your workspace' : 'Your workspace'}</h2><button className="icon-button" aria-label="Close navigation" onClick={close}><Icon name="close" /></button></div>{mode === 'tablet' ? <NavigationLinks pathname={pathname} onNavigate={close} /> : <nav aria-label="More destinations">{mobileMorePaths.map((href) => { const item = navigationFor(href); return item && <a key={href} href={href} onClick={close} aria-current={pathname === href ? 'page' : undefined}><Icon name={item.icon} /><span>{item.label}</span><Icon name="arrow" size={17} /></a> })}</nav>}</dialog>
}
export function Breadcrumbs({ pathname }: { pathname: string }) {
  if (pathname === '/') return <span className="workspace-label">Your workspace</span>
  const current = navigationFor(pathname)
  const group = navigationItems.find((entry) => entry.id === groupFor(pathname))
  return <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a>{group && current?.id !== group.id && <><Icon name="chevron" size={14} /><a href={group.href}>{group.label}</a></>}<Icon name="chevron" size={14} /><strong aria-current="page">{current?.label ?? 'Page not found'}</strong></nav>
}

