# Nutrition backup and restore

Export requires explicit user action. JSON format fitness-os-nutrition-backup, schemaVersion 1, contains preferences plus days, foodEntries, hydrationEntries, customFoods, customFoodRevisions, favourites and auditLog. Derived totals and recent-food views are excluded. No CSV is claimed to be a restorable backup.

The five CSV exports cover food entries with nutrient/source/status snapshots, daily energy/macros, all daily nutrients with coverage, hydration and custom-food revisions. Formula-leading cells are escaped and quoted. Missing amounts stay blank with their state; zero remains numeric.

Import is local, limited to 20 MB and parsed through strict schemas before any write. Unknown fields, unsupported versions, duplicate identities, invalid units/dates/zones, dangling custom revisions/day owners and inconsistent scaled quantities fail validation. A preview reports new, identical and conflicting identities. Confirmation precedes atomic restore.

Keep-existing mode retains existing identities and frozen day targets. Preferences stay unchanged unless the preview's explicit import-preferences checkbox is selected. A conflicting imported custom graph that would produce inconsistent references aborts rather than partially merging. Import-copy mode remaps the imported custom-food/revision/entry/favourite graph, retaining historical nutrient values and existing day snapshots on date collisions. The complete merged graph validates inside the transaction. A failure preserves all previous records and leaves the preview available for correction.

Rebuildable day caches regenerate with changed entries. JSON export should precede permanent deletion or site-data clearing. The nutrition purge never clears workout stores or saved diet plans.

If malformed local records prevent normal reads, the workspace offers an explicit raw recovery export. That format is deliberately not accepted as a validated nutrition backup. Preserve the file, repair its records and pass validation before importing; no automatic destructive repair is performed.
