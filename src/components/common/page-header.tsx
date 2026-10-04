export function PageHeader({ title, description, eyebrow, metadata, actions, children }: { title: string; description?: string; eyebrow?: string; metadata?: React.ReactNode; actions?: React.ReactNode; children?: React.ReactNode }) {
  return <><div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}{metadata && <div className="page-metadata">{metadata}</div>}</div>{actions && <div className="actions">{actions}</div>}</div>{children}</>
}
export function SectionNav({ items, label = 'Page sections' }: { items: readonly { label: string; href: string; active?: boolean }[]; label?: string }) {
  return <nav className="section-nav" aria-label={label}>{items.map((item) => <a key={item.href} href={item.href} aria-current={item.active ? 'page' : undefined}>{item.label}</a>)}</nav>
}
