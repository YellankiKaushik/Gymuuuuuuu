import { describe, expect, it } from "vitest";
import {
  createReleaseManifest,
  validateReleaseManifest,
} from "../scripts/phase18-release-manifest";
import { readFile } from "node:fs/promises";

const reference = JSON.parse(
  await readFile(
    "DOCS_for_entire_apppliaction/GYM/Phase_18_Testing_Deployment_Reference_Data.json",
    "utf8",
  ),
) as {
  releaseGates: { id: string; blocking: boolean }[];
};
const now = "2026-10-05T10:00:00.000Z";
const gates = reference.releaseGates
  .filter((item) => item.blocking)
  .map(({ id }) => ({
    id,
    status: "passed" as const,
    details: "Evidence reviewed.",
  }));
const metadata = {
  testSummary: { gates, startedAt: now, completedAt: now },
  contentVersions: [],
  dataCompatibility: {
    modules: [],
    destructiveMigration: false,
    externalBackupRequired: false,
  },
  deployment: {
    provider: "vercel" as const,
    environment: "preview" as const,
    deploymentUrl: "https://preview.example.test",
    canonicalUrl: "https://preview.example.test",
    deploymentId: "observed-preview-id",
    deployedAt: now,
    domainVerified: false,
    tlsVerified: true,
  },
  rollback: {
    codeRollbackSupported: true,
    dataRollbackSupported: false as const,
    previousDeploymentId: null,
    runbookPath: "docs/runbooks/release-and-rollback.md",
  },
};
const provenance = {
  repository: "https://github.com/YellankiKaushik/Gymuuuuuuu",
  commitSha: "0123456789abcdef0123456789abcdef01234567",
  branch: "codex/phase-18-release-controls",
  tag: null,
  version: "0.1.0",
  nodeVersion: "v24.16.0",
  packageManagerVersion: "11.9.0",
  reactStartVersion: "1.168.60",
  lockfileHash: "a".repeat(64),
};

describe("Phase 18 release manifest", () => {
  it("generates metadata that conforms to the supplied JSON Schema", () => {
    const manifest = createReleaseManifest(metadata, provenance, now);
    expect(manifest.testSummary.status).toBe("passed");
    expect(validateReleaseManifest(manifest).valid).toBe(true);
  });

  it("refuses a partial blocking-gate list instead of implying release readiness", () => {
    const incomplete = {
      ...metadata,
      testSummary: { ...metadata.testSummary, gates: gates.slice(0, -1) },
    };
    expect(() => createReleaseManifest(incomplete, provenance, now)).toThrow(
      /Missing:/,
    );
  });

  it("marks a candidate failed when any supplied blocking gate has not passed", () => {
    const incomplete = {
      ...metadata,
      testSummary: {
        ...metadata.testSummary,
        gates: gates.map((item, index) =>
          index === 0 ? { ...item, status: "not_applicable" as const } : item,
        ),
      },
    };
    expect(
      createReleaseManifest(incomplete, provenance, now).testSummary.status,
    ).toBe("failed");
  });

  it("rejects malformed provenance and unknown schema fields", () => {
    expect(() =>
      createReleaseManifest(
        metadata,
        { ...provenance, commitSha: "short" },
        now,
      ),
    ).toThrow(/commit SHA/);
    const manifest = createReleaseManifest(metadata, provenance, now);
    expect(
      validateReleaseManifest({
        ...manifest,
        personalRecord: "must never be added",
      }).valid,
    ).toBe(false);
  });
});
