import { preferencesSchema } from '../../domain/schemas/foundation'
import type { Preferences } from '../../domain/types'

export const PREFERENCE_KEY = 'fitness-os:preferences:v1'
export const defaultPreferences: Preferences = { theme: 'system', units: 'metric' }
export type StorageResult<T> = { ok: true; value: T } | { ok: false; error: string }

export function readPreferences(): StorageResult<Preferences> {
  if (typeof window === 'undefined') return { ok: true, value: defaultPreferences }
  try {
    const raw = window.localStorage.getItem(PREFERENCE_KEY)
    if (!raw) return { ok: true, value: defaultPreferences }
    let input: unknown
    try { input = JSON.parse(raw) as unknown } catch { return { ok: false, error: 'Saved preferences are invalid. Choose your preferences again.' } }
    const parsed = preferencesSchema.safeParse(input)
    return parsed.success ? { ok: true, value: parsed.data } : { ok: false, error: 'Saved preferences are invalid. Choose your preferences again.' }
  } catch { return { ok: false, error: 'Browser preferences are unavailable. Changes will apply only until this page is closed.' } }
}

export function writePreferences(preferences: Preferences): StorageResult<Preferences> {
  const parsed = preferencesSchema.safeParse(preferences)
  if (!parsed.success) return { ok: false, error: 'Preferences could not be validated.' }
  if (typeof window === 'undefined') return { ok: false, error: 'Preferences can only be saved in the browser.' }
  try { window.localStorage.setItem(PREFERENCE_KEY, JSON.stringify(parsed.data)); return { ok: true, value: parsed.data } }
  catch { return { ok: false, error: 'Your browser could not save preferences. The change applies to this visit only.' } }
}
