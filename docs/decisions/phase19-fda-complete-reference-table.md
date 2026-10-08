# Complete FDA label-reference transcription

The official FDA Current Daily Value table was inspected on October 8, 2026. Its 35 rows map to existing stable nutrient concepts. The original seven-row October 5 transcription remains in the repository; its values are unchanged. The current source has no verified publisher update date or release number. The snapshot version identifies our extraction, and direct HTML retrieval was unavailable; no raw-page checksum is asserted.

The compiler byte-pins the reviewed transcription, checks exact numerical values and adult/children age 4+ general labeling scope, requires every table row to appear exactly once, and validates the complete proposed release before atomic writes. The FDA industry FAQ at https://www.fda.gov/media/99069/download?attachment= separately confirms the age scope and equivalence units. The values are label references, not personal EARs, RDAs, ULs, supplement prescriptions or pregnancy/lactation recommendations.

Niacin remains mg NE, folate remains micrograms DFE, vitamin A remains micrograms RAE and vitamin E remains mg alpha-tocopherol. No conversion is imported. Food folate, folic acid, retinol, beta-carotene, total sugars, trans fat and other concepts without a corresponding table row receive no invented DV. Existing composition rules and missing-data states remain unchanged. FDA serving-based high/low guidance is not applied to per-100-g food rankings.

NIH and component education compilers now deterministically append these separately cited FDA rows. They still reject changes to published educational claims. Review metadata identifies machine source verification and personal use; no independent human review is claimed.
