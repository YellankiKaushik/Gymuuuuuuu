import { Icon, type IconName } from './icon'
export function StatusBadge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'success' | 'info' | 'warning' | 'danger' }) {
  return <span className={`status-badge tone-${tone}`}>{children}</span>
}
export function InfoCallout({ title, children, tone = 'info' }: { title?: string; children: React.ReactNode; tone?: 'info' | 'warning' | 'danger' }) {
  return <div className={`info-callout tone-${tone}`}><Icon name="help" size={20} /><div>{title && <strong>{title}</strong>}<div>{children}</div></div></div>
}
export function ModuleCard({ title, description, href, icon, children }: { title: string; description: string; href: string; icon: IconName; children?: React.ReactNode }) {
  return <a className="shared-module-card" href={href}><Icon name={icon} size={24} /><h3>{title}</h3><p>{description}</p>{children}<Icon name="arrow" size={18} /></a>
}
export function LinkCard({ title, description, href, icon }: { title: string; description?: string; href: string; icon: IconName }) {
  return <a className="shared-link-card" href={href}><Icon name={icon} size={21} /><span><strong>{title}</strong>{description && <small>{description}</small>}</span><Icon name="arrow" size={18} /></a>
}
export function IconButton({ label, onClick, icon, disabled }: { label: string; onClick: () => void; icon: IconName; disabled?: boolean }) {
  return <button className="icon-button" title={label} aria-label={label} onClick={onClick} disabled={disabled}><Icon name={icon} /></button>
}
