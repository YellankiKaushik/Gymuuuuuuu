import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { z } from "zod";

const root = process.cwd();
const referencePath = join(
  root,
  "DOCS_for_entire_apppliaction/GYM/Phase_18_Testing_Deployment_Reference_Data.json",
);
const schemaPath = join(
  root,
  "DOCS_for_entire_apppliaction/GYM/Phase_18_Testing_Deployment_Data_Schema.json",
);
const releaseGates = (
  JSON.parse(await readFile(referencePath, "utf8")) as {
    releaseGates: { id: string; blocking: boolean }[];
  }
).releaseGates
  .filter((gate) => gate.blocking)
  .map((gate) => gate.id);

const gate = z.strictObject({
  id: z.string().min(1),
  status: z.enum(["passed", "failed", "waived", "not_applicable"]),
  details: z.string().nullable().optional(),
  artifact: z.string().nullable().optional(),
});
const metadataSchema = z.strictObject({
  testSummary: z.strictObject({
    gates: z.array(gate),
    startedAt: z.iso.datetime({ offset: true }),
    completedAt: z.iso.datetime({ offset: true }),
    ciRunUrl: z.url().nullable().optional(),
  }),
  contentVersions: z.array(
    z.strictObject({
      moduleId: z.string().regex(/^phase_[0-9]{2}$/),
      dataVersion: z.string(),
      schemaVersion: z.number().int().nonnegative(),
      sourceRegistryReviewedThrough: z.iso.date().nullable().optional(),
    }),
  ),
  dataCompatibility: z.strictObject({
    modules: z.array(
      z.strictObject({
        moduleId: z.string().regex(/^phase_[0-9]{2}$/),
        schemaVersion: z.number().int().nonnegative(),
        minimumReadableVersion: z.number().int().nonnegative(),
        maximumReadableVersion: z
          .number()
          .int()
          .nonnegative()
          .nullable()
          .optional(),
        migrationIds: z.array(z.string()).optional(),
        rollbackSafe: z.boolean(),
      }),
    ),
    destructiveMigration: z.boolean(),
    externalBackupRequired: z.boolean(),
    testedFromPreviousVersion: z.boolean().optional(),
    testedRollbackToPreviousVersion: z.boolean().optional(),
  }),
  deployment: z.strictObject({
    provider: z.literal("vercel"),
    environment: z.enum(["preview", "production"]),
    deploymentUrl: z.url(),
    canonicalUrl: z.url(),
    deploymentId: z.string().min(1),
    deployedAt: z.iso.datetime({ offset: true }),
    domainVerified: z.boolean().optional(),
    tlsVerified: z.boolean().optional(),
  }),
  rollback: z.strictObject({
    codeRollbackSupported: z.boolean(),
    dataRollbackSupported: z.literal(false),
    previousDeploymentId: z.string().nullable(),
    previousVersion: z.string().nullable().optional(),
    rollbackCompatibilityTested: z.boolean().optional(),
    runbookPath: z.string().min(1),
    forwardFixRequiredWhenIncompatible: z.boolean().optional(),
  }),
  notes: z.array(z.string()).optional(),
});

type Metadata = z.infer<typeof metadataSchema>;
type Provenance = {
  repository: string;
  commitSha: string;
  branch: string;
  tag: string | null;
  version: string;
  nodeVersion: string;
  packageManagerVersion: string;
  reactStartVersion: string;
  lockfileHash: string;
};

export function validateReleaseManifest(manifest: unknown) {
  const schema = JSON.parse(requireSchemaText) as object;
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(manifest);
  return { valid, errors: validate.errors ?? [] };
}

let requireSchemaText = await readFile(schemaPath, "utf8");

export function createReleaseManifest(
  input: unknown,
  provenance: Provenance,
  generatedAt = new Date().toISOString(),
) {
  const metadata = metadataSchema.parse(input);
  const ids = metadata.testSummary.gates.map((item) => item.id);
  if (new Set(ids).size !== ids.length)
    throw new Error("Release evidence contains duplicate gate IDs.");
  const missing = releaseGates.filter((id) => !ids.includes(id));
  const unexpected = ids.filter((id) => !releaseGates.includes(id));
  if (missing.length || unexpected.length) {
    throw new Error(
      `Release evidence must include exactly the supplied blocking gates. Missing: ${missing.join(", ") || "none"}; unexpected: ${unexpected.join(", ") || "none"}.`,
    );
  }
  if (!/^[a-f0-9]{40}$/.test(provenance.commitSha))
    throw new Error("A full 40-character Git commit SHA is required.");
  if (!/^[a-f0-9]{64}$/.test(provenance.lockfileHash))
    throw new Error("A SHA-256 lockfile hash is required.");
  const completed = metadata.testSummary.gates.every(
    (item) => item.status === "passed",
  );
  const manifest = {
    format: "fitness-os-release-manifest",
    manifestVersion: 1,
    releaseId: `v${provenance.version}-${provenance.commitSha.slice(0, 12)}`,
    version: provenance.version,
    generatedAt,
    source: {
      repository: provenance.repository,
      commitSha: provenance.commitSha,
      branch: provenance.branch,
      tag: provenance.tag,
    },
    toolchain: {
      framework: "TanStack Start",
      frameworkVersion: provenance.reactStartVersion,
      nodeVersion: provenance.nodeVersion,
      packageManager: "npm",
      packageManagerVersion: provenance.packageManagerVersion,
      lockfileHash: provenance.lockfileHash,
    },
    testSummary: {
      status: completed ? "passed" : "failed",
      gates: metadata.testSummary.gates,
      startedAt: metadata.testSummary.startedAt,
      completedAt: metadata.testSummary.completedAt,
      ...(metadata.testSummary.ciRunUrl
        ? { ciRunUrl: metadata.testSummary.ciRunUrl }
        : {}),
    },
    contentVersions: metadata.contentVersions,
    dataCompatibility: metadata.dataCompatibility,
    deployment: metadata.deployment,
    rollback: metadata.rollback,
    ...(metadata.notes ? { notes: metadata.notes } : {}),
  };
  const { valid, errors } = validateReleaseManifest(manifest);
  if (!valid)
    throw new Error(
      `Manifest does not conform to the supplied schema: ${JSON.stringify(errors)}`,
    );
  return manifest;
}

async function run() {
  const [metadataPath, outputPath = "artifacts/release-manifest.json"] =
    process.argv.slice(2);
  if (!metadataPath)
    throw new Error(
      "Usage: npm run release:manifest -- <observed-release-evidence.json> [output-path]",
    );
  requireSchemaText = await readFile(schemaPath, "utf8");
  const metadata = JSON.parse(
    await readFile(join(root, metadataPath), "utf8"),
  ) as Metadata;
  const packageJson = JSON.parse(
    await readFile(join(root, "package.json"), "utf8"),
  ) as { version: string };
  const lock = await readFile(join(root, "package-lock.json"));
  const provenance: Provenance = {
    repository: "https://github.com/YellankiKaushik/Gymuuuuuuu",
    commitSha: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim(),
    branch: execFileSync("git", ["branch", "--show-current"], {
      encoding: "utf8",
    }).trim(),
    tag:
      execFileSync("git", ["tag", "--points-at", "HEAD"], { encoding: "utf8" })
        .trim()
        .split(/\r?\n/)[0] || null,
    version: packageJson.version,
    nodeVersion: process.version,
    packageManagerVersion: execFileSync("npm", ["--version"], {
      encoding: "utf8",
    }).trim(),
    reactStartVersion: JSON.parse(
      await readFile(join(root, "package-lock.json"), "utf8"),
    ).packages["node_modules/@tanstack/react-start"].version,
    lockfileHash: createHash("sha256").update(lock).digest("hex"),
  };
  const manifest = createReleaseManifest(metadata, provenance);
  const output = join(root, outputPath);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Validated release manifest written to ${outputPath}`);
}

if (process.argv[1]?.endsWith("phase18-release-manifest.ts")) {
  await run();
}
