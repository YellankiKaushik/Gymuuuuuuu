# Phase 13 normative schema companions

The supplied schema defines base session and version fields but omits the identities, complete frozen source plans, player state, edit revision history and undo snapshots required by its accompanying specification. Preserve its base fields and add strict, versioned companions. Unknown keys are rejected before any import writes; raw database recovery can export unknown or damaged stored data.

Use an isolated `fitness-os-cardio-conditioning` IndexedDB database. Its ten stores follow the specification's names. Local versions retain immutable IDs; identity records point to their current version. Sessions freeze prescriptions, method inputs and original completed records. Audited corrections do not rewrite those historical snapshots. No records are sent to the server.

Normative duration integers are supplemented by exact fractional timestamp seconds, rather than rounding the timer's source measurements. Canonical distances remain metres with an exact mile of 1609.344 metres. Rounded values are display values only.

Heart-rate calculators accept explicitly selected user fractions, not universal training zones. Tanaka is an optional age estimate with a source and warning. Medication/medical-context caution disables HR targeting. Missing measurements are null. Device HR remains an estimate. No calorie, VO₂max, fitness-age or diet-adjustment fields are introduced.

Engineering source verification on 2026-10-05 confirms CDC's measuring-intensity page, Tanaka's indexed PubMed abstract and the WHO/HHS adult activity guidance for the narrow calculation contracts. This is not clinical editorial approval of draft articles or plans. Source registry dates supplied in the reference file remain unchanged.

Guideline-equivalent minutes apply only to adult aerobic public-health volume: moderate minutes plus twice vigorous minutes. They do not represent training load, fatigue or calorie expenditure. Unclassified minutes remain separate; no minimum bout is imposed.
