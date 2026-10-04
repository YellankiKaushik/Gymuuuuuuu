# Program content and local selections

`src/content/programs` stores immutable public records and historical reviewed versions. Regenerate normative validation with `node scripts/generate-program-schema.mjs` after schema changes. Add reviewed records, run content validation, verify public exercise/science references and inspect every prescribed schedule before publication. Do not expose seed identities as ready-to-follow programs.

Finder v1 uses hard eligibility, days, required equipment, environment, experience and upper session-time limits. Primary-goal matches rank above secondary-goal matches (40/20), exact days above fewer days (20/10), optional preferred style adds 10. Tie-breaks use display name. Scores are internal ordering rules, not health suitability estimates. Answers are transient and never included in URLs.

Selections are local `plans` records marked `program-instance`. A new selection archives the previous one in one IndexedDB transaction. Performance data belongs to Phase 06. Canonical ID and version are retained; an unavailable historical template fails closed and does not erase the selection. Substitutions use reviewed candidate lists for the precise session/block/prescription slot. Export before clearing browser data.
