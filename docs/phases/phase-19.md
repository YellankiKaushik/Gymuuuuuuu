# Phase 19 handoff

Status: in progress. This file must not be read as a completion claim.

Phase 18 is integrated into main with the original history intact. Completion validation found and corrected a streamed-document hydration race and a Windows checkout/formatter line-ending mismatch. Automatic Vercel Git deployment is disabled and checked by the repository audit. Firefox cannot currently launch on the local Windows host; that browser gate remains unverified.

The first content checkpoint publishes 73 factual identities: 3 muscles, 1 exercise, 3 science topics, 46 foods with 47 composition profiles, 3 nutrients with 3 FDA Daily Value rows, 12 original recipes, 2 recovery articles, 1 cardio article and 2 supplement introductions. Programs, meal templates and public routines remain unpopulated. This is useful initial content, not the completed milestone.

USDA snapshots preserve original descriptions, preparations, portions, nutrient derivations and hashes. Import validation precedes writes, missing values stay unavailable and assumed zero is distinguished from measurement. Recipe calculations use exact food snapshots and estimated ingredient-mass yield without fabricated retention factors. Public recipe loaders send only immutable public records; browser personal databases are not read by the server.

Every published identity has explicit source provenance and a machine-only `published_personal_use` review. Anatomy uses a public-domain historical source with historical limitations; the exercise adapts licensed government guidance with attribution and an original accessible SVG. Modern training, nutrient, recovery, cardio and supplement introductions retain their source-specific populations and limits. No clinical or independent human review is claimed.

Search currently contains 201 documents, including all 73 factual identities. Validation rebuilds the expected documents and fails on stale search or missing publication provenance. The generated completion JSON names every remaining identity and source-review gap; these gaps still require implementation, rather than being declared permanently blocked.

Validation at this checkpoint: 204 unit tests in 37 files passed; coverage and npm audit passed, with zero reported vulnerabilities. The build fits the existing bundle limits. Nine new browser tests passed, including public content at 320px, tablet and desktop in light/dark themes, automated WCAG checks, source labels, safe unknown recipes and absence of remote requests. A complete route audit has been added and is pending execution. Full Chromium and WebKit regression reruns remain required after this checkpoint's final edits. Cross-browser CI now also runs on the Phase 19 branch so Linux can verify Firefox independently of the local Windows launch limitation.

Remaining work includes substantially expanding source-backed content, usable static programs and routines, meal templates, comparison/media coverage, full route-state verification and final clean-install regression. No completion tag should be created until the owner's definition of done is met. Production deployment remains disabled.
