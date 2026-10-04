import { useEffect, useState } from "react";
import { PageHeader } from "../../components/common/page-header";
import { InfoCallout } from "../../components/common/primitives";
import {
  nutrientReference,
  referenceValueTypes,
  type FrameworkId,
} from "./schema";
import {
  frameworkDatasets,
  resolveReferenceValue,
  formatReferenceValue,
  referenceContext,
  populationLabel,
  type PopulationSelection,
  type ReferenceRow,
} from "./frameworks";
import { loadReferenceFramework } from "./repository";
import {
  forgetPopulation,
  rememberPopulation,
  readRememberedPopulation,
} from "./population-storage";
const frameworkKey = "fitness-os:nutrient-framework:v1";
export function ReferenceExplorer({
  initialFramework,
}: {
  initialFramework?: string;
}) {
  const [framework, setFramework] = useState(
      initialFramework || "us_canada_dri",
    ),
    [age, setAge] = useState(""),
    [ageUnit, setAgeUnit] = useState("years"),
    [sex, setSex] = useState<PopulationSelection["sex"]>("all"),
    [lifeStage, setLifeStage] =
      useState<PopulationSelection["lifeStage"]>("general"),
    [rows, setRows] = useState<ReferenceRow[]>([]),
    [ready, setReady] = useState(false),
    [loading, setLoading] = useState(false),
    [message, setMessage] = useState(""),
    [remembered, setRemembered] = useState(false);
  const dataset = frameworkDatasets.find((d) => d.id === framework),
    known = !!dataset,
    ageMonths = Number(age) * (ageUnit === "years" ? 12 : 1),
    validAge =
      age.trim() !== "" &&
      Number.isInteger(ageMonths) &&
      ageMonths >= 0 &&
      ageMonths <= 1800;
  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      let storageMessage = "";
      if (!initialFramework)
        try {
          const saved = localStorage.getItem(frameworkKey);
          if (saved && frameworkDatasets.some((f) => f.id === saved) && active)
            setFramework(saved);
        } catch {
          storageMessage = "Framework preference could not be read.";
        }
      try {
        const population = await readRememberedPopulation();
        if (population && active) {
          setAge(String(population.ageMonths));
          setAgeUnit("months");
          setSex(population.sex);
          setLifeStage(population.lifeStage);
          setRemembered(true);
        }
      } catch {
        storageMessage =
          "Remembered population is unavailable; existing local data was preserved.";
      }
      if (active) {
        setMessage(storageMessage);
        setReady(true);
      }
    };
    void hydrate();
    return () => {
      active = false;
    };
  }, [initialFramework]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!dataset) {
        if (active) setRows([]);
        return;
      }
      setLoading(true);
      try {
        const data = await loadReferenceFramework(dataset);
        if (active) setRows(data);
      } catch (error) {
        if (active)
          setMessage(
            error instanceof Error
              ? error.message
              : "The source dataset is unavailable.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [dataset]);
  const selection =
    known && validAge && (sex !== "male" || lifeStage === "general")
      ? {
          frameworkId: framework as FrameworkId,
          frameworkVersion: dataset?.version ?? null,
          ageMonths,
          sex,
          lifeStage,
        }
      : undefined;
  const nutrientIds = [...new Set(rows.map((r) => r.nutrientId))];
  const resolved = selection
    ? nutrientIds.flatMap((id) =>
        referenceValueTypes
          .map((type) => resolveReferenceValue(id, type, rows, selection))
          .filter((r) => r.status === "value"),
      )
    : [];
  async function remember() {
    if (!validAge || (sex === "male" && lifeStage !== "general")) {
      setMessage(
        "Enter a valid age in complete months before remembering selections.",
      );
      return;
    }
    try {
      await rememberPopulation({
        kind: "nutrient-reference-population",
        ageMonths,
        sex,
        lifeStage,
      });
      setRemembered(true);
      setMessage(
        "Population selections saved on this device. Use Remember again after changing them.",
      );
    } catch {
      setMessage(
        "Population selections could not be saved; existing local data was preserved.",
      );
    }
  }
  async function forget() {
    try {
      await forgetPopulation();
      setRemembered(false);
      setMessage(
        "Remembered population removed. Current controls remain transient.",
      );
    } catch {
      setMessage("Remembered selections could not be removed. Try again.");
    }
  }
  return (
    <div className="page reference-explorer">
      <PageHeader
        title="Reference Intake Explorer"
        eyebrow="EAT / POPULATION REFERENCES"
        description="Select an authority and population to inspect reviewed reference rows. These are general references, not medical prescriptions."
      />
      <div className="nutrient-controls">
        <label>
          Reference framework
          <select
            aria-label="Reference framework"
            value={known ? framework : ""}
            disabled={!ready}
            onChange={(e) => {
              setFramework(e.target.value);
              try {
                localStorage.setItem(frameworkKey, e.target.value);
              } catch {
                setMessage("Framework preference could not be saved.");
              }
            }}
          >
            {!known && <option value="">Unsupported framework</option>}
            {nutrientReference.referenceFrameworks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Age
          <input
            aria-label="Reference age"
            type="number"
            min="0"
            max={ageUnit === "years" ? 150 : 1800}
            step={ageUnit === "years" ? "any" : "1"}
            value={age}
            disabled={!ready}
            onChange={(e) => setAge(e.target.value)}
            aria-invalid={age !== "" && !validAge}
          />
        </label>
        <label>
          Age unit
          <select
            aria-label="Age unit"
            value={ageUnit}
            disabled={!ready}
            onChange={(e) => {
              setAgeUnit(e.target.value);
              setAge("");
            }}
          >
            <option value="years">Years</option>
            <option value="months">Months</option>
          </select>
        </label>
        <label>
          Sex used by framework
          <select
            aria-label="Sex used by framework"
            value={sex}
            disabled={!ready}
            onChange={(e) => setSex(e.target.value as typeof sex)}
          >
            <option value="all">All / not distinguished</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label>
          Life stage
          <select
            aria-label="Life stage"
            value={lifeStage}
            disabled={!ready}
            onChange={(e) => setLifeStage(e.target.value as typeof lifeStage)}
          >
            <option value="general">General</option>
            <option value="pregnancy">Pregnancy</option>
            <option value="lactation">Lactation</option>
          </select>
        </label>
      </div>
      {!known && (
        <p role="alert">
          Unsupported framework identifier. Choose a listed framework; no value
          is guessed.
        </p>
      )}
      {sex === "male" && lifeStage !== "general" && (
        <p role="alert">
          The selected sex and life stage do not match the supported source
          populations. Choose compatible population controls.
        </p>
      )}
      {age !== "" && !validAge && (
        <p role="alert">
          Enter an age from 0 to 150 years, expressed in complete months.
        </p>
      )}
      <div className="nutrient-memory-controls">
        <button
          className="button secondary"
          disabled={!ready || !validAge}
          onClick={() => void remember()}
        >
          Remember population on this device
        </button>
        {remembered && (
          <button className="button secondary" onClick={() => void forget()}>
            Forget remembered population
          </button>
        )}
        <small>
          {remembered
            ? "A previous population selection is saved locally."
            : "Age, sex and life stage are transient unless you explicitly remember them."}
        </small>
      </div>
      {message && <p role="status">{message}</p>}
      <section className="nutrient-reference-results">
        <h2>
          {nutrientReference.referenceFrameworks.find((f) => f.id === framework)
            ?.label ?? "Framework unavailable"}
        </h2>
        <p>
          {dataset?.authority} · Dataset version:{" "}
          {dataset?.version ?? "Not configured"}
        </p>
        {loading ? (
          <p role="status">Loading selected reference dataset…</p>
        ) : dataset?.status !== "approved" ||
          dataset.rightsStatus !== "approved" ||
          !dataset.version ? (
          <InfoCallout title="No approved reference dataset is available">
            Values have not been imported and reviewed for this framework
            version. No intake amount is inferred.{" "}
            {framework === "icmr_nin_2020"
              ? "Structured-use rights for the Indian tables also require review."
              : ""}
          </InfoCallout>
        ) : !selection ? (
          <p>
            Enter an age and explicitly choose the applicable population
            controls.
          </p>
        ) : resolved.length ? (
          <>
            <p>Selected population: {populationLabel(selection)}</p>
            <table className="nutrient-table">
              <caption>
                Reviewed reference rows · {dataset.version} ·{" "}
                {populationLabel(selection)}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Nutrient and type</th>
                  <th scope="col">Reference and basis</th>
                  <th scope="col">Context and provenance</th>
                </tr>
              </thead>
              <tbody>
                {resolved.map(
                  (result, i) =>
                    result.status === "value" && (
                      <tr key={i}>
                        <th scope="row">
                          {result.row.nutrientName}
                          <small>{result.row.reference.valueType}</small>
                        </th>
                        <td>
                          {formatReferenceValue(result.row.reference)}
                          <small>
                            {result.row.reference.basis?.replaceAll("_", " ")}
                          </small>
                        </td>
                        <td>
                          {referenceContext(result.row.reference)}
                          <small>{result.row.reference.notes}</small>
                          <a
                            href={
                              nutrientReference.sourceRegistry.find(
                                (s) => s.id === result.row.reference.sourceId,
                              )?.url
                            }
                          >
                            Official source · {dataset.version}
                          </a>
                        </td>
                      </tr>
                    ),
                )}
              </tbody>
            </table>
          </>
        ) : (
          <p>
            No reviewed reference rows are available for the selected age, sex
            and life stage. Missing rows do not mean zero.
          </p>
        )}
      </section>
      <InfoCallout title="Frameworks stay separate">
        EAR and AR describe population requirements; UL and TUL describe
        upper-limit information. A label Daily Value is distinct from a personal
        RDA. This tool does not turn these values into supplement doses.
      </InfoCallout>
      <div className="nutrient-links">
        <a href="/nutrients/frameworks">Framework explanations</a>
        <a href="/nutrients/glossary">Reference glossary</a>
      </div>
    </div>
  );
}
