import { InformationPath } from "./information-path";

const diagrams = {
  training: {
    title: "From program to recorded session",
    caption: "A template and your actual workout are separate records.",
    steps: [
      {
        label: "Choose a structure",
        detail: "Browse program weeks, days and exercises.",
        icon: "book",
        href: "/programs",
      },
      {
        label: "Record what happened",
        detail: "Log completed sets, loads and session notes.",
        icon: "dumbbell",
        href: "/workout",
      },
      {
        label: "Review the record",
        detail: "Return to your session history; no invented progress.",
        icon: "chart",
        href: "/workout/history",
      },
    ],
  },
  nutrition: {
    title: "Food data → your plan → your diary",
    caption:
      "Composition values, chosen targets and actual intake remain distinct.",
    steps: [
      {
        label: "Explore composition",
        detail: "Check preparation, per-100-g values and serving mass.",
        icon: "leaf",
        href: "/foods",
      },
      {
        label: "Choose a plan",
        detail: "Review assumptions and optional targets before saving.",
        icon: "target",
        href: "/diet-planning/energy",
      },
      {
        label: "Record your intake",
        detail: "Unknown and not-measured values stay distinct from zero.",
        icon: "book",
        href: "/nutrition",
      },
    ],
  },
  recovery: {
    title: "Keep observations in context",
    caption:
      "Sleep, recovery check-ins and mobility routines are separate tools, without a combined health score.",
    steps: [
      {
        label: "Sleep diary",
        detail: "Record sleep times and your own reported quality.",
        icon: "moon",
        href: "/sleep",
      },
      {
        label: "Recovery check-in",
        detail: "Keep subjective observations with their recorded date.",
        icon: "chart",
        href: "/recovery/check-in",
      },
      {
        label: "Mobility library",
        detail: "Explore source-labelled routines and their limitations.",
        icon: "book",
        href: "/mobility",
      },
    ],
  },
  cardio: {
    title: "A cardio session has different dimensions",
    caption:
      "Duration, effort and activity type are recorded separately. This is a workflow, not an intensity prescription.",
    steps: [
      {
        label: "Choose an activity",
        detail: "Read modality-specific guidance and source notes.",
        icon: "book",
        href: "/cardio/modalities",
      },
      {
        label: "Record duration & effort",
        detail: "Use the session tools; retain the measurement method.",
        icon: "target",
        href: "/cardio/session/new",
      },
      {
        label: "Review by modality",
        detail: "History keeps activities and missing measurements distinct.",
        icon: "chart",
        href: "/cardio/history",
      },
    ],
  },
  evidence: {
    title: "Read evidence at the claim level",
    caption:
      "No numeric evidence score. Findings apply to a specific question; product quality and safety are separate checks.",
    steps: [
      {
        label: "Define the question",
        detail: "Match outcome, population and formulation.",
        icon: "search",
        href: "/supplements/ingredients",
      },
      {
        label: "Inspect the evidence",
        detail: "Read findings, sources and the visible review level.",
        icon: "book",
        href: "/supplements/evidence",
      },
      {
        label: "Read the limitations",
        detail: "Check uncertainty and safety separately from effectiveness.",
        icon: "shield",
        href: "/supplements/safety",
      },
    ],
  },
  backup: {
    title: "Local records → exported copy → validated restore",
    caption:
      "An export is a file you keep. There is no cloud sync. Review the backup scope, including photo binaries.",
    steps: [
      {
        label: "Prepare local storage",
        detail: "Inspect the inventory in this browser profile.",
        icon: "lock",
        href: "/settings/data/storage",
      },
      {
        label: "Export a backup",
        detail: "Choose portable records or the full media option.",
        icon: "download",
        href: "/settings/data/backup",
      },
      {
        label: "Validate, then restore",
        detail: "Preview conflicts before confirming writes.",
        icon: "check",
        href: "/settings/data/restore",
      },
    ],
  },
} as const;

export function ModuleDiagram({ kind }: { kind: keyof typeof diagrams }) {
  return <InformationPath {...diagrams[kind]} />;
}
