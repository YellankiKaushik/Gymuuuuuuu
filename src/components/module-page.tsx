import { modules, type ModuleDefinition } from '../data/navigation'
import { EmptyState } from './common/states'
import { Icon, type IconName } from './common/icon'
import { PageHeader } from './common/page-header'
import { LinkCard, StatusBadge } from './common/primitives'

const domainIcons: Record<string, IconName> = { Learn: 'book', Train: 'dumbbell', Eat: 'leaf', Recover: 'moon', Track: 'chart', Tools: 'tools', Saved: 'bookmark' }
export function ModulePage({ module }: { module: ModuleDefinition }) {
  const siblings = modules.filter((item) => item.domain === module.domain && item.path !== module.path && !item.path.includes('$') && item.phase > 1)
  const detail = module.path.includes('$slug')
  const tracking = ['/workout', '/workout/history', '/nutrition-log', '/progress', '/saved', '/track'].includes(module.path)
  const catalogue = module.path.split('/$slug')[0] ?? '/'
  return <div className="page module-page"><PageHeader eyebrow={module.domain.toUpperCase()} title={module.title} description={module.description} metadata={<StatusBadge>Content coming soon</StatusBadge>} /><section className="module-placeholder"><span className="placeholder-kicker">{detail ? 'RECORD UNAVAILABLE' : 'FOUNDATION IN PLACE'}</span><EmptyState title={detail ? `${module.title.replace(' detail', '')} not available` : tracking ? 'Your space, when you need it.' : 'A space for what comes next.'} description={detail ? 'This record could not be found. Verified content has not been added to this library yet.' : tracking ? 'Tracking is optional. When this module is enabled, records will stay on this device and can be exported for backup.' : `This section will bring together structured ${module.title.toLowerCase()} information and tools. The application foundation is ready, but verified content has not been added yet.`} icon={domainIcons[module.domain] ?? 'book'}><a href={detail ? catalogue : '/'} className="button primary">{detail ? 'Back to the library' : 'Return to overview'}<Icon name="arrow" size={16} /></a></EmptyState><div className="placeholder-footer"><Icon name="shield" size={17} />No personal information is needed to explore.</div></section>{!detail && siblings.length > 0 && <section className="related-section"><div className="section-heading"><div><h2>In this part of your workspace</h2><p>Explore the connected modules.</p></div></div><div className="module-directory">{siblings.map((item) => <LinkCard key={item.path} title={item.title} description="Content coming soon" href={item.path} icon={domainIcons[item.domain] ?? 'book'} />)}</div></section>}</div>
}
