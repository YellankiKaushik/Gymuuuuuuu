# Fitness OS permanent project rules

Build one phase at a time. The owner has authorized phases 00–18 sequentially using DOCS_for_entire_apppliaction/GYM. Read the current phase's documents, schemas and data before implementing it, then pass its checks before reading and starting the next phase. Preserve completed modules. Document changes to the specification in docs/decisions.

- Retain TanStack Start, React, strict TypeScript and Tailwind. No unbounded any.
- No accounts, authentication, Supabase, Firebase, cloud personal storage, payments, social features, admin CMS or external runtime fitness APIs.
- Public knowledge is repository-owned. Never fabricate fitness facts, food values, sources, review dates or personal metrics.
- Every factual entity needs immutable IDs, slugs, source references and review metadata. Relationships use IDs. Keep zero, trace, estimated, not measured and not available distinct.
- Canonical units: g, kcal, s, m, kg, cm. Food composition is per 100 g with explicit serving mass.
- Structured personal records belong in browser IndexedDB. localStorage is only for small preferences. Never access browser globals at module scope or expose personal records to SSR, server logs or metadata.
- Tracking remains optional and requires backup/restore, CSV export, validation, edit/delete and clear save feedback before production release.
- Import validation precedes writes. Preserve existing records after errors; require confirmation for destructive actions.
- Use semantic HTML, visible keyboard focus, labelled forms, reduced-motion support and consistent light/dark tokens. Target WCAG 2.2 AA.
- Keep secrets out of the repository and frontend environment variables.
- Run build, strict typecheck, lint, foundation tests and relevant desktop/mobile checks at each checkpoint. Update the phase checklist and handoff.
