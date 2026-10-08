import { execFileSync } from "node:child_process";
import { readFile, mkdir, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";

const groups = [
  [
    "Foundation",
    "application shell|navigation|responsive layouts|theme|error boundaries|loading states|404|canonical routes|metadata",
    "src/components/app-shell",
    "tests/browser/foundation.spec.ts",
  ],
  [
    "Training",
    "muscles|exercises|workout science|workout programs|program finder|workout tracking|history|previous performance|timers|PR handling|edits/deletes|exports",
    "src/features/workout-tracker",
    "tests/browser/workout.spec.ts",
  ],
  [
    "Nutrition",
    "foods|food preparations|nutrient encyclopedia|diet calculator|target storage|nutrition diary|serving conversion|custom foods|quick add|hydration|recipes|meal plans|grocery lists|consumption snapshots",
    "src/features/nutrition-tracker",
    "tests/browser/nutrition.spec.ts",
  ],
  [
    "Recovery",
    "sleep|recovery check-ins|soreness|pain/illness separation|mobility|routines",
    "src/features/recovery",
    "tests/browser/recovery.spec.ts",
  ],
  [
    "Cardio",
    "cardio education|plans|sessions|intervals|distance|HR|effort|laps|history",
    "src/features/cardio",
    "tests/browser/cardio.spec.ts",
  ],
  [
    "Supplements",
    "ingredient evidence|product labels|immutable label versions|intake records|trials|adverse events|safety flags",
    "src/features/supplements",
    "tests/browser/supplements.spec.ts",
  ],
  [
    "Progress",
    "body measurements|body weight|trends|circumference|external body-composition estimates|progress photos|analytics dashboard",
    "src/features/progress",
    "tests/browser/progress.spec.ts",
  ],
  [
    "Global systems",
    "search|favourites|collections|comparisons|recent activity|local settings|global backup|restore|CSV|privacy|migrations",
    "src/features/data-management",
    "tests/browser/manual-test-ready.spec.ts",
  ],
] as const;
const features = groups.flatMap(([module, names, implementation, evidence]) =>
  names.split("|").map((feature) => ({
    module,
    feature,
    status: "implemented",
    implementation,
    evidence,
    verification:
      "Final observed results are recorded separately in final-pre-vercel-readiness.json; file existence is not a test pass.",
  })),
);
const unavailable = [
  [
    "Global systems",
    "global import-as-copy",
    "No verified cross-module stable-ID remapper; UI explicitly disables this mode. Owning module copy modes remain available.",
  ],
  [
    "Global systems",
    "encrypted backups",
    "Optional profile deferred; UI explicitly states files are not encrypted or authenticated.",
  ],
  [
    "Global systems",
    "globally atomic multi-database restore",
    "Browser limitation; durable before-image, automatic rollback and explicit recovery are implemented.",
  ],
  [
    "Progress",
    "photo ZIP import",
    "Separate ZIP is an export; explicit global full-media JSON provides tested restoration. Portable JSON excludes binaries.",
  ],
  [
    "Foundation",
    "accounts, cloud sync, analytics, payments and runtime fitness APIs",
    "Prohibited by project contract.",
  ],
];
const manual = [
  "Real Android",
  "Real iPhone/iPad",
  "Human screen readers and visual contrast judgement",
  "Native OS file pickers",
  "Print",
  "Owner's real workouts, nutrition and backup on the stable deployed origin",
  "Vercel Preview and production DNS/TLS/headers/smoke tests",
];
const correctedDefects = [
  "A blocked IndexedDB clear rejected even though its uncancellable deletion remained queued; the confirmed operation now stays pending with explicit close-tabs feedback.",
  "WebKit could retain an identical file selection across document navigation and omit the change event; restore releases the picker selection after capturing each File.",
  "A large backup export could exceed its own restore byte limit; export now rejects that size before download with module/media guidance.",
  "Global restore file controls were available before React hydration and during a restore; they now wait for hydration and prevent overlapping selection.",
  "Windows WebKit rejected native Blob storage; sanitized byte storage now preserves old Blob reads and versioned full-media archive portability.",
  "Serial backup reads and integrity checks imposed avoidable browser waits; independent readonly reads and hashes now run concurrently.",
  "New safety validators exceeded the unchanged bundle budget; tree shaking and route-family wrapper grouping restore headroom without removing features.",
  "Blocked main/recovery upgrade requests could migrate after their promise rejected; cancelled upgrades now abort and recovery connections close on version changes.",
  "Backups claimed to exclude active-workout pointers but included the IndexedDB pointer; new exports exclude it and legacy imports ignore it with guidance.",
  "Fresh-profile global restore required visiting every owning module; one guided preparation action now calls owning migrations.",
  "Preview could initialize the main database; all preview opens now abort upgrades and write no canonical records.",
  "Malformed global envelopes could crash preview rendering; failed envelope results use a safe heading/summary.",
  "Global restore omitted owning row and resulting-module validation, including relationships and cached immutable calculations.",
  "Duplicate target stores, inconsistent schema versions, record counts and unsupported serializer/registry/module versions were not rejected.",
  "A synchronous restore write error could leave queued writes alive; transactions now explicitly abort and close on failure.",
  "Partial multi-database failure left recovery solely to the user; automatic before-image rollback is attempted and durable recovery retained on failure.",
  "Keep-existing overwrote shell preferences; existing preferences now survive.",
  "Global file reading/decompression and photo file sizes lacked byte bounds.",
  "Imported media lacked signature/metadata/checksum/dimension and binary-manifest validation.",
  "Full-media plus gzip produced an ambiguous portable profile; the UI separates the supported formats.",
  "Search result/module labels exposed phase numbers; product names now replace those labels.",
  "Comparison copy named the coding agent outside methodology; it now describes machine review.",
  "Cross-browser push triggers omitted the finalization branch; the final branch now receives the hosted matrix.",
];
const completion = JSON.parse(
  await readFile("docs/reports/content-completion.json", "utf8"),
) as {
  modules: {
    module: string;
    publishedIdentities: number;
    draftIdentities: number;
  }[];
};
const contracts = (await readdir("DOCS_for_entire_apppliaction/GYM")).filter(
  (name) => /(?:\.md|\.json|Quick_Implementation_Reference\.txt)$/.test(name),
);
const contractHashes = await Promise.all(
  contracts.map(async (name) => ({
    path: `DOCS_for_entire_apppliaction/GYM/${name}`,
    sha256: createHash("sha256")
      .update(await readFile(`DOCS_for_entire_apppliaction/GYM/${name}`))
      .digest("hex"),
  })),
);
const report = {
  schemaVersion: 1,
  auditedImplementationCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  scope:
    "Final pre-Vercel application completion; frozen verified subset; no deployment, cleanup, deletion or content expansion.",
  features: [
    ...features,
    ...unavailable.map(([module, feature, reason]) => ({
      module,
      feature,
      status: "intentionally unavailable",
      reason,
    })),
    ...manual.map((feature) => ({
      module: "Owner verification",
      feature,
      status: "manual-test-only",
    })),
    ...completion.modules
      .filter((module) => module.draftIdentities)
      .map((module) => ({
        module: module.module,
        feature: "Unpublished identities",
        count: module.draftIdentities,
        status: "future content backlog",
      })),
  ],
  correctedDefects,
  unresolvedDeterministicCodeBlockers: [],
  caveats: [
    "No independent human or clinical review is claimed.",
    "Unknown legacy stores remain opaque and preserved; no invented schema is assigned to them.",
    "No universal claim that software has no undiscovered bugs or that automation proves WCAG compliance.",
  ],
  contractHashes,
};
await mkdir("docs/reports", { recursive: true });
await writeFile(
  "docs/reports/pre-vercel-gap-audit.json",
  JSON.stringify(report, null, 2) + "\n",
);
await writeFile(
  "docs/reports/pre-vercel-gap-audit.md",
  `# Pre-Vercel implementation gap audit\n\nAudited implementation: \`${report.auditedImplementationCommit}\`. ${report.scope}\n\nFinal test evidence is recorded in final-pre-vercel-readiness.json. This inventory describes implementation and retained limitations; it does not inherit old test results.\n\n| Module | Feature | Status | Evidence / reason |\n| --- | --- | --- | --- |\n${report.features.map((row) => `| ${row.module} | ${row.feature} | ${row.status} | ${"evidence" in row ? row.evidence : "reason" in row ? row.reason : "count" in row ? `${row.count} retained draft identities` : "Owner/device check"} |`).join("\n")}\n\n## Defects corrected\n\n${correctedDefects.map((defect) => `- ${defect}`).join("\n")}\n\n## Boundaries\n\n${report.caveats.map((caveat) => `- ${caveat}`).join("\n")}\n\nThe JSON retains hashes of the supplied Phase 00–18 contracts; Phase 19 decisions, handoffs and historical completion reports remain in the repository.\n`,
);
console.log(
  `Gap audit generated: ${report.features.length} feature/status entries; ${correctedDefects.length} corrected defects; frozen backlog retained.`,
);
