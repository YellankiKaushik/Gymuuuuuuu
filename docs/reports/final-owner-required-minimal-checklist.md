# Minimal owner-required checklist

Automatable engineering: **43/43 = 100%**. Former owner technical portions: **14/14 = 100%**. Full release checklist: **43/52 = 82.69%**. Equal-weight task accounting: 29 established engineering checkpoints plus 14 technical former-owner portions = 43 automated checkpoints. Nine separately stated irreducible physical/human boundaries remain, so 43/52 = 82.69%. This refinement changes the old category denominator; it is not certification or universal test coverage. Optional repository policy, prohibited/unsupported features and 900 frozen identities are excluded. A proxy completion never means its physical/human boundary passed.

Completion assertions take effect only at the verified annotated `fitness-os-maximum-autonomy-complete` tag after final main CI passes. Before tagging, these are release-candidate reports. Exact final SHA and CI run IDs are recorded in that tag annotation and the final handoff.

Only the following nine physical/human boundaries remain. Use disposable records for device checks; actual personal data stays private. Automation has completed all technical parts of the old fourteen categories.

## PHYSICAL-ANDROID: Physical Android

OWNER_PHYSICAL_REQUIRED. Why: No attached physical Android or credential-free device service is available. Emulation cannot operate real hardware or its keyboard.

Steps: On Android Chrome at the stable origin, save a disposable workout, nutrition and photo; rotate; use the software keyboard; close/reopen; export and preview a backup.

Pass: Controls remain touchable; keyboard does not obscure required actions; exact records survive reopening.

Failure severity: P1 for data loss; P2 for layout or input failure.

## PHYSICAL-IPHONE: Physical iPhone

OWNER_PHYSICAL_REQUIRED. Why: Desktop WebKit emulation is not physical iOS Safari.

Steps: On iPhone Safari in normal mode repeat disposable workout, nutrition, photo and restore-preview flows; rotate; scroll while the software keyboard is open; close/reopen.

Pass: Navigation and keyboard remain usable; records/media persist; export and preview work.

Failure severity: P1 for data loss; P2 for layout or input failure.

## PHYSICAL-TABLET: Physical tablet

OWNER_PHYSICAL_REQUIRED. Why: No physical tablet is attached; split-view viewport simulation cannot reproduce OS window management.

Steps: On iPad Safari or Android tablet rotate, enter split view, browse food/exercise detail and comparison; open search/backup dialogs and export a disposable backup.

Pass: Tables scroll in intended regions; dialogs and required actions fit; touch works.

Failure severity: P2.

## PHYSICAL-EVICTION: Real OS storage behavior over time

OWNER_PHYSICAL_REQUIRED. Why: Application failure simulations cannot force or certify the real OS eviction/persistence policy over time.

Steps: Keep an external disposable backup; inspect storage health on the target browser; revisit after normal device use. Clear only disposable site data, prepare storage and restore the disposable backup.

Pass: Any storage limitation has honest feedback; independent backup restores exact records.

Failure severity: P1 if recovery fails.

## HUMAN-AT: Assistive technology auditory experience

OWNER_HUMAN_REQUIRED. Why: ARIA trees and axe cannot hear or judge NVDA, VoiceOver or TalkBack announcements.

Steps: With the chosen screen reader navigate headings/landmarks; complete a disposable workout/diary save; trigger an invalid restore; open/close search and review a comparison table.

Pass: Names, values, errors and save announcements are understandable; core actions are reachable.

Failure severity: P1 if a core flow is inaccessible; otherwise P2.

## HUMAN-COMFORT: Visual, keyboard, zoom and print comfort

OWNER_HUMAN_REQUIRED. Why: Automation measures focus, geometry, semantics and PDFs; personal readability and interaction comfort require human perception.

Steps: Try light/dark and reduced motion; keyboard-only search/forms; actual browser 200%/400% zoom and larger text; inspect the four print examples and a realistic disposable session.

Pass: Owner can read and operate the flows comfortably, recognize unknown/estimated values and read units/sources in print.

Failure severity: P2 for a reproducible usability barrier.

## HUMAN-PICKERS: Native OS file/photo/save experience

OWNER_HUMAN_REQUIRED. Why: Playwright operates file input delivery/downloads and simulates save cancellation; it cannot judge native OS chooser presentation or permission UX.

Steps: Cancel then reopen native backup and photo pickers; choose disposable JPEG/PNG/WebP; save backup/CSV and locate files; confirm cancellation changes no records.

Pass: Native chooser works and can reopen; files are locatable; cancellation preserves data.

Failure severity: P1 for lost data or unusable backup; otherwise P2.

## HUMAN-PERSONAL: Actual personal-data transition

OWNER_HUMAN_REQUIRED. Why: Owner actual records are intentionally never accessed or fabricated.

Steps: Create a private external backup; verify the stable production origin; optionally remove synthetic entries using confirmation; enter a small actual workout/diary/measurement privately; edit/reload; export and verify a fresh disposable-profile restore.

Pass: Owner privately confirms exact dates, units, values and immutable snapshots; recovery matches.

Failure severity: P1.

## HUMAN-CUSTODY: Choose private external backup custody

OWNER_HUMAN_REQUIRED. Why: An independent test-directory copy proves technical restoration, not the owner choice or privacy of an external storage location.

Steps: Choose owner-controlled private external storage; keep portable and explicit full-media backups as needed; restrict access; retain an independent copy; perform the documented disposable-profile restore drill.

Pass: At least one recoverable copy exists outside the browser at a private owner-chosen location.

Failure severity: P1 if no recoverable independent copy exists.

## Optional external policy

Repository administration changes were not authorized by this task; read-only inspection found unprotected main and no rulesets. Owner may choose Settings → Rules → protect main with the project CI checks and review policy. EXTERNAL_POLICY; optional governance, not an application defect.
