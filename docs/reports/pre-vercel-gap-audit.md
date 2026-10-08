# Pre-Vercel implementation gap audit

Audited implementation: `52102ad39cfc5c6e8e2ecb81db4eacde117fce7d`. Final pre-Vercel application completion; frozen verified subset; no deployment, cleanup, deletion or content expansion.

Final test evidence is recorded in final-pre-vercel-readiness.json. This inventory describes implementation and retained limitations; it does not inherit old test results.

| Module | Feature | Status | Evidence / reason |
| --- | --- | --- | --- |
| Foundation | application shell | implemented | tests/browser/foundation.spec.ts |
| Foundation | navigation | implemented | tests/browser/foundation.spec.ts |
| Foundation | responsive layouts | implemented | tests/browser/foundation.spec.ts |
| Foundation | theme | implemented | tests/browser/foundation.spec.ts |
| Foundation | error boundaries | implemented | tests/browser/foundation.spec.ts |
| Foundation | loading states | implemented | tests/browser/foundation.spec.ts |
| Foundation | 404 | implemented | tests/browser/foundation.spec.ts |
| Foundation | canonical routes | implemented | tests/browser/foundation.spec.ts |
| Foundation | metadata | implemented | tests/browser/foundation.spec.ts |
| Training | muscles | implemented | tests/browser/workout.spec.ts |
| Training | exercises | implemented | tests/browser/workout.spec.ts |
| Training | workout science | implemented | tests/browser/workout.spec.ts |
| Training | workout programs | implemented | tests/browser/workout.spec.ts |
| Training | program finder | implemented | tests/browser/workout.spec.ts |
| Training | workout tracking | implemented | tests/browser/workout.spec.ts |
| Training | history | implemented | tests/browser/workout.spec.ts |
| Training | previous performance | implemented | tests/browser/workout.spec.ts |
| Training | timers | implemented | tests/browser/workout.spec.ts |
| Training | PR handling | implemented | tests/browser/workout.spec.ts |
| Training | edits/deletes | implemented | tests/browser/workout.spec.ts |
| Training | exports | implemented | tests/browser/workout.spec.ts |
| Nutrition | foods | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | food preparations | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | nutrient encyclopedia | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | diet calculator | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | target storage | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | nutrition diary | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | serving conversion | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | custom foods | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | quick add | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | hydration | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | recipes | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | meal plans | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | grocery lists | implemented | tests/browser/nutrition.spec.ts |
| Nutrition | consumption snapshots | implemented | tests/browser/nutrition.spec.ts |
| Recovery | sleep | implemented | tests/browser/recovery.spec.ts |
| Recovery | recovery check-ins | implemented | tests/browser/recovery.spec.ts |
| Recovery | soreness | implemented | tests/browser/recovery.spec.ts |
| Recovery | pain/illness separation | implemented | tests/browser/recovery.spec.ts |
| Recovery | mobility | implemented | tests/browser/recovery.spec.ts |
| Recovery | routines | implemented | tests/browser/recovery.spec.ts |
| Cardio | cardio education | implemented | tests/browser/cardio.spec.ts |
| Cardio | plans | implemented | tests/browser/cardio.spec.ts |
| Cardio | sessions | implemented | tests/browser/cardio.spec.ts |
| Cardio | intervals | implemented | tests/browser/cardio.spec.ts |
| Cardio | distance | implemented | tests/browser/cardio.spec.ts |
| Cardio | HR | implemented | tests/browser/cardio.spec.ts |
| Cardio | effort | implemented | tests/browser/cardio.spec.ts |
| Cardio | laps | implemented | tests/browser/cardio.spec.ts |
| Cardio | history | implemented | tests/browser/cardio.spec.ts |
| Supplements | ingredient evidence | implemented | tests/browser/supplements.spec.ts |
| Supplements | product labels | implemented | tests/browser/supplements.spec.ts |
| Supplements | immutable label versions | implemented | tests/browser/supplements.spec.ts |
| Supplements | intake records | implemented | tests/browser/supplements.spec.ts |
| Supplements | trials | implemented | tests/browser/supplements.spec.ts |
| Supplements | adverse events | implemented | tests/browser/supplements.spec.ts |
| Supplements | safety flags | implemented | tests/browser/supplements.spec.ts |
| Progress | body measurements | implemented | tests/browser/progress.spec.ts |
| Progress | body weight | implemented | tests/browser/progress.spec.ts |
| Progress | trends | implemented | tests/browser/progress.spec.ts |
| Progress | circumference | implemented | tests/browser/progress.spec.ts |
| Progress | external body-composition estimates | implemented | tests/browser/progress.spec.ts |
| Progress | progress photos | implemented | tests/browser/progress.spec.ts |
| Progress | analytics dashboard | implemented | tests/browser/progress.spec.ts |
| Global systems | search | implemented | tests/browser/manual-test-ready.spec.ts |
| Global systems | favourites | implemented | tests/browser/manual-test-ready.spec.ts |
| Global systems | collections | implemented | tests/browser/manual-test-ready.spec.ts |
| Global systems | comparisons | implemented | tests/browser/manual-test-ready.spec.ts |
| Global systems | recent activity | implemented | tests/browser/manual-test-ready.spec.ts |
| Global systems | local settings | implemented | tests/browser/manual-test-ready.spec.ts |
| Global systems | global backup | implemented | tests/browser/manual-test-ready.spec.ts |
| Global systems | restore | implemented | tests/browser/manual-test-ready.spec.ts |
| Global systems | CSV | implemented | tests/browser/manual-test-ready.spec.ts |
| Global systems | privacy | implemented | tests/browser/manual-test-ready.spec.ts |
| Global systems | migrations | implemented | tests/browser/manual-test-ready.spec.ts |
| Global systems | global import-as-copy | intentionally unavailable | No verified cross-module stable-ID remapper; UI explicitly disables this mode. Owning module copy modes remain available. |
| Global systems | encrypted backups | intentionally unavailable | Optional profile deferred; UI explicitly states files are not encrypted or authenticated. |
| Global systems | globally atomic multi-database restore | intentionally unavailable | Browser limitation; durable before-image, automatic rollback and explicit recovery are implemented. |
| Progress | photo ZIP import | intentionally unavailable | Separate ZIP is an export; explicit global full-media JSON provides tested restoration. Portable JSON excludes binaries. |
| Foundation | accounts, cloud sync, analytics, payments and runtime fitness APIs | intentionally unavailable | Prohibited by project contract. |
| Owner verification | Real Android | manual-test-only | Owner/device check |
| Owner verification | Real iPhone/iPad | manual-test-only | Owner/device check |
| Owner verification | Human screen readers and visual contrast judgement | manual-test-only | Owner/device check |
| Owner verification | Native OS file pickers | manual-test-only | Owner/device check |
| Owner verification | Print | manual-test-only | Owner/device check |
| Owner verification | Owner's real workouts, nutrition and backup on the stable deployed origin | manual-test-only | Owner/device check |
| Owner verification | Vercel Preview and production DNS/TLS/headers/smoke tests | manual-test-only | Owner/device check |
| exercises | Unpublished identities | future content backlog | 152 retained draft identities |
| workout-science | Unpublished identities | future content backlog | 66 retained draft identities |
| programs | Unpublished identities | future content backlog | 46 retained draft identities |
| foods | Unpublished identities | future content backlog | 78 retained draft identities |
| recovery | Unpublished identities | future content backlog | 109 retained draft identities |
| cardio | Unpublished identities | future content backlog | 189 retained draft identities |
| supplements | Unpublished identities | future content backlog | 260 retained draft identities |

## Defects corrected

- A blocked IndexedDB clear rejected even though its uncancellable deletion remained queued; the confirmed operation now stays pending with explicit close-tabs feedback.
- WebKit could retain an identical file selection across document navigation and omit the change event; restore releases the picker selection after capturing each File.
- A large backup export could exceed its own restore byte limit; export now rejects that size before download with module/media guidance.
- Global restore file controls were available before React hydration and during a restore; they now wait for hydration and prevent overlapping selection.
- Windows WebKit rejected native Blob storage; sanitized byte storage now preserves old Blob reads and versioned full-media archive portability.
- Serial backup reads and integrity checks imposed avoidable browser waits; independent readonly reads and hashes now run concurrently.
- New safety validators exceeded the unchanged bundle budget; tree shaking and route-family wrapper grouping restore headroom without removing features.
- Blocked main/recovery upgrade requests could migrate after their promise rejected; cancelled upgrades now abort and recovery connections close on version changes.
- Backups claimed to exclude active-workout pointers but included the IndexedDB pointer; new exports exclude it and legacy imports ignore it with guidance.
- Fresh-profile global restore required visiting every owning module; one guided preparation action now calls owning migrations.
- Preview could initialize the main database; all preview opens now abort upgrades and write no canonical records.
- Malformed global envelopes could crash preview rendering; failed envelope results use a safe heading/summary.
- Global restore omitted owning row and resulting-module validation, including relationships and cached immutable calculations.
- Duplicate target stores, inconsistent schema versions, record counts and unsupported serializer/registry/module versions were not rejected.
- A synchronous restore write error could leave queued writes alive; transactions now explicitly abort and close on failure.
- Partial multi-database failure left recovery solely to the user; automatic before-image rollback is attempted and durable recovery retained on failure.
- Keep-existing overwrote shell preferences; existing preferences now survive.
- Global file reading/decompression and photo file sizes lacked byte bounds.
- Imported media lacked signature/metadata/checksum/dimension and binary-manifest validation.
- Full-media plus gzip produced an ambiguous portable profile; the UI separates the supported formats.
- Search result/module labels exposed phase numbers; product names now replace those labels.
- Comparison copy named the coding agent outside methodology; it now describes machine review.
- Cross-browser push triggers omitted the finalization branch; the final branch now receives the hosted matrix.

## Boundaries

- No independent human or clinical review is claimed.
- Unknown legacy stores remain opaque and preserved; no invented schema is assigned to them.
- No universal claim that software has no undiscovered bugs or that automation proves WCAG compliance.

The JSON retains hashes of the supplied Phase 00–18 contracts; Phase 19 decisions, handoffs and historical completion reports remain in the repository.
