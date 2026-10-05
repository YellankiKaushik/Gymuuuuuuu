# Phase 16 — Global search, favourites and comparison

Status: implementation, verification and remote checkpoint are complete. Commit `96b72fe` and tag `phase-16-global-search-saved-compare-complete` are pushed to `main` before Phase 17 review.

## Requirements reviewed

- Read the complete Phase 16 Markdown, DOCX, normative schema, reference records and all 20 integrity vectors, prompt package and quick reference. Compared the DOCX with Markdown (1,021 paragraphs, 10 tables; normalized similarity 0.999).
- Read Phase 00 Project Knowledge and reviewed the existing search shell, navigation registry, module source/publication adapters, IndexedDB contracts and Phase 15 records.
- The Lovable prompt's plan-only pause is superseded by the owner's direct authorization to build Phases 00–18 sequentially and push after every completed phase.

## Delivered

- Replaced the Phase 01 navigation finder implementation in place. The existing shell button, Ctrl/Cmd+K and `/` triggers, modal semantics and focus return now use local indexed suggestions and canonical destinations.
- Added `/search`, settings, saved overview, favourites, collection list/detail, recent activity, comparison overview and family routes. Public query/filter state is validated in route state; private query text and private record IDs remain local.
- Added exhaustive entity type definitions, owning-module publication adapters, a repository-built inverted index, ranking/matching helpers, schema/hash verification and automatic in-memory index rebuild when postings do not match verified documents.
- Added browser-local IndexedDB v16 tables for favourite references, collections and ordered items, optional recents, saved comparison definitions, settings, audits, deletion records, import conflicts and rebuildable private-index cache.
- Implemented public search, keyboard suggestions, indexed private search with opt-in and allowlisted structured fields, backup/cache exclusions, local favourites, recent history controls, backup export, validation-first restore and replace confirmation.
- Implemented collection create/rename/delete, manual keyboard-accessible reorder, title/date sorting, entity-type filtering, private notes, and validated move/copy operations.
- Added ten comparison families, same-family maximum-four enforcement, unavailable-value presentation and local saved comparison references. No winner, inferred value or unit conversion is introduced.
- Recorded the native index, publication-gate and current content-state decisions in [phase-16-search-publication-and-index.md](../decisions/phase-16-search-publication-and-index.md).

## Content and performance

At the checkpoint, the generated public index has 128 entries: 124 canonical navigation routes and four progress-widget destinations. It contains zero published factual documents. The module repositories currently contain draft identities or empty published releases for the relevant domain libraries. Those records remain excluded; Phase 16 does not fabricate facts to populate results.

The generated documents artifact is approximately 99.5 KB, postings approximately 23.4 KB and manifest approximately 1.2 KB. Manifest canonical-document hash is `d144ca3dd46344ce0fb66f6ab0b46bab75a74c0a104e9bc5719c147ceff87ffa`; serialized-index hash is `b23b8295fdd4966ca3bd8e4d309b9d718685527c4930dbfe6108190c6be80d69`. A 5,000-document synthetic indexed check measured 10.5 ms to build and 8.8 ms for a query in Vitest on the development host. The synthetic corpus is limited and does not guarantee performance on every target device.

Reference vectors whose expected behavior depends on source facts or an approved stable-ID migration remain correctly unavailable until those records/mappings exist. Search projections, private cache and user records are separated; private search remains off by default.

## Verification

- Strict TypeScript, ESLint, full unit suite (184 tests, 32 files), content validation and production build pass.
- Full Playwright regression: **49/49 pass**. The foundation test now expects the registered `/foods/categories` canonical destination.
- Phase 16 browser scenarios cover keyboard navigation, public filters, private-query URL isolation, favourite persistence, collection rename/order/filter/note/move/copy, axe checks and 320px/desktop layouts.
- No external search service or query telemetry was introduced. Public search and private search remain in the local runtime.

## Handoff

Phase 17 may extend data portability across the modules. It must preserve Phase 16's import validation before writes, private search cache exclusion, browser-only personal data, explicit replace confirmation, source-owned records and collection notes as local-only fields. Phase 16 has been pushed and tagged before Phase 17 document review.
