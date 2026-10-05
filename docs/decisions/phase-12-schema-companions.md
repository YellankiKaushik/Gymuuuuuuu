# Phase 12 schema companions

The written specification governs behavior where its illustrative JSON schema omits necessary fields. Preserve the original schema as generated normative definitions, then extend with strict, versioned companions.

- Store this module in `fitness-os-recovery-sleep-mobility`, database version 2, with the ten specified `phase12_*` stores. Version 2 adds started-time/deletion indexes without clearing version 1 data; backup format remains 1.0.0. Existing module databases remain independent; the aggregate backup adapter must include this owner.
- Add custom routine identities, immutable session snapshots, explicit player state, active seconds, pause/step state and revision reasons. A historical session never follows the identity's latest version.
- Device duration is a separately labelled estimate. Reject device stages rather than deriving diagnoses or silently mixing device duration with diary arithmetic.
- Exact timestamps can contain seconds. Preserve calculated fractional minutes rather than rounding away seconds merely to satisfy the supplied integer calculated fields. Canonical player durations are seconds and distances metres.
- Add stable tombstone IDs and validated record snapshots for undo; import conflict records and derived summaries are disposable local indexes. Include identities and tombstone snapshots in backup so restore can preserve relationships.
- Soreness uses the existing Phase 02 canonical region IDs, not the informal reference aliases. Whole-body reporting selects multiple explicit regions; do not introduce fabricated anatomy IDs.
- Settings are a strict typed record, not arbitrary executable or unbounded data. No module-scope browser globals.
- Source URLs in the reference file are editorial leads, not verified claims. The 124 seeds have no completed claim/source/review records and remain draft. Do not generate their factual content or invent review metadata.

These are implementation resolutions within the owner's standing authorization for sequential Phases 00–18. No account, remote personal storage or automated training prescription is introduced.
