# Lossless nutrient-ranking assets

Nutrient-ranking rows repeated the same food/profile names, states and source
release references across nutrient files. At 485 factual records the public
JSON total was 516816 gzip bytes, close to the existing 524288-byte limit.

The ranking asset format now stores common profile metadata once in a strict,
repository-owned dictionary. Each versioned ranking file stores a positional
tuple for the remaining fields. The runtime reconstructs the existing RankedFood
objects; numbers, row order, units, preparation states, source references, portion
mass, missing contexts and measurement statuses are unchanged. No values are
rounded, averaged, converted or filled in.

The compiler validates every decoded asset against its complete canonical
source-derived rows before replacing generated files. The strict decoder rejects
unsupported versions, unknown fields, invalid values, duplicate profile IDs,
conflicting profile metadata, missing profiles and mismatched nutrient IDs.
Both server and browser loaders use that decoder. The browser dictionary is a
lazy same-origin public asset; failed loads clear the promise cache for retry.
No personal data enters these assets or caches.

Integration tests compare all published nutrient rankings with the independent
food-ranking calculation and runtime repository loader, retaining the separate
alpha-tocopherol form tests. The rebuilt 485-record release passes 310 unit tests
and reduces public JSON to 415707 gzip bytes, saving 101109 bytes. JavaScript is
690943 gzip bytes; all budgets remain unchanged. Browser and coverage results
are recorded at their actual checkpoints, without asserting final completion.
