# Phase 15 source verification

Checked 2026-10-05. The main Phase 15 source registry contains several draft rows. Draft sources and draft measurement protocols are not shown as reviewed knowledge in the application.

| Use in this phase | Primary source | Implementation boundary |
|---|---|---|
| BMI formula and screening limitation | [CDC: About BMI](https://www.cdc.gov/bmi/about/index.html) | BMI appears only when the user enters a dated height record. It is labelled as a screening value and is never presented as body-fat measurement or diagnosis. No category interpretation is implemented. |
| Standardized anthropometry context | [CDC/NCHS Anthropometry Procedures Manual (2021)](https://stacks.cdc.gov/view/cdc/127207) | User-entered sites and protocol IDs remain distinct. Draft protocols are not promoted as approved measurement instructions. |
| Browser-local persistence behavior | [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) | Data remains in IndexedDB; the privacy screen reports best-effort versus persistent storage when available and exposes the browser's persistence request. Backups remain user-controlled. |
| Accessibility target | [W3C: Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) | Semantic labels, visible focus, a mobile layout, reduced-motion handling, and readable table alternatives are included. Automated axe/browser checks supplement manual review. |

No unpublished source is used to generate health thresholds, recommendations, predicted outcomes, or public facts.
