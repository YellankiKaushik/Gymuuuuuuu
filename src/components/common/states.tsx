import { Link } from '@tanstack/react-router'
import { Icon, type IconName } from './icon'
import { appConfig } from '../../config/app'
import { PageHeader } from './page-header'

export function EmptyState({ title, description, icon = 'book', children }: { title: string; description: string; icon?: IconName; children?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name={icon} size={27} /></span><h2>{title}</h2><p>{description}</p>{children}</div>
}
export function LoadingState() {
  return <div className="loading-state" role="status"><span className="eyebrow">{appConfig.name.toUpperCase()}</span><span className="skeleton" /><span className="skeleton short" /><p>Loading your workspace…</p></div>
}
export function ErrorState({ reset }: { reset?: () => void }) {
  return <div className="error-state" role="alert"><Icon name="help" size={32} /><h1>This page couldn’t load.</h1><p>Your local records haven’t been changed. Try the page again.</p><div className="actions">{reset && <button className="button primary" onClick={reset}>Try again</button>}<Link to="/" className="button secondary">Back to overview</Link></div></div>
}
export function NotFoundState() {
  return <div className="page"><PageHeader title="Page not found" description={`Find your way back to your ${appConfig.name} workspace.`} /><EmptyState title="Let’s find the right place." description="This page could not be found. Explore the overview or use search to find a module." icon="help"><div className="actions"><Link to="/" className="button primary">Back to overview<Icon name="arrow" size={16} /></Link><button className="button secondary" onClick={() => window.dispatchEvent(new Event('fitness-os:open-search'))}>Search modules</button><button className="button secondary" onClick={() => window.history.back()}>Go back</button></div></EmptyState></div>
}
export function UnavailableState({ message }: { message: string }) {
  return <p className="inline-notice" role="status"><Icon name="help" size={18} />{message}</p>
}
