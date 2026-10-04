import { createContext, useContext, useEffect, useState } from 'react'
import type { Preferences } from '../../domain/types'
import { defaultPreferences, readPreferences, writePreferences } from '../../storage/preferences/adapter'

interface PreferenceContext { preferences: Preferences; hydrated: boolean; message: string; update: (next: Partial<Preferences>) => void }
const Context = createContext<PreferenceContext | null>(null)
export function PreferenceProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
  const [hydrated, setHydrated] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    let active = true
    // Hydrate browser-only preferences after the SSR hydration boundary.
    queueMicrotask(() => {
      if (!active) return
      const saved = readPreferences()
      if (saved.ok) setPreferences(saved.value)
      else setMessage(saved.error)
      setHydrated(true)
    })
    const onStorage = () => { const current = readPreferences(); if (current.ok) setPreferences(current.value) }
    window.addEventListener('storage', onStorage)
    return () => { active = false; window.removeEventListener('storage', onStorage) }
  }, [])
  useEffect(() => {
    if (!hydrated) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => { document.documentElement.dataset.theme = preferences.theme === 'system' ? (media.matches ? 'dark' : 'light') : preferences.theme }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preferences.theme, hydrated])
  function update(next: Partial<Preferences>) {
    const merged = { ...preferences, ...next }
    const result = writePreferences(merged)
    setPreferences(merged)
    setMessage(result.ok ? 'Preferences saved on this device.' : result.error)
  }
  return <Context.Provider value={{ preferences, hydrated, message, update }}>{children}</Context.Provider>
}
export function usePreferences() {
  const context = useContext(Context)
  if (!context) throw new Error('Preferences require PreferenceProvider')
  return context
}
