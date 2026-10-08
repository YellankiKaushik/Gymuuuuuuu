# Final product pass

The verified content subset remains frozen. Changes connect existing capabilities
and correct current UX and integrity defects; no new factual identities are added.

- Long science source IDs wrap within their cards using overflow-wrap:anywhere
  and max-width:100%. Stored IDs and evidence are unchanged; overflow is not clipped.
- Global restore file reads and preview completions carry a generation token.
  A newer selection or route disposal invalidates earlier work. The selected
  archive becomes restorable only after its own preview completes. Selection is
  disabled during a restore. A delayed-read regression preserves the newest error.
- Global data-management operations own independent IndexedDB connections rather
  than closing the shared module connection during concurrent inventory/export.
  Preview reuses each owned connection across its stores and closes it once. A
  unit concurrency regression checks both exports and the still-usable module
  connection. The WebKit journey caught the original closing-connection race;
  fixed Chromium/WebKit recipe, restore and stale-file cases pass 6/6.
- Data-management breadcrumbs now resolve their eight existing routes instead of
  displaying Page not found. Normal screens omit phase numbers and clarify that
  exercise publication is source-backed, without implying independent human review.
- Home exposes nutrition logging, diet planning and cardio alongside existing links.
- Public recipes support an explicit local copy into the existing immutable recipe
  workflow. Ingredient/source snapshots and estimated yield are retained. The copy
  can be scaled, revised and explicitly logged; viewing or copying does not log food.
  The browser regression compares source snapshots and checks a consumed diary entry.
- Search is explicitly regenerated once after the freeze. Check/prebuild now verify
  the complete deterministic output without writing or changing its manifest date.
  Stale assets fail instead of being silently rebuilt during final verification.
- Final route artifacts include audited Git commit, search manifest, production
  build timestamp and server-entry SHA-256. The strict report rejects missing build
  bindings as well as failed/unmeasured routes.

Synthetic portability uses a separate clean browser context, initializes versioned
schemas through owning routes, previews without imported records, confirms replace,
compares restored record values/hashes and rejects a corrupt archive. Fresh schemas
contain legitimate app metadata, so they are not assumed to have zero rows in every
store. Native OS file-picker interaction remains manual; automation exercises the
documented download fallback. An initial test used the wrong button label; another
left sleep before its schema initialized. Both fixtures were corrected without
timeouts, retries or weaker integrity checks.

Twenty major workspaces are checked at 320, 375, 393, 768, 1024, 1280 and 1440px in
both themes. Existing workout, program, diet, nutrition, recipe, recovery, cardio,
progress, search/collections/comparison, backup and migration suites are retained.
Print, real devices and human screen-reader behavior remain owner testing.
