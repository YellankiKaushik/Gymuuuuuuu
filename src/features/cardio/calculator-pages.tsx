import { useState } from "react";
import {
  CardioFrame,
  CardioField as Field,
  display,
  numberOrNull,
} from "./workspace";
import {
  calculatePace,
  toMetres,
  formatPace,
  calculateHeartRateTarget,
  tanakaMaximum,
  type DistanceUnit,
} from "./calculations";
export function PacePage() {
  const [distance, setDistance] = useState(""),
    [unit, setUnit] = useState<DistanceUnit>("km"),
    [time, setTime] = useState(""),
    [error, setError] = useState(""),
    [result, setResult] = useState<ReturnType<typeof calculatePace> | null>(
      null,
    );
  return (
    <CardioFrame title="Pace & speed calculator">
      <p>
        Use elapsed time and a measured distance for the same activity. Moving
        time is not inferred. Compare similar modality, terrain and device
        conditions.
      </p>
      <form
        className="card recovery-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const d = numberOrNull(distance);
            setResult(
              calculatePace(
                d === null ? null : toMetres(d, unit),
                numberOrNull(time),
              ),
            );
            setError("");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Check the inputs.");
          }
        }}
      >
        <Field label="Distance">
          <input
            inputMode="decimal"
            type="number"
            min="0"
            step="any"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          />
        </Field>
        <Field label="Distance unit">
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as DistanceUnit)}
          >
            <option value="km">km</option>
            <option value="mile">mile</option>
            <option value="m">m</option>
          </select>
        </Field>
        <Field label="Elapsed seconds">
          <input
            type="number"
            min="0"
            step="any"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Field>
        <button className="button primary">Calculate pace</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {result && (
        <section className="card" aria-label="Pace results">
          <h2>Elapsed-time results</h2>
          <dl>
            <dt>Pace per km</dt>
            <dd>{formatPace(result.secondsPerKm)}</dd>
            <dt>Pace per mile</dt>
            <dd>{formatPace(result.secondsPerMile)}</dd>
            <dt>Speed km/h</dt>
            <dd>{display(result.kilometresPerHour, 3)}</dd>
            <dt>Speed mph</dt>
            <dd>{display(result.milesPerHour, 3)}</dd>
          </dl>
          <p>
            {result.version} · exact mile = 1609.344 m · rounding for display
            only.
          </p>
        </section>
      )}
    </CardioFrame>
  );
}
export function IntensityPage() {
  const [method, setMethod] = useState<"percent_hrmax" | "heart_rate_reserve">(
      "heart_rate_reserve",
    ),
    [source, setSource] = useState("measured"),
    [age, setAge] = useState(""),
    [max, setMax] = useState(""),
    [rest, setRest] = useState(""),
    [lower, setLower] = useState(""),
    [upper, setUpper] = useState(""),
    [disabled, setDisabled] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState<ReturnType<
      typeof calculateHeartRateTarget
    > | null>(null),
    [estimate, setEstimate] = useState<ReturnType<typeof tanakaMaximum>>(null);
  return (
    <CardioFrame title="Intensity methods">
      <p>
        Talk-test observations, perceived effort, heart rate, pace and power
        describe different methods. A generic 0–10 self-report is not a
        proprietary clinical scale. These tools do not establish universal
        training zones.
      </p>
      <form
        className="card recovery-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const estimated =
              source === "age_predicted_tanaka"
                ? tanakaMaximum(numberOrNull(age))
                : null;
            setEstimate(estimated);
            setResult(
              calculateHeartRateTarget({
                method,
                maximumBpm:
                  estimated?.bpm ??
                  (source === "age_predicted_tanaka"
                    ? null
                    : numberOrNull(max)),
                restingBpm: numberOrNull(rest),
                lowerFraction:
                  numberOrNull(lower) === null ? null : Number(lower) / 100,
                upperFraction:
                  numberOrNull(upper) === null ? null : Number(upper) / 100,
                affectedByMedicationOrMedicalContext: disabled,
              }),
            );
            setError("");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Check the inputs.");
          }
        }}
      >
        <Field label="Heart-rate method">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as typeof method)}
          >
            <option value="heart_rate_reserve">Heart-rate reserve</option>
            <option value="percent_hrmax">Percentage of maximum HR</option>
          </select>
        </Field>
        <Field label="Maximum HR source">
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="measured">User-reported measured maximum</option>
            <option value="clinician_supplied">Clinician supplied</option>
            <option value="age_predicted_tanaka">
              Optional Tanaka age estimate
            </option>
          </select>
        </Field>
        {source === "age_predicted_tanaka" ? (
          <Field label="Adult age in years">
            <input
              type="number"
              min="18"
              max="100"
              step="any"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </Field>
        ) : (
          <Field label="Maximum heart rate bpm">
            <input
              type="number"
              min="20"
              max="280"
              step="any"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </Field>
        )}
        <Field label="Resting heart rate bpm">
          <input
            type="number"
            min="20"
            max="260"
            step="any"
            value={rest}
            onChange={(e) => setRest(e.target.value)}
          />
        </Field>
        <Field
          label="Your lower percentage"
          help="Select your own fractions; this is not a prescribed zone."
        >
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            value={lower}
            onChange={(e) => setLower(e.target.value)}
          />
        </Field>
        <Field label="Your upper percentage">
          <input
            type="number"
            min="0"
            max="100"
            step="any"
            value={upper}
            onChange={(e) => setUpper(e.target.value)}
          />
        </Field>
        <Field label="Medication or medical context affects HR">
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
          />
        </Field>
        <button className="button primary">
          Calculate selected HR fractions
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {result && (
        <section className="card" aria-label="Heart-rate results">
          <h2>Your selected fractions</h2>
          <p>
            {display(result.lowerBpm)}–{display(result.upperBpm)} bpm ·{" "}
            {result.method} · {result.methodVersion}
          </p>
          <p>{result.warning}</p>
          {estimate && (
            <p>
              Estimated maximum: {display(estimate.bpm)} bpm. {estimate.warning}{" "}
              Source:{" "}
              <a href="https://pubmed.ncbi.nlm.nih.gov/11153730/">
                Tanaka et al., 2001
              </a>
              .
            </p>
          )}
          <p>
            Heat, dehydration, illness, altitude and device error can change HR.
            Device readings are estimates. Consult your clinician for
            individualized limits.
          </p>
        </section>
      )}
      <section className="card">
        <h2>Talk-test observations</h2>
        <p>
          CDC describes talking but not singing as a moderate-intensity
          observation, and being able to say only a few words before pausing as
          a vigorous-intensity observation. Record what happened; stop concerns
          take precedence over targets.
        </p>
        <a href="https://www.cdc.gov/physical-activity-basics/measuring/index.html">
          CDC: measuring activity intensity
        </a>
      </section>
    </CardioFrame>
  );
}
