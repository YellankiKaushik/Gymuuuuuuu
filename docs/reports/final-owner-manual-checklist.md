# Final owner manual checklist

All 14 categories are **OWNER_MANUAL_REQUIRED** on https://kaush-ka-gym.vercel.app. Automation did not complete these tasks. Use synthetic data first and keep private backups outside browser storage. Severity below applies if the task fails; it is not an observed engineering defect.

## OWNER-01: Physical Android

- Device/environment: Android Chrome at the stable production origin
- Exact steps: Open home/search/workout/nutrition/backup; use portrait and landscape; save synthetic workout and diary records; reload and revisit history.
- Pass: All controls readable and touchable; records survive reload.
- Failure: Clipped controls, touch failures, lost saves or console errors.
- Severity if failed: P1 if data loss; otherwise P2

## OWNER-02: Physical iPhone

- Device/environment: iPhone Safari, normal browsing
- Exact steps: Repeat workout/diary/backup flows; rotate; scroll with keyboard open; reload saved synthetic records.
- Pass: Navigation, keyboard and persistence work without blocked controls.
- Failure: Keyboard obscures submit, page jumps, inaccessible actions or lost records.
- Severity if failed: P1 if data loss; otherwise P2

## OWNER-03: Physical iPad/tablet

- Device/environment: Physical iPad Safari or Android tablet
- Exact steps: Use split view and rotation; browse food/exercise detail; open filters, comparison and backup dialogs.
- Pass: Tables scroll, dialogs fit and navigation stays usable.
- Failure: Overlapping navigation, trapped scroll or clipped actions.
- Severity if failed: P2

## OWNER-04: Real desktop workflow

- Device/environment: Owner desktop browser/profile on production
- Exact steps: Start a synthetic workout; log a set; finish; log nutrition; review history/dashboard; open a second tab and reload.
- Pass: Saved feedback matches persisted records and tab state.
- Failure: Stale records, duplicate saves, incorrect history or lost edits.
- Severity if failed: P1 if data loss; otherwise P2

## OWNER-05: Native file picker and save

- Device/environment: Desktop and mobile native OS dialogs
- Exact steps: Open /settings/data/backup and click Create backup file; open /settings/data/export and click Export spreadsheet-safe CSV; locate both saved files; on /settings/data/restore cancel and reopen Backup file; select the backup and inspect preview without confirming restore.
- Pass: Files are usable; cancellation changes no records; preview shows expected counts.
- Failure: Picker cannot reopen, truncated download, cancellation writes or missing file.
- Severity if failed: P1

## OWNER-06: Native photo picker

- Device/environment: Android/iOS photo picker with disposable photo
- Exact steps: Open /progress/photos; use Image file to choose a disposable image; click Sanitize and save photo; reload; cancel a second selection; on /settings/data/backup explicitly choose full media and Create backup file; remove the photo using its confirmation.
- Pass: Image persists locally; cancellation preserves it; backup includes sanitized image when explicitly selected.
- Failure: Wrong photo, missing image, failed save or unexpected network upload.
- Severity if failed: P1 for loss/upload; otherwise P2

## OWNER-07: Storage quota/eviction/persistence

- Device/environment: Owner browsers including Safari/private-mode behavior
- Exact steps: In a disposable profile inspect storage-health/persistence; exercise restricted storage; keep an external backup; clear only disposable site data; prepare storage and restore.
- Pass: Unavailable storage has honest feedback; restore recovers records; eviction risks understood.
- Failure: False success, silent data loss, blocked storage without guidance or unusable recovery.
- Severity if failed: P1

## OWNER-08: Human keyboard evaluation

- Device/environment: Desktop keyboard without mouse
- Exact steps: Tab through navigation/search/forms; open/close dialogs; use Escape; submit and correct invalid inputs; inspect focus after actions.
- Pass: Visible focus and logical order; no trap; dialog returns focus.
- Failure: Invisible focus, unreachable controls, trapped focus or unclear errors.
- Severity if failed: P2; P1 if core flow unusable

## OWNER-09: Human screen reader

- Device/environment: NVDA/Firefox or Chrome; VoiceOver/Safari; TalkBack if available
- Exact steps: Read home, workout, diary, comparison and backup; navigate landmarks/headings; trigger validation and save; inspect dialogs/table captions.
- Pass: Names, values, errors and status updates are understandable; all core actions reachable.
- Failure: Unlabelled fields, silent errors/saves, incorrect dialog focus or unusable tables.
- Severity if failed: P1 if core flow inaccessible; otherwise P2

## OWNER-10: Human zoom and reflow

- Device/environment: Desktop 200%/400% zoom plus mobile larger text
- Exact steps: Increase zoom/text; inspect search, food detail, calculator, history and restore; keep keyboard focus visible.
- Pass: Text and actions remain usable; only intended table regions scroll sideways.
- Failure: Clipped text/actions, page-wide overflow or missing focused control.
- Severity if failed: P2

## OWNER-11: Human print review

- Device/environment: Desktop print preview/PDF and printer if available
- Exact steps: Preview public exercise/food/recipe pages and a disposable local summary; inspect page breaks, sources, units and privacy before saving/printing.
- Pass: Readable output preserves context and sources; chosen private output is intentional.
- Failure: Missing units/sources, truncated records, unreadable contrast or unexpected private output.
- Severity if failed: P2

## OWNER-12: Subjective usability and visual review

- Device/environment: Owner devices, light/dark themes, reduced motion
- Exact steps: Run one realistic synthetic session; inspect labels, empty/error states, feedback, touch targets and motion in both themes.
- Pass: Owner can complete flows and distinguish unavailable, unknown and estimated values.
- Failure: Misleading feedback, ambiguous control, painful contrast or distracting motion.
- Severity if failed: P2

## OWNER-13: Real personal-data workflow

- Device/environment: Stable origin and owner-controlled normal profile after synthetic tests pass
- Exact steps: Keep an external backup first; enter a small real workout/diary/measurement; edit and reload; export; inspect exact values privately.
- Pass: Actual values, dates, units and immutable snapshots match the owner’s entries.
- Failure: Incorrect conversion/date, overwritten snapshot, unexpected sharing or lost record.
- Severity if failed: P1

## OWNER-14: Backup custody and independent restore drill

- Device/environment: Private external storage and separate disposable browser profile
- Exact steps: On /settings/data/backup click Create backup file for portable and explicit full-media profiles as needed; copy files outside browser; in a fresh disposable profile open /settings/data/restore and click Prepare local storage; select Backup file; compare preview counts; confirm Replace matching stores only in that disposable profile; reload and compare exact records/media; retain original files privately.
- Pass: Owner can recover exact records/media and keep unencrypted files private.
- Failure: Only browser copy exists, unreadable file, count mismatch, missing media or public exposure.
- Severity if failed: P1

Optional governance: the owner should protect main with required checks/review. No repository settings were changed.
