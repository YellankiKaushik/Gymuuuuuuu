# Non-destructive repository hygiene

1280 final tracked files classified individually in [JSON](repository-hygiene.json). Active runtime/tooling, tests, source data, current/historical documentation and generated evidence remain in place. Unknown files are preserved, not treated as deletion candidates. The 1271-file candidate inventory was refreshed after staging nine new documentation evidence files.

- Corrected README deployment/current-origin and historical report wording; updated owner runbook for the existing project, Production-only origin variable and explicit production-build promotion. Relative Markdown link scan: 0 broken references.
- .gitignore adds future local cache/editor/tsbuildinfo/tmp patterns. Nothing is untracked, moved or deleted.
- Strict TypeScript unused-local/parameter checks and lint pass. Exported APIs and historical migration compatibility are retained; no claim of exhaustive dead-code reachability. Domain backup/CSV duplication remains intentional rather than receiving a broad refactor.
- TODO/FIXME/HACK/TEMP/XXX/DEPRECATED matches: 22 in the final staged inventory; six matches are the scanner rule names themselves, one is XXX in the decision template and fifteen are generated audit-report references. All are non-blocking reference text. Runtime matches: 0. Production debug calls/debugger matches: 0. Static nonced theme HTML insertion is reviewed; a config comment mentions new Function only to explain its prohibition.
- Public output contains no source maps or sourceMappingURL references. Pattern scans find no credentials. Source visibility itself is not a secret.
- All historical files and evidence are preserved. No cleanup command, untracking, force push or history rewrite was performed.

**No tracked repository file was deleted, renamed or moved.**
