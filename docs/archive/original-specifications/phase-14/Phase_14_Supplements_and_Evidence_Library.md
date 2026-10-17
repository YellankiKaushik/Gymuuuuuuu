# Phase 14 — Supplements and Evidence Library

**Project:** Fitness OS  
**Document type:** Lovable implementation specification  
**Phase:** 14 of the modular build  
**Version:** 1.0  
**Status:** Ready for Lovable Plan mode  
**Prepared:** 5 August 2026  
**Depends on:** Phases 00, 01, 07, 08, 09, 10, 12 and 13  
**Next phase:** Phase 15 — Body Progress, Dashboard and Analytics

---

## 1. Phase objective

Build a public supplement and sports-food evidence library plus optional device-local product and usage records. The module must help the user understand **what an ingredient is, which specific outcomes have been studied, how confident the evidence is, what protocol was studied, what safety concerns exist, how product quality is verified and whether anti-doping rules create additional risk**.

This phase is not a supplement store, prescriber, brand recommender, medical interaction checker or bodybuilding-product generator. Lovable must never fill missing claims, doses, adverse effects, interactions, legal statuses or anti-doping statuses from model memory.

**Core product rule:** One ingredient can have different evidence for different outcomes, populations, formulations, doses and timeframes. Therefore the application stores claim-level evidence, not one global “works” or “does not work” badge.

## 2. Scope

### 2.1 Included

- Public ingredient and sports-food catalogue.
- Public ingredient detail pages.
- Claim-level evidence records.
- Dose/protocol records only when directly sourced and reviewed.
- Safety, adverse-effect, interaction and contraindication education.
- Product-quality and label-reading education.
- Anti-doping education and dated WADA-status records.
- Dated snapshots of external frameworks such as AIS ABCD.
- Ingredient comparison by separate dimensions.
- Optional local personal-product records.
- Immutable product-label versions.
- Batch, lot, expiry and certification-verification records.
- Optional supplement trials and intake logs.
- Optional adverse-event log.
- JSON backup, restore and CSV export.

### 2.2 Explicit exclusions

- No automatic supplement recommendation.
- No brand ranking or purchase link.
- No affiliate links, advertisements or sponsored placement.
- No supplement-dose generator.
- No disease treatment, prevention or cure claim.
- No diagnosis of deficiency from symptoms or diet logs.
- No declaration that a product or combination is safe for an individual.
- No medication-change advice.
- No steroid, SARM, prohormone, peptide or research-chemical protocol.
- No automatic “stack” creation.
- No automatic pre-workout formulation.
- No calorie or macro credit unless a product is deliberately logged through the nutrition architecture.
- No live scraping of retailers, brands, product reviews or social media.
- No automatic copying of NIH, AIS, WADA, FDA, FSSAI, certification or commercial content.
- No claim that third-party certification guarantees zero risk.
- No claim that absence from the WADA list means medically safe or contamination-free.

## 3. Regulatory and evidence reality

1. Supplement law differs by jurisdiction. U.S. FDA, Indian FSSAI and Australian regulatory concepts must remain separate.
2. In the United States, dietary supplements are not approved like drugs before ordinary market entry. Manufacturer responsibility and post-market oversight do not prove efficacy.
3. In India, health supplements and nutraceuticals fall under FSSAI regulations and amendments. The application is educational and is not a legal-compliance engine.
4. The WADA Prohibited List is updated annually. The 2026 List took effect on 1 January 2026.
5. Anti-doping strict liability means athletes remain responsible for substances found in their body.
6. Third-party testing reduces defined quality or contamination risks; it does not prove that a supplement improves an outcome.
7. A product can have an accurate label but weak clinical evidence.
8. An ingredient can have promising evidence but an unverified product can still carry quality risk.
9. A product can be legal in one jurisdiction and restricted, unapproved or differently classified in another.
10. An external evidence framework is a dated expert classification, not a permanent truth.

## 4. Phase ownership and dependencies

| Concept | Owning phase | Phase 14 rule |
| --- | --- | --- |
| Application shell and reusable UI | Phase 01 | Reuse without redesign. |
| Food and nutrient identities | Phases 07–08 | Link nutrients and sports foods; do not duplicate composition data. |
| Diet targets | Phase 09 | Do not turn targets into supplement prescriptions. |
| Nutrition logging | Phase 10 | A supplement with calories or nutrients can be logged only through explicit compatible snapshots. |
| Recipes and meal plans | Phase 11 | No automatic supplement insertion into menus. |
| Sleep and recovery | Phase 12 | Link sleep/recovery outcomes without medical claims. |
| Cardio and performance outcomes | Phase 13 | Link outcome definitions; do not promise performance changes. |
| Dashboard and analytics | Phase 15 | Consume immutable Phase 14 records. |
| Global backup and restore | Phase 17 | Register a versioned Phase 14 adapter. |

## 5. Non-negotiable decisions

1. **Claims are atomic.** Every evidence claim names the ingredient, formulation, outcome, population, protocol, comparator, timeframe and sources.
2. **Evidence confidence and effect direction are separate.** “Low-confidence beneficial” differs from “high-confidence beneficial.”
3. **Safety is separate from efficacy.** Good evidence of an effect does not imply acceptable risk for every person.
4. **Quality is separate from efficacy.** Certification never upgrades an efficacy claim.
5. **Anti-doping is separate from legality and safety.** These are different dimensions.
6. **Research dose is not personal advice.** Protocols are labelled as study or expert-framework protocols.
7. **No missing-value invention.** Unknown dose, form, adverse effect or interaction remains unavailable.
8. **No global verdict.** Ingredient pages must not display one unqualified “effective” badge.
9. **No proprietary-blend allocation.** If individual amounts are not disclosed, the app cannot divide the blend total among ingredients.
10. **Framework classifications are snapshots.** AIS, WADA and regulatory records include source and review date.
11. **Not listed is not safe.** A current-list search result cannot guarantee permission, product purity or medical safety.
12. **Certification is verified, not assumed.** Logos, marketing text and seller claims are insufficient.
13. **Historical labels are immutable.** A reformulated product creates a new version.
14. **One-change trials are preferred.** The app warns that multi-ingredient changes make attribution difficult.
15. **Symptoms override normal use.** Severe adverse-event signals suppress trial guidance and surface stop/report/help information.
16. **No hidden scoring.** Evidence, safety, quality and anti-doping dimensions remain visible separately.
17. **Local means local.** Product labels, usage, symptoms and safety contexts remain on device unless exported.

## 6. Required routes

| Route | Purpose |
| --- | --- |
| `/supplements` | Overview, search, evidence education and local tools. |
| `/supplements/ingredients` | Ingredient catalogue. |
| `/supplements/ingredients/$ingredientSlug` | Ingredient detail. |
| `/supplements/compare` | Claim-specific ingredient comparison. |
| `/supplements/evidence` | Evidence-methodology library. |
| `/supplements/evidence/$topicSlug` | Evidence-topic detail. |
| `/supplements/safety` | Safety, interactions and adverse-event education. |
| `/supplements/quality` | Product quality, label and certification education. |
| `/supplements/anti-doping` | Anti-doping library and current-list methodology. |
| `/supplements/frameworks` | AIS, WADA, NIH, FDA, FSSAI and certification-framework pages. |
| `/supplements/products` | Local personal products. |
| `/supplements/products/create` | Capture a product and label version. |
| `/supplements/products/$productId` | Local product detail and versions. |
| `/supplements/trials` | Local supplement trials. |
| `/supplements/trials/create` | Create a trial without generating a dose. |
| `/supplements/trials/$trialId` | Trial detail, intake history and outcome notes. |
| `/supplements/adverse-events` | Local adverse-event history and reporting resources. |
| `/supplements/methodology` | Data model, evidence rules, sources and version history. |
| `/supplements/settings` | Units, athlete mode, jurisdiction and privacy. |
| `/supplements/privacy` | Local storage and network behavior. |

Invalid public slugs show a recoverable not-found state. Corrupt local records are quarantined rather than crashing valid data.

## 7. Public ingredient catalogue

### 7.1 Catalogue cards

Every card may show only reviewed fields:

- Canonical name.
- Common aliases.
- Ingredient category.
- Studied outcome domains.
- Number of reviewed claims.
- Highest current evidence confidence for a selected outcome, not globally.
- Safety-review status.
- Anti-doping-review status and list year.
- External framework snapshots with dates.
- Last reviewed date.

Draft identities with no reviewed claims remain hidden by default. A development-only switch may show draft identities.

### 7.2 Search and aliases

Search canonical names, chemical names, botanical Latin names, common abbreviations and known label aliases. Alias matching must never merge chemically distinct forms. Examples:

- Creatine monohydrate is not automatically interchangeable with every creatine salt.
- Citrulline and citrulline malate remain separate formulations.
- Vitamin D2 and D3 may require separate form records.
- Magnesium oxide and magnesium citrate must not inherit the same absorption or tolerability claims without evidence.
- Probiotic evidence must preserve genus, species and strain when the source does.

### 7.3 Filters

- Category.
- Outcome domain.
- Population.
- Formulation.
- Evidence confidence.
- Effect direction.
- Safety severity.
- External framework classification.
- Anti-doping status.
- Third-party quality relevance.
- Review status.

Filter state must be encoded in the URL.

## 8. Ingredient detail page

Required sections:

1. Identity and aliases.
2. What it is.
3. Food sources or endogenous production where relevant.
4. Available forms.
5. Studied outcomes.
6. Claim-level evidence cards.
7. Studied protocols.
8. Safety and adverse effects.
9. Contraindications and interactions.
10. Nutrient upper-limit context where relevant.
11. Anti-doping status and contamination risk.
12. Product-quality considerations.
13. External framework snapshots.
14. Related ingredients.
15. Phase 07 food links and Phase 08 nutrient links.
16. Methodology and sources.
17. Review history.

The page must never collapse all evidence into one traffic-light answer.

## 9. Claim-level evidence model

Every claim record requires:

- Stable claim ID.
- Ingredient identity ID.
- Exact formulation or form.
- Outcome ID.
- Outcome definition.
- Population and training status.
- Sex and age limits when relevant.
- Baseline status or deficiency status when relevant.
- Intervention protocol.
- Comparator.
- Duration.
- Effect direction.
- Magnitude only if directly extractable and meaningful.
- Evidence confidence.
- Assessment method.
- Number and type of supporting studies.
- Known harms.
- Applicability limitations.
- Claim-level source IDs.
- Reviewer and review date.
- Publication status.

### 9.1 Effect-direction labels

- Beneficial.
- No clear benefit.
- Harmful.
- Mixed.
- Insufficient evidence.
- Not applicable.

### 9.2 Evidence-confidence labels

- High.
- Moderate.
- Low.
- Very low.
- Not assessed.

These labels are editorial unless the exact source uses a formal grading process. Lovable must not call the internal system “GRADE” unless a documented GRADE assessment was actually completed.

### 9.3 Evidence card

Each card must answer:

- What outcome was studied?
- In whom?
- Which form?
- What protocol?
- Compared with what?
- What was the direction and practical size of effect?
- How confident are we?
- What did the studies not establish?
- Which safety constraints matter?
- When was this reviewed?

## 10. Protocol and dose records

Dose data are high-risk fields. A protocol can be published only when all required fields are sourced:

- Lower and upper amount when a range exists.
- Unit.
- Basis such as per serving, per day, per kilogram or concentration.
- Frequency.
- Timing.
- Duration.
- Loading and maintenance distinction.
- Exact form.
- Applicable population.
- Safety limits.
- Source IDs.
- Review date.

Rules:

1. A study dose is labelled **research protocol**, not recommendation.
2. An AIS protocol is labelled **AIS framework protocol** with date.
3. A nutrient RDA or AI is not a performance-supplement dose.
4. A UL is not a target.
5. A product serving is not proof of an effective or safe dose.
6. Body-mass-based calculations require explicit user action and display the source formula.
7. No protocol is created from a marketing label.
8. Multi-ingredient proprietary blends cannot produce ingredient-specific protocol calculations.
9. If the source gives no reliable dose, display `Protocol unavailable`.
10. The app never produces a final “take this amount” instruction.

## 11. Safety and interaction model

### 11.1 Safety profile

Each ingredient may have:

- Common adverse effects.
- Serious adverse effects.
- Dose-related concerns.
- Duration-related concerns.
- Contaminant concerns.
- Contraindicated populations.
- Pregnancy and lactation status.
- Paediatric boundary.
- Kidney and liver boundary.
- Cardiovascular boundary.
- Surgery and anaesthesia boundary.
- Allergy or cross-reactivity.
- Laboratory-test interference.
- Medication interactions.
- Supplement-supplement interactions.
- Stop signals.
- Sources and review date.

### 11.2 Interaction records

An interaction record must identify:

- Ingredient and form.
- Interacting medicine class, condition, supplement, food or test.
- Direction and mechanism when supported.
- Severity.
- Evidence confidence.
- Recommended action category: informational, caution, professional review, avoid without medical supervision or urgent stop signal.
- Source IDs.
- Limitations.

The UI never returns `safe to combine`. Lack of a known interaction is not proof of safety.

### 11.3 Total exposure

For vitamins, minerals, caffeine and other dose-sensitive compounds, the app may display known amounts across locally captured products. It must also show completeness limits:

- Foods may contribute additional intake.
- Labels may be incomplete.
- Proprietary blends may hide amounts.
- The user may not have logged every product.
- Bioavailability and individual risk differ.

The module cannot diagnose toxicity or deficiency.

## 12. Adverse-event workflow

### 12.1 Local adverse-event record

Capture:

- Date, time and time zone.
- Symptoms.
- Severity selected by the user.
- Related intake logs.
- Suspected products.
- Product label and lot snapshot.
- Action taken.
- Whether professional care occurred.
- Resolution time.
- External-report jurisdiction and reference.
- Notes.

### 12.2 Urgent signals

Display prominent stop-and-seek-help language for serious signals including breathing difficulty, swelling, fainting, chest pain, severe shortness of breath, palpitations, severe persistent gastrointestinal symptoms, reduced or dark urine, abnormal bleeding, jaundice, severe pain, marked behavioral change, suicidal thoughts or stroke-like symptoms.

The app must not diagnose causality. It records suspicion and preserves evidence.

### 12.3 Reporting resources

Reporting links are jurisdiction-specific and must be maintained as reviewed external resources. The U.S. FDA Safety Reporting Portal may be linked for U.S. users. India-specific and other jurisdictional reporting pathways require separate verified records before display.

## 13. Product identity and label versions

### 13.1 Personal product

Store locally:

- Product display name.
- Brand.
- Purchase country.
- Product type.
- Current label-version ID.
- Notes.

### 13.2 Immutable label version

A label version captures:

- Capture date.
- Serving-size text.
- Servings per container.
- Every listed ingredient.
- Exact amount and unit when disclosed.
- Form or chemical name.
- Proprietary-blend disclosure state.
- Other ingredients.
- Allergen statements.
- Warnings.
- Manufacturer or distributor details.
- Lot or batch number.
- Expiry date.
- Label-image references stored locally.
- Certification evidence.
- User notes.

Editing creates a new version. Previous trials and intake logs continue to reference the old version.

### 13.3 Label parsing boundary

Lovable may provide a structured manual-entry form. It must not perform OCR or infer unclear text automatically in the MVP. A future image parser would require explicit review and confirmation for every extracted value.

## 14. Proprietary blends and multi-ingredient products

- Store the blend name and total mass when disclosed.
- Store each listed component name.
- Keep each component amount unknown unless individually disclosed.
- Do not assume equal allocation.
- Do not infer the order-based quantity.
- Do not calculate whether each ingredient reaches a studied protocol.
- Show increased interpretation uncertainty.
- Show interaction and stimulant-stacking warnings when relevant.
- Do not assign the product the evidence grade of its best-known ingredient.

## 15. Product quality and certification

### 15.1 Separate dimensions

Show these independently:

- Identity verification.
- Label-content verification.
- Potency or strength verification.
- Contaminant testing.
- Banned-substance screening.
- Manufacturing audit.
- Lot- or batch-specific verification.
- Registry check date.

### 15.2 Verification workflow

1. Select certification scheme.
2. Open the official live registry.
3. Search product, brand and lot when supported.
4. Store the result, verification time, registry URL and evidence note.
5. Never infer certification from a logo alone.
6. Recheck when buying a new lot or when the record expires.
7. Display `not checked`, `not found`, `uncertain` or `registry unavailable` honestly.

### 15.3 Certification limitations

- Certification does not prove clinical efficacy.
- Certification does not guarantee zero adverse effects.
- Certification does not guarantee compatibility with medication or disease.
- A general quality mark may not include sport-specific banned-substance screening.
- Brand-level certification may not cover every product or lot.
- No scheme guarantees zero anti-doping risk.

## 16. Anti-doping architecture

### 16.1 Substance-level record

Required fields:

- Ingredient or substance identity.
- WADA list year.
- Status: not assessed, not identified, prohibited at all times, prohibited in competition, prohibited in specific sports, monitoring program, high contamination risk or unclear.
- Exact WADA category when available.
- Competition context.
- Sport context.
- Known aliases and metabolites requiring review.
- Source URL.
- Reviewed date.
- Reviewer status.

### 16.2 Product-level risk

A product-level assessment remains separate:

- Batch-tested evidence.
- Lot match.
- High-risk category.
- Proprietary blend.
- Undeclared-ingredient alerts.
- Product or brand warnings from live official resources.
- Purchase-channel traceability.
- Seal integrity and expiry.

### 16.3 Athlete mode

Optional Athlete Mode adds:

- Current WADA list year.
- Sport-specific warning.
- Certification-verification prompts.
- Lot and expiry requirement.
- Evidence-preservation checklist.
- Doping-control declaration reminder.
- Strong warning for muscle-builder, fat-burner and pre-workout categories.

Athlete Mode never declares a product risk-free.

## 17. External framework pages

Framework pages explain:

- Scope.
- Publisher.
- Current version or review date.
- What the framework classifies.
- What it does not classify.
- Relationship to the app’s internal evidence records.
- Source links.

The AIS ABCD snapshot is displayed as a dated external classification. Lovable must not transform AIS Group A into “recommended for everyone” or Group C into “illegal.”

## 18. Ingredient comparison

Allow comparison of up to four ingredients for one selected outcome and population.

Columns:

- Ingredient and form.
- Exact claim.
- Population.
- Protocol studied.
- Effect direction.
- Evidence confidence.
- Magnitude and limitations.
- Common adverse effects.
- Serious concerns.
- Interaction burden.
- Anti-doping status and year.
- Quality-verification considerations.
- Cost field only if entered locally by the user.

No automatic winner is selected. No brand or product recommendation is produced.

## 19. Supplement trial system

### 19.1 Purpose

The trial tool supports structured self-observation. It does not validate efficacy or prove causality.

### 19.2 Trial creation

Require:

- Trial title.
- Ingredient or exact product-label version.
- Reason for trial.
- One or more predefined outcomes.
- Baseline period where practical.
- Start and planned end date.
- User-entered protocol or externally reviewed protocol reference.
- Professional-review status.
- Stop rules.
- Notes.

The app must not generate the protocol.

### 19.3 Trial guidance

- Prefer one major change at a time.
- Preserve training, sleep, diet and recovery context links.
- Record adherence.
- Record subjective effects separately from objective measurements.
- Do not treat expectation or placebo effects as proof or failure.
- Stop normal guidance when adverse-event signals occur.
- A completed trial produces a personal observation summary, not a scientific conclusion.

### 19.4 Intake log

Capture:

- Local date and time zone.
- Timestamp.
- Product label version.
- Serving count or exact entered amount.
- Ingredient snapshot.
- Context such as pre-workout, with meal, before sleep or rest day.
- Notes.

Historical logs are immutable snapshots.

## 20. Personal safety context

Optional local flags:

- Under 18.
- Pregnancy or lactation.
- Medication use.
- Kidney condition.
- Liver condition.
- Cardiovascular condition.
- Bleeding risk.
- Scheduled surgery.
- Allergy or intolerance.
- Tested athlete.
- Other professional-review need.

These flags suppress generic use language and increase professional-review prompts. The user is not required to enter diagnoses or medicine names.

## 21. Static data contracts

### 21.1 Ingredient identity

- ID and slug.
- Canonical name.
- Aliases.
- Category.
- Chemical or botanical identity.
- Plant part where relevant.
- Forms.
- Related Phase 08 nutrient IDs.
- Related Phase 07 food IDs.
- Outcome domains.
- Claim IDs.
- Safety-profile ID.
- Anti-doping-record IDs.
- External framework snapshots.
- Source IDs.
- Review metadata.
- Publication status.

### 21.2 Evidence claim

Use the contract in the reference-data file. Claims cannot publish without source IDs, population, formulation, protocol, limitations and review metadata.

### 21.3 Safety profile

Safety profiles cannot publish without explicit uncertainty and professional-review boundaries.

### 21.4 Source registry

Every source record includes publisher, year, type, URL, role, reuse note, review date and status. Broken links do not delete historical source identity.

## 22. Local storage architecture

Use IndexedDB with versioned migrations and transactions.

Required stores:

1. Personal products.
2. Immutable product-label versions.
3. Supplement trials.
4. Intake logs.
5. Adverse events.
6. Personal safety contexts.
7. Saved comparisons.
8. Settings.
9. Audit events.
10. Deleted-record tombstones.
11. Import conflicts.
12. Rebuildable derived summaries.

Static public evidence content remains version-controlled application data, not editable personal data.

## 23. Backup and export

### 23.1 JSON backup

Include:

- Schema version.
- Export timestamp.
- Module ID.
- Every Phase 14 local store except rebuildable indexes.
- Product-label versions.
- Trial and intake snapshots.
- Certification-verification records.
- Adverse-event records.
- Safety contexts.

### 23.2 Restore

- Validate the entire file before writing.
- Show counts by entity.
- Preview conflicts.
- Support keep existing, import as copy and replace local.
- Use one transaction.
- Preserve immutable historical versions.
- Rebuild indexes after success.
- Do not partially import an invalid file.

### 23.3 CSV exports

Separate exports:

- Products and label versions.
- Ingredient amounts.
- Certification checks.
- Trials.
- Intake logs.
- Adverse events.
- Personal observations.

Unknown values remain blank, never zero.

## 24. Privacy and network behavior

- No authentication.
- No cloud database.
- No analytics containing product names, ingredients, medication-context flags, symptoms, notes, lot numbers or trial outcomes.
- No runtime transmission of local product or health data.
- External source and certification links open only after user action.
- No automatic product lookup API in the MVP.
- No retailer tracking pixels.
- Local images remain local and are included in backup only if the backup architecture explicitly supports them.

## 25. Accessibility and responsive behavior

- WCAG 2.2 AA target.
- Keyboard-accessible catalogue, tabs, dialogs and comparison controls.
- Evidence confidence cannot rely on colour alone.
- Safety severity requires text and icon.
- Tables must provide mobile card alternatives.
- Source links have descriptive labels.
- Warning banners use `role="alert"` only for immediate actionable hazards.
- No horizontal overflow at 320 CSS pixels.
- Screen readers receive expanded forms of abbreviations such as WADA, AIS, NSF and USP.
- Reduced-motion preference is respected.

## 26. Performance requirements

- Search index is generated at build time.
- Ingredient detail pages lazy-load long evidence sections.
- Filter operations remain local.
- Draft content is excluded from production indexes.
- Source and evidence references use stable IDs.
- Large personal histories are paginated or virtualized.
- No source webpage is fetched automatically during normal browsing.

## 27. Publication gates

### 27.1 Ingredient page gate

Require:

- Verified identity.
- At least one reviewed source.
- Identity/form distinctions.
- Safety status.
- Explicit unknowns.
- Review metadata.

### 27.2 Claim gate

Require:

- Outcome.
- Population.
- Formulation.
- Protocol.
- Comparator or context.
- Direction.
- Confidence.
- Limitations.
- Sources.
- Reviewer approval.

### 27.3 Protocol gate

Require directly sourced amount, unit, basis, timing, duration, population and safety context. Otherwise protocol remains unavailable.

### 27.4 Anti-doping gate

Require list year, exact status, source, review date and warning. No stale status is silently displayed as current.

### 27.5 Framework gate

Require publisher, version/date, scope and source. External classifications never become app-owned universal recommendations.

## 28. Required UI components

- `SupplementSearchInput`
- `IngredientCard`
- `IngredientIdentityHeader`
- `OutcomeSelector`
- `EvidenceClaimCard`
- `EvidenceConfidenceBadge`
- `EffectDirectionLabel`
- `ProtocolCard`
- `SafetyProfilePanel`
- `InteractionTable`
- `TotalExposureWarning`
- `AntiDopingStatusPanel`
- `FrameworkSnapshotBadge`
- `CertificationVerificationCard`
- `ProductLabelVersionPanel`
- `ProprietaryBlendWarning`
- `IngredientComparisonTable`
- `SupplementTrialBuilder`
- `IntakeLogForm`
- `AdverseEventForm`
- `SourceDrawer`
- `ReviewHistoryPanel`
- `LocalDataStatusCard`

Components must reuse Phase 01 tokens and shared controls.

## 29. Acceptance criteria

- [ ] No authentication, backend or cloud database is added.
- [ ] Public ingredient pages use claim-level evidence.
- [ ] No global “works” badge exists.
- [ ] Evidence confidence and direction are separate.
- [ ] Unknown dose and interaction data remain unavailable.
- [ ] Research protocols are not phrased as prescriptions.
- [ ] Proprietary blends do not receive invented ingredient amounts.
- [ ] FDA, FSSAI and other regulatory summaries remain jurisdiction-specific.
- [ ] WADA status includes list year and review date.
- [ ] Not-listed status includes a clear limitation warning.
- [ ] Certification requires registry verification and does not imply efficacy.
- [ ] Product labels are immutable versions.
- [ ] Intake logs preserve label and ingredient snapshots.
- [ ] Adverse-event records preserve product, lot and timeline evidence.
- [ ] Urgent symptoms suppress normal trial guidance.
- [ ] No brand recommendation, purchase link or affiliate link exists.
- [ ] No steroid, SARM, peptide or research-chemical protocol exists.
- [ ] Local records do not leave the device during runtime.
- [ ] JSON backup validates before transactional import.
- [ ] CSV exports preserve unknown values as blank.
- [ ] The interface works at 320 CSS pixels.
- [ ] Keyboard and screen-reader flows are complete.
- [ ] Draft seed identities are not public by default.
- [ ] Existing phases continue to work.

## 30. Testing matrix

### 30.1 Evidence tests

- Same ingredient with beneficial and no-clear-benefit claims for different outcomes.
- Same ingredient with different formulations.
- Same outcome with different populations.
- Missing protocol.
- Low confidence with beneficial direction.
- High confidence with no clear benefit.
- Stale review date.
- Removed or superseded claim.

### 30.2 Safety tests

- Medication interaction requiring professional review.
- Duplicate nutrient across three products.
- Unknown proprietary-blend amount.
- Pregnancy flag.
- Tested-athlete flag.
- Severe adverse-event stop signal.
- No known interaction record.

### 30.3 Product tests

- New label version after reformulation.
- New lot with no certification check.
- Logo shown but registry not checked.
- Certification not found.
- Certification verified for a different lot.
- Expired product.
- Missing lot number.
- Counterfeit-risk note.

### 30.4 Anti-doping tests

- 2026 prohibited-at-all-times status.
- In-competition-only status.
- Sport-specific status.
- Not assessed.
- Not identified on current list.
- WADA year changes to 2027 and old records become stale.
- High-risk product with ingredient absent from label.

### 30.5 Local data tests

- Refresh during trial creation.
- Duplicate tab edit conflict.
- Soft delete and undo.
- Full JSON export and restore.
- Invalid backup rejection.
- Import-as-copy conflict mode.
- Historical label snapshot remains unchanged.
- Offline use.

## 31. Lovable implementation sequence

1. Read Phase 00 and this specification completely.
2. Inspect existing Phase 01, 07, 08, 09, 10, 12 and 13 contracts.
3. Produce a Plan-mode response before code changes.
4. Add routes and placeholders.
5. Add static TypeScript contracts and validation.
6. Load seed identities as draft only.
7. Build catalogue and ingredient detail shell.
8. Build claim-level evidence UI.
9. Build safety, interaction, quality and anti-doping sections.
10. Build framework and methodology pages.
11. Build local product and immutable-label storage.
12. Build trial, intake and adverse-event records.
13. Build certification-verification records.
14. Build backup, restore and CSV export.
15. Add accessibility and responsive behavior.
16. Run test vectors and verify no network leakage.
17. Do not publish draft scientific content.

## 32. Definition of done

Phase 14 is complete only when the application can accurately represent evidence, uncertainty, safety, quality and anti-doping risk without generating a personal supplement prescription. A user must be able to research a reviewed ingredient, compare claim-specific evidence, capture an exact product label, preserve lot and certification evidence, run an optional local observation trial and export the history without creating an account.

## 33. Source registry

The machine-readable source registry is in `Phase_14_Supplements_Evidence_Reference_Data.json`. The following sources are foundational:

| Source | Role |
| --- | --- |
| NIH Office of Dietary Supplements | Ingredient monographs, efficacy, safety and interactions. |
| FDA | U.S. regulation, product warnings and adverse-event reporting. |
| NCCIH | Bodybuilding and performance-product evidence and harm education. |
| IOC consensus | Athlete decision framework and anti-doping risk. |
| AIS Supplement Framework | Dated ABCD ingredient classifications and practitioner resources. |
| WADA 2026 Prohibited List | Current anti-doping standard for 2026. |
| Sport Integrity Australia and USADA | Contamination and product-risk education. |
| NSF and USP | Third-party product-quality verification. |
| OPSS | Ingredient and military supplement-safety resources. |
| FSSAI | Indian health-supplement and claims regulatory resources. |

## 34. Files in this phase package

- `Phase_14_Supplements_and_Evidence_Library.md`
- `Phase_14_Supplements_Evidence_Data_Schema.json`
- `Phase_14_Supplements_Evidence_Reference_Data.json`
- `Phase_14_Lovable_Prompt_Package.txt`
- `Phase_14_Supplements_and_Evidence_Library.docx`
- `Phase_14_Quick_Implementation_Reference.txt`
