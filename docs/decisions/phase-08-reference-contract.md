# Phase 08 reference version and unit decisions

The supplied reference-value JSON Schema does not include a version field although the specification requires versioned framework values. Keep the normative objects unchanged and govern each framework through `src/content/nutrients/framework-datasets.json`. Numeric public rows require a nonempty dataset version, approved dataset status and reviewed rights. No source values are included while manifests remain unpopulated.

The supplied seed's niacin unit is `mg NE`, while Phase 07's composition registry says `mg`; vitamin E similarly uses a more specific Phase 08 unit. Matching IDs do not authorize equivalent conversion. Retain both original contracts. Plain mass-unit changes preserve the same nutrient concept; other forms and equivalents require explicit source-backed conversion rules scoped to framework and nutrient form. Incompatible values cannot calculate percentages.

Age limits are inclusive integer months. Overlapping rows with the same framework, value type, life stage and overlapping sex scope are rejected instead of choosing a reference arbitrarily. Missing reference rows and explicitly unestablished values remain distinct from a numeric zero. Upper limits are informational boundaries, never goals.
