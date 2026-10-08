# Independent accessibility verification

The 505-record hosted CI run took 17.9 minutes for the full Chromium regression,
after installation, complete checks and coverage. The separately required
accessibility command then shared the remainder of a 30-minute job limit. The
500-record checkpoint had already taken 7.4 minutes for that accessibility suite.
This sequential arrangement leaves insufficient predictable headroom as the
published library grows.

GitHub subsequently confirmed the 505-record job exceeded its maximum execution
time of 30 minutes and cancelled the accessibility process. All 244 Chromium
regression cases and all three cross-browser jobs passed; the separate 169-case
accessibility rerun did not complete and is not recorded as a pass. Exact evidence
is retained in phase19-ci-505-checkpoint.json.

The accessibility command now runs in its own CI job, with a clean installation,
complete checks, production build and Chromium installation. Both jobs retain
their 30-minute limits. Test selection, assertions, workers, browser settings,
budgets and test timeouts remain unchanged. Both jobs must pass; splitting them
does not make accessibility optional or hide a failing result. Failure artifacts
are retained independently. Cross-browser regression continues to run unchanged.
