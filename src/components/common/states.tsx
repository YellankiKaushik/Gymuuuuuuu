import { Link } from '@tanstack/react-router'
import { Icon, type IconName } from './icon'

export function EmptyState({ title, description, icon = 'book', children }: { title: string; description: string; icon?: IconName; children?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name={icon} size={27} /></span><h2>{title}</h2><p>{description}</p>{children}</div>
}
export function LoadingState() {
  return <div className="loading-state" role="status"><span className="eyebrow">FITNESS OS</span><span className="skeleton" /><span className="skeleton short" /><p>Loading your workspace…</p></div>
}
export function ErrorState({ reset }: { reset?: () => void }) {
  return <div className="error-state" role="alert"><Icon name="help" size={32} /><h1>This page couldn’t load.</h1><p>Your local records haven’t been changed. Try the page again.</p><div className="actions">{reset && <button className="button primary" onClick={reset}>Try again</button>}<Link to="/" className="button secondary">Back to overview</Link></div></div>
}
export function NotFoundState() {
  return <EmptyState title="This page isn’t in the plan." description="Use the overview to find a module in the Fitness OS foundation." icon="help"><Link to="/" className="button primary">Back to overview<Icon name="arrow" size={16} /></Link></EmptyState>
}
export function UnavailableState({ message }: { message: string }) {
  return <p className="inline-notice" role="status"><Icon name="help" size={18} />{message}</p>
}
