# Phase 01 — shell implementation plan

Read the Phase 01 master Markdown, quick reference and full prompt package; compare the DOCX for additional requirements. Keep the strict TanStack Start foundation and existing domain/storage boundaries. The owner has authorized continuation through Phase 18.

## File impact
Create app configuration, navigation search utility, shared PageHeader/SectionNav/ModuleCard/LinkCard/StatusBadge/InfoCallout, split responsive navigation components and shell tests. Modify navigation manifest, preference schema/adapter/provider (add compatible sidebar preference), shell, finder, home and placeholder pages, stylesheet and route metadata. Preserve domain schemas other than extending optional UI preferences and all storage/backup safety logic.

## Delivery
One manifest with immutable IDs, groups, aliases and icon keys; canonical mobile primary Home/Learn/Train/Eat/Progress. 272/80 px collapsible desktop sidebar with persisted preference. Native dialog tablet drawer/mobile More sheet with focus trap and restoration. Five-item safe-area mobile bottom navigation; 64 px topbar; semantic breadcrumbs and optional action slot. Navigation-only search with shortcut/arrow/enter/escape, result counts and reset. Central product/origin configuration. No technical phase labels on public placeholders. Safe unknown entities and branded 404. Increase typography to documented readable scale while preserving forest character. No final data or trackers.

## Gate
Build/typecheck/lint/foundation tests plus manifest tests, keyboard search, collapse persistence, drawer/More focus, 7 required viewports, narrow landscape/reflow, safe missing pages, theme/axe checks. Update docs/design-system.md and docs/navigation.md; checkpoint phase-01-shell-complete. Deployment-specific refresh is locally verified; remote hosting remains pending a destination.
