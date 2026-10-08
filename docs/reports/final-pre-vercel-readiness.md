# Final pre-Vercel readiness

Engineering status: **ready for owner-controlled Vercel Preview**. Production, Preview, DNS and TLS actions were not performed.

Verified implementation: `52102ad39cfc5c6e8e2ecb81db4eacde117fce7d`. All fresh clean-clone and hosted results below bind to this commit. Final documentation/evidence descendants must preserve execution tree SHA-256 `706ec0d1d4953464dfce471474b559df20b5a58cfba7db8b9171f4f6ffaf17f2`. Historical passes are not inherited.

## Observed checks

| Check | Result |
| --- | --- |
| Clean npm ci / check / build / privacy | Passed |
| Units | 352/352, 94 files |
| Coverage | Statements 72.87%, branches 64.63%, functions 67.37%, lines 76.78% |
| Local Windows Chromium / WebKit | 284/284 each |
| Hosted Linux Chromium / Firefox / WebKit | 284/284 each |
| Separate hosted accessibility | 184/184 |
| Complete current-build route audit | 702/702; 0 failed/unmeasured |
| Dependency audit | 0 vulnerabilities |
| Secret-pattern scan | 1248 tracked + 289 public bundle files; 0 matches |
| JavaScript budget | 700418 / 716800 bytes gzip; largest 168459 / 204800 |
| Public JSON | 97 assets, 429517 bytes gzip; largest 59287 |
| Vercel package-only build | Node.js 24 output generated; no deployment |

## Frozen application and content

Shell/navigation/themes, training libraries/programs/workouts, food/nutrient/diet/nutrition tools, recipes/meal planning, recovery/sleep/mobility, cardio, supplement records, progress/photos/dashboard, search/saved systems and global data management are operational within the verified subset. Detailed feature states and retained limitations are in [the gap audit](pre-vercel-gap-audit.md).

| Content | Published |
| --- | ---: |
| muscles | 70 |
| exercises | 32 |
| workout-science | 32 |
| programs | 4 |
| foods | 264 |
| nutrients | 51 |
| recipes | 24 |
| meal-templates | 3 |
| recovery | 15 |
| cardio | 13 |
| supplements | 12 |
| foodProfiles | 273 |
| factualRecords | 520 |
| searchDocuments | 648 |
| backlog | 900 |

The public content and search hashes remain unchanged. No independent human/clinical review is claimed. Backlog is preserved; no content-expansion work was started.

## Corrected defects

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

## Security, privacy and data safety

Nonce CSP, React text escaping, validated imports, spreadsheet-safe CSV and readonly pinned-action workflows remain in place. Browser network/SSR checks retain zero unexpected remote requests and zero synthetic personal-marker leaks. Private records stay in IndexedDB; small preferences stay in localStorage. Photo metadata stripping, legacy Blob compatibility, portable exclusions and explicit full-media restore pass.

Fresh-profile preparation calls owning migrations. Preview performs zero canonical writes. Corrupt, duplicate, future-format and invalid-row imports fail before writes. Keep-existing preserves preferences. Confirmed replacement validates the resulting module and journals before-images. Injected partial-write failure rolls back; blocked rollback retains explicit recovery. No global multi-database atomicity or universal bug-free claim is made.

## Fitness safety and owner checks

Adult diet eligibility/formula disclosures, BMI context, external body-composition estimates, soreness/pain/illness separation, sleep/device labels, cardio estimate/stop labels and conservative supplement/adverse-event handling pass their relevant checks. No new diagnosis, health score, calorie credit, efficacy guarantee, prescription or causal trial conclusion was introduced.

Remaining owner work: real-device and screen-reader/keyboard/print use; OS file picker and real storage quota/persistence/eviction; private external backup custody; owner-controlled Preview followed by stable-origin, HTTPS headers, canonical, DNS/TLS and production smoke checks. Existing unsupported encryption, global copy/remapping and ZIP import stay explicitly unavailable.

Follow [the owner deployment runbook](../runbooks/vercel-owner-deployment.md). Git deployment is disabled. Origin/profile changes do not automatically transfer local data.

**Production deployment was NOT performed. Fitness OS is ready for the owner-controlled Vercel Preview and deployment stage.**
