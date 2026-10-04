import { modules, type ModuleDefinition } from '../data/navigation'
import { EmptyState } from './common/states'
import { Icon, type IconName } from './common/icon'

const domainIcons: Record<string, IconName> = { Learn: 'book', Train: 'dumbbell', Eat: 'leaf', Recover: 'moon', Track: 'chart', Tools: 'tools', Saved: 'bookmark' }
export function ModulePage({ module }: { module: ModuleDefinition }) {
  const siblings = modules.filter((item) => item.domain === module.domain && item.path !== module.path && !item.path.includes('$') && item.phase > 1)
  return <div className="page module-page"><div className="page-heading"><div><span className="eyebrow">{module.domain.toUpperCase()} / PLANNED MODULE</span><h1>{module.title}</h1><p>{module.description}</p></div><span className="phase-chip">Phase {String(module.phase).padStart(2, '0')}</span></div>
    <section className="module-placeholder"><span className="placeholder-kicker">FOUNDATION IN PLACE</span><EmptyState title="A space for what comes next." description={`${module.title} is part of the build plan. This route is ready; reviewed content and feature tools will be introduced in Phase ${String(module.phase).padStart(2, '0')}.`} icon={domainIcons[module.domain] ?? 'book'}><a href="/" className="button primary">Return to overview<Icon name="arrow" size={16} /></a></EmptyState><div className="placeholder-footer"><Icon name="shield" size={17} />No personal information is needed to explore.</div></section>
    {siblings.length > 0 && <section className="related-section"><div className="section-heading"><div><h2>In this part of your workspace</h2><p>Explore the connected modules on the roadmap.</p></div></div><div className="module-directory">{siblings.map((item) => <a href={item.path} key={item.path}><span className="directory-icon"><Icon name={domainIcons[item.domain] ?? 'book'} size={21} /></span><span><strong>{item.title}</strong><small>Planned · Phase {String(item.phase).padStart(2, '0')}</small></span><Icon name="arrow" size={17} /></a>)}</div></section>}
  </div>
}
