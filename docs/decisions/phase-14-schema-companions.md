# Phase 14 schema companions

The supplied 1.0.0 schema is preserved in generated normative schemas. A companion version 1 adds the fields the prose requires but the interchange schema omits: product type/notes/revision/archive; label allergens, manufacturer, canonical serving mass and embedded local image assets; lot-specific certification scope; trial observations and external context IDs; frozen product/label snapshots in intakes and adverse events; append-only intake corrections; settings identity and typed preferences; saved comparison outcome/population; soft deletion snapshots and import conflict records.

Dedicated IndexedDB `fitness-os-supplements-evidence` version 1 owns the twelve specified stores. Browser images are bounded PNG/JPEG/WebP data URLs embedded in immutable label versions and included in JSON backup. No cloud upload, OCR, remote image fetch or metadata inference occurs. Backups are bounded to 20 MB. Unknown companion versions are rejected before any write.

Published doses require reviewed claim-specific source protocols. Draft seed identities are never clinical facts. Manually entered label amounts preserve their literal units and disclosure state; optional canonical mass conversion uses only g/mg/µg arithmetic. International Units and other noncomparable units are never converted by guesswork. Proprietary blend totals never become component doses.

Historical intake correction appends the prior full record with a reason; source label and ingredient snapshot stay frozen. Product label changes create a new immutable version. No Phase 10 nutrient credit is automatic. Explicit nutrition transfer requires a user-created compatible Phase 10 snapshot, whose provenance is the manually captured label, and is not supplied by unreviewed library data.
