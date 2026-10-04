export const CURRENT_SCHEMA_VERSION = 1 as const
// Reject future versions until explicit, tested migrations are provided.
export function supportsSchema(version: number): boolean { return version === CURRENT_SCHEMA_VERSION }
