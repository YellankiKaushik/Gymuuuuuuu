# Exact oat, soy milk and dill samples

The food importer adds three existing identities using the complete pinned USDA
downloads: Foundation 2346396 (whole-grain old-fashioned rolled oats), Foundation
2257044 (sweetened plain refrigerated soy milk) and SR Legacy 172233 (fresh dill
weed). Every earlier food record and mapping remains unchanged. The importer
verified all 273 selected profiles against their original dataset payloads before
writing the expanded release.

These labels remain visible. Preparation is `other` where the source does not
provide one of the application's explicit preparation states. Fresh is retained
in the label; raw, cooked, dried, fortification, brand or cultivar equivalence is
not inferred. The unsweetened shelf-stable soy sample remains a separate identity.
The oats' source-reported 40 g RACC is a reference portion, with no invented cup
conversion or personal serving recommendation.

University of Wisconsin-Madison Extension's selected Culinary Uses of Dill
paragraph identifies dill weed as the leaves and distinguishes it from seed.
That source supplies naming evidence only; all composition remains USDA data.
Its September 2026 revision has no supplied exact day, so `sourceDate` is null.
No source photograph or copyrighted text block is reproduced, and no open licence
or independent human/clinical review is claimed. Missing nutrient values remain
unavailable rather than zero.

Publication metadata is regenerated explicitly after source and mapping
validation; stale publication metadata continues to fail closed. Tests preserve
the earlier raw gourd assertions and add a separate fresh-dill state check rather
than weakening the old preparation requirements.
