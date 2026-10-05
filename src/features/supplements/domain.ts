import {
  backupSchema,
  supplementReference,
  type Backup,
  type Label,
  type Amount,
  type Preferences,
  type AdverseEvent,
  rowSchemas,
} from "./schema";
import { localDate, validateZonedTimestamp } from "../recovery/domain";
export const newId = () => crypto.randomUUID();
export const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);
export function emptyBackup(): Backup {
  return {
    schemaVersion: "1.0.0",
    companionVersion: 1,
    moduleId: "phase_14_supplements_evidence",
    exportedAt: new Date().toISOString(),
    personalProducts: [],
    productLabelVersions: [],
    supplementTrials: [],
    intakeLogs: [],
    adverseEvents: [],
    safetyContexts: [],
    savedComparisons: [],
    settings: [],
    auditEvents: [],
    deletedRecords: [],
    importConflicts: [],
  };
}
export function defaultPreferences(): Preferences {
  return {
    id: "supplement-preferences",
    key: "preferences",
    value: {
      trackingEnabled: true,
      athleteMode: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      jurisdiction: "global_education",
      listYear: new Date().getFullYear(),
    },
    updatedAt: new Date().toISOString(),
  };
}
export function urgentEvent(
  event: Pick<AdverseEvent, "severity" | "stopSignals">,
) {
  return (
    event.severity === "urgent_or_emergency" || event.stopSignals.length > 0
  );
}
export function certificationApplies(
  label: Label,
  c: Label["certifications"][number],
  date: string,
) {
  return (
    c.status === "verified_current" &&
    c.verifiedAt !== null &&
    c.registryUrl !== null &&
    c.evidenceNote.trim() !== "" &&
    (!c.validUntil || c.validUntil >= date) &&
    (!c.lotSpecific ||
      (label.lotNumber !== null &&
        c.matchedLot === label.lotNumber &&
        c.productOrLotIdentifier === label.lotNumber))
  );
}
export function wadaFresh(
  reviewYear: number,
  configuredYear: number,
  reviewStatus: string,
) {
  return reviewYear === configuredYear && reviewStatus === "approved";
}
export function canonicalMass(a: Amount): number | null {
  if (a.amountDisclosure !== "exact" || a.amount === null) return null;
  const factors: Record<string, number> = {
    g: 1,
    mg: 0.001,
    µg: 0.000001,
    ug: 0.000001,
  };
  const factor = a.unit === null ? undefined : factors[a.unit];
  return factor === undefined ? null : a.amount * factor;
}
export function exposure(logs: Backup["intakeLogs"]) {
  const rows = new Map<
    string,
    {
      label: string;
      form: string | null;
      unit: string | null;
      known: number;
      unknown: number;
      intakeIds: string[];
    }
  >();
  for (const log of logs)
    for (const a of log.ingredientSnapshot) {
      const key = JSON.stringify([
        a.ingredientIdentityId ?? a.labelName,
        a.form,
        a.unit,
      ]);
      const row = rows.get(key) ?? {
        label: a.labelName,
        form: a.form,
        unit: a.unit,
        known: 0,
        unknown: 0,
        intakeIds: [],
      };
      if (
        a.amountDisclosure === "exact" &&
        a.amount !== null &&
        log.servings !== null
      )
        row.known += a.amount * log.servings;
      else row.unknown++;
      row.intakeIds.push(log.id);
      rows.set(key, row);
    }
  return [...rows.values()];
}
export function validateBackup(input: unknown): Backup {
  const root = backupSchema.parse(input);
  const fail = (message: string) => {
    throw Error(message);
  };
  const sets = new Map<string, Set<string>>();
  for (const [key, value] of Object.entries(root)) {
    if (!Array.isArray(value)) continue;
    const ids = value.map((v) => (v as { id: string }).id);
    if (new Set(ids).size !== ids.length) fail(`Duplicate ${key} IDs`);
    sets.set(key, new Set(ids));
  }
  const labelIds = sets.get("productLabelVersions")!;
  const tombs = root.deletedRecords;
  const available = (collection: string, id: string) =>
    sets.get(collection)?.has(id) ||
    tombs.some((t) => t.collection === collection && t.entityId === id);
  const versions = new Set<string>();
  for (const label of root.productLabelVersions) {
    if (!available("personalProducts", label.personalProductId))
      fail("Label product reference is unresolved");
    const key = `${label.personalProductId}:${label.versionNumber}`;
    if (versions.has(key)) fail("Duplicate label version number");
    versions.add(key);
    if (
      !same(
        label.labelImageReferences,
        label.images.map((i) => i.id),
      )
    )
      fail("Image reference is missing from backup");
    for (const a of label.ingredients) validateAmount(a);
    for (const c of label.certifications) {
      if (
        c.status.startsWith("verified") &&
        (!c.verifiedAt || !c.registryUrl || !c.evidenceNote.trim())
      )
        fail("Verified registry evidence is incomplete");
      if (
        c.lotSpecific &&
        c.status === "verified_current" &&
        c.matchedLot !== label.lotNumber
      )
        fail("Certification lot mismatch");
    }
  }
  for (const p of root.personalProducts) {
    if (p.currentLabelVersionId !== null) {
      const label = root.productLabelVersions.find(
        (l) => l.id === p.currentLabelVersionId,
      );
      if (!label || label.personalProductId !== p.id)
        fail("Current label belongs to another product");
    }
    if (p.updatedAt < p.createdAt) fail("Product dates reversed");
  }
  for (const trial of root.supplementTrials) {
    if (trial.labelVersionId !== null && !labelIds.has(trial.labelVersionId))
      fail("Trial label reference unresolved");
    if (
      trial.labelVersionId !== trial.labelSnapshot?.id &&
      !(trial.labelVersionId === null && trial.labelSnapshot === null)
    )
      fail("Trial snapshot mismatch");
    if (
      trial.labelSnapshot &&
      !same(
        trial.labelSnapshot,
        root.productLabelVersions.find((l) => l.id === trial.labelVersionId),
      )
    )
      fail("Trial label was changed");
    if (
      trial.trialStartDate &&
      trial.plannedEndDate &&
      trial.plannedEndDate < trial.trialStartDate
    )
      fail("Trial dates reversed");
    if (
      trial.actualEndDate &&
      trial.trialStartDate &&
      trial.actualEndDate < trial.trialStartDate
    )
      fail("Trial end precedes start");
    if (
      new Set(trial.observations.map((o) => o.id)).size !==
      trial.observations.length
    )
      fail("Duplicate observation IDs");
  }
  for (const log of root.intakeLogs) {
    try {
      Intl.DateTimeFormat("en", { timeZone: log.timezone });
      if (log.takenAt) {
        validateZonedTimestamp(log.takenAt, log.timezone);
        if (localDate(log.takenAt, log.timezone) !== log.localDate)
          fail("Intake date and timezone disagree");
      }
    } catch {
      fail("Invalid intake timestamp or timezone");
    }
    if (log.trialId && !available("supplementTrials", log.trialId))
      fail("Intake trial reference unresolved");
    if (log.labelVersionId) {
      if (
        !labelIds.has(log.labelVersionId) ||
        !log.labelSnapshot ||
        log.labelSnapshot.id !== log.labelVersionId
      )
        fail("Intake label unresolved");
      if (
        !same(
          log.labelSnapshot,
          root.productLabelVersions.find((l) => l.id === log.labelVersionId),
        )
      )
        fail("Intake historical label changed");
      if (!same(log.ingredientSnapshot, log.labelSnapshot!.ingredients))
        fail("Intake ingredient snapshot differs from label");
      if (log.productSnapshot?.id !== log.labelSnapshot!.personalProductId)
        fail("Intake product snapshot mismatch");
    } else if (log.labelSnapshot || log.productSnapshot)
      fail("Detached intake snapshot");
    for (const a of log.ingredientSnapshot) validateAmount(a);
    if (log.revision !== log.history.length + 1)
      fail("Intake correction history missing");
    for (const h of log.history) {
      if (
        h.record.id !== log.id ||
        !same(h.record.labelSnapshot, log.labelSnapshot) ||
        !same(h.record.ingredientSnapshot, log.ingredientSnapshot)
      )
        fail("Intake correction changed historical label");
    }
  }
  for (const event of root.adverseEvents) {
    try {
      Intl.DateTimeFormat("en", { timeZone: event.timezone });
      if (event.onsetAt) {
        validateZonedTimestamp(event.onsetAt, event.timezone);
        if (localDate(event.onsetAt, event.timezone) !== event.localDate)
          fail("Event date mismatch");
      }
    } catch {
      fail("Invalid event timestamp or timezone");
    }
    if (
      event.resolvedAt &&
      event.onsetAt &&
      Date.parse(event.resolvedAt) < Date.parse(event.onsetAt)
    )
      fail("Resolution precedes onset");
    for (const id of event.relatedIntakeLogIds)
      if (!available("intakeLogs", id))
        fail("Event intake reference unresolved");
    for (const id of event.suspectedProductIds)
      if (!available("personalProducts", id))
        fail("Event product reference unresolved");
    for (const label of event.labelSnapshots)
      if (
        !same(
          label,
          root.productLabelVersions.find((l) => l.id === label.id),
        )
      )
        fail("Event historical label changed");
    if (urgentEvent(event)) {
      for (const id of event.relatedIntakeLogIds) {
        const log = root.intakeLogs.find((l) => l.id === id);
        const trial = root.supplementTrials.find((t) => t.id === log?.trialId);
        if (trial && trial.status === "active")
          fail("Urgent event requires stopping the related active trial");
      }
    }
  }
  for (const comparison of root.savedComparisons)
    if (
      comparison.ingredientIdentityIds.some(
        (id) => !supplementReference.seedRecords.some((s) => s.id === id),
      )
    )
      fail("Unknown comparison identity");
  for (const tomb of tombs) {
    rowSchemas[tomb.collection].parse(tomb.snapshot);
    const row = tomb.snapshot as { id?: unknown };
    if (row?.id !== tomb.entityId) fail("Deleted record identity mismatch");
    if (sets.get(tomb.collection)?.has(tomb.entityId))
      fail("Deleted identity is still live");
  }
  return root;
}
export function validateAmount(a: Amount) {
  if (
    a.amountDisclosure === "exact" &&
    (a.amount === null || a.unit === null || a.unit.trim() === "")
  )
    throw Error("Exact label amount requires value and unit");
  if (
    (a.amountDisclosure === "not_disclosed" ||
      a.amountDisclosure === "unknown") &&
    a.amount !== null
  )
    throw Error("Undisclosed individual amount must stay unknown");
  if (
    a.ingredientIdentityId !== null &&
    !supplementReference.seedRecords.some(
      (s) => s.id === a.ingredientIdentityId,
    )
  )
    throw Error("Unknown ingredient identity");
}
export function parseBackup(text: string) {
  if (new TextEncoder().encode(text).length > 20 * 1024 * 1024)
    throw Error("Backup exceeds 20 MB");
  return validateBackup(JSON.parse(text) as unknown);
}
