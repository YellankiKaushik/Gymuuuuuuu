# Phase 13 local data dictionary

All base fields in the supplied JSON schema are retained. Strict companions fill behavioral requirements omitted from that schema.

| Collection/companion | Key fields and meaning |
| --- | --- |
| cardioSessions | Immutable ID; local sessionDate/timezone; activity/type IDs; explicit start/end offsets; status; actual metrics; source-labelled HR; frozen source; timestamp player; revision number and optional lease. |
| Exact seconds | elapsedSecondsExact / actualSecondsExact preserve fractional timestamp measurements. Normative elapsedSeconds / actualDurationSeconds are their integer floor projection, validated for agreement. Active elapsed cannot exceed the start/end window. |
| Segment actuals | completed/skipped/planned, measured distance or null, effort/talk report, modification note. Planned targets remain distinct and frozen through corrections. |
| Intensity provenance | method/version, user-selected or reviewed basis, source IDs, explicit maximum source, HR estimate flag, age/rest/maximum/fraction inputs, HR-disabled flag and cautions. No released zone framework exists. |
| Classification | Per-record pinned classificationVersion `cdc-talk-effort-examples-1`; raw observations remain available and ambiguous values remain unclassified. |
| laps | Own ID, timestamp, cumulative active elapsed seconds and optional measured distance for that lap. Separate overlapping observations, not extra training time. |
| deviceLabel | Optional user-reported device/machine identity, used to avoid silently merging different devices in progress groups. HR source remains separately labelled. |
| originalCompletedRecord / revisions | Frozen original record; each correction appends a prior full record, timestamp, immutable edit ID and reason. Writes reject replaced originals or dropped earlier revisions. |
| customPlanIdentities / customRoutineIdentities | Identity ID, current version ID, title, archive flag, created/updated timestamps. |
| customPlanVersions | Consecutive immutable versions with user goal, weeks, day-indexed sessions/segments, revision reason and user progression notes. |
| customRoutineVersions | Consecutive immutable versions with activity/type, ordered segments, explicit final-recovery choice, user prerequisites and revision reason. |
| settings | One typed preferences record: tracking, timezone, display units, history preference, HR caution and selected local plan/start date. Structured data stays in IndexedDB. |
| auditEvents | Immutable audit ID, entity/type, action and timestamp. Root validation and audit writes share the transaction. No event is emitted to a server. |
| deletedRecords | Entity identity/type, deletion timestamp and strict session or identity-plus-version snapshot, used for explicit undo. |
| derived/import stores | Rebuildable invalidation marker and dedicated conflict capacity; excluded from canonical JSON personal truth. Raw recovery includes every store. |

Canonical units: m, s, bpm (explicit observation source), W, declared cadence unit and °C. Zero is measured zero; null is not measured/unavailable. User source text is not editorial approval. External workout links are IDs and newly added links must resolve to completed local workouts; imported historical references may be absent in another browser.
