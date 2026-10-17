# Fitness OS documentation

Start with the [project README](../README.md) for the product, quick start, privacy model, commands and deployment policy. The [repository map](repository-map.md) explains the checkout. This index distinguishes present-day maintenance guidance from original specifications and dated release evidence.

## Current product and feature guidance

The [feature documentation index](features/README.md) groups the existing module documents without changing their established paths. Feature documents describe the implemented contracts and methods; later [decisions](decisions/) and implementation code resolve recorded changes.

## Architecture, data and methods

- [Design system](design-system.md) and [navigation](navigation.md).
- [Foundation data dictionary](data-dictionary/foundation.md), [local storage and backup contracts](local-data/), and [content governance](content-governance/).
- Module-specific data models, methods, source policies and test matrices are linked from the [feature index](features/README.md).
- [Visual provenance manifest](assets/owner-ux-visual-manifest.json).

## Operations, security and verification

- [Release and rollback](runbooks/release-and-rollback.md) and [owner deployment runbook](runbooks/vercel-owner-deployment.md). Automatic Vercel deployment remains disabled. Documentation reorganization does not trigger a production release.
- [Security threat model](security/final-threat-model.md); privacy/storage rules also live in [AGENTS.md](../AGENTS.md) and the [project README](../README.md).
- [Reports](reports/) contain dated, commit-bound verification evidence, not a promise that old counts describe every later checkout. The [UX upgrade report](reports/final-owner-requested-ux-upgrade.md) describes the preceding production release.
- [Reorganization manifest](reports/repository-reorganization-manifest.md) records every move, content hashes, inventories, reference decisions and checks.
- [Test navigation](../tests/README.md) and [script navigation](../scripts/README.md).

## History and original requirements

- [Phase plans and handoffs](phases/) record implementation checkpoints.
- [Decisions](decisions/) retain specification and engineering changes; [screenshots](screenshots/) retain historical visual evidence.
- [Original Phase 00–18 specifications](archive/original-specifications/README.md) preserve all source documents, DOCX files, schemas, reference data, prompt packages and duplicate copies. These are historical inputs, not automatically current operational instructions.

Existing meaningful documentation directories and feature paths remain stable. The repository map and feature index provide classification without breaking historical evidence or relocating documents that already have established references.
