import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "../../components/common/page-header";
import { InfoCallout } from "../../components/common/primitives";
import { usePreferences } from "../../components/app-shell/preferences";
import {
  dietReference,
  dietFrameworks,
  defaultProteinPreset,
  metricConversion,
  inputLimits,
  defaultDietSettings,
  convertDietPlannerInputsToMetric,
  calculateAdultEer,
  calculateBmiContext,
  buildDietPlan,
  type PlannerOptions,
  type DietPlan,
  type DietSettings,
  type Goal,
  type Activity,
} from "./domain";
import { mutateDietPlans, redactDietInputs } from "./storage";

export const dietSections = [
  ["energy", "Energy"],
  ["goal", "Goal"],
  ["macros", "Macros"],
  ["meal-distribution", "Meals"],
] as const;
export const boundaryText =
  "Designed for healthy adults only. This tool is not designed for diagnosed eating disorders, kidney or liver disease, diabetes managed with glucose-lowering medication, bariatric-surgery history, unintentional weight loss, prescribed therapeutic diets or extreme athletic workloads. Seek qualified professional review for these situations.";
type Fields = {
  age: string;
  sex: "" | "male" | "female";
  height: string;
  weight: string;
  activity: "" | Activity;
  pregnancy: boolean;
  acknowledged: boolean;
  targetWeight: string;
  calculationWeight: string;
};
const initialFields: Fields = {
  age: "",
  sex: "",
  height: "",
  weight: "",
  activity: "",
  pregnancy: false,
  acknowledged: false,
  targetWeight: "",
  calculationWeight: "",
};
export const initialOptions: PlannerOptions = {
  goal: "maintenance",
  adjustmentPercent: dietReference.goalAdjustments.maintenance.defaultPercent,
  proteinPresetId: defaultProteinPreset!.id,
  selectedProteinGPerKg: defaultProteinPreset!.defaultGPerKg,
  fatPercentEnergy: dietReference.macroRules.defaultFatPercent,
  mealCount: dietReference.mealDistribution.defaultMealCount,
  mealMode: "even",
};
interface Workspace {
  fields: Fields;
  setFields: (value: Fields) => void;
  options: PlannerOptions;
  setOptions: (value: PlannerOptions) => void;
  settings: DietSettings;
  setSettings: (value: DietSettings) => void;
  seed: (plan: DietPlan) => void;
  recalculatedFrom?: string;
}
const Context = createContext<Workspace | null>(null);
export function DietWorkspaceProvider({ children }: { children: ReactNode }) {
  const [fields, setFields] = useState(initialFields),
    [options, setOptions] = useState(initialOptions),
    [settings, setSettings] = useState(defaultDietSettings),
    [recalculatedFrom, setRecalculatedFrom] = useState<string>();
  const seed = (plan: DietPlan) => {
    if (!plan.inputs)
      throw Error(
        "This snapshot has no stored inputs. Enter fresh inputs to recalculate.",
      );
    const i = plan.inputs;
    setRecalculatedFrom(plan.id);
    setSettings({ ...settings, unitSystem: "metric" });
    setFields({
      age: String(i.ageYears),
      sex: i.sexForEquation,
      height: String(i.heightCm),
      weight: String(i.weightKg),
      activity: i.activityCategory,
      pregnancy: i.pregnancyOrLactation,
      acknowledged: false,
      targetWeight: i.targetWeightKg ? String(i.targetWeightKg) : "",
      calculationWeight: i.calculationWeightKg
        ? String(i.calculationWeightKg)
        : "",
    });
    setOptions({
      ...initialOptions,
      goal: plan.goal,
      adjustmentPercent: plan.energy.adjustmentPercent,
      manualOverrideKcal: plan.energy.manualOverrideKcal ?? undefined,
      manualOverrideReason: plan.energy.manualOverrideReason ?? undefined,
      proteinPresetId:
        plan.macros.proteinPresetId ?? initialOptions.proteinPresetId,
      selectedProteinGPerKg:
        plan.macros.protein.selected / (i.calculationWeightKg ?? i.weightKg),
      fatPercentEnergy:
        plan.macros.fatPercentEnergy ?? initialOptions.fatPercentEnergy,
      mealCount: plan.mealDistribution.mealCount,
      mealMode: plan.mealDistribution.mode,
      customMeals:
        plan.mealDistribution.mode === "custom"
          ? plan.mealDistribution.meals
          : undefined,
    });
  };
  return (
    <Context.Provider
      value={{
        fields,
        setFields,
        options,
        setOptions,
        settings,
        setSettings,
        seed,
        recalculatedFrom,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDietWorkspace() {
  const value = useContext(Context);
  if (!value) throw Error("Diet workspace provider missing");
  return value;
}
export function DietNavigation() {
  return (
    <nav className="diet-nav" aria-label="Diet planning pages">
      <Link to="/diet-planning" activeOptions={{ exact: true }}>
        Overview
      </Link>
      {dietSections.map(([path, label]) => (
        <Link key={path} to={`/diet-planning/${path}`}>
          {label}
        </Link>
      ))}
      <Link to="/diet-planning/plans">Saved plans</Link>
      <Link to="/diet-planning/methodology">Methodology</Link>
      <Link to="/diet-planning/safety">Safety</Link>
    </nav>
  );
}
export function DietSources({ ids }: { ids?: string[] }) {
  return (
    <ul className="diet-sources">
      {dietReference.sources
        .filter((source) => !ids || ids.includes(source.id))
        .map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.title} ({source.year})
            </a>
          </li>
        ))}
    </ul>
  );
}
const display = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 1 });
export function DietResult({ plan }: { plan: DietPlan }) {
  return (
    <section className="diet-result" aria-label="Starting target summary">
      <h2>Starting target</h2>
      <p>
        Maintenance estimate{" "}
        <strong>{plan.energy.maintenanceKcal} kcal/day</strong>; explicit
        adjustment <strong>{display(plan.energy.adjustmentPercent)}%</strong>.
      </p>
      <p className="diet-target">
        {plan.energy.targetKcal} <span>kcal/day</span>
      </p>
      {plan.goal === "manual" && (
        <p className="status-badge tone-warning">
          Manual override: {plan.energy.manualOverrideReason}
        </p>
      )}
      <p>
        Population-model estimate, not a metabolic measurement. Individual
        maintenance can differ by hundreds of calories. Model RMSE:{" "}
        {plan.energy.modelRmseKcal} kcal/day; this is not a personal confidence
        interval.
      </p>
      <dl className="diet-macros">
        <div>
          <dt>Protein</dt>
          <dd>{display(plan.macros.protein.selected)} g/day</dd>
          <dd className="diet-detail">
            Range {display(plan.macros.protein.min)}–
            {display(plan.macros.protein.max)} g/day
          </dd>
        </div>
        <div>
          <dt>Fat</dt>
          <dd>{display(plan.macros.fat.selected)} g/day</dd>
          <dd className="diet-detail">
            {plan.macros.fatPercentEnergy}% energy
          </dd>
        </div>
        <div>
          <dt>Carbohydrate</dt>
          <dd>{display(plan.macros.carbohydrate.selected)} g/day</dd>
          <dd className="diet-detail">
            {display(plan.macros.carbohydratePercentEnergy ?? 0)}% energy;
            remainder
          </dd>
        </div>
        <div>
          <dt>Fibre benchmark</dt>
          <dd>{Math.round(plan.macros.fiber.selected)} g/day</dd>
          <dd className="diet-detail">Planning benchmark, not treatment</dd>
        </div>
      </dl>
      {plan.warnings.map((w) => (
        <InfoCallout
          key={w.code}
          tone={w.severity === "block" ? "danger" : "warning"}
          title={w.severity === "block" ? "Blocked" : "Caution"}
        >
          {w.message}
        </InfoCallout>
      ))}
      <details className="diet-calculation">
        <summary>How this was calculated</summary>
        {plan.inputs ? (
          <>
            <p>
              Metric inputs: {plan.inputs.ageYears} years;{" "}
              {plan.inputs.heightCm} cm; {plan.inputs.weightKg} kg;{" "}
              {plan.inputs.sexForEquation}; {plan.inputs.activityCategory}.
            </p>
            <EquationText
              sex={plan.inputs.sexForEquation}
              activity={plan.inputs.activityCategory}
            />
            <p>
              BMI:{" "}
              {display(
                calculateBmiContext(plan.inputs.weightKg, plan.inputs.heightCm),
              )}{" "}
              = kg / (metres × metres). BMI does not distinguish muscle from fat
              and is not a diagnosis.
            </p>
          </>
        ) : (
          <p>
            Personal inputs were withheld. This snapshot cannot be recalculated
            without fresh inputs.
          </p>
        )}
        <p>
          Unrounded maintenance: {plan.energy.unroundedMaintenanceKcal}{" "}
          kcal/day. Headlines round to the nearest 25 kcal after calculations.
        </p>
        <p>
          Goal: {plan.energy.unroundedMaintenanceKcal} × (1 +{" "}
          {plan.energy.adjustmentPercent}/100)
          {plan.energy.manualOverrideKcal !== null &&
          plan.energy.manualOverrideKcal !== undefined
            ? `; direct manual input ${plan.energy.manualOverrideKcal}`
            : ""}
          .
        </p>
        <p>
          Protein: {plan.macros.protein.basis}. Fat: target ×{" "}
          {plan.macros.fatPercentEnergy}/100 ÷{" "}
          {dietReference.macroRules.energyPerGramKcal.fat}. Carbohydrate:
          (target − protein ×{" "}
          {dietReference.macroRules.energyPerGramKcal.protein} − fat ×{" "}
          {dietReference.macroRules.energyPerGramKcal.fat}) ÷{" "}
          {dietReference.macroRules.energyPerGramKcal.carbohydrate}.
        </p>
        <p>
          Fibre: target / 1000 ×{" "}
          {dietReference.macroRules.fiberGramsPer1000Kcal}.
        </p>
        <p>
          AMDR:{" "}
          {Object.entries(plan.macros.amdrStatus ?? {})
            .map(([key, status]) => `${key}: ${status}`)
            .join("; ")}
          .
        </p>
        <p>
          Formula {plan.provenance.formulaSetId} v
          {plan.provenance.formulaSetVersion}; reference v
          {plan.provenance.referenceDataVersion}; model {plan.energy.modelId} v
          {plan.energy.modelVersion}. Calculated {plan.provenance.calculatedAt}.
        </p>
        <DietSources ids={plan.provenance.sourceIds} />
        <button type="button" onClick={() => window.print()}>
          Print calculation
        </button>
      </details>
    </section>
  );
}
export function EquationText({
  sex,
  activity,
}: {
  sex: "male" | "female";
  activity: Activity;
}) {
  const e = dietReference.energyModel.equations[sex][activity];
  return (
    <p className="diet-equation">
      EER = {e.intercept} + ({e.ageCoefficient} × age years) + (
      {e.heightCoefficient} × height cm) + ({e.weightCoefficient} × weight kg)
    </p>
  );
}
export function DietPlanner({
  step,
}: {
  step: (typeof dietSections)[number][0];
}) {
  const {
      fields,
      setFields,
      options,
      setOptions,
      settings,
      setSettings,
      recalculatedFrom,
    } = useDietWorkspace(),
    { hydrated } = usePreferences(),
    [name, setName] = useState(""),
    [message, setMessage] = useState(""),
    [saving, setSaving] = useState(false),
    [attempted, setAttempted] = useState(false),
    [gramMode, setGramMode] = useState(Boolean(options.customMeals)),
    [pattern, setPattern] = useState("unspecified"),
    [cuisines, setCuisines] = useState(""),
    [excluded, setExcluded] = useState(""),
    [allergy, setAllergy] = useState("");
  const calculation = useMemo(() => {
    try {
      if (
        !fields.age ||
        !fields.sex ||
        !fields.height ||
        !fields.weight ||
        !fields.activity
      )
        throw Error(
          "Enter age, equation sex, height, weight and activity category.",
        );
      const inputs = {
        ageYears: Number(fields.age),
        sexForEquation: fields.sex,
        activityCategory: fields.activity,
        pregnancyOrLactation: fields.pregnancy,
        professionalReviewAcknowledged: fields.acknowledged,
        ...convertDietPlannerInputsToMetric({
          unitSystem: settings.unitSystem,
          height: Number(fields.height),
          weight: Number(fields.weight),
          targetWeight: fields.targetWeight
            ? Number(fields.targetWeight)
            : undefined,
          calculationWeight: fields.calculationWeight
            ? Number(fields.calculationWeight)
            : undefined,
        }),
      };
      const eer = calculateAdultEer(inputs);
      try {
        return {
          inputs,
          eer,
          plan: buildDietPlan(
            inputs,
            options,
            "Preview",
            new Date().toISOString(),
            "dietplan_preview",
            true,
          ),
          error: "",
        };
      } catch (error) {
        return {
          inputs,
          eer,
          plan: undefined,
          error:
            error instanceof Error
              ? error.message
              : "Review the planning inputs.",
        };
      }
    } catch (error) {
      return {
        inputs: undefined,
        eer: undefined,
        plan: undefined,
        error:
          error instanceof Error
            ? error.message
            : "Review the eligibility fields.",
      };
    }
  }, [fields, options, settings.unitSystem]);
  const field = (key: keyof Fields, value: string | boolean) => {
      setFields({ ...fields, [key]: value });
      setMessage("");
    },
    option = (change: Partial<PlannerOptions>) => {
      setOptions({ ...options, ...change });
      setMessage("");
    };
  function changeUnits(unitSystem: "metric" | "imperial") {
    if (unitSystem === settings.unitSystem) return;
    const values = convertDietPlannerInputsToMetric({
        unitSystem: settings.unitSystem,
        height: Number(fields.height || 0),
        weight: Number(fields.weight || 0),
        targetWeight: fields.targetWeight
          ? Number(fields.targetWeight)
          : undefined,
        calculationWeight: fields.calculationWeight
          ? Number(fields.calculationWeight)
          : undefined,
      }),
      factor = unitSystem === "imperial" ? 1 / metricConversion.kgPerPound : 1;
    setFields({
      ...fields,
      height: fields.height
        ? String(
            values.heightCm /
              (unitSystem === "imperial" ? metricConversion.cmPerInch : 1),
          )
        : "",
      weight: fields.weight ? String(values.weightKg * factor) : "",
      targetWeight:
        values.targetWeightKg === null
          ? ""
          : String(values.targetWeightKg * factor),
      calculationWeight:
        values.calculationWeightKg === null
          ? ""
          : String(values.calculationWeightKg * factor),
    });
    setSettings({ ...settings, unitSystem });
  }
  async function save() {
    setAttempted(true);
    if (!calculation.plan || !name.trim()) {
      setMessage(
        "Enter a plan name and resolve the calculation fields before saving.",
      );
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString(),
        plan = redactDietInputs(
          {
            ...calculation.plan,
            id: `dietplan_${crypto.randomUUID()}`,
            name: name.trim(),
            createdAt: now,
            updatedAt: now,
            provenance: { ...calculation.plan.provenance, calculatedAt: now },
            dietPreferences: {
              pattern: pattern as NonNullable<
                DietPlan["dietPreferences"]
              >["pattern"],
              cuisinePreferences: cuisines
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              excludedFoodIds: excluded
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              allergenNotes: allergy.trim() || null,
            },
          },
          settings.storeInputsInSavedPlans,
        );
      await mutateDietPlans({
        action: "created",
        plan,
        settings,
        summary: recalculatedFrom
          ? `Duplicated and recalculated from ${recalculatedFrom}.`
          : undefined,
      });
      setMessage(
        "Saved on this device. View it in Saved plans; it is not current until you select it.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Save failed. Existing plans are preserved.",
      );
    } finally {
      setSaving(false);
    }
  }
  const protein =
      dietReference.proteinPresets.find(
        (p) => p.id === options.proteinPresetId,
      ) ?? defaultProteinPreset!,
    index = dietSections.findIndex((s) => s[0] === step);
  const mealBaseline = (() => {
    if (!calculation.inputs) return undefined;
    try {
      return buildDietPlan(
        calculation.inputs,
        { ...options, mealMode: "even", customMeals: undefined },
        "Preview",
        new Date().toISOString(),
        "dietplan_preview",
        true,
      );
    } catch {
      return undefined;
    }
  })();
  return (
    <div className="page diet-page">
      <PageHeader
        title={dietSections[index]![1] + " planner"}
        eyebrow={`EAT / STEP ${index + 1} OF ${dietSections.length}`}
        description="Make the assumptions explicit. Inputs remain transient until you choose to save."
      />
      <div className="diet-workspace">
        <div>
          <fieldset disabled={!hydrated} className="diet-fields">
            {step === "energy" && (
              <>
                <InfoCallout title="Eligibility and professional-review boundary">
                  {boundaryText}
                </InfoCallout>
                <label>
                  <input
                    type="checkbox"
                    checked={fields.acknowledged}
                    onChange={(e) => field("acknowledged", e.target.checked)}
                  />
                  I understand this limitation and am using the healthy-adult
                  planner.
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={fields.pregnancy}
                    onChange={(e) => field("pregnancy", e.target.checked)}
                  />
                  Pregnant or lactating (calculator unavailable)
                </label>
                <label>
                  Display units
                  <select
                    value={settings.unitSystem}
                    onChange={(e) =>
                      changeUnits(e.target.value as "metric" | "imperial")
                    }
                  >
                    <option value="metric">Metric</option>
                    <option value="imperial">Imperial</option>
                  </select>
                </label>
                <div className="diet-input-grid">
                  <label>
                    Age (years)
                    <input
                      id="diet-age"
                      type="number"
                      inputMode="decimal"
                      min={inputLimits.age.min}
                      max={inputLimits.age.max}
                      value={fields.age}
                      onChange={(e) => field("age", e.target.value)}
                    />
                  </label>
                  <label>
                    Sex used by the source equation
                    <select
                      id="diet-sex"
                      value={fields.sex}
                      onChange={(e) => field("sex", e.target.value)}
                    >
                      <option value="">Choose</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                  <label>
                    Height ({settings.unitSystem === "metric" ? "cm" : "inches"}
                    )
                    <input
                      id="diet-height"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={fields.height}
                      onChange={(e) => field("height", e.target.value)}
                    />
                  </label>
                  <label>
                    Current weight (
                    {settings.unitSystem === "metric" ? "kg" : "lb"})
                    <input
                      id="diet-weight"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={fields.weight}
                      onChange={(e) => field("weight", e.target.value)}
                    />
                  </label>
                </div>
                <label>
                  Physical-activity category
                  <select
                    id="diet-activity"
                    value={fields.activity}
                    onChange={(e) => field("activity", e.target.value)}
                  >
                    <option value="">Choose a category</option>
                    {dietReference.activityCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p>
                  PAL aggregates work, transport, recreation, sleep and daily
                  movement. A workout or step count does not directly determine
                  a category.
                </p>
                {dietReference.activityCategories.map((c) => (
                  <div key={c.id} className="diet-activity">
                    <strong>{c.label}</strong>
                    <p>
                      PAL {c.palMin} to less than {c.palMaxExclusive}.{" "}
                      {c.description}
                    </p>
                    {calculation.inputs && (
                      <p>
                        Compare estimate:{" "}
                        {Math.round(
                          calculateAdultEer({
                            ...calculation.inputs,
                            activityCategory: c.id as Activity,
                          }).headline,
                        )}{" "}
                        kcal/day
                      </p>
                    )}
                  </div>
                ))}
              </>
            )}
            {step === "goal" && (
              <>
                <label>
                  Planning goal
                  <select
                    value={options.goal}
                    onChange={(e) => {
                      const goal = e.target.value as Goal,
                        rule = dietReference.goalAdjustments[goal];
                      option({
                        goal,
                        adjustmentPercent:
                          "defaultPercent" in rule ? rule.defaultPercent : 0,
                        manualOverrideKcal: undefined,
                        manualOverrideReason: undefined,
                      });
                    }}
                  >
                    {Object.keys(dietReference.goalAdjustments).map((g) => (
                      <option key={g} value={g}>
                        {g.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                {options.goal === "manual" ? (
                  <>
                    <label>
                      Manual adjustment (%)
                      <input
                        type="number"
                        step="any"
                        value={options.adjustmentPercent}
                        min={dietReference.goalAdjustments.manual.minPercent}
                        max={dietReference.goalAdjustments.manual.maxPercent}
                        onChange={(e) =>
                          option({
                            adjustmentPercent: Number(e.target.value),
                            manualOverrideKcal: undefined,
                          })
                        }
                      />
                    </label>
                    <label>
                      Or direct target (kcal/day)
                      <input
                        type="number"
                        value={options.manualOverrideKcal ?? ""}
                        onChange={(e) =>
                          option({
                            manualOverrideKcal: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </label>
                    <label>
                      Manual reason
                      <textarea
                        maxLength={500}
                        value={options.manualOverrideReason ?? ""}
                        onChange={(e) =>
                          option({ manualOverrideReason: e.target.value })
                        }
                      />
                    </label>
                  </>
                ) : (
                  <label>
                    Explicit adjustment (%)
                    <select
                      value={options.adjustmentPercent}
                      onChange={(e) =>
                        option({ adjustmentPercent: Number(e.target.value) })
                      }
                    >
                      {("allowedPercents" in
                      dietReference.goalAdjustments[options.goal]
                        ? dietReference.goalAdjustments[options.goal]
                            .allowedPercents
                        : []
                      ).map((p) => (
                        <option key={p} value={p}>
                          {p}%
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <p>
                  Defaults are interface starting points. A percentage does not
                  guarantee weekly weight change or a completion date.
                </p>
                <label>
                  Optional goal weight (
                  {settings.unitSystem === "metric" ? "kg" : "lb"})
                  <input
                    type="number"
                    step="any"
                    value={fields.targetWeight}
                    onChange={(e) => field("targetWeight", e.target.value)}
                  />
                </label>
                <p>
                  Goal weight is used only for contextual BMI safety checks. BMI
                  is not a diagnosis.
                </p>
              </>
            )}
            {step === "macros" && (
              <>
                <label>
                  Protein context
                  <select
                    value={options.proteinPresetId}
                    onChange={(e) => {
                      const p = dietReference.proteinPresets.find(
                        (p) => p.id === e.target.value,
                      );
                      if (p)
                        option({
                          proteinPresetId: p.id,
                          selectedProteinGPerKg: p.defaultGPerKg,
                        });
                    }}
                  >
                    {dietReference.proteinPresets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p>
                  {protein.notes} Range {protein.minGPerKg}–{protein.maxGPerKg}{" "}
                  g/kg/day. The upper end is not automatically superior.
                </p>
                <DietSources ids={protein.sourceIds} />
                <label>
                  Selected protein (g/kg/day)
                  <input
                    type="number"
                    step="any"
                    min={protein.minGPerKg}
                    max={protein.maxGPerKg}
                    value={options.selectedProteinGPerKg}
                    onChange={(e) =>
                      option({ selectedProteinGPerKg: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Optional manual calculation weight (
                  {settings.unitSystem === "metric" ? "kg" : "lb"})
                  <input
                    type="number"
                    step="any"
                    value={fields.calculationWeight}
                    onChange={(e) => field("calculationWeight", e.target.value)}
                  />
                </label>
                <p>
                  Blank uses current weight. No adjusted weight is inferred.
                </p>
                <label>
                  Fat (% energy)
                  <input
                    type="number"
                    step="any"
                    min={
                      dietReference.macroRules.adultAmdrPercentEnergy.fat.min
                    }
                    max={
                      dietReference.macroRules.adultAmdrPercentEnergy.fat.max
                    }
                    value={options.fatPercentEnergy}
                    onChange={(e) =>
                      option({ fatPercentEnergy: Number(e.target.value) })
                    }
                  />
                </label>
                <p>
                  Carbohydrate uses remaining energy. Allocations outside AMDR
                  are labelled and are not silently changed.
                </p>
                <label>
                  Reference framework for saved targets
                  <select
                    value={settings.referenceFrameworkId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        referenceFrameworkId: e.target.value,
                      })
                    }
                  >
                    {dietFrameworks.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.authority}
                      </option>
                    ))}
                  </select>
                </label>
                <Link
                  to="/nutrients/reference-intakes"
                  search={{ framework: settings.referenceFrameworkId }}
                >
                  Population references for fibre, fat and total water
                </Link>
                <InfoCallout title="Reference values unavailable">
                  No approved Phase 08 numeric intake dataset is currently
                  published. The fibre planning benchmark is shown separately.
                  Total water includes food and beverages; needs vary with
                  circumstances.
                </InfoCallout>
              </>
            )}
            {step === "meal-distribution" && (
              <>
                <p>{dietReference.mealDistribution.proteinDistributionNote}</p>
                <label>
                  Meal count
                  <select
                    value={options.mealCount}
                    onChange={(e) => {
                      setGramMode(false);
                      option({
                        mealCount: Number(e.target.value),
                        mealLabels: undefined,
                        mealPercents: undefined,
                        customMeals: undefined,
                      });
                    }}
                  >
                    {dietReference.mealDistribution.allowedMealCount.map(
                      (n) => (
                        <option key={n}>{n}</option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Distribution mode
                  <select
                    value={options.mealMode}
                    onChange={(e) => {
                      setGramMode(false);
                      option({
                        mealMode: e.target.value as "even" | "custom",
                        mealPercents: Array.from(
                          { length: options.mealCount },
                          () => 100 / options.mealCount,
                        ),
                        customMeals: undefined,
                      });
                    }}
                  >
                    <option value="even">Even</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>
                {options.mealMode === "custom" && (
                  <label>
                    <input
                      type="checkbox"
                      checked={gramMode}
                      onChange={(e) => {
                        setGramMode(e.target.checked);
                        option({
                          customMeals: e.target.checked
                            ? ((calculation.plan ?? mealBaseline)
                                ?.mealDistribution.meals ??
                              Array.from(
                                { length: options.mealCount },
                                (_, i) => ({
                                  label: `Meal ${i + 1}`,
                                  energyKcal: 0,
                                  proteinGrams: 0,
                                  fatGrams: 0,
                                  carbohydrateGrams: 0,
                                }),
                              ))
                            : undefined,
                          mealPercents: Array.from(
                            { length: options.mealCount },
                            () => 100 / options.mealCount,
                          ),
                        });
                      }}
                    />
                    Enter individual energy and gram allocations
                  </label>
                )}
                {Array.from({ length: options.mealCount }, (_, i) => (
                  <div key={i} className="diet-meal-edit">
                    <label>
                      Meal {i + 1} label
                      <input
                        maxLength={50}
                        value={
                          options.mealLabels?.[i] ??
                          options.customMeals?.[i]?.label ??
                          `Meal ${i + 1}`
                        }
                        onChange={(e) => {
                          const labels = Array.from(
                            { length: options.mealCount },
                            (_, n) =>
                              options.mealLabels?.[n] ?? `Meal ${n + 1}`,
                          );
                          labels[i] = e.target.value;
                          option({
                            mealLabels: labels,
                            customMeals: options.customMeals?.map((meal, n) =>
                              n === i
                                ? { ...meal, label: e.target.value }
                                : meal,
                            ),
                          });
                        }}
                      />
                    </label>
                    {options.mealMode === "custom" && !gramMode && (
                      <label>
                        Meal {i + 1} share (%)
                        <input
                          type="number"
                          step="any"
                          value={
                            options.mealPercents?.[i] ?? 100 / options.mealCount
                          }
                          onChange={(e) => {
                            const shares = Array.from(
                              { length: options.mealCount },
                              (_, n) =>
                                options.mealPercents?.[n] ??
                                100 / options.mealCount,
                            );
                            shares[i] = Number(e.target.value);
                            option({ mealPercents: shares });
                          }}
                        />
                      </label>
                    )}
                    {options.mealMode === "custom" &&
                      gramMode &&
                      (
                        [
                          "energyKcal",
                          "proteinGrams",
                          "fatGrams",
                          "carbohydrateGrams",
                        ] as const
                      ).map((key) => (
                        <label key={key}>
                          Meal {i + 1}{" "}
                          {key === "energyKcal"
                            ? "energy (kcal)"
                            : key.replace("Grams", " (g)")}
                          <input
                            type="number"
                            step="any"
                            value={options.customMeals?.[i]?.[key] ?? 0}
                            onChange={(e) => {
                              const meals =
                                options.customMeals ??
                                Array.from(
                                  { length: options.mealCount },
                                  (_, n) => ({
                                    label: `Meal ${n + 1}`,
                                    energyKcal: 0,
                                    proteinGrams: 0,
                                    fatGrams: 0,
                                    carbohydrateGrams: 0,
                                  }),
                                );
                              option({
                                customMeals: meals.map((meal, n) =>
                                  n === i
                                    ? { ...meal, [key]: Number(e.target.value) }
                                    : meal,
                                ),
                              });
                            }}
                          />
                        </label>
                      ))}
                  </div>
                ))}
                {options.mealMode === "custom" && !gramMode && (
                  <p>
                    Percentage total:{" "}
                    {(
                      options.mealPercents ??
                      Array.from(
                        { length: options.mealCount },
                        () => 100 / options.mealCount,
                      )
                    ).reduce((a, b) => a + b, 0)}
                    %; difference from daily total:{" "}
                    {100 -
                      (
                        options.mealPercents ??
                        Array.from(
                          { length: options.mealCount },
                          () => 100 / options.mealCount,
                        )
                      ).reduce((a, b) => a + b, 0)}{" "}
                    percentage points.
                  </p>
                )}
                {options.customMeals && calculation.eer && (
                  <p>
                    Custom energy total:{" "}
                    {display(
                      options.customMeals.reduce(
                        (sum, m) => sum + m.energyKcal,
                        0,
                      ),
                    )}{" "}
                    kcal. Review reconciliation messages below before saving.
                  </p>
                )}
                {options.customMeals && mealBaseline && (
                  <p>
                    Difference from daily target: energy{" "}
                    {display(
                      options.customMeals.reduce(
                        (sum, m) => sum + m.energyKcal,
                        0,
                      ) - mealBaseline.energy.targetKcal,
                    )}{" "}
                    kcal; protein{" "}
                    {display(
                      options.customMeals.reduce(
                        (sum, m) => sum + m.proteinGrams,
                        0,
                      ) - mealBaseline.macros.protein.selected,
                    )}{" "}
                    g; carbohydrate{" "}
                    {display(
                      options.customMeals.reduce(
                        (sum, m) => sum + m.carbohydrateGrams,
                        0,
                      ) - mealBaseline.macros.carbohydrate.selected,
                    )}{" "}
                    g; fat{" "}
                    {display(
                      options.customMeals.reduce(
                        (sum, m) => sum + m.fatGrams,
                        0,
                      ) - mealBaseline.macros.fat.selected,
                    )}{" "}
                    g.
                  </p>
                )}
              </>
            )}
          </fieldset>
          <div className="actions">
            {index > 0 && (
              <Link
                to={`/diet-planning/${dietSections[index - 1]![0]}`}
                className="button secondary"
              >
                Previous step
              </Link>
            )}
            {index < dietSections.length - 1 && (
              <Link
                to={`/diet-planning/${dietSections[index + 1]![0]}`}
                className="button primary"
              >
                Next: {dietSections[index + 1]![1]}
              </Link>
            )}
          </div>
          <section className="diet-save">
            <h2>Save this plan optionally</h2>
            <label>
              Plan name
              <input
                id="diet-plan-name"
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!hydrated}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.storeInputsInSavedPlans}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    storeInputsInSavedPlans: e.target.checked,
                  })
                }
                disabled={!hydrated}
              />
              Include age, equation sex, height and weights in the saved plan.
              Otherwise these inputs are withheld.
            </label>
            <details>
              <summary>Optional plan-specific preferences</summary>
              <label>
                Diet pattern
                <select
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                >
                  {[
                    "unspecified",
                    "omnivore",
                    "vegetarian",
                    "vegan",
                    "pescatarian",
                    "eggetarian",
                  ].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label>
                Cuisine preferences (comma separated)
                <input
                  value={cuisines}
                  onChange={(e) => setCuisines(e.target.value)}
                />
              </label>
              <label>
                Excluded food IDs (comma separated)
                <input
                  value={excluded}
                  onChange={(e) => setExcluded(e.target.value)}
                />
              </label>
              <label>
                Allergy note
                <textarea
                  maxLength={500}
                  value={allergy}
                  onChange={(e) => setAllergy(e.target.value)}
                />
              </label>
              <p>
                Plan metadata does not guarantee allergen safety or diagnose
                nutrient gaps.
              </p>
            </details>
            <button
              className="button primary"
              disabled={!hydrated || saving}
              onClick={() => void save()}
            >
              {saving ? "Saving…" : "Save on this device"}
            </button>
            <p role="status">
              {message}
              {attempted && !name.trim() && (
                <>
                  <br />
                  <a href="#diet-plan-name">Enter a plan name</a>
                </>
              )}
            </p>
          </section>
        </div>
        <aside className="diet-summary" aria-live="polite">
          {calculation.plan ? (
            <>
              <DietResult plan={calculation.plan} />
              <MealSummary plan={calculation.plan} />
            </>
          ) : (
            <section className="diet-result">
              <h2>Review inputs</h2>
              {calculation.eer && (
                <p>
                  Estimated maintenance: {calculation.eer.headline} kcal/day.
                  Model RMSE: {calculation.eer.rmse} kcal/day; not a personal
                  confidence interval.
                </p>
              )}
              <p role={attempted ? "alert" : undefined}>{calculation.error}</p>
              {attempted && step === "energy" && (
                <ul aria-label="Review invalid input fields">
                  {[
                    ["ageYears", "diet-age", "Age"],
                    ["sexForEquation", "diet-sex", "Equation sex"],
                    ["heightCm", "diet-height", "Height"],
                    ["weightKg", "diet-weight", "Weight"],
                    ["activityCategory", "diet-activity", "Activity"],
                  ]
                    .filter(
                      ([field]) =>
                        calculation.error.includes(field ?? "") ||
                        calculation.error.startsWith("Enter age"),
                    )
                    .map(([, id, label]) => (
                      <li key={id}>
                        <a href={`#${id}`}>{label}</a>
                      </li>
                    ))}
                </ul>
              )}
              {attempted && (
                <p>
                  <Link to="/diet-planning/energy">
                    Review eligibility and required fields
                  </Link>
                  ; check goal, macro and meal allocations.
                </p>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
export function MealSummary({ plan }: { plan: DietPlan }) {
  return (
    <section className="diet-result">
      <h2>Meal planning slots</h2>
      <p>
        Daily total {plan.energy.targetKcal} kcal; reconciled allocations.
        Convenience, not a requirement to eat identical meals.
      </p>
      <ul className="diet-meal-list">
        {plan.mealDistribution.meals.map((meal, i) => (
          <li key={i}>
            <strong>{meal.label}</strong>
            <p>
              {display(meal.energyKcal)} kcal · P {display(meal.proteinGrams)} g
              · C {display(meal.carbohydrateGrams)} g · F{" "}
              {display(meal.fatGrams)} g
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
export function RecalculateDietButton({ plan }: { plan: DietPlan }) {
  const { seed } = useDietWorkspace(),
    navigate = useNavigate(),
    [message, setMessage] = useState("");
  return (
    <>
      <button
        onClick={() => {
          try {
            seed(plan);
            void navigate({ to: "/diet-planning/energy" });
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Recalculation unavailable",
            );
          }
        }}
      >
        Duplicate and recalculate
      </button>
      <p role="status">{message}</p>
    </>
  );
}
