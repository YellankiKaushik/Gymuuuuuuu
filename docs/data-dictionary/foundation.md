# Foundation data dictionary

Sources: immutable sourceId, publisher, title, HTTP(S) URL, sourceType, optional publication/dataset version, accessedAt, nullable reviewedAt, usageNote, quality, supportedFields, limitations, reviewerStatus. An empty source registry is intentional until reviewed knowledge is introduced.

Values: g, kcal, s, m, kg, cm internally. measured/calculated/estimated carry finite nonnegative values; calculated includes a method; estimated includes limitations; trace and missing statuses contain null, never an invented zero. Reviewed sources support numerical data. Display conversion cannot mutate canonical data.

Local records: immutable id, module, schemaVersion, UTC ISO creation/update times and a payload. These are generic envelopes; module phases must validate their payloads. The Phase 00 adapter does not create records from navigation.

Backups: format fitness-os-backup, schemaVersion 1, export timestamp, app version, record list and preferences. Strict parsing rejects future versions, duplicate IDs and malformed records before writes. Dry-run reports module counts and conflicts. Import writes, replace/merge, automatic pre-import backup and migration UI arrive in the dedicated storage phase.
