import { useState } from "react";
import { PageHeader } from "../../components/common/page-header";
import { NotFoundState } from "../../components/common/states";
import { InfoCallout } from "../../components/common/primitives";
import { foodReference, type Food, type CompositionProfile } from "./schema";
import { nutrientIndex } from "../nutrients/public-index";
import {
  dataCompleteness,
  formatNutrient,
  scaleNutrients,
  sourceBadge,
} from "./domain";
const words = (s: string) => s.replaceAll("_", " ");
export function NutrientTable({
  profile,
  grams,
  available = false,
}: {
  profile: CompositionProfile;
  grams: number;
  available?: boolean;
}) {
  const scaled = scaleNutrients(profile, grams);
  const groups = [
    ["Energy and macronutrients", foodReference.nutrientRegistry.slice(0, 15)],
    ["Minerals", foodReference.nutrientRegistry.slice(15, 26)],
    ["Vitamins and choline", foodReference.nutrientRegistry.slice(26)],
  ] as const;
  return (
    <div className="food-nutrient-groups">
      {groups.map(([title, registry]) => (
        <section key={title}>
          <h2>{title}</h2>
          <table className="food-table">
            <caption>
              {title}, per {grams} g edible portion
            </caption>
            <thead>
              <tr>
                <th scope="col">Nutrient</th>
                <th scope="col">Amount</th>
                <th scope="col">Data status and source</th>
              </tr>
            </thead>
            <tbody>
              {registry.map((r) => {
                const n = scaled.find((n) => n.nutrientId === r.id);
                if (available && (!n || n.status === "not_available"))
                  return null;
                return (
                  <tr key={r.id}>
                    <th scope="row">
                      {nutrientIndex.some((n) => n.id === r.id) ? (
                        <a
                          href={`/nutrients/${nutrientIndex.find((n) => n.id === r.id)?.slug}`}
                        >
                          {r.label}
                        </a>
                      ) : (
                        r.label
                      )}{" "}
                      <small>{r.canonicalUnit}</small>
                    </th>
                    <td>
                      {formatNutrient(n)}
                      {(n?.minValue != null || n?.maxValue != null) && (
                        <small>
                          Reported bounds: {n.minValue ?? "unspecified"}–
                          {n.maxValue ?? "unspecified"} {n.unit}
                        </small>
                      )}
                    </td>
                    <td>
                      <span>{n ? words(n.status) : "not available"}</span>
                      {n && (
                        <a
                          href={`#source-${encodeURIComponent(n.sourceRecordId)}`}
                        >
                          Source
                        </a>
                      )}
                      {n?.methodNote && <small>{n.methodNote}</small>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
export function FoodDetail({
  food,
  initialProfile,
}: {
  food: Food | undefined;
  initialProfile?: string;
}) {
  const profiles =
    food?.status === "published"
      ? food.compositionProfiles.filter((p) => p.review.status === "approved")
      : [];
  const [profileId, setProfileId] = useState(
      initialProfile || food?.defaultProfileId || "",
    ),
    [serving, setServing] = useState("100"),
    [custom, setCustom] = useState("100"),
    [available, setAvailable] = useState(false);
  const p = profiles.find((p) => p.profileId === profileId);
  if (!food || !p) return <NotFoundState />;
  const portion = p.portions.find((s) => s.portionId === serving),
    candidate = serving === "custom" ? Number(custom) : (portion?.grams ?? 100);
  const valid =
      Number.isFinite(candidate) && candidate > 0 && candidate <= 10000,
    grams = valid ? candidate : 100,
    complete = dataCompleteness(p);
  return (
    <div className="page food-detail">
      <a href="/foods" className="back-link">
        ← Food encyclopedia
      </a>
      <PageHeader
        title={food.canonicalName}
        eyebrow="EAT / FOOD PROFILE"
        description={
          food.description ??
          "Source-reviewed food composition. Choose a preparation state and serving to explore the data."
        }
      />
      <div className="food-detail-controls">
        <label>
          Composition profile
          <select
            value={p.profileId}
            onChange={(e) => {
              setProfileId(e.target.value);
              setServing("100");
              const url = new URL(location.href);
              url.searchParams.set("profile", e.target.value);
              history.replaceState(history.state, "", url);
            }}
          >
            {profiles.map((p) => (
              <option key={p.profileId} value={p.profileId}>
                {p.label} · {words(p.foodState)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Serving basis
          <select value={serving} onChange={(e) => setServing(e.target.value)}>
            <option value="100">100 g edible portion</option>
            {p.portions.map((s) => (
              <option key={s.portionId} value={s.portionId}>
                {s.label} · {s.grams} g · {words(s.status)}
              </option>
            ))}
            <option value="custom">Custom grams</option>
          </select>
        </label>
        {serving === "custom" && (
          <label>
            Custom edible grams
            <input
              type="number"
              min="0.01"
              max="10000"
              step="any"
              value={custom}
              aria-invalid={!valid}
              onChange={(e) => setCustom(e.target.value)}
            />
          </label>
        )}
      </div>
      {!valid && (
        <p role="alert">
          Enter a serving above 0 and at most 10,000 grams. Data below remains
          on the 100 g basis.
        </p>
      )}
      <div className="food-profile-banner">
        <strong>{p.label}</strong>
        <span>
          {words(p.foodState)} · {words(p.processingLevel)}
        </span>
        <p>{p.preparationNotes}</p>
        <p>{sourceBadge(p)}</p>
        <small>
          {complete.numeric} of {complete.total} registered nutrients have
          numeric data. Reviewed {p.review.reviewedAt?.slice(0, 10)}.
        </small>
      </div>
      {food.media
        ?.filter((m) => m.status === "rights_verified")
        .map((m) => (
          <figure key={m.id}>
            <img src={m.src} alt={m.alt} loading="lazy" />
            <figcaption>
              {m.attribution} · {m.license}
            </figcaption>
          </figure>
        ))}
      <label className="food-check">
        <input
          type="checkbox"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
        />
        Show reported nutrients only
      </label>
      <NutrientTable profile={p} grams={grams} available={available} />
      <section>
        <h2>Portions and edible portion</h2>
        <p>
          Edible portion:{" "}
          {p.ediblePortion.percent === null
            ? "Not available"
            : `${p.ediblePortion.percent}%`}{" "}
          · {words(p.ediblePortion.status)}
        </p>
        {p.portions.length ? (
          <ul>
            {p.portions.map((s) => (
              <li key={s.portionId}>
                {s.label}: {s.grams} g, {words(s.status)} ·{" "}
                <a href={`#source-${encodeURIComponent(s.sourceRecordId)}`}>
                  Source
                </a>
                {s.notes && ` · ${s.notes}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No source-backed household portions are available for this profile.
          </p>
        )}
      </section>
      <section>
        <h2>Quality and limitations</h2>
        {p.review.qualityNotes.length ? (
          <ul>
            {p.review.qualityNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        ) : (
          <p>No additional review notes are recorded.</p>
        )}
        <p>Aliases: {food.aliases.join(", ") || "None recorded"}</p>
        <p>
          {food.regionalNames
            ?.map((n) => `${n.name} (${n.language})`)
            .join(" · ")}
        </p>
      </section>
      <section>
        <h2>Composition provenance</h2>
        {p.sourceRecords.map((s) => (
          <article
            className="food-source-record"
            id={`source-${encodeURIComponent(s.sourceRecordId)}`}
            key={s.sourceRecordId}
          >
            <h3>
              {
                foodReference.sourceRegistry.find((r) => r.id === s.sourceId)
                  ?.name
              }
            </h3>
            <p>{s.citation}</p>
            <dl>
              <dt>Release</dt>
              <dd>{s.release}</dd>
              <dt>External record</dt>
              <dd>
                {s.externalFoodId ?? "Not available"} · {s.externalDescription}
              </dd>
              <dt>Match</dt>
              <dd>{words(s.matchType)}</dd>
              <dt>Accessed</dt>
              <dd>{s.accessedAt.slice(0, 10)}</dd>
              <dt>Reuse</dt>
              <dd>{s.licenseNote}</dd>
            </dl>
            <a
              href={
                foodReference.sourceRegistry.find((r) => r.id === s.sourceId)
                  ?.url
              }
            >
              Official source information
            </a>
          </article>
        ))}
      </section>
      <InfoCallout title="A profile describes a specific food state">
        Amounts scale from a source-reviewed 100 g edible-portion basis. They do
        not establish personal intake needs or account for a different cooking
        process.
      </InfoCallout>
      <a href="/foods/methodology">Food data methodology</a>
    </div>
  );
}
