# Phase 16 — Global Search, Favourites and Comparison

**Project:** Fitness OS  
**Document type:** Lovable implementation specification  
**Phase:** 16 of the modular build  
**Version:** 1.0  
**Status:** Ready for Lovable Plan mode  
**Prepared:** 5 August 2026  
**Depends on:** Phases 00–15  
**Next phase:** Phase 17 — Local Storage, Backup and Export

---

## 1. Phase objective

Build the cross-module discovery and retrieval layer for Fitness OS. Phase 16 replaces the Phase 01 navigation-only search shell with a complete local search system and adds device-local favourites, collections, recent activity and compatible comparison views.

The system must help a user find the correct canonical record across muscles, exercises, workout science, programs, foods, nutrients, recipes, recovery, cardio, supplements and progress knowledge without inventing synonyms, exposing draft content, leaking private records or pretending that incompatible entities can be compared meaningfully.

The permanent rule is:

> Search may improve discovery, but it must never change the scientific meaning, publication state, source provenance or privacy classification of the underlying record.

## 2. Scope

### 2.1 Included

- One global search dialog available from every route.
- A full `/search` results page.
- Build-time public search documents and a serialized local full-text index.
- Prefix, exact-title, exact-alias and controlled fuzzy matching.
- Curated aliases and regional names from owning modules.
- Result groups, filters, sorting, pagination and shareable public URL state.
- Optional private-record search that is disabled by default.
- Favourites for stable entity references.
- Local named collections and ordered collection items.
- Optional recently viewed records and recent queries.
- A compare tray and family-specific comparison pages.
- Saved comparison configurations.
- Stable-ID migration and orphan handling.
- IndexedDB persistence, JSON backup registration and CSV export contracts.
- Keyboard, screen-reader, touch and 320 px responsive support.
- Performance, privacy, security and regression tests.

### 2.2 Explicit exclusions

- No external search service.
- No cloud search index.
- No remote autocomplete.
- No runtime AI retrieval or AI-generated answer box.
- No semantic embeddings or vector database.
- No query analytics, advertising or popularity ranking.
- No private records in public URLs.
- No automatic search across personal notes by default.
- No searching photo pixels, image metadata or uploaded documents.
- No OCR.
- No auto-generated synonyms.
- No publication of draft, quarantined or invalid records.
- No universal “best” result or compare winner.
- No cross-domain comparison between incompatible entity families.
- No missing-value substitution with zero.
- No social bookmarks, shared collections or public profiles.
- No automatic cloud synchronization.

## 3. Phase ownership and dependencies

| Concept | Owning phase | Phase 16 rule |
| --- | --- | --- |
| Shell, route metadata and navigation search | Phase 01 | Upgrade the existing dialog; preserve keyboard shortcuts and route navigation. |
| Anatomy and muscles | Phase 02 | Index only published stable records and reviewed aliases. |
| Exercises | Phase 03 | Preserve canonical exercise IDs, equipment, movement and muscle relationships. |
| Workout science | Phase 04 | Search reviewed topics; comparison is outcome-specific where applicable. |
| Workout programs | Phase 05 | Compare immutable published program versions; no universal winner. |
| Workout tracker | Phase 06 | Private search is opt-in and excludes free-text notes by default. |
| Foods | Phase 07 | Preserve exact food profile, preparation state, source and nutrient availability. |
| Nutrients | Phase 08 | Preserve framework and life-stage context. |
| Diet plans | Phase 09 | Local plans are private and never URL-addressed. |
| Nutrition tracker | Phase 10 | Personal diary entries are private and excluded by default. |
| Recipes and meal plans | Phase 11 | Published recipes are public-searchable; personal recipes and meal plans are private. |
| Recovery, sleep and mobility | Phase 12 | Keep knowledge content separate from personal diary and check-in records. |
| Cardio and conditioning | Phase 13 | Preserve modality and intensity-method boundaries. |
| Supplements | Phase 14 | Compare claim-specific evidence only for one selected outcome and population. |
| Progress and analytics | Phase 15 | Search public protocols/topics; personal measurements remain private. |
| Global backup and offline | Phase 17 | Register Phase 16 canonical local stores; exclude search caches. |

## 4. Non-negotiable decisions

1. **Canonical records remain owned by their source phases.** Phase 16 stores references, not copied facts.
2. **Stable IDs are mandatory.** Slugs and titles are not identity keys.
3. **Only published public records enter the public index.** Draft and quarantined records are absent, not merely hidden in the UI.
4. **Aliases are curated.** Lovable may not invent synonyms from titles or model memory.
5. **Public and private indexes are separate.** Private search is disabled by default and built only on device after explicit opt-in.
6. **Free-text personal notes are excluded from private search by default.** A separate explicit setting is required before indexing them.
7. **Private query state is never placed in a URL.**
8. **No runtime search request leaves the device.**
9. **Exact matches outrank fuzzy matches.**
10. **Short technical tokens do not use fuzzy matching.**
11. **One alias resolves to one canonical result.** The UI does not show duplicate alias rows.
12. **Ranking is deterministic and inspectable.** No popularity, advertising or unexplained personalization.
13. **Search caches are disposable.** Canonical content and local saved references remain the source of truth.
14. **A stale or mismatched index is rejected and rebuilt.**
15. **Favourites do not alter public search ranking unless the user explicitly selects a Saved-only filter.**
16. **Recent history is optional, local and clearable.**
17. **Comparison is family-specific.** Mixed entity families are rejected.
18. **Comparison never produces a universal winner.**
19. **Missing and unavailable values remain missing or unavailable.**
20. **Saved comparisons store configuration and references, not independent copied scientific facts.**
21. **Removed content does not silently retarget.** Approved ID migrations are explicit and audited.
22. **Search highlights are escaped text, not injected HTML.**
23. **Public query and filter state is shareable.** Private IDs and notes are not.
24. **No user query analytics.** Even anonymized query telemetry is excluded.
25. **All search and comparison functions work without authentication or a backend.**

## 5. Required routes

| Route | Purpose |
| --- | --- |
| `/search` | Full global public-search results and filters. |
| `/saved` | Saved-content overview. |
| `/saved/favourites` | All favourites grouped and filtered by entity type. |
| `/saved/collections` | Local collection catalogue. |
| `/saved/collections/$collectionId` | One collection with ordered items and notes. |
| `/recent` | Optional recent searches and recently viewed records. |
| `/compare` | Compare-family chooser and active compare tray. |
| `/compare/$family` | Family-specific comparison page. |
| `/search/settings` | Search privacy, fuzzy, history and display settings. |

Public search URL parameters may include:

- `q`
- repeated `type`
- repeated `module`
- `sort`
- `page`
- public family-specific filters

The parser must reject unknown parameters, invalid enum values, negative pages and overlong queries. Canonical URL state is written through `URLSearchParams` using a stable parameter order.

Private search state, private record IDs, notes and collection notes never appear in URLs.

## 6. Searchable entity registry

The reference-data file defines 25 entity types. Each type declares:

- Owning phase.
- Public or private visibility.
- Search-result group.
- Comparison-family eligibility.
- Canonical route builder.
- Publication-status field.
- Stable ID field.
- Title, alias, summary, keyword and facet adapters.

The registry is the only place where a new entity type joins global search. Lovable must not scan arbitrary object keys or guess route patterns.

### 6.1 Public searchable entities

Public search can include:

- Routes.
- Muscles.
- Exercises.
- Workout Science topics.
- Published workout programs.
- Published food profiles.
- Nutrients.
- Published recipes.
- Recovery knowledge topics and reviewed routines.
- Cardio topics, modalities, plans and routines.
- Supplement ingredients and evidence topics.
- Measurement protocols and progress knowledge topics.
- Dashboard destinations where useful.

### 6.2 Private searchable entities

Only after explicit opt-in, the local private index may include selected structured metadata from:

- Workout sessions.
- Saved diet plans.
- Personal recipes.
- Meal plans.
- Sleep entries.
- Recovery check-ins.
- Body measurements.

Private search defaults to safe structured fields such as dates, record titles, exercise names, program names and tags. Notes, symptoms, pain descriptions, supplement adverse-event descriptions and photo metadata remain excluded unless a separate high-friction setting is enabled.

## 7. Canonical search-document contract

Each public searchable record is transformed into one search document:

```ts
interface PublicSearchDocument {
  documentId: string;            // entityType:stableEntityId
  entityType: SearchEntityType;
  entityId: string;
  entityVersion: string | null;
  sourceModule: string;
  route: string;
  title: string;
  normalizedTitle: string;
  aliases: string[];
  normalizedAliases: string[];
  summary: string;
  keywords: string[];
  headings: string[];
  searchableBody: string;
  facets: Record<string, string[]>;
  publicationStatus: "published";
  lastReviewedAt: string | null;
  contentHash: string;
}
```

Rules:

- `documentId` is unique.
- `route` is generated through the typed route registry.
- `searchableBody` contains reviewed text only.
- Source URLs are not used as document identity.
- Draft fields are not copied into a published document.
- Favourites, recent views and query counts do not enter the document.
- Search snippets are generated from escaped strings.

## 8. Public-index build pipeline

### 8.1 Build artifacts

Generate these repository-owned artifacts:

1. `search-documents.public.json`
2. `search-index.public.json`
3. `search-manifest.json`

The manifest contains:

- Index schema version.
- Search-adapter version.
- Canonical-document hash.
- Index hash.
- Total document count.
- Count by entity type.
- Build timestamp.
- Locale configuration.
- Ranking-configuration version.
- Normalization-configuration version.

### 8.2 Publication gate

A record enters the index only when:

- Stable ID exists.
- Canonical route resolves.
- Publication status is `published`.
- Required title and summary fields are valid.
- Owning module validation passes.
- Source/licensing gate passes where required.
- No duplicate `entityType + entityId` exists.

### 8.3 Index validation

At build time, fail on:

- Duplicate document IDs.
- Duplicate canonical routes.
- Unknown entity types.
- Invalid routes.
- Draft or quarantined records.
- Empty titles.
- Alias collisions that resolve to different canonical records without an explicit disambiguation record.
- Search documents whose content hash does not match the canonical record adapter output.

### 8.4 Index loading

- Load after browser idle or first search activation.
- Show a deterministic loading state if the user opens search first.
- Use a dedicated Web Worker when measured initialization or queries create unacceptable main-thread work.
- Reject serialized index data when manifest and index hashes differ.
- Rebuild from canonical search documents when the serialized index is missing or invalid.
- Never fetch an external index service.

## 9. Search engine adapter

Use a replaceable local full-text adapter. The reference implementation may use MiniSearch because it supports local prefix search, fuzzy search, field boosting and index serialization. Pin the exact package version in the repository and do not rely on undocumented defaults.

Create an interface such as:

```ts
interface SearchEngineAdapter {
  build(documents: PublicSearchDocument[]): Promise<SearchIndexReceipt>;
  load(serialized: string, manifest: SearchManifest): Promise<void>;
  search(query: SearchQuery): Promise<SearchResponse>;
  suggest(query: SuggestQuery): Promise<SearchSuggestion[]>;
  dispose(): void;
}
```

The domain layer must not import MiniSearch directly outside the adapter.

## 10. Text normalization and tokenization

### 10.1 Matching pipeline

Apply the same versioned pipeline to indexed fields and queries:

1. Convert to a well-formed string.
2. Apply Unicode NFKC normalization.
3. Normalize apostrophe and hyphen variants.
4. Apply case folding.
5. Build an optional diacritic-folded secondary field.
6. Tokenize using Unicode-aware rules.
7. Collapse repeated whitespace.

Display the original canonical text. Normalized text is for matching only.

### 10.2 Protected technical tokens

Do not split or over-normalize tokens such as:

- `B12`
- `omega-3`
- `5x5`
- `RPE`
- `RIR`
- `1RM`
- `VO2max`

### 10.3 Alias rules

Aliases may come only from:

- Canonical owning-module alias arrays.
- Reviewed regional food names.
- Reviewed exercise alternative names.
- Reviewed abbreviations.
- Explicit Phase 16 disambiguation records.

Lovable may not generate synonyms, translations, misspellings or regional names automatically.

## 11. Ranking model

### 11.1 Field boosts

Use explicit field boosts:

| Field | Base boost |
| --- | ---: |
| Canonical title | 8 |
| Aliases | 6 |
| Reviewed keywords | 4 |
| Summary | 2 |
| Section headings | 1.5 |
| Reviewed body text | 1 |

### 11.2 Deterministic bonuses

Apply after the search adapter score:

| Match | Bonus |
| --- | ---: |
| Exact normalized title | +100 |
| Exact normalized alias | +80 |
| Canonical-title prefix | +40 |
| Alias prefix | +30 |
| Exact navigation alias | +20 |

Fuzzy matches use a `0.6` score multiplier. Exact and prefix matches therefore remain ahead unless the underlying result is otherwise irrelevant.

### 11.3 Tie-breaking

1. Final score descending.
2. Entity-type priority only in the unfiltered All view.
3. Title using one configured `Intl.Collator`.
4. Stable entity ID.

### 11.4 Prohibited ranking signals

- Page views.
- Search-query frequency.
- Favourites count.
- Commercial placement.
- Affiliate status.
- User body data.
- Medical-risk inference.
- Hidden recency boost.
- Unexplained personalization.

## 12. Fuzzy matching and typo control

| Token length/type | Behavior |
| --- | --- |
| 0–3 characters | Exact and prefix only. |
| 4–7 characters | Maximum one edit or configured fuzzy ratio no greater than 0.15. |
| 8+ characters | Maximum two edits or configured fuzzy ratio no greater than 0.20. |
| Contains digits | Fuzzy disabled unless a reviewed alias covers the form. |

Additional rules:

- Exact and prefix results always appear before fuzzy-only results.
- Fuzzy reason is visible in development diagnostics.
- The UI may show “Showing results for…” only when a deterministic correction candidate is substantially stronger than the original query.
- The user can always search the original text.
- No automatic correction may change a nutrient abbreviation, exercise code, dose, unit or numeric expression.

## 13. Global search dialog

Upgrade the Phase 01 `GlobalSearchDialog` rather than creating a second search implementation.

### 13.1 Opening behavior

- Search button.
- `Ctrl+K` on Windows/Linux.
- `Cmd+K` on macOS.
- `/` only when focus is not in an editable control.
- The button remains reachable in desktop, tablet and mobile shells.

### 13.2 Dialog behavior

- Initial focus moves to the search input.
- `Escape` closes the dialog.
- Focus returns to the invoking control.
- `Down Arrow` and `Up Arrow` move through suggestions.
- `Enter` activates the selected suggestion.
- Typed text remains editable with normal platform keys.
- A visible “View all results” action opens `/search`.

### 13.3 Suggestion groups

Maximum eight suggestions:

- Exact or prefix entity results.
- Navigation destinations.
- Recent public queries when enabled.
- Recently viewed public records when enabled.

Private records are not displayed in autocomplete by default, even when private full-search is enabled. Add a clearly labelled local-results section only after explicit private-suggestion opt-in.

### 13.4 Announcements

Use polite status messages for:

- Number of suggestions.
- Selected suggestion.
- Index loading.
- No results.
- Filter changes.
- Favourite saved or removed.

Do not move focus merely to announce a count.

## 14. Full search-results page

### 14.1 Layout

- Query field.
- Active-filter chips.
- Entity-type filter.
- Module filter.
- Contextual facets.
- Sort control.
- Result count.
- Grouped or unified result view.
- Result list.
- Pagination.
- Empty and error states.

### 14.2 Result card

Every result shows:

- Canonical title.
- Entity-type label.
- Source module.
- Short reviewed summary.
- Matched alias or field when useful.
- Relevant facets.
- Publication/review indicator where owned by the module.
- Favourite action.
- Compare action when eligible.
- Canonical route.

Do not show a generated answer or summary beyond canonical reviewed fields.

### 14.3 Sorting

Supported public sorts:

- Relevance.
- Title A–Z.
- Title Z–A.
- Last reviewed, only when comparable review dates exist and the user explicitly chooses it.

No popularity sort exists.

### 14.4 Filters

Global filters stay conservative:

- Entity type.
- Owning module.
- Published-content category.
- Saved-only.

Module-specific facets may be shown only when their adapters expose validated values, for example equipment for exercises or food category for foods. The global search page does not reimplement every module catalogue filter.

## 15. URL, browser history and deep links

Public search state is URL-addressable through validated `URLSearchParams`.

Rules:

- Typing in the modal does not push a browser-history entry for every keystroke.
- Submitting a query or applying a committed filter updates the URL.
- Back and forward restore query, filters, sort and page.
- Changing the query resets page to one.
- Unknown values are discarded and canonicalized.
- Very long filter sets are not encoded; the UI explains the limit.
- Private mode and private record IDs remain in local state only.

Search pages use `noindex, follow` to avoid generating large numbers of duplicate query pages. Canonical public entity pages remain the indexable destinations.

## 16. Private-record search

### 16.1 Default state

Private-record search is off.

The settings screen must explain:

- Which local stores can be indexed.
- Which fields are included.
- That the index stays on the device.
- That clearing browser storage removes it.
- That private query text is not placed in URLs.
- That the cache is rebuildable and excluded from backup.

### 16.2 Safe field selection

Default private fields may include:

- Record title.
- Date.
- Program name.
- Exercise names.
- Meal-plan title.
- Personal recipe title.
- Structured tags.

Default exclusions include:

- Free-text notes.
- Symptoms.
- Pain descriptions.
- Adverse-event descriptions.
- Medication context.
- Progress-photo metadata.
- Collection notes.

A separate explicit setting is required to index free text. The app must warn that local-device privacy depends on device and browser security.

### 16.3 Private result behavior

- Private results are visually labelled “On this device.”
- Private results never appear in shareable URLs.
- Opening a private result uses a local route already owned by its module.
- Private result snippets do not expose more text than necessary.
- Clearing private search deletes its cache transactionally.

## 17. Favourites

### 17.1 Canonical favourite record

A favourite stores:

- Phase 16 favourite ID.
- Stable entity type and entity ID.
- Source module.
- Optional entity version.
- Saved timestamp.
- Last-known title and route for recovery UI.
- Reference status.

It does not copy nutrient values, exercise instructions, scientific claims or article text.

### 17.2 Behavior

- One favourite per canonical entity reference.
- Favourite actions appear consistently on eligible detail pages and result cards.
- Save/remove is optimistic only after the local transaction succeeds.
- The control exposes state with text and accessible name, not color alone.
- Removing a favourite does not delete a collection item silently; the UI explains the relationship.
- Favourites do not modify search ranking.

### 17.3 Orphan handling

When a referenced record disappears:

- Keep the favourite record.
- Mark it unavailable or orphaned.
- Show last-known title.
- Offer remove and review actions.
- Never point to another entity automatically.

When an approved stable-ID migration exists:

- Show the old and new reference.
- Apply the migration transactionally.
- Write an audit event.
- Preserve the saved timestamp.

## 18. Collections

Collections are local named lists of saved references.

Required capabilities:

- Create, rename and delete a collection.
- Add favourites or public/private entity references.
- Reorder items manually.
- Sort by title or saved date.
- Add optional local notes.
- Filter a collection by entity type.
- Move or copy items between collections.
- Export collection membership and notes through Phase 17.

Boundaries:

- Collection notes never enter public search.
- Collections are not shared or published.
- Deleting a collection does not delete source entities or favourites unless explicitly chosen.
- Duplicate entity references in one collection are blocked.

## 19. Recent searches and recently viewed records

### 19.1 User control

Users can independently enable or disable:

- Recent public queries.
- Recent public views.
- Recent private queries.
- Recent private views.

Defaults:

- Public recent views: enabled.
- Public recent queries: enabled.
- Private query/view history: disabled.

### 19.2 Retention

- Default recent-query limit: 30.
- Hard recent-query limit: 100.
- Default recent-view limit: 100.
- Hard recent-view limit: 500.
- Duplicate consecutive views collapse to the most recent timestamp.
- Repeating a normalized query updates its timestamp rather than creating unlimited duplicates.
- Clear-one and clear-all actions require clear feedback.

History stays on device and is included in Phase 17 backup only when the user selects it.

## 20. Compare tray

### 20.1 Global tray

Eligible cards expose “Compare.”

The tray:

- Starts when the first eligible entity is added.
- Locks to one comparison family.
- Shows two to four entities.
- Rejects a fifth entity.
- Rejects incompatible entity types with a specific reason.
- Allows removal and reordering.
- Persists locally across navigation.
- Opens the family-specific comparison route.

### 20.2 Tray privacy

- Public-entity comparison IDs may appear in a URL.
- Private entity references never appear in a URL.
- A compare URL is validated against the family registry and item limit.
- Invalid or removed IDs produce a recoverable partial-comparison state.

## 21. Family-specific comparison rules

The reference package defines ten families.

### 21.1 Muscles

Compare:

- Region.
- Anatomical and common names.
- Functions.
- Joint actions.
- Related movement patterns.
- Linked exercises.

Do not rank muscle importance, aesthetic value or growth potential.

### 21.2 Exercises

Compare:

- Movement pattern.
- Equipment.
- Difficulty.
- Compound/isolation and unilateral/bilateral status.
- Primary, secondary and stabilizing muscle relationships.
- Setup requirements.
- Common errors.
- Regressions, progressions and substitutions.
- Goal suitability as reviewed by Phase 03.

Do not create activation percentages or a universal best exercise.

### 21.3 Workout programs

Compare immutable published versions:

- Goal.
- Experience level.
- Days per week.
- Typical session duration.
- Required equipment.
- Weekly structure.
- Progression method.
- Deload method.
- Substitution rules.
- Constraints and exclusions.

Do not automatically choose a winner.

### 21.4 Foods

Default basis:

- Per 100 grams of the exact edible profile.

Rules:

- Raw and cooked profiles remain distinct.
- Source release and profile state remain visible.
- Missing values show “Not available.”
- Percentage differences are not calculated when either value is missing or the denominator is zero.
- Verified-serving comparison is available only when all selected profiles have a verified gram weight.
- One food is not labelled healthier overall.

### 21.5 Nutrients

Compare:

- Functions.
- Forms.
- Absorption factors.
- Food sources.
- Deficiency and excess education.
- Athletic context.

Reference values can be compared only with the same framework, sex, age band and life stage. EAR, RDA, AI, UL, DV and other reference types remain distinct.

### 21.6 Recipes

Compare:

- Immutable recipe version.
- Per-100-gram or per-serving basis.
- Yield method.
- Calculation grade.
- Nutrient completeness.
- Dietary tags.
- Cooking time.
- Equipment.
- Ingredient and allergen declarations.

An unresolved recipe cannot be presented as exact nutrition.

### 21.7 Recovery methods

Require one selected outcome, such as:

- Soreness.
- Perceived recovery.
- Strength recovery.
- Power recovery.
- Range of motion.
- Long-term adaptation considerations.

Show evidence direction and confidence separately. No one-dimensional recovery ranking is allowed.

### 21.8 Cardio modalities

Compare:

- Equipment.
- Environment.
- Skill requirement.
- Impact category.
- Supported tracking metrics.
- Accessibility considerations.
- Typical session formats.

Do not compare pace across modalities or calculate calories or VO2max.

### 21.9 Cardio plans

Compare published plan versions:

- Goal.
- Level.
- Weeks.
- Sessions per week.
- Modality.
- Intensity methods.
- Progression.
- Equipment.
- Session-time range.
- Stop signals and constraints.

No universal winner.

### 21.10 Supplement ingredients

Require one shared:

- Outcome.
- Population.
- Ingredient form.
- Evidence-review context.

Compare:

- Claim wording.
- Effect direction.
- Evidence confidence.
- Studied protocol.
- Safety profile.
- Interactions.
- Anti-doping status and review year.
- Product-quality considerations.

Never generate a recommendation, stack, brand ranking or purchase link.

## 22. Comparison table behavior

- Prefer a native HTML table for non-editable tabular data.
- First column contains row labels.
- Entity titles are column headers.
- Headers remain visible during horizontal scrolling.
- Mobile supports horizontal scroll plus a card alternative.
- Users may hide optional rows without destroying data.
- Differences use text and icons, not color alone.
- Missing cells remain “Not available” or “Unknown.”
- Every row can expose methodology or source details.
- Screen readers receive row and column context.
- The comparison remains usable at 200% zoom and 320 px viewport width.

## 23. Saved comparisons

A saved comparison stores:

- Local comparison ID and name.
- Comparison family.
- Ordered stable entity references.
- Selected basis and context.
- Selected rows or metrics.
- Created, updated and last-opened timestamps.
- Status.

It does not copy scientific values. On reopen:

- Resolve current canonical records.
- Show when a record version changed.
- Preserve the previous comparison configuration.
- Mark missing or incompatible records.
- Require review before substituting a replacement.

## 24. Local data architecture

Phase 16 adds these IndexedDB stores:

1. Favourites.
2. Collections.
3. Collection items.
4. Recent queries.
5. Recent views.
6. Saved comparisons.
7. Settings.
8. Audit events.
9. Deleted-record tombstones.
10. Import conflicts.
11. Rebuildable private-search cache.

Canonical Phase 16 records are transactional. Search indexes and caches are derived and excluded from canonical backups.

## 25. Backup, restore and export contract

Phase 17 must include:

- Favourites.
- Collections.
- Collection membership and notes.
- Saved comparisons.
- Settings.
- Optional recent history when selected.
- Audit records where configured.
- Deleted-record tombstones needed for restore correctness.

Exclude:

- Public serialized indexes.
- Private search caches.
- Search worker state.
- Temporary suggestions.
- Derived result caches.

CSV exports:

- Favourites.
- Collections.
- Collection items.
- Recent queries, optional.
- Recent views, optional.
- Saved comparisons.

Unknown fields remain blank rather than becoming zero or false.

## 26. Performance requirements

Test with at least 5,000 representative search documents even if the current production dataset is smaller.

Budgets on the agreed test environment:

- Search dialog becomes interactive within 100 ms after the shell is loaded, excluding first index load.
- First index initialization completes within 500 ms on the chosen mid-tier mobile simulation or shows a non-blocking loading state.
- Query response for the first 20 results is under 100 ms at the 95th percentile after index load.
- Typing does not create a main-thread task over 50 ms.
- Search input debounce is 120 ms unless worker measurements prove it unnecessary.
- Result list renders the first 20 items without loading all result cards into the DOM.
- Public index compression and bundle impact are reported.
- If the serialized public index exceeds 2.5 MiB compressed or initialization exceeds the budget, shard by owning module or entity family and document the decision.

These are acceptance-test budgets, not claims about every device.

## 27. Accessibility requirements

Target WCAG 2.2 AA.

### 27.1 Search dialog

- Accessible name.
- Correct combobox/listbox or equivalent native semantics.
- `aria-controls` and active-option management where used.
- Keyboard selection.
- Escape to close.
- Focus contained while modal.
- Focus returned to invoker.
- Status announcements without focus theft.
- Visible focus in every theme.

### 27.2 Search results

- One logical heading hierarchy.
- Result count announced.
- Filters labelled and keyboard operable.
- Active filters removable by keyboard.
- Pagination has current-page semantics.
- Match highlighting does not reduce readability.

### 27.3 Favourites and collections

- Saved state announced.
- Drag/reorder has move-up, move-down and position controls.
- Destructive actions use confirmation and restore focus correctly.

### 27.4 Comparison

- Semantic row and column headers.
- Keyboard-operable horizontal navigation.
- Non-color difference indicators.
- Table and card alternatives preserve the same information.
- Hidden rows remain discoverable through a labelled control.

## 28. Privacy and security

- Search works without network calls.
- Queries are not sent to analytics.
- Private records and notes are never in URLs.
- Public result routes come from a typed allowlist.
- Search snippets are escaped and rendered as text.
- Do not use `dangerouslySetInnerHTML` for highlights.
- Validate imported Phase 16 JSON before writing.
- Sanitize collection and comparison names for display.
- Apply length limits to all query and note fields.
- Private-search caches are cleared when private search is disabled.
- Clearing recent history removes it transactionally.
- No search term, favourite, collection or comparison is added to error-reporting payloads.

## 29. Loading, empty, stale and error states

Required states:

- Public index loading.
- Public index unavailable and rebuild in progress.
- Index hash mismatch.
- No query entered.
- No results.
- Filtered to zero results.
- Private search disabled.
- Private index rebuilding.
- No favourites.
- Empty collection.
- Orphaned favourite.
- Compare tray has one item.
- Comparison contains a missing entity.
- Comparison incompatible after a module update.
- Restore conflict.
- Storage write failed.
- Search worker failed and safe main-thread fallback is available.

No state should silently fall back to fabricated data.

## 30. Component architecture

Recommended structure:

```text
src/
  features/search/
    adapters/
      search-engine-adapter.ts
      minisearch-adapter.ts
    build/
      build-public-search-documents.ts
      validate-search-documents.ts
      build-public-search-index.ts
    components/
      global-search-dialog.tsx
      search-input.tsx
      search-suggestions.tsx
      search-result-card.tsx
      search-filters.tsx
      active-filter-chips.tsx
      search-status.tsx
    domain/
      entity-registry.ts
      search-document.ts
      query-normalization.ts
      ranking.ts
      fuzzy-policy.ts
      search-url-state.ts
      search-manifest.ts
    worker/
      search.worker.ts
    routes/
      search-route.tsx
      search-settings-route.tsx
  features/saved/
    components/
    domain/
    repositories/
    routes/
  features/comparison/
    components/
    domain/
    families/
    routes/
  data/search/
    search-documents.public.json
    search-index.public.json
    search-manifest.json
```

Use the project’s native TanStack Start/React/TypeScript/Tailwind structure. Do not migrate frameworks.

## 31. TypeScript requirements

- Strict mode.
- Discriminated unions for entity types and comparison families.
- Branded stable IDs where practical.
- Zod or equivalent runtime validation at file and import boundaries.
- No unbounded `any`.
- No arbitrary route strings.
- Exhaustive switches for entity adapters.
- Versioned normalization, ranking and manifest types.
- Search results contain an explicit match-reason list for diagnostics.

## 32. Testing requirements

### 32.1 Build-time validation

- Entity registry exhaustive against enabled module adapters.
- Stable document IDs unique.
- Routes unique and valid.
- Draft records excluded.
- Alias collisions reported.
- Manifest and index hashes match.
- No unsupported entity enters a comparison family.

### 32.2 Search unit tests

- Exact title.
- Exact alias.
- Prefix.
- Multi-term AND behavior.
- Controlled fuzzy matching.
- Short-token fuzzy disabled.
- Numeric token fuzzy disabled.
- Deterministic tie-break.
- Duplicate alias collapse.
- Filter and sort behavior.
- Pagination.
- Query limit enforcement.
- XSS-safe highlighting.

### 32.3 Private-search tests

- Default off.
- Store and field allowlist.
- No private URL state.
- Cache cleared on disable.
- No network calls.
- Free-text notes excluded by default.

### 32.4 Favourite and collection tests

- Duplicate favourite blocked.
- Transaction failure does not show saved state.
- Orphan detection.
- Approved migration audit.
- Collection duplicate blocked.
- Manual reorder keyboard alternative.
- Delete semantics.

### 32.5 Comparison tests

- Family lock.
- Two-item minimum.
- Four-item maximum.
- Mixed family rejection.
- Missing value remains unavailable.
- Food basis and state.
- Nutrient framework compatibility.
- Supplement outcome/population compatibility.
- No winner or recommendation.
- URL validation.

### 32.6 Accessibility tests

- Search opens by button and keyboard.
- Focus enters and returns.
- Suggestion navigation.
- Count announcements.
- Filters and pagination.
- Favourite status announcement.
- Reorder alternative.
- Comparison table headers.
- 200% zoom.
- 320 px viewport.

### 32.7 Privacy/network tests

- Zero external search requests.
- Zero query analytics.
- No private terms in URLs.
- No personal data in error payloads.
- No search cache in backup.

The reference-data package contains 20 required integrity test vectors. All must be implemented.

## 33. Acceptance criteria

### 33.1 Public search

- [ ] The Phase 01 search shell is upgraded, not duplicated.
- [ ] All enabled public modules contribute through typed adapters.
- [ ] Only published records enter the public index.
- [ ] Exact title and alias matches rank deterministically.
- [ ] Controlled fuzzy rules match the specification.
- [ ] Public query and filter state survives refresh and browser navigation.
- [ ] No external search service or query telemetry exists.

### 33.2 Private search

- [ ] Private search is off by default.
- [ ] The user sees exactly which stores and fields are indexed.
- [ ] Private terms and IDs never enter URLs.
- [ ] Free-text sensitive fields remain excluded by default.
- [ ] The private cache is deleted when disabled.

### 33.3 Favourites, collections and recents

- [ ] Favourites use stable references.
- [ ] Duplicate favourites are blocked.
- [ ] Orphan and migration behavior is explicit.
- [ ] Collections support accessible reordering.
- [ ] Recent history is optional and clearable.
- [ ] Saved records stay local.

### 33.4 Comparison

- [ ] Ten comparison families are registered.
- [ ] Compare tray enforces family and item limits.
- [ ] Missing values remain unavailable.
- [ ] No family declares a universal winner.
- [ ] Food, nutrient, recovery and supplement context rules are enforced.
- [ ] Comparison tables are accessible and responsive.

### 33.5 Architecture and quality

- [ ] Search runs through a replaceable adapter and optional worker.
- [ ] Serialized index hashes are validated.
- [ ] Search caches are rebuildable and excluded from backup.
- [ ] TypeScript strict checking passes.
- [ ] Automated accessibility scan passes.
- [ ] Manual keyboard and screen-reader checks pass.
- [ ] Performance budgets are measured and reported.
- [ ] Earlier phases have no regressions.

## 34. Definition of done

Phase 16 is complete only when:

1. Public search reliably discovers canonical published records across all enabled modules.
2. Search ranking is deterministic, documented and tested.
3. Private search remains explicit, local and safe.
4. Favourites, collections, recents and saved comparisons persist correctly.
5. Incompatible comparisons are blocked.
6. Missing values remain honest.
7. The complete feature works on keyboard, touch and screen reader.
8. No user query or private record leaves the browser.
9. Backup adapters are registered for Phase 17.
10. All 20 integrity test vectors pass.

## 35. Lovable Plan-mode instruction

Read the Phase 16 specification, schema, reference data, prompt package and active Phase 00 Project Knowledge. Inspect all implemented Phase 01–15 routes and data contracts. Do not modify code yet.

Produce a plan that identifies:

- Existing Phase 01 search shell to upgrade.
- Every enabled entity adapter and canonical route source.
- Public build-time search artifacts.
- Search adapter, worker and index validation.
- Private-search store/field allowlists.
- IndexedDB migration and stores.
- Favourite, collection, recent and comparison repositories.
- Comparison-family implementations.
- Accessibility and performance tests.
- Privacy/network audit.
- Exact files to create or change.

Stop after the plan and wait for approval.

## 36. Lovable Agent-mode instruction

Implement only the approved Phase 16 plan.

Preserve completed modules. Do not fabricate domain content, publish draft records, add a backend, add telemetry, add an external search service, index private notes by default, create universal winners or replace missing values with zero.

After implementation report:

1. Files created and changed.
2. Indexed entity types and counts.
3. Excluded records and reasons.
4. Index version, adapter version and hashes.
5. IndexedDB migration and stores.
6. Comparison families implemented.
7. All test results mapped to acceptance criteria.
8. Accessibility results.
9. Performance measurements.
10. Network/privacy audit.

## 37. Source registry

| ID | Source | Role |
| --- | --- | --- |
| `src_w3c_wcag22` | World Wide Web Consortium: Web Content Accessibility Guidelines (WCAG) 2.2. https://www.w3.org/TR/WCAG22/ | keyboard_access, focus_visibility, status_messages, target_size, accessible_names |
| `src_w3c_apg_combobox` | World Wide Web Consortium: WAI-ARIA Authoring Practices: Combobox Pattern. https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ | search_autocomplete, keyboard_navigation, aria_controls, active_option |
| `src_w3c_apg_dialog` | World Wide Web Consortium: WAI-ARIA Authoring Practices: Modal Dialog Pattern. https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ | search_dialog, focus_entry, focus_trap, focus_return |
| `src_w3c_apg_table` | World Wide Web Consortium: WAI-ARIA Authoring Practices: Table Pattern. https://www.w3.org/WAI/ARIA/apg/patterns/table/ | comparison_tables, semantic_headers, native_html_preference |
| `src_w3c_status_messages` | World Wide Web Consortium: Understanding WCAG 2.2 Success Criterion 4.1.3: Status Messages. https://www.w3.org/WAI/WCAG22/Understanding/status-messages | result_count_announcements, filter_status, save_status |
| `src_mdn_indexeddb` | Mozilla Developer Network: IndexedDB API. https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API | local_structured_storage, transactional_favourites, recent_items, saved_comparisons |
| `src_mdn_web_workers` | Mozilla Developer Network: Web Workers API. https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API | background_index_loading, non_blocking_query_processing |
| `src_mdn_urlsearchparams` | Mozilla Developer Network: URLSearchParams. https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams | shareable_public_search_state, filter_state, comparison_deep_links |
| `src_mdn_string_normalize` | Mozilla Developer Network: String.prototype.normalize(). https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize | unicode_normalization |
| `src_mdn_intl_collator` | Mozilla Developer Network: Intl.Collator. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator | stable_human_sorting, locale_aware_tie_breaking |
| `src_minisearch_docs` | MiniSearch Project: MiniSearch Documentation. https://lucaong.github.io/minisearch/ | local_full_text_index, prefix_search, fuzzy_search, field_boosting, serialized_index |
| `src_minisearch_api` | MiniSearch Project: MiniSearch API Reference. https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html | search_options, autosuggest, serialization, index_loading |

## 38. Handoff to Phase 17

Phase 17 must treat these as canonical Phase 16 local records:

- Favourites.
- Collections.
- Collection items and notes.
- Recent history when selected.
- Saved comparisons.
- Settings.
- Audit events and deletion tombstones required for restore correctness.

Phase 17 must exclude public/private search caches and regenerate them after restore from canonical content and local records.
