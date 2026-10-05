# Phase 13 acceptance evidence

Synthetic test values are confined to tests and private browser contexts. No test writes to the owner's regular browser data.

| Check | Evidence |
| --- | --- |
| Reference arithmetic | Exact 5 km / 25 min and mile / 8 min pace; Tanaka age 40; HRR 60/190 with 0.5/0.7; adult 90+2×30 equivalence; interval final recovery; missing values; no calorie/VO₂max model; urgent-stop continuation suppressed. |
| Timing and versions | Fractional timestamp seconds, pauses/background time, skipped segments, ending twice rejected, immutable source versions and originals, current-version lineage, independent laps and no double counting. |
| Storage/import | Stale revision, other-tab lease, disabled tracking, queued-clear/write failure abort, invalid/unknown records isolated, raw export and valid replacement repair, soft-delete/undo, keep/copy ID graphs and original sources preserved. |
| Unit/foundation checks | Final `npm run check`: strict typecheck, lint, 154 tests in 28 files and production build. One earlier recipe performance test timed out while browser tests ran concurrently; the complete suite subsequently passed with the browser run stopped. |
| Route layout/accessibility | All 22 routes at 320, 768 and 1440 pixels in light and dark: 132 route/width/theme combinations with axe, one H1 and no page overflow. |
| Browser workflows | Manual entry, sourced device HR, successive audited corrections, routine intervals, plan selection/week/version, HR target freeze, refresh, offline player controls, urgent stop, lap capture, JSON preview/copy and CSV download. |
| Regression | Full project browser run: 34 passed; an existing exercise hydration assertion timed out during parallel startup, then passed unchanged on focused rerun. Additional populated plan workflow passed after waiting for its loaded version options. |
| Privacy | Actual saved synthetic titles/notes absent from fresh server HTML and metadata; no canonical personal URL; noindex/nofollow. No external runtime fitness requests. |
| Input/failure states | Keyboard focus, reduced motion, 320×568 / 390×844 / 768×1024 / 1366×768 / 1440×900, quota denial preserves form input, denied IndexedDB leaves an editable unsaved draft and a clear error. |

Physical screen-reader, high-contrast and non-Chromium engine checks remain manual release checks; they are not claimed as automated passes. Full offline page navigation is a later-phase responsibility; an already-loaded player and browser storage work offline. Reviewed public knowledge remains gated, with no fabricated prescriptions or reviewer approvals.
