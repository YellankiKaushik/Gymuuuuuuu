# Phase 02 — Muscle and Functional Anatomy Library

**Project:** Fitness Knowledge and Tracking Application  
**Working product name:** Fitness OS  
**Document type:** Lovable implementation specification  
**Phase:** 02 of 20  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Lovable Plan mode

---

## Document purpose

This document tells Lovable exactly how to build the Muscle and Functional Anatomy Library on top of the completed Phase 00 foundation and Phase 01 application shell. The module must give users a precise, training-oriented understanding of muscles, body regions, joint actions and movement relationships without pretending to be a medical diagnosis or a full clinical anatomy atlas.

Phase 02 is not a decorative body chart. It is the anatomical data foundation for later exercise, workout-program, recovery and mobility modules. Exercise records created in Phase 03 must reference the canonical muscle identities and movement terms established here rather than inventing their own labels.

The module must remain useful in three ways:

1. A beginner can select a familiar body area such as chest, back or quadriceps and understand what it contains.
2. An intermediate user can study individual muscles, subdivisions, joint actions and training roles.
3. Later application modules can query stable muscle IDs and relationships to power exercise filtering, workout planning and progress summaries.

## How to use this document in Lovable

1. Open the existing project after Phase 01 has passed its acceptance criteria.
2. Confirm that Phase 00 Project Knowledge remains active.
3. Attach Phase 00, Phase 01 and this Phase 02 Markdown document.
4. Also attach `Phase_02_Muscle_Data_Schema.json` and `Phase_02_Seed_Taxonomy.json`.
5. Use the Plan-mode prompt in Section 38 before allowing code changes.
6. Reject any plan that introduces authentication, a cloud database, fabricated anatomy, copied proprietary illustrations or a framework migration.
7. Approve implementation only after Lovable maps every requirement to files and tests.
8. Run the Agent-mode prompt in Section 39.
9. Run the verification prompt in Section 40 and manually test Section 34.
10. Correct all Phase 02 defects before Phase 03 begins.
11. Create a stable GitHub checkpoint named `phase-02-muscle-library-complete`.

---

## 1. Phase objective

Build a structured, searchable and accessible functional-anatomy module containing:

- A training-oriented muscle catalogue.
- Body-region and muscle-group navigation.
- Canonical anatomical terminology and user-friendly aliases.
- Individual muscle and functional-group detail pages.
- A data-driven front/back body-region selector.
- Joint-action and movement relationships.
- Training relevance expressed as qualitative roles, not invented activation percentages.
- Clear source, review and media-license metadata.
- Stable data contracts for Phase 03 Exercise Encyclopedia.
- Responsive, accessible interfaces integrated into the Phase 01 shell.

The phase is complete only when the module can be used independently for learning and can serve as the canonical anatomy layer for future modules.

## 2. Dependencies and assumptions

### 2.1 Required Phase 00 and Phase 01 outputs

The project must already have:

- The Lovable-native application scaffold.
- Strict TypeScript configuration.
- The Phase 01 responsive shell and typed navigation manifest.
- Routes `/muscles` and `/muscles/$slug`.
- Shared `PageHeader`, breadcrumbs, card, filter, feedback and source components or equivalent primitives.
- Light, dark and system theme support.
- Shared source metadata, unit conventions and value-status types.
- No authentication, server-side personal profiles or cloud personal-data storage.
- Project documentation and phase records.

If one of these dependencies is missing, Lovable may add the minimum compliant foundation after documenting the gap. It must not redesign Phase 01.

### 2.2 Phase relationship

Phase 02 owns canonical anatomy identities. Later modules must reference them.

| Later module | Required Phase 02 dependency |
| --- | --- |
| Exercise Encyclopedia | Primary, secondary and stabilizer muscle IDs; joint actions; regions. |
| Workout Science | Agonist, antagonist, synergist and stabilizer terminology. |
| Workout Programs | Muscle-group volume summaries and program coverage. |
| Workout Tracker | Muscle-group history derived from logged exercise relationships. |
| Recovery and Mobility | Body-region links, mobility relationships and caution tags. |
| Search | Muscle names, aliases, regions, actions and related exercises. |

### 2.3 No medical atlas claim

This library is a fitness education product. It does not attempt to catalogue every clinically named structure, fascial plane, nerve branch or vascular structure. It must not diagnose pain, injury, nerve damage, posture disorders or disease.

## 3. Required deliverables

Lovable must produce:

1. `/muscles` catalogue page.
2. `/muscles/$slug` muscle/group detail template.
3. Training-region overview cards.
4. Accessible front/back body-region selector.
5. Text/list alternative to every graphical body-map interaction.
6. Muscle search, filters, sort and URL state.
7. Canonical muscle data types and validation.
8. Repository-owned muscle data loader.
9. Source and review metadata display.
10. Related muscles, related movements and future exercise-link placeholders.
11. Responsive detail-page navigation.
12. Empty, unavailable and invalid-slug behavior.
13. Automated data, routing, filtering and accessibility tests.
14. `docs/muscle-library.md` and `docs/phases/phase-02.md`.
15. A migration-free handoff contract for Phase 03.

## 4. Scope boundaries

### 4.1 Build in this phase

- Functional-anatomy knowledge architecture.
- Body regions, training-facing muscle groups and individual muscle/subdivision records.
- Standard anatomical names, common names and aliases.
- High-level attachment summaries where verified.
- Joint actions and movement terminology.
- Functional roles and relationships.
- Training relevance and qualitative contribution labels.
- Accessible region/body-map navigation.
- Source attribution and content-status indicators.
- Local favourites only if Phase 01 already provides a generic saved-items primitive; otherwise show a non-functional future placeholder.
- Static repository-owned structured content.

### 4.2 Do not build in this phase

- Exercise technique pages or full exercise records.
- Workout plans, volume prescriptions or set/rep programming.
- EMG ranking tables or exact muscle activation percentages.
- Injury diagnosis, rehabilitation protocols or pain treatment.
- Medical imaging, pathology or surgical anatomy.
- User accounts, profiles or cloud synchronization.
- Supabase, Firebase, Lovable Cloud or another runtime content database.
- AI-generated anatomy illustrations presented as authoritative.
- Scraped copyrighted diagrams or copied textbook prose.
- 3D anatomical engines or paid anatomy SDKs.
- Camera-based posture or form analysis.
- Final favourite, comparison or progress systems beyond existing generic shell support.

## 5. Product and learning model

The module must support progressive depth rather than forcing every user to read advanced anatomy.

| Level | User need | Content shown first |
| --- | --- | --- |
| Foundation | “What is this body area?” | Familiar name, location, main function, major exercises placeholder, simple visual. |
| Practical | “How does it move and train?” | Joint actions, functional roles, movement patterns, related muscles, training relevance. |
| Detailed | “What exactly is the anatomy?” | Canonical name, subdivisions, attachment summary, innervation summary, fiber direction, joint crossings and sources. |

Use progressive disclosure. The detail page should open with practical information and place advanced anatomy in clearly labelled sections or accordions.

## 6. Information architecture

### 6.1 Primary routes

| Route | Purpose |
| --- | --- |
| `/muscles` | Catalogue, body-region selector, search and filters. |
| `/muscles/$slug` | Individual muscle, subdivision or functional-group detail page. |
| `/learn` | Existing overview; link to Muscles without duplicating the catalogue. |
| `/about/sources` | Existing methodology page; link to anatomy source policy. |

Do not create a separate route for every tab or accordion. Use stable section anchors on the detail page.

### 6.2 Detail-page anchors

Use predictable IDs:

- `#overview`
- `#location`
- `#anatomy`
- `#actions`
- `#training`
- `#relationships`
- `#cautions`
- `#sources`

Anchor navigation must account for the sticky top bar and preserve browser back/forward behavior.

### 6.3 Catalogue entry paths

Users must be able to reach a muscle through:

- Search.
- Region cards.
- Front/back body selector.
- Training-group filters.
- Joint-action filters.
- Related-muscle links.
- Direct URL.

## 7. Domain taxonomy

### 7.1 Entity levels

Do not collapse all concepts into one untyped list. Use these entity levels:

| Entity type | Example | Purpose |
| --- | --- | --- |
| Body region | Shoulder region | Broad navigation and body map. |
| Functional training group | Chest | Familiar training category. |
| Anatomical group | Rotator cuff | Named multi-muscle functional group. |
| Individual muscle | Supraspinatus | Canonical anatomical structure. |
| Subdivision/head/portion | Anterior deltoid | Training-relevant portion of a muscle. |
| Joint action | Shoulder abduction | Normalized movement term. |
| Functional role | Stabilizer | Contextual role in a movement, not permanent identity. |

A single detail page template may render multiple entity types, but the record must declare its type.

### 7.2 Body regions

Required first-release regions:

1. Neck.
2. Shoulder.
3. Chest.
4. Upper back.
5. Lower back.
6. Upper arm.
7. Forearm and hand-grip region.
8. Core and trunk.
9. Hip and gluteal region.
10. Front thigh.
11. Back thigh.
12. Inner/outer thigh.
13. Lower leg and calf.

The body selector may visually combine or split regions for usability, but canonical region IDs must remain stable.

### 7.3 Movement patterns

Normalize these training-facing movement patterns for future cross-module use:

- Horizontal push.
- Horizontal pull.
- Vertical push.
- Vertical pull.
- Squat/knee-dominant.
- Hinge/hip-dominant.
- Lunge/split stance.
- Carry.
- Rotation.
- Anti-rotation.
- Flexion.
- Extension.
- Abduction.
- Adduction.
- Scapular elevation/depression.
- Scapular protraction/retraction.
- Locomotion.
- Breathing/bracing.

These are not substitutes for joint actions. Store both when applicable.

## 8. Anatomical terminology and naming rules

### 8.1 Canonical standard

Use the current IFAA/FIPAT Terminologia Anatomica as the reference for canonical anatomical nomenclature. User-facing labels may use familiar English terms, but each record must retain a canonical anatomical name and aliases.

### 8.2 Naming hierarchy

Each record must have:

- `id`: immutable machine identifier.
- `slug`: stable URL-safe identifier.
- `displayName`: concise user-facing English name.
- `anatomicalName`: canonical anatomical name.
- `latinName`: optional Latin term when useful and verified.
- `aliases`: common gym, historical or regional terms.
- `entityType`: controlled enum.

### 8.3 Naming examples

| User-facing label | Canonical concept | Alias handling |
| --- | --- | --- |
| Lats | Latissimus dorsi | “Lats” is an alias, not the canonical anatomical name. |
| Side delts | Lateral/middle portion of deltoid | Preserve common search alias. |
| Rear delts | Posterior portion of deltoid | Preserve common search alias. |
| Calves | Triceps surae group | Group page links gastrocnemius and soleus. |
| Lower abs | Rectus abdominis region | Do not present as a separate anatomical muscle. Explain the distinction. |
| Inner chest | Region of pectoralis major | Do not invent an independent “inner chest muscle.” |

### 8.4 Terminology safeguards

- Never create a muscle because a gym phrase sounds anatomical.
- Distinguish a muscle, a portion, a group and a body region.
- Where nomenclature varies, show the canonical term and document aliases.
- Avoid claiming that a broad body region can be completely isolated.
- Do not use “tone,” “shred” or “spot reduce” as anatomical concepts.

## 9. Canonical data model

### 9.1 Required muscle record fields

Every published record must support the following structure. Fields may be nullable only where the schema explicitly permits it.

| Field group | Required fields |
| --- | --- |
| Identity | ID, slug, display name, anatomical name, aliases, entity type, status. |
| Classification | Regions, training groups, parent/child relations, laterality. |
| Location | Plain-language location, anatomical position, front/back/side visibility. |
| Structure | Subdivisions, proximal/distal attachment summaries, joint crossings, fiber direction. |
| Function | Joint actions, movement patterns, functional roles, lengthened/shortened position summaries. |
| Training | Training relevance, common compound relationships, isolation relationship placeholders, qualitative contribution notes. |
| Relationships | Agonist/antagonist/synergist/stabilizer links with context. |
| Education | Beginner summary, detailed explanation, misconceptions, terminology notes. |
| Safety | General cautions, red-flag disclaimer, no-diagnosis statement. |
| Media | Asset IDs, alt text, caption, license, attribution, focal region. |
| Governance | Source IDs, reviewer status, review date, content version, confidence level. |

### 9.2 Controlled enums

Use controlled values for:

- `entityType`: `region`, `training-group`, `anatomical-group`, `muscle`, `subdivision`.
- `laterality`: `midline`, `bilateral`, `left`, `right`, `not-applicable`.
- `contentStatus`: `draft`, `review-needed`, `reviewed`, `published`, `deprecated`.
- `confidence`: `high`, `moderate`, `limited`.
- `contributionLevel`: `primary`, `secondary`, `supporting`, `stabilizing`, `context-dependent`.
- `visibility`: `anterior`, `posterior`, `lateral`, `deep`, `multiple`.
- `mediaLicenseStatus`: `original`, `public-domain`, `open-license`, `permission-granted`, `link-only`, `unverified-do-not-publish`.

Do not permit arbitrary strings where a controlled enum exists.

### 9.3 Missing-data rules

- Missing content must be `null` or omitted according to the schema, never an invented sentence.
- `unknown`, `not reviewed` and `not applicable` must remain distinct.
- A record with required facts missing cannot be marked `published`.
- UI must not display empty headings or strings such as “N/A” repeatedly. Hide optional sections or show one clear unavailable message.

## 10. Attachment, action and function model

### 10.1 Attachments

For fitness education, provide concise attachment summaries rather than exhaustive medical detail by default.

Store:

- `proximalAttachmentSummary`.
- `distalAttachmentSummary`.
- Optional structured attachment references for advanced display.
- A terminology note where “origin” and “insertion” are commonly used.

Do not imply that one attachment is always mechanically fixed during every movement.

### 10.2 Joint actions

Each action relationship must include:

- Joint.
- Motion.
- Plane, if relevant.
- Contribution level.
- Conditions or qualifiers.
- Source IDs.

Example concept:

```json
{
  "joint": "shoulder",
  "motion": "abduction",
  "contributionLevel": "primary",
  "qualifier": "Contribution varies by arm angle and scapular mechanics.",
  "sourceIds": ["source-example"]
}
```

### 10.3 Functional roles

Agonist, antagonist, synergist and stabilizer are context-dependent roles. Do not store them as permanent traits without a movement context.

A relationship must specify:

- Related muscle ID.
- Movement or task context.
- Role.
- Qualitative note.
- Source IDs.

### 10.4 Lengthened and shortened positions

Where useful, explain positions that generally lengthen or shorten the muscle. These statements must be anatomical descriptions, not guarantees of hypertrophy or injury prevention.

## 11. Training relevance model

### 11.1 Purpose

The muscle page should connect anatomy to training without turning Phase 02 into an exercise-prescription module.

### 11.2 Allowed content

- Major movement patterns involving the muscle.
- Typical compound-movement relationships.
- Typical isolation-movement categories.
- Whether the muscle often acts as a prime mover, assistant or stabilizer in a named context.
- Practical cue caveats and common misconceptions.
- Links reserved for verified Phase 03 exercises.

### 11.3 Disallowed content

- “Best exercise” rankings without defined criteria and evidence.
- Exact activation percentages.
- Universal weekly set targets.
- Claims that one angle isolates a fiber region completely.
- Claims that soreness proves effective training.
- Injury-treatment recommendations.
- Body-shape guarantees.

### 11.4 Exercise-link state before Phase 03

Phase 02 must include the relationship slots and UI section, but it must not fabricate exercise data. Until Phase 03 records exist:

- Show “Exercise links will be added in Phase 03” only in development builds, or.
- Hide the section in production when no verified exercise relationships exist.
- Never show fake exercise cards to make the page look complete.

## 12. Starter taxonomy and coverage contract

The attached seed taxonomy defines IDs and hierarchy. It is a coverage contract, not a finished anatomy textbook.

### 12.1 Required training-facing group pages

- Neck.
- Shoulders.
- Rotator cuff.
- Chest.
- Upper back.
- Lats.
- Lower back.
- Biceps.
- Triceps.
- Forearms and grip.
- Core.
- Obliques.
- Glutes.
- Hip flexors.
- Hip adductors.
- Hip abductors.
- Quadriceps.
- Hamstrings.
- Calves.
- Shin and ankle stabilizers.

### 12.2 Required canonical muscles and subdivisions

At minimum, the first published dataset must include reviewed records for the following. Group related heads/portions when the detail improves training understanding.

| Region | Required records |
| --- | --- |
| Neck/upper shoulder | Sternocleidomastoid; upper trapezius; levator scapulae. |
| Shoulder | Deltoid with anterior, middle/lateral and posterior portions; supraspinatus; infraspinatus; teres minor; subscapularis. |
| Chest/scapular front | Pectoralis major with clavicular and sternocostal portions; pectoralis minor; serratus anterior. |
| Back | Latissimus dorsi; trapezius with upper, middle and lower portions; rhomboid group; teres major; erector spinae group; multifidus. |
| Upper arm | Biceps brachii with long and short heads; brachialis; coracobrachialis; triceps brachii with long, lateral and medial heads; brachioradialis. |
| Forearm/grip | Wrist/finger flexor group; wrist/finger extensor group; pronator group; supinator. |
| Trunk/core | Rectus abdominis; external oblique; internal oblique; transversus abdominis; quadratus lumborum; diaphragm as breathing/bracing context. |
| Hip/gluteal | Gluteus maximus; gluteus medius; gluteus minimus; tensor fasciae latae; iliopsoas group; deep external rotator group. |
| Inner thigh | Adductor magnus; adductor longus; adductor brevis; gracilis; pectineus. |
| Front thigh | Rectus femoris; vastus lateralis; vastus medialis; vastus intermedius; sartorius. |
| Back thigh | Biceps femoris long and short heads; semitendinosus; semimembranosus. |
| Lower leg | Gastrocnemius medial/lateral heads; soleus; tibialis anterior; tibialis posterior; fibularis/peroneal group. |

### 12.3 Deep or specialist structures

Deep structures may be listed and related without requiring an extensive training page in the first release. Mark the depth as `advanced` and do not create shallow filler text merely to satisfy a count.

## 13. Content record quality levels

Use a publishing workflow:

| Level | Meaning | UI behavior |
| --- | --- | --- |
| Draft | Structure exists; facts incomplete. | Development only. |
| Review needed | Content populated but not independently checked. | Development/staging only. |
| Reviewed | Checked against approved sources. | May be previewed. |
| Published | Reviewed, sourced, media cleared and schema-valid. | Public. |
| Deprecated | Replaced or terminology changed. | Redirect to replacement; do not list. |

No record should be public solely because Lovable generated plausible text.

## 14. `/muscles` catalogue page

### 14.1 Page objective

Help users find a body area or specific muscle quickly while introducing the relationship between common gym labels and precise anatomy.

### 14.2 Page order

1. Breadcrumb and page header.
2. Short scope statement.
3. Search field.
4. View switch: “Body” and “List.”
5. Front/back body-region selector.
6. Quick region cards.
7. Filter/sort controls.
8. Results summary.
9. Muscle/group result grid or list.
10. Educational terminology callout.
11. Sources/methodology link.

### 14.3 Header copy

Use factual, neutral copy similar to:

> Explore the muscles and functional groups involved in common training movements. Start with a body region or search by anatomical or gym terminology.

Do not use transformation promises or body-image marketing language.

### 14.4 Result card requirements

Every card must show:

- Display name.
- Anatomical name when different.
- Entity-type label.
- Body region.
- One-sentence function summary.
- Small licensed/original visual or neutral region icon.
- Up to three movement/action tags.
- Clear link to detail page.

Cards must not show exercise counts until Phase 03 relationships exist.

### 14.5 View persistence

Store only the chosen body/list view locally as a validated UI preference. Search and filters must remain in the URL so a view can be bookmarked and shared.

## 15. Body-region selector

### 15.1 Scope

Build a simplified two-dimensional anterior/posterior selector. It is a navigation aid, not a diagnostic or medically precise diagram.

### 15.2 Asset rule

Use only:

- Original project-owned vector artwork.
- Explicitly public-domain artwork.
- Openly licensed artwork whose terms are recorded and satisfied.
- A neutral abstract silhouette built from simple shapes.

Do not copy anatomy illustrations from search results, commercial anatomy products, textbooks or YouTube thumbnails.

### 15.3 Interaction behavior

- Toggle anterior and posterior views.
- Selecting a region updates the result set and URL filter.
- Hover may provide enhancement but never the only interaction.
- Keyboard users can traverse region buttons in logical order.
- Enter/Space selects a region.
- Selected region is visibly distinct without colour alone.
- A persistent text list offers the same regions and state.
- Focus remains visible.
- Touch targets meet the Phase 01 minimum size.

### 15.4 SVG accessibility

For an interactive inline SVG:

- Give the overall figure an accessible name and description.
- Treat selectable regions as real buttons or links where feasible.
- Provide `title`/`desc` or equivalent accessible labels.
- Do not rely on raw path order for a meaningful keyboard sequence.
- Provide a synchronized HTML list as the authoritative alternative.
- Do not trap keyboard focus inside the SVG.

### 15.5 Small screens

On small mobile screens, the text region grid may appear before the graphic. The diagram must not force horizontal scrolling.

## 16. Search, filter and sort behavior

### 16.1 Searchable fields

Search must index:

- Display name.
- Anatomical name.
- Latin name when present.
- Aliases.
- Training-group names.
- Body regions.
- Joint actions.
- Movement patterns.
- Common misconception terms mapped to correct records.

Example: searching “rear delt” must find the posterior deltoid record. Searching “lower abs” should find rectus abdominis with a terminology note rather than inventing a separate muscle.

### 16.2 Filters

Required filters:

- Body region.
- Entity type.
- Anterior/posterior/deep visibility.
- Joint.
- Joint action.
- Movement pattern.
- Content depth.

Optional filters should not clutter the first-release UI.

### 16.3 Sort

Support:

- Relevance when searching.
- A–Z.
- Body region.

Do not offer scientifically meaningless sorting such as “most important muscle.”

### 16.4 URL contract

Recommended parameters:

```text
/muscles?q=rear+delt&region=shoulder&type=subdivision&view=list&sort=relevance
```

Unknown parameter values must be ignored safely or normalized. Back/forward navigation must restore state.

### 16.5 No-results behavior

The no-results state should:

- Repeat the query in plain text.
- Suggest clearing individual filters.
- Offer likely alias matches when available.
- Link back to all muscles.
- Never suggest an invented record.

## 17. Muscle/group detail page

### 17.1 Page header

Show:

- Breadcrumbs.
- Display name.
- Anatomical name.
- Entity-type badge.
- Region and parent group.
- One-sentence practical summary.
- Reviewed status and review date.
- Optional original/licensed illustration.

Do not lead with dense attachment text.

### 17.2 Overview section

Include:

- Where it is.
- What it generally does.
- Why it matters in movement/training.
- Common name clarification.
- Parent/child anatomy links.

### 17.3 Location and anatomy section

Include, where applicable:

- Surface/deep location.
- Neighboring structures at a high level.
- Portions/heads/subdivisions.
- Proximal and distal attachment summaries.
- Joints crossed.
- Fiber direction.
- Innervation summary as advanced content.

Do not include blood supply unless a later reviewed content decision adds it.

### 17.4 Actions section

Render a semantic table or cards with:

- Joint.
- Action.
- Contribution level.
- Context/qualifier.
- Related muscles.

Avoid presenting actions as absolute when position or joint angle changes the role.

### 17.5 Training section

Show:

- Relevant movement patterns.
- Common compound categories.
- Common isolation categories.
- Stabilization contexts.
- Training misconceptions.
- Future verified exercise relationships.

Do not prescribe sets, repetitions or weekly volume in this phase.

### 17.6 Relationships section

Provide:

- Parent group.
- Child portions.
- Synergists by movement context.
- Antagonists by movement context.
- Stabilizer relationships.
- Neighboring/commonly confused structures.

### 17.7 Cautions section

Use restrained language:

- General movement or discomfort cautions.
- Clear statement that pain, weakness, numbness or suspected injury requires qualified assessment.
- No diagnosis, injury test or treatment protocol.

### 17.8 Sources section

List:

- Source title and publisher.
- Source type.
- Publication/update year.
- Link.
- Which fields the source supports.
- Last content review date.
- Media attribution separately from factual sources.

## 18. Content presentation rules

### 18.1 Plain language first

Lead with clear language, then offer exact terminology. Define unfamiliar terms inline.

### 18.2 Structured facts over essays

Prefer:

- Short summaries.
- Tables for actions.
- Relationship chips/links.
- Diagrams with captions.
- Expandable advanced details.

Avoid long unbroken walls of anatomy text.

### 18.3 Claims language

Use:

- “contributes to”.
- “commonly involved in”.
- “may act as”.
- “depends on position or task” when relevant.

Avoid:

- “always”.
- “completely isolates”.
- “guarantees”.
- “fixes posture”.
- “prevents injury”.

### 18.4 Units and notation

Anatomy pages rarely need numeric units. Where angles are later included, use degrees with source context. Do not add numbers for visual authority.

## 19. Misconception handling

Create a controlled `misconceptions` array. Each item contains:

- Short claim.
- Corrected explanation.
- Source IDs.
- Severity: `minor`, `misleading`, `safety-relevant`.

Starter concepts to support after review:

- “Lower abs” are not a separate abdominal muscle.
- “Inner chest” is not an independent muscle.
- A movement does not isolate one muscle with zero contribution from others.
- Muscle roles can change with joint position and task.
- A broad exercise category should not be equated with one exact fiber region.

Do not publish these corrections without source review.

## 20. Source governance

### 20.1 Source hierarchy

Prioritize:

1. International anatomical terminology standards.
2. University-level anatomy texts with clear licensing or link-only use.
3. Government or academic biomedical references.
4. Peer-reviewed reviews or biomechanics research where a claim requires it.
5. Professional training references for practical interpretation.

General blogs, social posts and unsourced gym websites cannot establish canonical anatomy facts.

### 20.2 Approved baseline references

- IFAA/FIPAT Terminologia Anatomica for nomenclature.
- OpenStax Anatomy and Physiology for educational anatomy concepts, subject to its current license and attribution terms.
- NCBI Bookshelf/StatPearls for cross-checking selected skeletal-muscle explanations, used as cited reference rather than copied content.
- W3C and MDN for accessible interactive graphics and keyboard behavior.

### 20.3 Licensing rule

Factual knowledge may be summarized with citation, but source text and illustrations remain subject to copyright and license terms.

For each source, store:

- License/status.
- Whether text may be adapted.
- Whether images may be reused.
- Required attribution.
- Commercial-use restrictions.
- Link-only requirement.

If the future product may become commercial, do not embed non-commercial-only derivative content without a deliberate licensing decision.

### 20.4 AI use rule

AI may help structure drafts and detect inconsistencies. AI output is not a source. Every published anatomy fact must map to one or more source records.

## 21. Media and illustration governance

### 21.1 Media entity

Each media asset must include:

- Asset ID.
- File path or external link.
- Media type.
- Subject record IDs.
- View orientation.
- Caption.
- Alt text.
- Creator/source.
- License.
- Attribution text.
- Modification status.
- Focal coordinates where useful.
- Review status.

### 21.2 Illustration styles

The module may use:

- Simplified original silhouette overlays.
- Original labelled diagrams.
- Properly licensed open educational illustrations.
- Link cards to external educational sources.

Do not use photorealistic generated anatomy as the primary factual representation. If generated artwork is ever used decoratively, label and review it, and do not let it imply medical precision.

### 21.3 Alt-text standard

Alt text must describe the educational purpose, orientation and highlighted structure. Do not repeat the caption word-for-word.

Example:

> Posterior view of a simplified upper body with the latissimus dorsi region highlighted on both sides of the lower back.

## 22. Data validation rules

The data loader must reject or report:

- Duplicate IDs or slugs.
- Missing display/anatomical names.
- Invalid entity types.
- Parent cycles.
- References to nonexistent parent, child, action, region or source IDs.
- Published records without sources.
- Published media without verified license status.
- Unknown controlled enum values.
- Empty action arrays for individual published muscles unless explicitly justified.
- Duplicate aliases after case/spacing normalization.
- Broken internal links.

Validation must run during development/build, not only at runtime.

## 23. Technical implementation contract

### 23.1 Repository-owned content

Store Phase 02 content in version-controlled files. Recommended structure:

```text
src/
  features/
    muscles/
      components/
      data/
      lib/
      routes/
      types/
      tests/
  content/
    muscles/
      regions.json
      muscle-groups.json
      muscles.json
      movements.json
      joint-actions.json
      sources.json
      media.json
  assets/
    anatomy/
      body-map/
      muscle-illustrations/
docs/
  muscle-library.md
  content-governance/
    anatomy-sources.md
  phases/
    phase-02.md
```

Adapt paths to the existing scaffold, but preserve clear feature and content boundaries.

### 23.2 No runtime API dependency

The public muscle library must work from bundled or statically loaded repository data. Do not add a remote API for core content.

### 23.3 Data loading

- Validate content through a schema such as Zod or the project’s existing validator.
- Build indexes for slug, aliases, region, action and movement pattern.
- Do not repeatedly scan the full dataset on every render.
- Keep data access behind typed selectors/repository functions.
- Ensure static build or server rendering remains deterministic.

### 23.4 Suggested selectors

- `getPublishedMuscles()`.
- `getMuscleBySlug(slug)`.
- `getMusclesByRegion(regionId)`.
- `searchMuscles(query, filters)`.
- `getRelatedMuscles(muscleId)`.
- `getJointActionsForMuscle(muscleId)`.
- `getAnatomySources(sourceIds)`.

### 23.5 URL and state rules

- Search/filter state belongs in the URL.
- View preference may use validated local storage.
- No personal health data is created in this phase.
- Do not use global state for data that can be derived from route/search parameters.

### 23.6 Detail-page rendering

- Unknown slug: branded safe unavailable/not-found state.
- Deprecated slug: permanent redirect or clear replacement link.
- Draft/non-public record: unavailable in production.
- Missing optional section: omit it cleanly.
- Broken media: show neutral fallback and preserve text content.

## 24. Component catalogue

Reuse Phase 01 primitives and create only domain-specific components:

- `MuscleSearch`.
- `MuscleFilterBar`.
- `MuscleResultCard`.
- `BodyRegionSelector`.
- `BodyRegionTextGrid`.
- `MuscleIdentityHeader`.
- `AnatomyOverview`.
- `AttachmentSummary`.
- `JointActionTable`.
- `MovementPatternList`.
- `RelationshipGraph` or accessible relationship list.
- `TrainingRelevancePanel`.
- `MisconceptionCallout`.
- `AnatomyMediaFigure`.
- `ContentReviewBadge`.
- `SourceList` specialization only if shared component is insufficient.
- `DetailSectionNav` using Phase 01 page-composition patterns.

Do not create duplicate buttons, cards, badges, tabs or dialogs when Phase 01 already provides them.

## 25. Relationship visualization

A visual relationship graph is optional. The semantic list is mandatory.

If implemented:

- It must not replace the text list.
- Nodes must be keyboard reachable or the graph must be decorative with an equivalent list.
- Avoid dense physics animations.
- Limit initial relationships to meaningful, sourced links.
- Use labels and line styles, not colour alone.
- Respect reduced-motion preferences.

## 26. Responsive behavior

### 26.1 Mobile

- One-column detail layout.
- Sticky section navigation may collapse into a select/menu.
- Body-map graphic scales without horizontal scrolling.
- Filters use an accessible sheet/drawer.
- Tables may become stacked cards when needed, without losing labels.
- Relationship links wrap cleanly.

### 26.2 Tablet

- Two-column catalogue where space permits.
- Body selector and region list may sit side-by-side.
- Detail page may use a narrow in-page section rail only when it does not compress content.

### 26.3 Desktop

- Catalogue may use body selector plus results layout.
- Detail may use main content plus sticky section navigation and optional related-content rail.
- Reading width must remain controlled; do not stretch prose across the full screen.

## 27. Accessibility requirements

Meet Phase 01’s WCAG 2.2 AA baseline and specifically verify:

- Every body region is reachable and selectable by keyboard.
- A text alternative offers identical region navigation.
- SVGs have accessible names/descriptions where they convey content.
- Decorative SVGs are hidden from assistive technology.
- Focus order follows the visual/reading order.
- Filter drawers restore focus on close.
- Tables retain headers and relationships.
- Colour is not the only indicator of region, action level or selected state.
- Anatomy diagrams remain understandable at 200% zoom.
- Tooltips do not contain essential information unavailable elsewhere.
- Screen-reader users can determine current filters and result count.
- Heading hierarchy is logical on catalogue and detail pages.

## 28. Performance requirements

- Keep initial muscle-catalogue JavaScript modest.
- Lazy-load non-critical diagrams.
- Use optimized local assets with explicit dimensions.
- Avoid loading all full-resolution illustrations on the catalogue page.
- Precompute search indexes at build time where practical.
- Do not add a heavy 3D library.
- Avoid layout shift when illustrations load.
- Catalogue filtering should feel immediate for the planned dataset.

## 29. SEO and metadata

For public pages:

- Use unique titles and descriptions.
- Use canonical URLs.
- Do not create indexable thin pages for unpublished records.
- Add structured breadcrumbs where supported.
- Use factual copy; no medical or transformation claims.
- Include source/review information visibly.
- Detail-page metadata may include familiar alias terms but must not keyword-stuff.

## 30. Privacy and local-data impact

Phase 02 requires no personal data. It may store only non-sensitive UI preferences such as catalogue view. Do not request age, sex, injuries, goals or body information.

## 31. Error and edge states

Support:

- Unknown muscle slug.
- Deprecated alias slug.
- Empty region result.
- Invalid query parameter.
- Missing image.
- Invalid content record in development.
- Source link unavailable.
- JavaScript-disabled/static-readable baseline where supported by the framework.
- Search query containing punctuation, abbreviations or aliases.
- Very long anatomical names.
- Records with multiple parents or regions.

In production, malformed content must fail safely and log a developer-readable error without exposing stack traces to users.

## 32. Required automated tests

### 32.1 Schema and content integrity

- Unique IDs and slugs.
- Valid controlled enums.
- Valid parent/child relationships.
- No cycles.
- All source IDs resolve.
- All media IDs resolve.
- Published records meet publishing requirements.
- Alias normalization has no unresolved collisions.

### 32.2 Search and filters

- Canonical-name match.
- Common-alias match.
- Misconception-term mapping.
- Region filter.
- Entity-type filter.
- Joint-action filter.
- Combined filters.
- URL serialization/deserialization.
- Invalid URL values fail safely.

### 32.3 Routing

- Catalogue renders.
- Valid published slug renders.
- Unknown slug shows safe unavailable state.
- Deprecated slug resolves correctly.
- Draft record does not publish.
- Section anchors work.

### 32.4 Accessibility

- Body-region selector is keyboard operable.
- Equivalent text region list is present.
- Search/filter controls have accessible names.
- Selected filter state is announced.
- Diagram/figure accessible name and description exist.
- Basic automated accessibility scan passes.

### 32.5 Visual regression where supported

- Catalogue mobile/desktop.
- Anterior/posterior selector.
- Individual detail page.
- Long-name record.
- Missing-image fallback.
- Dark theme.

## 33. Manual testing matrix

Test at the Phase 01 viewport matrix plus:

### 33.1 Catalogue journeys

- Browse by front body region.
- Browse by back body region.
- Switch to list view.
- Search canonical term.
- Search gym alias.
- Search misleading term such as “lower abs” and confirm correction behavior.
- Combine region and action filters.
- Share/copy filtered URL and reload.
- Clear one filter and all filters.

### 33.2 Detail journeys

- Open from region card.
- Open from search.
- Use section anchor navigation.
- Follow parent/child links.
- Follow related-muscle links.
- Review sources.
- Test missing optional sections.
- Test unknown slug.

### 33.3 Accessibility

- Keyboard-only body selector.
- Screen-reader spot check of body selector and action table.
- 200% zoom.
- High-contrast/forced-colours mode where available.
- Reduced motion.
- Touch targets on 320 px screen.

### 33.4 Content integrity

- Confirm no exact EMG percentages.
- Confirm no set/rep prescriptions.
- Confirm no injury diagnosis or treatment.
- Confirm no unsourced public record.
- Confirm image license/attribution is visible or documented.

## 34. Required content-review checklist

Before a muscle record is published:

- [ ] Canonical name checked against the terminology standard.
- [ ] Common aliases normalized.
- [ ] Entity type is correct.
- [ ] Parent and child relationships are valid.
- [ ] Location summary is accurate and understandable.
- [ ] Attachment summary is sourced.
- [ ] Joint actions include context and sources.
- [ ] Functional roles are movement-specific.
- [ ] Training relevance contains no unsupported ranking or prescription.
- [ ] Misconceptions are sourced.
- [ ] Caution language is non-diagnostic.
- [ ] Media is licensed and attributed.
- [ ] Alt text is reviewed.
- [ ] Source list resolves.
- [ ] Review date and status are present.
- [ ] Schema validation passes.

## 35. Lovable implementation sequence

Implement in this order:

1. Inspect Phase 00/01 code, routes, shared components and content types.
2. Validate the attached schema and seed taxonomy against existing conventions.
3. Create canonical anatomy types, validators and content repository functions.
4. Add source and media metadata structures without duplicating Phase 00 shared models.
5. Build indexes and query/filter URL utilities.
6. Build the catalogue list view.
7. Build region cards and accessible text-region grid.
8. Build the simplified anterior/posterior body selector with original/cleared assets.
9. Build search, filters, sort and result states.
10. Build the detail-page template and section navigation.
11. Add relationships, actions, misconceptions, review and source displays.
12. Add a small reviewed seed set only from the attached approved data; do not invent missing facts.
13. Add validation, unit and accessibility tests.
14. Run type-check, tests, build and responsive inspection.
15. Update documentation and report exact changes.

## 36. Protected boundaries

Lovable must preserve:

- Phase 00 no-authentication and local-first architecture.
- Phase 01 shell, navigation manifest and design tokens.
- Existing route behavior outside `/muscles`.
- Existing shared source/unit/value-status types unless the approved plan explicitly extends them compatibly.
- No cloud/backend requirement.
- No fabricated exercise or nutrition data.
- No exercise pages, trackers, calculators or program logic.
- No framework migration.
- No copied proprietary illustrations.

Permanent guardrail:

> Preserve all completed modules. Do not refactor, redesign, delete or replace previous functionality unless Phase 02 explicitly requires the change and the approved plan identifies the affected files.

## 37. Phase 02 acceptance criteria

### 37.1 Architecture and data

- [ ] Existing framework and Phase 01 shell are retained.
- [ ] Canonical anatomy data types and validation exist.
- [ ] IDs/slugs are unique and stable.
- [ ] Parent/child and relation references validate.
- [ ] Public records require resolved sources and review status.
- [ ] Repository-owned content works without a runtime API.
- [ ] No authentication, cloud database or personal-data storage was added.

### 37.2 Catalogue

- [ ] `/muscles` implements search, body/list view, region navigation, filters and sort.
- [ ] Search recognizes anatomical names and common aliases.
- [ ] Search does not create fake entities for misleading gym terms.
- [ ] Filter state is shareable through URL parameters.
- [ ] No-results and invalid-filter states are useful and safe.
- [ ] Catalogue contains no fake exercise counts or unsupported rankings.

### 37.3 Body selector

- [ ] Anterior and posterior region views work.
- [ ] All selectable regions are keyboard operable.
- [ ] An equivalent synchronized text list exists.
- [ ] Selection is not communicated by colour alone.
- [ ] The graphic uses original or license-cleared assets.
- [ ] The selector works at 320 px and 200% zoom.

### 37.4 Detail pages

- [ ] Valid published slugs render complete detail pages.
- [ ] Entity type, canonical name, region and review status are visible.
- [ ] Overview, anatomy, actions, training relevance, relationships, cautions and sources are structured clearly.
- [ ] Optional missing sections do not create empty boxes.
- [ ] Unknown/deprecated slugs are handled safely.
- [ ] No set/rep prescriptions, exact activation percentages or medical diagnosis appear.

### 37.5 Accessibility and quality

- [ ] Catalogue and detail pages pass the agreed automated accessibility baseline.
- [ ] Keyboard focus and drawer/dialog behavior work.
- [ ] Figures have appropriate accessible descriptions.
- [ ] Tables/cards retain semantic labels.
- [ ] Light/dark themes remain readable.
- [ ] Build, strict type-check and tests pass.
- [ ] No console errors occur during core journeys.

### 37.6 Documentation and checkpoint

- [ ] `docs/muscle-library.md` matches implementation.
- [ ] Anatomy source and media policy is documented.
- [ ] `docs/phases/phase-02.md` records decisions and deviations.
- [ ] Phase 03 can consume stable muscle IDs without migration.
- [ ] A GitHub checkpoint can be created as `phase-02-muscle-library-complete`.

## 38. Phase 02 Plan-mode prompt

Paste this prompt in Lovable Plan mode with Phase 00, Phase 01, Phase 02, the schema and seed taxonomy attached:

```text
Read the attached Phase 00 Master Foundation, Phase 01 Application Shell specification, Phase 02 Muscle and Functional Anatomy Library specification, Phase 02 Muscle Data Schema and Phase 02 Seed Taxonomy completely. Do not modify code yet.

Inspect the current project and produce a formal Phase 02 implementation plan only.

The plan must:
1. Confirm the current framework, route structure, Phase 01 shell, design tokens, shared content/source types and test setup.
2. List every file to create or modify and every protected file that will remain unchanged.
3. Map the attached anatomy schema into strict TypeScript validation without duplicating or breaking Phase 00 shared types.
4. Define repository-owned content files, build-time validation, slug/alias indexes and typed selectors.
5. Define the /muscles catalogue, body/list views, region cards, search, filters, sort, URL state and no-results behavior.
6. Define an accessible anterior/posterior body-region selector plus an equivalent synchronized HTML text list.
7. Define the /muscles/$slug page structure, section anchors, parent/child relations, joint-action display, training relevance, misconceptions, cautions, review status and sources.
8. Define media licensing/attribution handling and ensure no proprietary or unverified anatomy image is used.
9. Define tests mapped to every Phase 02 acceptance criterion, including schema integrity, alias search, URL filters, keyboard body-map operation and invalid slugs.
10. Identify conflicts, risks, assumptions and any specification deviation requiring approval.

Non-negotiable constraints:
- No authentication, accounts, profiles, Supabase, Lovable Cloud, Firebase, backend database, payments or server-side personal-data storage.
- Do not migrate or redesign the Phase 01 shell.
- Do not create exercise pages, workout programs, trackers, calculators or nutrition features.
- Do not invent anatomy facts, exercise counts, activation percentages, set/rep prescriptions or injury advice.
- Use only attached reviewed content for public records. Keep incomplete records non-public.
- Use only original or license-cleared media with recorded attribution.
- Preserve all completed modules and shared contracts unless the plan explicitly identifies a necessary compatible extension.

End with a checklist matching every Phase 02 acceptance criterion and ask for approval before implementation.
```

## 39. Phase 02 Agent-mode implementation prompt

Use only after approving the Plan-mode plan:

```text
Implement the approved Phase 02 plan exactly.

Build the Muscle and Functional Anatomy Library using the attached specification, schema and seed taxonomy. Implement repository-owned validated anatomy content, /muscles catalogue, body/list views, region navigation, accessible anterior/posterior selector and text equivalent, search, filters, sort, URL state, /muscles/$slug detail pages, section navigation, actions, relationships, training-relevance boundaries, misconceptions, cautions, content review status, source display, media attribution and safe error states.

Implementation rules:
- Retain the existing Lovable-native framework, Phase 01 shell, strict TypeScript and design system.
- Reuse shared Phase 00/01 primitives and extend types compatibly.
- Validate all anatomy records and cross-references at development/build time.
- Keep the public library functional without a runtime API.
- Publish only attached content that meets the review/source rules; do not fill gaps with generated facts.
- Make every graphical region interaction keyboard accessible and provide a synchronized HTML list.
- Use only original or license-cleared assets with attribution.
- Do not add authentication, backend services, exercise modules, trackers, calculators, charts, set/rep recommendations, EMG percentages, medical diagnosis or injury treatment.
- Preserve all completed modules and report any unavoidable deviation before making it.

After implementation:
1. Run strict type-check, content validation, tests, build and available accessibility checks.
2. Inspect all required mobile, tablet and desktop viewports, including 320 px and 200% zoom.
3. Fix Phase 02 failures.
4. Update docs/muscle-library.md, docs/content-governance/anatomy-sources.md and docs/phases/phase-02.md.
5. Report exact files changed, commands/tests run, results, published seed-record count, known limitations and the complete acceptance-criteria status.
```

## 40. Phase 02 verification prompt

```text
Audit the current project against the attached Phase 02 specification. Do not add new features.

Return a table with:
- acceptance criterion
- pass/fail
- evidence in code or UI
- exact file(s)
- corrective action for failures

Specifically verify:
- no authentication/backend/cloud/personal-data dependency
- Phase 01 shell and routes outside /muscles are preserved
- anatomy schema and build-time cross-reference validation
- no duplicate IDs/slugs or alias collisions
- public records have sources, review status and cleared media
- canonical name and common alias search
- misleading term handling without invented muscles
- URL-restored filters and browser back/forward
- keyboard anterior/posterior body selector and synchronized text alternative
- 320 px, 200% zoom, dark theme and visible focus
- detail-page sections, unknown/deprecated slug behavior and source display
- no exact activation percentages, exercise rankings, set/rep prescriptions, diagnosis or treatment
- build, strict type-check, tests, accessibility checks and console state
- documentation accuracy and Phase 03 stable-ID handoff

Do not claim a pass without evidence. List defects first, fix only clear Phase 02 defects, rerun relevant checks and provide the final status.
```

## 41. Focused correction prompt

```text
Correct only the Phase 02 defects listed below. Preserve all passing behavior and all Phase 00/01 functionality.

For each defect:
1. Identify root cause.
2. Name the exact files to change.
3. Apply the smallest compliant fix.
4. Add or update a regression test.
5. Run the relevant validation, type-check, test and build commands.
6. Report before/after behavior and any remaining limitation.

Do not redesign the shell, migrate frameworks, add dependencies without need, invent anatomy content, or expand into Phase 03.

Defects:
[PASTE VERIFIED DEFECTS HERE]
```

## 42. Phase 03 handoff requirements

Phase 02 must leave Phase 03 with:

- Stable canonical muscle and group IDs.
- Stable region IDs.
- Joint-action and movement-pattern enums.
- Contribution-level enum.
- Typed selectors for resolving muscle relations.
- A clear policy for primary, secondary, supporting and stabilizing exercise relationships.
- Source/review metadata reusable by exercise records.
- No need to rename or migrate published Phase 02 IDs.

Before Phase 03, freeze published IDs. Future display-name improvements must not change IDs or slugs without redirect/migration handling.

## 43. Completion definition

Phase 02 is complete when:

- A user can browse, search and understand the first reviewed muscle dataset.
- Common gym terminology maps to correct anatomical records.
- The body-region selector works for mouse, touch and keyboard users.
- Every public detail page exposes practical function, deeper anatomy and sources.
- The app contains no unsourced filler, medical diagnosis or fake precision.
- Tests and content validation pass.
- Phase 03 can link exercises to stable muscle IDs without restructuring this module.

## 44. Reference and verification baseline

The implementation team must re-check current license and usage terms before reusing any external text or image.

1. International Federation of Associations of Anatomists (IFAA), Federative International Programme for Anatomical Terminology (FIPAT). Terminologia Anatomica, second edition and current status pages. https://ifaa.net/committees/anatomical-terminology-fipat/
2. OpenStax. *Anatomy and Physiology 2e*, Chapter 11 and related regional muscle chapters. Published 2022. Current online license/attribution requirements must be followed. https://openstax.org/details/books/anatomy-and-physiology-2e/
3. Dave HD, Shook M, Varacallo MA. “Anatomy, Skeletal Muscle.” StatPearls, NCBI Bookshelf. https://www.ncbi.nlm.nih.gov/books/NBK537236/
4. W3C Web Accessibility Initiative. WCAG 2.2 keyboard-accessibility guidance and ARIA Authoring Practices keyboard interface guidance. https://www.w3.org/WAI/WCAG22/Understanding/keyboard-accessible.html
5. MDN Web Docs. SVG `title`, `desc` and accessible inline-SVG guidance. https://developer.mozilla.org/en-US/docs/Web/SVG/
6. Lovable Documentation. Plan mode, Agent mode, Project Knowledge and supported file attachments. https://docs.lovable.dev/

---

**End of Phase 02 specification**
