import { useState } from "react";
import {
  WorkspacePage,
  useWorkspace,
  TextField,
  Field,
  numberOrNull,
  readable,
} from "./workspace";
import {
  productSchema,
  labelSchema,
  imageSchema,
  type Product,
  type Label,
  type Amount,
  type Intake,
} from "./schema";
import {
  newId,
  defaultPreferences,
  exposure,
  certificationApplies,
} from "./domain";
import { saveProduct, saveIntake, removeRecord } from "./storage";
import { localDate } from "../recovery/domain";
const blankAmount = (): Amount => ({
  ingredientIdentityId: null,
  labelName: "",
  form: null,
  amount: null,
  unit: null,
  amountDisclosure: "unknown",
  sourceText: "",
});
export function ProductsPage() {
  return (
    <WorkspacePage title="My products & intake">
      <Products />
    </WorkspacePage>
  );
}
function Products() {
  const { view, run, reload } = useWorkspace();
  const [selected, setSelected] = useState(""),
    [servings, setServings] = useState(""),
    [date, setDate] = useState(""),
    [takenAt, setTakenAt] = useState(""),
    [timezone, setTimezone] = useState(""),
    [notes, setNotes] = useState(""),
    [trialId, setTrialId] = useState("");
  const products = view?.data.personalProducts ?? [],
    labels = view?.data.productLabelVersions ?? [];
  const label = labels.find((l) => l.id === selected);
  const logIntake = () =>
    run(async () => {
      if (!label) throw Error("Choose a captured label version");
      const product = products.find((p) => p.id === label.personalProductId);
      if (!product) throw Error("Product missing");
      const now = new Date().toISOString(),
        zone = timezone || defaultPreferences().value.timezone;
      const log: Intake = {
        id: newId(),
        localDate: date || localDate(now, zone),
        timezone: zone,
        takenAt: takenAt || null,
        trialId: trialId || null,
        labelVersionId: label.id,
        servings: numberOrNull(servings),
        servingText: label.servingSizeText,
        ingredientSnapshot: structuredClone(label.ingredients),
        productSnapshot: structuredClone(product),
        labelSnapshot: structuredClone(label),
        contextTags: [],
        notes,
        createdAt: now,
        updatedAt: now,
        revision: 1,
        correctionReason: "",
        history: [],
      };
      await saveIntake(log);
      setNotes("");
    }, "Intake saved with frozen label; no nutrition credit added");
  return (
    <>
      <section className="card">
        <h2>Captured products</h2>
        <a className="button primary" href="/supplements/products/create">
          Capture product
        </a>
        {products.length === 0 && <p>No products recorded.</p>}
        {products.map((p) => (
          <article className="card" key={p.id}>
            <h3>{p.displayName}</h3>
            <p>
              {p.brand ?? "Brand not recorded"} · {readable(p.productType)}
            </p>
            <a href={`/supplements/products/${p.id}`}>
              Labels and edit product
            </a>
            <button
              className="button secondary"
              onClick={() => {
                if (
                  window.confirm(
                    "Delete this product? Historical labels and intake remain; a recovery snapshot is kept.",
                  )
                )
                  void run(
                    () => removeRecord("personalProducts", p.id, true),
                    "Product deleted; historical records preserved",
                  );
              }}
            >
              Delete product
            </button>
          </article>
        ))}
      </section>
      <section className="card">
        <h2>Record intake</h2>
        <p>
          Use the exact captured label. Enter servings actually taken; blank
          means not recorded. No recommended amount is calculated.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void logIntake();
          }}
        >
          <Field label="Captured label version">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Choose label</option>
              {labels
                .filter((l) =>
                  products.some((p) => p.id === l.personalProductId),
                )
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {
                      products.find((p) => p.id === l.personalProductId)
                        ?.displayName
                    }{" "}
                    · version {l.versionNumber} · lot{" "}
                    {l.lotNumber ?? "not recorded"}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Associated trial (optional)">
            <select
              value={trialId}
              onChange={(e) => setTrialId(e.target.value)}
            >
              <option value="">No trial</option>
              {view?.data.supplementTrials.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} · {readable(t.status)}
                </option>
              ))}
            </select>
          </Field>
          <TextField
            label="Servings actually taken"
            value={servings}
            onChange={setServings}
            help="Positive number or blank; per-label amount remains a snapshot."
          />
          <TextField
            label="Intake local date"
            type="date"
            value={date}
            onChange={setDate}
          />
          <TextField
            label="Timezone (IANA, blank uses browser zone)"
            value={timezone}
            onChange={setTimezone}
          />
          <TextField
            label="Taken at (optional ISO timestamp with offset)"
            value={takenAt}
            onChange={setTakenAt}
          />
          <TextField label="Intake notes" value={notes} onChange={setNotes} />
          <button
            className="button primary"
            disabled={!view || !label}
            type="submit"
          >
            Save intake
          </button>
        </form>
      </section>
      <section className="card">
        <h2>Intake history</h2>
        <p>
          Showing up to 100 records on this page; {view?.totals.intakeLogs ?? 0}{" "}
          stored in total.
        </p>
        {view?.data.intakeLogs.map((log) => (
          <IntakeCard key={`${log.id}:${log.revision}`} log={log} />
        ))}
        <button
          className="button secondary"
          disabled={!view || view.offset === 0}
          onClick={() => void reload(Math.max(0, (view?.offset ?? 0) - 100))}
        >
          Previous intake page
        </button>
        <button
          className="button secondary"
          disabled={!view || view.offset + 100 >= (view.totals.intakeLogs ?? 0)}
          onClick={() => void reload((view?.offset ?? 0) + 100)}
        >
          Next intake page
        </button>
      </section>
      <section className="card">
        <h2>Known exposure on this history page</h2>
        <p>
          Incomplete: foods, unlogged products, unknown amounts and
          noncomparable units are excluded. Label names and forms are kept
          distinct. These totals do not determine medical safety or upper-limit
          clearance.
        </p>
        {exposure(view?.data.intakeLogs ?? []).map((row, i) => (
          <p key={i}>
            {row.label} · {row.form ?? "form not recorded"}: {row.known}{" "}
            {row.unit ?? "unit unknown"} explicitly recorded; {row.unknown}{" "}
            amounts unknown.
          </p>
        ))}
      </section>
    </>
  );
}
function IntakeCard({ log }: { log: Intake }) {
  const { run } = useWorkspace();
  const [editing, setEditing] = useState(false),
    [notes, setNotes] = useState(log.notes),
    [servings, setServings] = useState(
      log.servings === null ? "" : String(log.servings),
    ),
    [reason, setReason] = useState("");
  return (
    <article className="card">
      <h3>
        {log.productSnapshot?.displayName ?? "Manual intake"} · {log.localDate}
      </h3>
      <p>
        Label version {log.labelSnapshot?.versionNumber ?? "unavailable"} · lot{" "}
        {log.labelSnapshot?.lotNumber ?? "not recorded"} ·{" "}
        {log.servings ?? "unrecorded"} servings. Revision {log.revision}.
      </p>
      <p>{log.notes}</p>
      <button className="button secondary" onClick={() => setEditing(!editing)}>
        Correct intake
      </button>
      <button
        className="button secondary"
        onClick={() => {
          if (window.confirm("Delete this intake? Keep a recovery snapshot."))
            void run(
              () => removeRecord("intakeLogs", log.id, true),
              "Intake deleted",
            );
        }}
      >
        Delete intake
      </button>
      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              if (!reason.trim()) throw Error("Record a correction reason");
              const { history, ...record } = log;
              const now = new Date().toISOString();
              await saveIntake(
                {
                  ...log,
                  servings: numberOrNull(servings),
                  notes,
                  updatedAt: now,
                  revision: log.revision + 1,
                  correctionReason: reason,
                  history: [...history, { record, reason, correctedAt: now }],
                },
                log.revision,
              );
              setEditing(false);
            }, "Correction saved; prior record and label preserved");
          }}
        >
          <TextField
            label="Corrected servings"
            value={servings}
            onChange={setServings}
          />
          <TextField
            label="Corrected notes"
            value={notes}
            onChange={setNotes}
          />
          <TextField
            label="Correction reason"
            value={reason}
            onChange={setReason}
          />
          <button className="button primary" type="submit">
            Save correction
          </button>
        </form>
      )}
    </article>
  );
}
export function ProductEditorPage({ productId }: { productId?: string }) {
  return (
    <WorkspacePage
      title={productId ? "Product labels & versions" : "Capture product label"}
    >
      <EditorLoader productId={productId} />
    </WorkspacePage>
  );
}
function EditorLoader({ productId }: { productId?: string }) {
  const { view } = useWorkspace();
  if (!view) return null;
  const product = view.data.personalProducts.find((p) => p.id === productId);
  if (productId && !product)
    return (
      <section className="card">
        <h2>Product unavailable</h2>
        <p>The record may be deleted or isolated. Use settings for recovery.</p>
      </section>
    );
  const label = view.data.productLabelVersions.find(
    (l) => l.id === product?.currentLabelVersionId,
  );
  return (
    <Editor
      key={`${productId ?? "new"}:${product?.revision ?? 0}`}
      product={product}
      label={label}
    />
  );
}
function Editor({ product, label }: { product?: Product; label?: Label }) {
  const { view, run, busy } = useWorkspace();
  const [name, setName] = useState(product?.displayName ?? ""),
    [brand, setBrand] = useState(product?.brand ?? ""),
    [country, setCountry] = useState(product?.purchaseCountry ?? ""),
    [type, setType] = useState<Product["productType"]>(
      product?.productType ?? "other",
    ),
    [serving, setServing] = useState(label?.servingSizeText ?? ""),
    [mass, setMass] = useState(
      label?.servingMassGrams === null || label?.servingMassGrams === undefined
        ? ""
        : String(label.servingMassGrams),
    ),
    [lot, setLot] = useState(label?.lotNumber ?? ""),
    [expiry, setExpiry] = useState(label?.expiryDate ?? ""),
    [notes, setNotes] = useState(product?.notes ?? ""),
    [labelNotes, setLabelNotes] = useState(label?.notes ?? ""),
    [warnings, setWarnings] = useState(label?.warningsText ?? ""),
    [allergens, setAllergens] = useState(label?.allergensText ?? ""),
    [manufacturer, setManufacturer] = useState(label?.manufacturerText ?? ""),
    [other, setOther] = useState(label?.otherIngredientsText ?? ""),
    [container, setContainer] = useState(
      label?.servingsPerContainer === null ||
        label?.servingsPerContainer === undefined
        ? ""
        : String(label.servingsPerContainer),
    ),
    [amounts, setAmounts] = useState<Amount[]>(
      label?.ingredients ?? [blankAmount()],
    ),
    [certifications, setCertifications] = useState(
      JSON.stringify(label?.certifications ?? [], null, 2),
    ),
    [images, setImages] = useState<Label["images"]>(label?.images ?? []),
    [reason, setReason] = useState(""),
    [error, setError] = useState(""),
    [savedProductId, setSavedProductId] = useState("");
  const change = (index: number, patch: Partial<Amount>) =>
    setAmounts((rows) =>
      rows.map((a, i) => (i === index ? { ...a, ...patch } : a)),
    );
  const save = async () => {
    const saved = await run(async () => {
      const now = new Date().toISOString(),
        pid = product?.id ?? newId(),
        lid = newId();
      const newLabel = labelSchema.parse({
        id: lid,
        personalProductId: pid,
        versionNumber: (label?.versionNumber ?? 0) + 1,
        capturedAt: now,
        servingSizeText: serving || null,
        servingsPerContainer: numberOrNull(container),
        ingredients: amounts,
        otherIngredientsText: other || null,
        lotNumber: lot || null,
        expiryDate: expiry || null,
        certifications: JSON.parse(certifications) as unknown,
        warningsText: warnings || null,
        labelImageReferences: images.map((i) => i.id),
        notes: labelNotes,
        immutable: true,
        allergensText: allergens || null,
        manufacturerText: manufacturer || null,
        servingMassGrams: numberOrNull(mass),
        images,
        changeReason:
          reason || (!product ? "Initial manual label capture" : ""),
      });
      const p = productSchema.parse({
        id: pid,
        displayName: name,
        brand: brand || null,
        currentLabelVersionId: lid,
        purchaseCountry: country || null,
        createdAt: product?.createdAt ?? now,
        updatedAt: now,
        productType: type,
        notes,
        archived: false,
        revision: (product?.revision ?? 0) + 1,
      });
      await saveProduct(p, newLabel, product?.revision);
      return pid;
    }, "New immutable label version saved; earlier intakes unchanged");
    if (saved) setSavedProductId(product?.id ?? "saved");
  };
  return (
    <>
      <section className="card">
        <h2>Exact manual label capture</h2>
        <p>
          Copy only what the label states. Leave unknown amounts blank; preserve
          proprietary blends as total-only entries. This records your product,
          not a verified recommendation.
        </p>
        {view?.data.settings[0]?.value.athleteMode && (
          <p role="status">
            Athlete mode: preserve exact product, lot, expiry and dated registry
            evidence. Certification does not guarantee clearance.
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <TextField label="Product name" value={name} onChange={setName} />
          <TextField
            label="Brand (optional)"
            value={brand}
            onChange={setBrand}
          />
          <TextField
            label="Purchase country"
            value={country}
            onChange={setCountry}
          />
          <Field label="Product type">
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as Product["productType"])
              }
            >
              {productSchema.shape.productType.options.map((v) => (
                <option key={v} value={v}>
                  {readable(v)}
                </option>
              ))}
            </select>
          </Field>
          <TextField
            label="Serving text, exactly as printed"
            value={serving}
            onChange={setServing}
          />
          <TextField
            label="Explicit serving mass (g), if printed"
            value={mass}
            onChange={setMass}
          />
          <TextField
            label="Servings per container, if printed"
            value={container}
            onChange={setContainer}
          />
          <TextField
            label="Lot or batch number"
            value={lot}
            onChange={setLot}
          />
          <TextField
            label="Expiry date"
            type="date"
            value={expiry}
            onChange={setExpiry}
          />
          <TextField
            label="Manufacturer details"
            value={manufacturer}
            onChange={setManufacturer}
          />
          <TextField
            label="Allergen text"
            value={allergens}
            onChange={setAllergens}
          />
          <TextField
            label="Warnings, exactly as printed"
            value={warnings}
            onChange={setWarnings}
          />
          <TextField
            label="Other ingredients"
            value={other}
            onChange={setOther}
          />
          <h3>Ingredient amounts per stated serving</h3>
          {amounts.map((a, i) => (
            <fieldset className="card" key={i}>
              <legend>Label ingredient {i + 1}</legend>
              <TextField
                label={`Ingredient ${i + 1} label name`}
                value={a.labelName}
                onChange={(v) => change(i, { labelName: v })}
              />
              <TextField
                label={`Ingredient ${i + 1} form or strain`}
                value={a.form ?? ""}
                onChange={(v) => change(i, { form: v || null })}
              />
              <Field label={`Ingredient ${i + 1} amount disclosure`}>
                <select
                  value={a.amountDisclosure}
                  onChange={(e) =>
                    change(i, {
                      amountDisclosure: e.target
                        .value as Amount["amountDisclosure"],
                      amount: null,
                    })
                  }
                >
                  {[
                    "exact",
                    "proprietary_blend_total_only",
                    "not_disclosed",
                    "unknown",
                  ].map((v) => (
                    <option key={v} value={v}>
                      {readable(v)}
                    </option>
                  ))}
                </select>
              </Field>
              <TextField
                label={`Ingredient ${i + 1} amount`}
                value={a.amount === null ? "" : String(a.amount)}
                onChange={(v) => {
                  try {
                    change(i, { amount: numberOrNull(v) });
                  } catch {
                    setError("Enter a finite amount");
                  }
                }}
              />
              <TextField
                label={`Ingredient ${i + 1} printed unit`}
                value={a.unit ?? ""}
                onChange={(v) => change(i, { unit: v || null })}
              />
              <TextField
                label={`Ingredient ${i + 1} original source text`}
                value={a.sourceText}
                onChange={(v) => change(i, { sourceText: v })}
              />
              <button
                type="button"
                className="button secondary"
                onClick={() =>
                  setAmounts((rows) => rows.filter((_, j) => j !== i))
                }
              >
                Remove ingredient {i + 1}
              </button>
            </fieldset>
          ))}
          <button
            type="button"
            className="button secondary"
            onClick={() => setAmounts((rows) => [...rows, blankAmount()])}
          >
            Add label ingredient
          </button>
          <details>
            <summary>Manual certification evidence</summary>
            <p>
              Enter registry evidence as a JSON array. Status alone does not
              verify a product. Each check requires id, schemeId, status,
              productOrLotIdentifier, verifiedAt, registryUrl, evidenceNote,
              lotSpecific, matchedLot, scope and validUntil. Use null for
              missing dates/identifiers, [] for scopes. Verified claims require
              evidence and matching lot when lot-specific.
            </p>
            <Field label="Certification checks JSON">
              <textarea
                rows={8}
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
              />
            </Field>
            <p>No logo parsing, scraping or automatic lookup occurs.</p>
          </details>
          <Field label="Attach local label image (PNG, JPEG or WebP)">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 2000000) {
                  setError("Images are limited to 2 MB each");
                  return;
                }
                const reader = new FileReader();
                reader.onerror = () => setError("Image read failed");
                reader.onload = () => {
                  const parsed = imageSchema.safeParse({
                    id: newId(),
                    mime: file.type,
                    dataUrl: reader.result,
                  });
                  if (parsed.success)
                    setImages((rows) => [...rows, parsed.data]);
                  else setError("Unsupported image. Use PNG, JPEG or WebP.");
                };
                reader.readAsDataURL(file);
              }}
            />
          </Field>
          <p>
            Images remain local, are included in JSON backup and may retain
            camera metadata. No OCR or upload occurs. Maximum five images.
          </p>
          {images.map((i) => (
            <div key={i.id}>
              <img
                src={i.dataUrl}
                alt="Manually attached product label"
                style={{ maxWidth: "100%", maxHeight: 240 }}
              />
              <button
                type="button"
                className="button secondary"
                onClick={() =>
                  setImages((rows) => rows.filter((r) => r.id !== i.id))
                }
              >
                Remove image
              </button>
            </div>
          ))}
          {error && <p role="alert">{error}</p>}
          <TextField label="Product notes" value={notes} onChange={setNotes} />
          <TextField
            label="Label notes"
            value={labelNotes}
            onChange={setLabelNotes}
          />
          <TextField
            label="Reason for new label version"
            value={reason}
            onChange={setReason}
          />
          <button
            type="submit"
            className="button primary"
            disabled={busy || Boolean(savedProductId)}
          >
            Save product and label version
          </button>
          {savedProductId && (
            <p role="status">
              <a
                href={`/supplements/products/${product?.id ?? savedProductId}`}
              >
                Open saved product and current label
              </a>
            </p>
          )}
        </form>
      </section>
      {product && (
        <section className="card">
          <h2>Immutable label history</h2>
          {view?.data.productLabelVersions
            .filter((l) => l.personalProductId === product.id)
            .sort((a, b) => b.versionNumber - a.versionNumber)
            .map((l) => (
              <details key={l.id}>
                <summary>
                  Version {l.versionNumber} · {l.capturedAt} · lot{" "}
                  {l.lotNumber ?? "not recorded"}
                </summary>
                <p>
                  {l.servingSizeText ?? "Serving unavailable"} ·{" "}
                  {l.changeReason}
                </p>
                {l.ingredients.map((a, i) => (
                  <p key={i}>
                    {a.labelName} · {a.form ?? "form unknown"} ·{" "}
                    {a.amount ?? "unknown"} {a.unit ?? ""} ·{" "}
                    {readable(a.amountDisclosure)}
                  </p>
                ))}
                {l.certifications.map((c) => (
                  <p key={c.id}>
                    {c.schemeId}: {readable(c.status)} ·{" "}
                    {certificationApplies(
                      l,
                      c,
                      new Date().toISOString().slice(0, 10),
                    )
                      ? "Recorded current matching evidence (user-entered)"
                      : "Not verified for this lot/date"}{" "}
                    · no efficacy or medical clearance.
                  </p>
                ))}
              </details>
            ))}
        </section>
      )}
    </>
  );
}
