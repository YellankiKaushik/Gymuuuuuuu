# Design reference integration — October 17, 2026

## Outcome and scope

Both required repositories were analyzed before implementation. The project's
existing shell, shared primitives, CSS import order, current phase decisions,
Progress schema and restore preparation flow informed the integration. The
supporting research report was read as background rather than owner instructions.
Reference links and original project rules are in root [DESIGN.md](../../DESIGN.md).

The user journey is Home → public search/comparison or optional local tracking →
visible saved feedback and reload → separate backup/restore controls. Presentation
improvements preserve those boundaries. No server-side personal-data path is
introduced; no new environment variable or external service is required.

Implemented changes:

- Stronger Home introduction, natural heading wrapping, warm ownership panel,
  readable local-storage explanation and consistent module-card alignment.
- Existing forest/sage palette retained with explicit control, foreground, corner
  and wellness tokens. System fonts and Lucide remain unchanged.
- Tone borders support existing status labels; flat comparison cards separate
  labels from values. Data forms have visible boundaries and 44px controls.
- Progress uses semantic borders, focus and button foregrounds in both themes.
  Recovery headings have a quiet divider. Home and button tokens support print.

## Automated evidence

| Check                                                                 | Result                                                                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Repository formatting, lint and strict application/content TypeScript | Passed                                                                                           |
| Content/source/relationship checks and search-index verification      | Passed; 520 factual documents, 648 total search documents; frozen manifest retained              |
| Unit suite, including foundation and local-storage tests              | 371 passed across 97 files                                                                       |
| Production build                                                      | Passed                                                                                           |
| Runtime privacy audit                                                 | Passed; 397 source files inspected                                                               |
| JavaScript budget                                                     | Passed; 704516 bytes gzip across 160 assets                                                      |
| Public-data budget                                                    | Passed; 429517 bytes gzip across 97 lazy JSON assets                                             |
| Existing Chromium regression selection                                | 49 passed                                                                                        |
| Additional representative responsive/theme inspection                 | 32 states; no WCAG-tagged axe violations, page overflow, application errors or external requests |

The browser regression selection runs the unchanged foundation, owner-ux,
data-management, progress and phase19-comparisons specs against the local
production server. This covers keyboard navigation, seven Home widths, theme
first paint and runtime Auto behavior, local measurement save/edit/reload,
comparison preparation/source/missing-value handling, and clear-data confirmation.
All test data belongs to disposable browser contexts.

The extra inspection covers Home, restore, reset, body weight, Recovery, public
food search, brown-rice detail and nutrients at 320px and 1440px in both themes.
Home, weight, restore and Recovery screenshots plus Home print emulation were
visually inspected. Local captures and machine results are under the ignored
`artifacts/design-reference/` directory. Command logs use `artifacts-design-*.log`.

## Environment findings and limits

The first aggregate check stopped in Vitest because its sandbox temporary SSR
cache files were missing. All unit cases passed when rerun with a workspace-local
TEMP/TMP and one worker; no test assertion or application behavior was changed.
The first browser attempts could not use the sandbox-relative browser cache or
reach the IPv6-bound preview. Using the installed browser directory and explicitly
binding the preview to 127.0.0.1 resolved those harness failures.

Screenshots and axe scans provide automated layout/accessibility evidence;
physical devices, screen readers and native print dialogs remain human checks.
This checkpoint does not repeat the historical 702-route or hosted cross-browser
release audit. No deployment or GitHub push is part of this request.
