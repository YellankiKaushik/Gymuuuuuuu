# Final pre-Vercel portability safety

The owner's finalization request freezes public content and prohibits tracked-file
deletion, cleanup, history rewriting and production deployment. The safety tag
preserves `684345c41207c2d54044e79be52c42a303bfee90` before this pass.

Global restore previously relied on manually opening owning routes and did not
invoke all available owning record validators. The restore screen now offers one
explicit **Prepare local storage** action. It dynamically calls each owning
database's existing initializer and closes its connections. It preserves existing
records and schemas. File preview never initializes a database: missing targets
are safely rejected with preparation guidance. This deliberately separates schema
migration from the zero-write preview guarantee; selecting an invalid archive
cannot initiate migrations.

Preview validates archive versions, duplicate target stores/record IDs, counts,
payload/store/record hashes, allowed preferences, target versions, primary keys and
owning schemas. Restore assembles the resulting records for keep-existing/replace
and runs nutrition, saved-reference, recipe, recovery, cardio and supplement owner
validators before journal creation or canonical writes. Unknown legacy stores are
preserved opaquely; operational journals, timers and derived caches cannot be
restored from an archive. No unverified ID remapper is introduced: global
import-as-copy remains explicitly unavailable.

Write transactions register completion before queuing writes and explicitly abort
on synchronous errors. A failed multi-database operation attempts rollback from its
durable before-image automatically. If rollback also fails (for example storage
remains inaccessible), the journal remains available to Data health for explicit
recovery. Independent browser databases still cannot provide global atomicity.
Keep-existing also preserves existing small preferences. Native locking and the
existing fallback lease remain in place; module editors still require their normal
stale-record protections. Close other tabs before destructive restore.

Global file reading is capped at 100 MiB for compressed and decompressed input.
Progress-photo selection and sanitized output are capped at 10 MiB, retaining the
existing pixel limit and canvas re-encoding that removes original metadata. Limits
are product validation rules, not relaxed verification budgets. Very large backups
should use selected modules and separate explicit photo exports.

Cross-browser CI includes the finalization branch. Existing assertions, coverage,
timeouts, route checks and performance limits are retained. Historical reports
remain intact; final evidence must bind to the new tested commit and build.


## Cross-browser photo representation

Sanitized images use Uint8Array bytes in IndexedDB. Windows WebKit rejects native
Blob writes with UnknownError. Reads reconstruct a Blob and continue accepting
existing native Blob records. Global full-media archives retain their versioned
Blob encoding, checksums and explicit opt-in; restore converts that encoding to
bytes before writes. Portable archives continue excluding image binaries.

Backup store reads run concurrently, with transaction completion handlers installed
before requests. This avoids serial empty-store waits without weakening integrity
checks, preview isolation or transaction boundaries.


## Browser action lifecycle

Restore controls wait for React hydration and disable file selection while busy.
Each selection releases its native picker value after capturing the File so
WebKit can reselect the same archive. Restore displays an explicit in-progress
message. Backup delivery rejects files above the same 100 MiB uncompressed
restore limit, rather than exporting an archive this version cannot reopen.

A confirmed IndexedDB deletion cannot be cancelled after it is queued. A blocked
clear therefore remains pending with close-tabs guidance instead of reporting
failure and silently deleting later. A regression verifies the pending state
and completion after the blocking connection closes. Clear still requires the
backup choice and exact typed confirmation.

The synthetic portability journey has separate creation/export and fresh-profile
restore cases in one serial group. It carries only an in-memory synthetic archive
between cases; all record/hash/privacy assertions and existing timeouts remain.
