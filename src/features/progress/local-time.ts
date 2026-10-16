/** HTML datetime-local uses wall-clock components, never UTC ISO digits. */
export function localDateTimeValue(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localDateValue(date = new Date()): string {
  return localDateTimeValue(date).slice(0, 10);
}
