import { useEffect, useRef, useState } from 'react'
import { modules } from '../../data/navigation'
import { Icon } from '../common/icon'

export function ModuleFinder({ close }: { close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const results = modules.filter((module) => !module.path.includes('$') && `${module.title} ${module.domain}`.toLowerCase().includes(query.toLowerCase()))
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close() }, [])
  return <dialog ref={ref} className="finder" onCancel={close} onClick={(event) => { if (event.target === event.currentTarget) close() }} aria-labelledby="finder-title">
    <div className="finder-heading"><div><span className="eyebrow">WORKSPACE DIRECTORY</span><h2 id="finder-title">Find a module</h2></div><button className="icon-button" onClick={close} aria-label="Close module finder"><Icon name="close" /></button></div>
    <label className="search-field"><Icon name="search" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search module names…" aria-label="Search module names" /></label>
    <p className="finder-note">Feature pages are placeholders during Phase 00.</p>
    <div className="finder-results">{results.length ? results.map((module) => <a href={module.path} key={module.path} onClick={close}><span>{module.title}<small>{module.domain}</small></span><Icon name="arrow" size={18} /></a>) : <p className="no-results">No modules match “{query}”. Try another name.</p>}</div>
  </dialog>
}
