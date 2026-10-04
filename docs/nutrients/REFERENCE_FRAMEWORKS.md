# Reference frameworks

Four framework IDs remain isolated: `us_canada_dri`, `fda_dv_adult_4_plus`, `icmr_nin_2020`, `efsa_drv`. The supplied reference registry defines their authorities and value types. A separate `framework-datasets.json` governs the exact imported version, approval and rights status. All manifests currently have no configured numeric dataset version and contain no public reference values.

The Reference Intake Explorer selects framework, complete age months (or years that resolve to whole months), source sex scope and explicit general/pregnancy/lactation stage. It does not infer pregnancy, use geolocation, request conditions or turn the reference into supplement advice. Unsupported versions and overlapping rows resolve to explicit unavailable states.

RDA, AI, EAR, UL, AMDR, CDRR, DV, PRI, AR, RI and TUL have separate plain-language glossary entries. EAR/AR are population requirement estimates; UL/TUL are upper-limit context; DV is a label reference. Ranges keep their source energy basis. None is silently averaged with another authority. Missing upper-limit information is not an assertion of unlimited safety.

Before importing a numeric dataset, record the real authority version and reuse review, verify every population and value type, preserve source-specific units and food/supplement scope in notes, and complete numerical/editorial review. The compiler rejects public rows without a reviewed version-bearing dataset and source citation.
