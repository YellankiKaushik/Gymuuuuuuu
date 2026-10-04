# Engineering checks

Automated checks cover all draft identities and Phase 07 mapping compatibility; publication/claim/citation/medical-boundary gates; inclusive age boundaries; isolated frameworks; overlapping populations; explicit pregnancy/lactation selection; missing/unestablished/zero distinctions; compatible percentages; upper-limit informational semantics; context-scoped equivalents; food ranking basis/state/status handling; alias/abbreviation search; a 250-topic compact future index; remembered-population persistence/removal; concept comparison and reference presentation.

Browser checks cover all routes and hidden draft slugs, filters/dialogs, unknown frameworks, transient reference populations, explicit remember/reload/forget behavior, absence of remote requests, and live reflow/axe checks at 320 and 1440 px in both themes. Synthetic detail and concept-comparison fixtures cover 320, 375, 768, 1024 and 1440 px, both themes and axe WCAG checks. Synthetic values are not public content.

Windows Edge is the automated browser. Physical Android/iOS, Safari/Firefox and human screen-reader/400%-zoom review remain manual release checks. Build warnings about upstream module-level `use client` directives are non-fatal; strict typecheck/lint/content checks must pass independently.

The larger regression run exposed pre-hydration input/click races in the earlier exercise search and missing-page module-search buttons. These controls now wait for the same shell hydration signal used elsewhere. This preserves their functions while preventing an action from occurring before event handlers exist.
