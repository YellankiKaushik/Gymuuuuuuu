# Offline data ingestion

1. Obtain an official pinned JSON download from the approved source. Keep it outside public assets. Do not import branded data or protected NIN tables.
2. Run `node scripts/prepare-food-source.mjs <local-download.json> <allowed-source-id> <release> <license-note>`. This validates JSON and writes a SHA-256 manifest under ignored `data-imports/foods`. It does not make network calls or change public records.
3. Manually match each stable identity to a precise source food state and description. Record exact/close/compiled/manual match type. Close matches need limitations. Never publish a fuzzy automatic match.
4. Supply explicit reviewed nutrient mappings using `src/features/foods/ingestion.ts`. Plain mass units convert through canonical factors; equivalent forms such as vitamin A RAE and folate DFE do not convert automatically. Preserve absent, trace and not-detected statuses, source methods, bounds and source record IDs.
5. Create separate profiles for every preparation state; add only source-backed household portions. Check values, units, edible portion, energy availability, citations, source releases and redistribution rights. Record real review signoffs; do not fabricate them.
6. Add approved editorial records to `src/content/foods/records.json`. Run `npm run validate:content`. `scripts/compile-foods.ts` validates all draft and editorial records, rejects duplicate stable IDs/slugs/names/profile IDs and emits review flags for alias collisions, external-record reuse and identical cross-state nutrient arrays. Review flags require editorial resolution before release.
7. Inspect generated index, manifest, shards and `release-report.json`, then run the engineering checks and inspect real profile pages before changing the dataset version.

The current compiler report hashes editorial input, records transform/dataset versions and counts, and contains no source downloads because no source dataset has been ingested. A real release must document the pinned source-download manifests alongside its compilation report. The helpers deliberately stop before unreviewed automatic content publication.
