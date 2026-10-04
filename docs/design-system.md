# Design system

Forest/neutral theme with one green accent. src/styles/foundation.css preserves baseline tokens; shell.css applies Phase 01 semantic status/focus/radius rules and responsive typography. app.css imports Tailwind, foundation and shell in order. Light/dark/system themes share semantic surfaces/text/muted/border/accent. Status pairs text with color. Lucide line icons use 1.65 stroke; icon-only controls have labels.

Body 16 px, supporting text 14 px, metadata 12 px; H1 36/30 px desktop/mobile, section headings 24 px, rare hero display 44/36 px. Default information line height 1.65–1.9; control targets at least 44 px; mobile navigation 50 px. Base spacing 4 px; page padding 32/24/16 px desktop/tablet/mobile. Maximum content 1440 px; ordinary text should stay near 800 px. Radius 8/12/16 px. Border-led grouping; shadows reserved for floating dialogs. Motion 120–200 ms and disabled for reduced motion.

Shared primitives: PageHeader (eyebrow/title/description/metadata/actions/section slot), SectionNav, ModuleCard, LinkCard, StatusBadge, InfoCallout, IconButton, EmptyState, UnavailableState, ErrorState, LoadingState. Forms use real labels and fieldsets. native dialog manages focus trapping and return focus. Whole-card links avoid nested controls. Future modules reuse these patterns rather than replace the shell.
