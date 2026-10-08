# Exact milkfish and unsweetened soy composition

The October 8 machine mapping adds FDC 173675 (raw milkfish), 171995
(milkfish cooked by dry heat) and Foundation 1999630 (unsweetened plain
shelf-stable soy milk). Canonical identities and slugs are preserved.

Both complete downloaded USDA JSON payloads pass their existing exact SHA-256
pins and full mapped-record comparisons before the proposed snapshots and
mappings are written. All nutrient and portion arrays are retained. These are
US source samples, not newly measured Indian composition.

Milkfish defaults to the raw profile. The dry-heat profile is independently
sourced; there is no raw-to-cooked conversion, retention factor or invented
yield. Its generic `cooked` state retains the specific method in the profile
label. A raw composition entry does not recommend eating fish raw.

The soy profile retains every source qualifier. Its source has no portion
weights, so no cup-to-gram conversion is generated. No fortification, brand or
equivalence to every soy beverage is inferred. Unsupported nutrient forms remain
unavailable rather than zero.

Review is machine validation for personal use, with actual mapping time
2026-10-08T02:03:14.802Z. No independent human or clinical review is claimed.
Existing recipe versions, food profiles and their source snapshots are preserved.
