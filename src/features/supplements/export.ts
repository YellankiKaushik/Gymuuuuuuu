import type { Backup } from "./schema";
function cell(v: unknown) {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return String(v);
  const text = typeof v === "object" ? JSON.stringify(v) : String(v);
  return `"${(/^[=+\-@\t\r]/.test(text) ? "'" : "") + text.replaceAll('"', '""')}"`;
}
const csv = (heads: string[], rows: unknown[][]) =>
  [heads.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))].join(
    "\r\n",
  );
export function supplementsCsv(root: Backup) {
  return {
    "supplement-products-labels.csv": csv(
      [
        "product_id",
        "name",
        "brand",
        "label_version_id",
        "version",
        "captured_at",
        "serving_text",
        "serving_mass_g",
        "lot",
        "expiry",
        "warnings",
        "allergens",
        "manufacturer",
        "notes",
      ],
      root.productLabelVersions.map((l) => {
        const p = root.personalProducts.find(
          (p) => p.id === l.personalProductId,
        );
        return [
          l.personalProductId,
          p?.displayName,
          p?.brand,
          l.id,
          l.versionNumber,
          l.capturedAt,
          l.servingSizeText,
          l.servingMassGrams,
          l.lotNumber,
          l.expiryDate,
          l.warningsText,
          l.allergensText,
          l.manufacturerText,
          l.notes,
        ];
      }),
    ),
    "supplement-label-amounts.csv": csv(
      [
        "label_version_id",
        "identity_id",
        "label_name",
        "form",
        "amount",
        "unit",
        "disclosure",
        "source_text",
      ],
      root.productLabelVersions.flatMap((l) =>
        l.ingredients.map((a) => [
          l.id,
          a.ingredientIdentityId,
          a.labelName,
          a.form,
          a.amount,
          a.unit,
          a.amountDisclosure,
          a.sourceText,
        ]),
      ),
    ),
    "supplement-certifications.csv": csv(
      [
        "label_version_id",
        "check_id",
        "scheme",
        "status",
        "identifier",
        "matched_lot",
        "lot_specific",
        "checked_at",
        "registry",
        "scope",
        "valid_until",
        "evidence_note",
      ],
      root.productLabelVersions.flatMap((l) =>
        l.certifications.map((c) => [
          l.id,
          c.id,
          c.schemeId,
          c.status,
          c.productOrLotIdentifier,
          c.matchedLot,
          c.lotSpecific,
          c.verifiedAt,
          c.registryUrl,
          c.scope,
          c.validUntil,
          c.evidenceNote,
        ]),
      ),
    ),
    "supplement-trials.csv": csv(
      [
        "id",
        "title",
        "status",
        "reason",
        "outcome_ids",
        "baseline_start",
        "start",
        "planned_end",
        "actual_end",
        "protocol",
        "professional_review",
        "stop_rules",
        "context_links",
        "notes",
        "label_version_id",
      ],
      root.supplementTrials.map((t) => [
        t.id,
        t.title,
        t.status,
        t.reasonForTrial,
        t.primaryOutcomeIds,
        t.baselineStartDate,
        t.trialStartDate,
        t.plannedEndDate,
        t.actualEndDate,
        t.plannedProtocolText,
        t.professionalReview,
        t.stopRules,
        t.contextLinks,
        t.notes,
        t.labelVersionId,
      ]),
    ),
    "supplement-intakes.csv": csv(
      [
        "id",
        "date",
        "timezone",
        "taken_at",
        "trial_id",
        "label_version_id",
        "servings",
        "serving_text",
        "ingredient_snapshot",
        "product_snapshot",
        "context_tags",
        "notes",
        "revision",
        "correction_reason",
        "history",
      ],
      root.intakeLogs.map((l) => [
        l.id,
        l.localDate,
        l.timezone,
        l.takenAt,
        l.trialId,
        l.labelVersionId,
        l.servings,
        l.servingText,
        l.ingredientSnapshot,
        l.productSnapshot,
        l.contextTags,
        l.notes,
        l.revision,
        l.correctionReason,
        l.history,
      ]),
    ),
    "supplement-adverse-events.csv": csv(
      [
        "id",
        "date",
        "timezone",
        "onset",
        "severity",
        "symptoms",
        "stop_signals",
        "related_intakes",
        "suspected_products",
        "label_snapshots",
        "actions",
        "resolved_at",
        "care",
        "reporting_jurisdiction",
        "report_reference",
        "notes",
      ],
      root.adverseEvents.map((e) => [
        e.id,
        e.localDate,
        e.timezone,
        e.onsetAt,
        e.severity,
        e.symptoms,
        e.stopSignals,
        e.relatedIntakeLogIds,
        e.suspectedProductIds,
        e.labelSnapshots,
        e.actionTaken,
        e.resolvedAt,
        e.professionalCare,
        e.reportingJurisdiction,
        e.externalReportReference,
        e.notes,
      ]),
    ),
    "supplement-observations.csv": csv(
      [
        "trial_id",
        "id",
        "date",
        "kind",
        "outcome",
        "value",
        "unit",
        "adherence",
        "note",
      ],
      root.supplementTrials.flatMap((t) =>
        t.observations.map((o) => [
          t.id,
          o.id,
          o.date,
          o.kind,
          o.outcome,
          o.value,
          o.unit,
          o.adherence,
          o.note,
        ]),
      ),
    ),
  };
}
export function download(
  name: string,
  body: string,
  mime = "application/json",
) {
  const url = URL.createObjectURL(new Blob([body], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function supplementsReadModels(root: Backup) {
  return {
    intakes: root.intakeLogs.map((l) => ({
      id: `supplement:${l.id}`,
      recordId: l.id,
      date: l.localDate,
      timezone: l.timezone,
      trialId: l.trialId,
      labelVersionId: l.labelVersionId,
      updatedAt: l.updatedAt,
      source: "manual_label",
      automaticNutritionCredit: false,
    })),
    observations: root.supplementTrials.flatMap((t) =>
      t.observations.map((o) => ({
        ...o,
        trialId: t.id,
        causalityEstablished: false,
      })),
    ),
    adverseEvents: root.adverseEvents.map((e) => ({
      id: `supplement-event:${e.id}`,
      date: e.localDate,
      severity: e.severity,
      stopConcern: e.stopSignals.length > 0,
      causalityEstablished: false,
    })),
  };
}
