import { existsSync, readFileSync, readdirSync } from "node:fs";
import { z } from "zod";
import type { RouteAuditKind } from "./route-inventory";

const evidenceSchema = z.object({
  path: z.string(),
  kind: z.enum(["route", "public_record", "missing_record"]),
  browserName: z.string(),
  generatedAt: z.iso.datetime(),
  contentManifest: z.unknown(),
  buildDate: z.iso.datetime().optional(),
  status: z.number().nullable(),
  finalUrl: z.string(),
  errors: z.array(z.string()),
  remoteRequests: z.array(z.string()),
  states: z.array(
    z.object({
      width: z.number(),
      theme: z.enum(["light", "dark"]),
      overflow: z.boolean(),
      violations: z.array(
        z.object({
          id: z.string(),
          impact: z.string().nullable(),
          nodes: z.array(z.array(z.union([z.string(), z.array(z.string())]))),
        }),
      ),
    }),
  ),
  complete: z.boolean(),
});

export function collectBrowserEvidence(
  inventory: ReadonlyMap<string, RouteAuditKind>,
  manifest: unknown,
  directory = "data-imports/route-audit",
  buildDate: string | null = existsSync(".output/nitro.json")
    ? (
        JSON.parse(readFileSync(".output/nitro.json", "utf8")) as {
          date: string;
        }
      ).date
    : null,
) {
  const current = new Map<string, z.infer<typeof evidenceSchema>>();
  let ignoredStaleReports = 0;
  if (existsSync(directory)) {
    for (const file of readdirSync(directory).filter((f) =>
      f.endsWith(".json"),
    )) {
      const evidence = evidenceSchema.parse(
        JSON.parse(readFileSync(`${directory}/${file}`, "utf8")),
      );
      if (
        evidence.buildDate !== buildDate ||
        JSON.stringify(evidence.contentManifest) !== JSON.stringify(manifest) ||
        inventory.get(evidence.path) !== evidence.kind
      ) {
        ignoredStaleReports++;
        continue;
      }
      if (evidence.browserName === "chromium")
        current.set(evidence.path, evidence);
    }
  }
  const routes = [...inventory].map(([path, kind]) => {
    const evidence = current.get(path);
    const validStates =
      evidence?.states.length === 5 &&
      evidence.states.every(
        (s, i) =>
          s.width === [320, 320, 768, 1440, 1440][i] &&
          s.theme === ["light", "dark", "light", "light", "dark"][i],
      );
    const passed = Boolean(
      evidence?.complete &&
      validStates &&
      evidence.status &&
      evidence.status < (kind === "missing_record" ? 500 : 400) &&
      !evidence.errors.length &&
      !evidence.remoteRequests.length &&
      evidence.states.every((s) => !s.overflow && !s.violations.length),
    );
    return {
      path,
      kind,
      result: !evidence ? "unmeasured" : passed ? "passed" : "failed",
      evidence: evidence ?? null,
    };
  });
  return {
    browser: "chromium",
    buildDate,
    expected: routes.length,
    passed: routes.filter((r) => r.result === "passed").length,
    failed: routes.filter((r) => r.result === "failed").length,
    unmeasured: routes.filter((r) => r.result === "unmeasured").length,
    ignoredStaleReports,
    limitations: [
      "Tablet checks measure overflow; automated WCAG scanning covers mobile and desktop themes.",
      "No manual devices, screen-reader interaction, print output or complete interactive-state traversal is claimed.",
    ],
    routes,
  };
}
