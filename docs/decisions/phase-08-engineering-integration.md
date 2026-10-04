# Phase 08 engineering integration decisions

Keep the normative JSON objects unchanged. The companion framework dataset manifest supplies the version and rights metadata missing from the row schema. Dietary-pattern context uses approved `other` claims and their population text; no unsupported editorial fields are added. Source-checked glossary definitions have their own immutable IDs, actual source-check date and explicit automated-verification provenance, distinct from scientific review of nutrient articles.

The domain entry point re-exports the canonical framework/calculation services; the food-ranking entry point forwards the canonical ranking service. These avoid maintaining divergent draft helper implementations. The compile-time catalogue builder and public index are independent of dynamic article loaders so SSR engineering fixtures do not load the full repository.

The generic IndexedDB adapter gained a validated single-record getter for remembered populations; existing list/put/remove/transaction behavior is retained. No database version or earlier canonical record schema changed. Reference selections are optional preferences, not a tracking module.

Regression findings required hydration gates on the earlier exercise search input and missing-page search/history buttons. Actions wait until browser event handlers are ready; layout, routes and data are retained. These narrow fixes are part of preserving completed modules.

The owner supplied `https://github.com/YellankiKaushik/Gymuuuuuuu` as the remote and authorized a push after every verified phase. The empty remote was initialized on `main`; verified checkpoints through Phase 07 and their tags were pushed. Future checkpoints will be pushed after their checks, without including unverified next-phase work.
