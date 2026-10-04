import type { SourceMetadata } from '../../domain/types'
import { Icon } from './icon'
export function SourceList({ sources }: { sources: readonly SourceMetadata[] }) {
  return <ul className="source-list">{sources.map((source) => <li key={source.sourceId}><a href={source.url} target="_blank" rel="noreferrer"><strong>{source.title}</strong><Icon name="external" size={17} /></a><p>{source.publisher} · {source.sourceType} · {source.publishedAt ?? 'Publication date not specified'}</p><p>Supports: {source.supportedFields.join(', ')}.</p><small>Checked {source.reviewedAt ?? 'not yet reviewed'} · {source.reviewerStatus} · {source.quality}</small>{source.limitations && <p>{source.limitations}</p>}<details><summary>Usage & attribution</summary><p>{source.usageNote}</p></details></li>)}</ul>
}
