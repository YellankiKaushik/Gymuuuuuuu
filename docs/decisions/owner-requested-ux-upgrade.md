# Bounded owner-requested UX upgrade

The owner's targeted UX/release request supersedes the preceding read-only audit
for this implementation. Content identities, facts, backlog, architecture and
backup schemas remain frozen. The finite workstreams are Progress correctness,
navigation, themes, Home, reusable visual foundation, ten high-value visual areas,
verification, and reports/release. No tracked file deletion, rename or move is
required.

PROG-001: HTML datetime-local defaults use local numeric calendar/time components,
with minute precision, instead of UTC ISO digits. The submitted local datetime is
converted to its ISO instant. Local-date defaults use the same calendar formatter.
All four affected Progress measurement forms share it. Existing JSON editing keeps
explicit offset-bearing instants and retains schema validation.

PROG-002: BMI selects a schema-valid active height by measuredAt instant, excluding
future measurements until their recorded instant. Measurement time descending is
the recency rule. Equal instants use updatedAt descending, createdAt descending,
then stable code-point ID order only to break an otherwise exact tie. Deleted,
invalid and future records remain untouched in storage. IndexedDB order is not a
recency signal. The displayed BMI identifies its height and measurement date.

Desktop navigation keeps eight primary destinations and compact persistent system
actions. Secondary group links open an adjacent panel rather than increasing the
sidebar's normal height. Only one panel opens at once; Escape restores opener
focus. Explicit focus on pointer activation supports WebKit's non-focusing button
behavior. At heights below 700px the sidebar may scroll as an accessible fallback.
Mobile navigation keeps its existing destinations and focus restoration.

Theme storage retains the existing `system` value and preference schema; the UI
calls it Auto (System). The existing nonce-bearing pre-paint script now recovers
from malformed or inaccessible preference storage and still follows the system.
Runtime system changes and manual overrides use the existing provider. The header
cycles Auto → Dark → Light → Auto; mobile settings expose all three choices.

Original workflow diagrams explain application records rather than prescribing
health behavior. Evidence interpretation is claim-specific, without a numeric
score. The weight scatter plot uses recorded daily medians in the selected window,
without interpolation, includes labelled units/dates and an equivalent table, and
allows local horizontal scrolling to keep axis text readable on small screens.
Anatomy remains explicitly approximate navigation with equivalent text controls;
exercise thumbnails reuse unchanged, reviewed local SVGs. The visual manifest is
`docs/assets/owner-ux-visual-manifest.json`. No external image is added. Existing
Lucide license notices are retained at `public/licenses/lucide.txt`.

The reference projects were inspected in the browser and on GitHub: Criscris's
explicit action/workflow hierarchy and SchemeSeva's grouped capability cards and
data-boundary panel informed the composition. Their code, branding, fonts and
architecture were not imported.

Browser harness corrections await actual shell hydration, document fonts and two
animation frames after document navigation/reload or viewport resize. Nutrient and
recipe accessibility loops become independent cases with every original route,
width, theme and assertion preserved and no increased timeout. Historical
screenshots are preserved; new captures use ignored artifacts. Persistent closure
profiles use isolated short temporary directories to avoid Windows LevelDB path
limits; the browser's real persistence behavior is still tested. Closure geometry
waits for layout settlement before measuring. No error is suppressed.

The development server's AsyncLocalStorage externalization failure was observed
and retained as an environment/toolchain limitation during targeted testing. The
candidate is verified through the established production build/server instead of
introducing unrelated framework changes. Windows Firefox launch limitations are
reported separately from hosted Linux browser results.

Release uses normal main commits/pushes, then the existing Vercel project's
server-side Git source at the exact pushed SHA after applicable gates pass.
Automatic Git deployments remain disabled. Final counts and deployment evidence
belong in the final owner-requested report, not this prospective decision.

During the first final regression matrix, a separately created fresh-profile page
bypassed the shared page fixture. Playwright setInputFiles can populate a disabled
pre-hydration input; the native UI was correctly disabled. The separate page now
awaits readyForUi after each navigation, retaining every restore, confirmation,
corruption and record-equality assertion. Both portability cases pass. A food-retry
trace also showed mass fill starting at 862696ms before the retried data response
completed at 862707ms. Three unchanged isolated checks passed; the test now
explicitly awaits the loaded profile and asserts the retained mass before the
original preview/save assertions. Application code was not changed for either
harness finding. Initial evidence is preserved and the entire affected engine is
rechecked before release.

Hosted execution then exposed whole-job limits: the duplicate CI Chromium job
hit its existing 30-minute deadline twice, and the unsharded Firefox/WebKit jobs
hit 40 minutes. Original logs and statuses are retained. Firefox also printed
timeout/failure markers before cancellation; these remain unresolved until named
sharded results identify and verify the exact cases. They are not classified as
passing merely because Chromium passes.

CI now runs the identical Chromium suite in two dedicated shards, separately from
check/coverage/audit. The cross-browser workflow runs four shards per engine;
closure still runs once per engine on shard 1 with all original configurations.
Line reporting exposes failing test names before a run ends. No tests, assertions,
per-test timeouts, 30/40-minute job limits, workers, coverage thresholds or
performance budgets are removed or relaxed. This changes execution scheduling,
not application behavior. Every shard must pass before production deployment.

The first complete sharded results were 12 successful jobs and four failed jobs.
Named diagnostics confirmed cumulative accessibility scan deadlines in the food
catalogue, foundation navigation, cardio, nutrition, Progress, search/saved and
published-route groups. In the chicken-drumstick traces, the sixth axe finishRun
begins 30.288 seconds (Firefox) and 30.890 seconds (WebKit) after Before Hooks,
beyond the 30-second deadline, without a reported accessibility violation.
These read-only combinations now run in isolated route/viewport cases, with every
original theme, axe rule, layout, focus, loading, error and request assertion
retained. The two former 180/240-second aggregate loops use the stricter default
30-second deadline per isolated case. No timeout is increased. Browser case count
is 893 and dedicated accessibility count is 561 because of regrouping; the 179
published routes retain exactly 1,074 viewport/theme scans. CI accessibility also
uses two shards within its existing 30-minute job limit.

Firefox/Linux additionally confirmed real primary-sidebar overflow at 1440×700
with its fallback font metrics. Reducing unused top/brand/footer spacing by 16px
retains all 14px primary text and 44px minimum controls. Necessary fallback
scrolling applies below 700px. The original no-overflow assertion is preserved as
an equivalent numeric comparison that now reports content and viewport heights.
The current local check and all 72 focused Chromium/WebKit correction cases pass;
current hosted results and production release remain required before completion.
