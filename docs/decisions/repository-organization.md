# Non-destructive repository organization

Owner-authorized maintenance task, 2026-10-17 (Asia/Calcutta). This is not a new application phase or content expansion. Starting commit: `b7f332a9ef2344113cf27ff9ff07dd4618c3f785`. Safety tag: `pre-repository-structure-cleanup`.

Move the 114 original Phase 00–18 files into a phase-based archive, preserving byte hashes and all five numbered duplicate copies. Repair references before validation. Keep all runtime/public paths, package command names, test discovery, pinned workflows, permissions, budgets and deployment policy stable.

The reference graph identified two runtime imports of the Phase 06 reference JSON, three reference-reading tests, schema generators, release tooling, formatting exclusions and a dynamic historical-contract inventory. Import paths/provenance comments are repaired; the archived JSON is not edited. The dynamic inventory now traverses phase subdirectories and retains the original file selection, including duplicate copies.

Keep the existing 88 script paths and 145 test/support paths: sibling/shared imports, repository-relative outputs and historical evidence make broad moves disproportionate. Add complete family/navigation indexes. Keep specialized Playwright configs at root because their paths are config-relative and referenced by npm, CI and recorded evidence. Current meaningful documentation directories remain; a hub, feature index and repository map supply subject navigation without changing established paths.

Do not rewrite dated reports to replace their audited paths. The manifest maps those paths to present locations. No archived document contents, facts, storage schemas, application UI or security policy are changed. No production deployment is planned: verify the built public bytes and semantic inputs against the baseline. If output diverges meaningfully, investigate and report before considering deployment.

Validation results, all-file inventory, move hashes, branch/tag classification and reference checks are recorded in the [reorganization manifest](../reports/repository-reorganization-manifest.md). The containing Git commit provides the final commit identity without a recursive self-hash in this document.
