import type { Preferences, UnitValue } from '../types'

export function formatUnitValue(value: UnitValue, units: Preferences['units'] = 'metric'): string {
  if (value.status === 'trace') return 'Trace'
  if (value.status === 'not-measured') return 'Not measured'
  if (value.status === 'not-available') return 'Not available'
  let quantity = value.value
  let label: string = value.unit
  if (units === 'imperial') {
    if (value.unit === 'kg') { quantity *= 2.2046226218; label = 'lb' }
    if (value.unit === 'cm') { quantity /= 2.54; label = 'in' }
    if (value.unit === 'm') { quantity /= 1609.344; label = 'mi' }
  }
  return `${value.status === 'estimated' ? '≈ ' : ''}${new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(quantity)} ${label}`
}
