# Planning methodology

Primary model: supplied 2023 National Academies adult EER coefficients, selected explicitly by equation sex and activity category. Inputs are canonical kg/cm/years. No independent activity multiplier, workout energy add-back, predicted goal date or automatic adjustment is used. Imperial inputs use exact inch/pound conversions before validation and preserve full precision.

Unrounded maintenance is retained; goal adjustments use it. Energy headlines round to 25 kcal after calculation. Macros use the rounded target so the budget reconciles. RMSE appears beside the result as a population-model performance statistic, never a personal confidence interval. BMI is contextual and supplies the specified low-weight safety blocks, not a body-fat estimate or diagnosis.

Each saved plan is an immutable calculation snapshot whose metadata can be edited. Changed assumptions require a duplicate and explicit recalculation. Archived plans remain available and exportable. Old versions retain results. Transient workspace inputs disappear on reload; structured saved records use IndexedDB only.

The loaded calculator needs no runtime API or connectivity. A full offline navigation/cache guarantee awaits deployment/cache verification; no service worker is claimed here.
