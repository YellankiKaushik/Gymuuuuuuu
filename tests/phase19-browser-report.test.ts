import { afterEach, expect, it } from "vitest";
import {
  mkdtempSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
  rmdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectBrowserEvidence } from "../scripts/content/browser-report";
import { routeAuditInventory } from "../scripts/content/route-inventory";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) {
    for (const file of readdirSync(directory))
      unlinkSync(join(directory, file));
    rmdirSync(directory);
  }
});
it("includes unpublished dynamic fallbacks and all factual routes without treating navigation as facts", () => {
  const tree =
    "export interface FileRoutesByFullPath {\n'/': typeof Home\n'/foods/$slug': typeof Food\n}\n";
  expect([
    ...routeAuditInventory(tree, [
      { entityType: "food", route: "/foods/apple" },
      { entityType: "route", route: "/not-a-factual-record" },
    ]),
  ]).toEqual([
    ["/", "route"],
    ["/foods/audit-unknown-record", "missing_record"],
    ["/foods/apple", "public_record"],
  ]);
});
it("excludes stale builds and records actual failing UI states without inventing a pass", () => {
  const directory = mkdtempSync(join(tmpdir(), "fitness-os-browser-evidence-"));
  directories.push(directory);
  const buildDate = "2026-10-05T18:00:00.000Z";
  const manifest = { version: "fixture" };
  const base = {
    path: "/",
    auditVersion: 2,
    publicRecordVerified: null,
    failedAssets: [],
    kind: "route",
    browserName: "chromium",
    generatedAt: buildDate,
    buildDate,
    contentManifest: manifest,
    status: 200,
    finalUrl: "http://127.0.0.1:3000/",
    errors: [],
    remoteRequests: [],
    complete: true,
    states: [320, 320, 768, 1440, 1440].map((width, i) => ({
      width,
      theme: ["light", "dark", "light", "light", "dark"][i],
      overflow: false,
      violations: [],
    })),
  };
  writeFileSync(join(directory, "home.json"), JSON.stringify(base));
  writeFileSync(
    join(directory, "stale.json"),
    JSON.stringify({
      ...base,
      path: "/stale",
      buildDate: "2026-10-04T18:00:00.000Z",
    }),
  );
  writeFileSync(
    join(directory, "broken.json"),
    JSON.stringify({
      ...base,
      path: "/broken",
      states: base.states.map((state, i) => ({ ...state, overflow: i === 0 })),
    }),
  );
  writeFileSync(
    join(directory, "fallback.json"),
    JSON.stringify({
      ...base,
      path: "/foods/apple",
      kind: "public_record",
      publicRecordVerified: false,
    }),
  );
  writeFileSync(
    join(directory, "asset.json"),
    JSON.stringify({
      ...base,
      path: "/asset",
      failedAssets: ["404 /assets/missing.json"],
    }),
  );
  writeFileSync(
    join(directory, "method.json"),
    JSON.stringify({ ...base, path: "/old-method", auditVersion: 1 }),
  );
  const result = collectBrowserEvidence(
    new Map([
      ["/", "route"],
      ["/stale", "route"],
      ["/broken", "route"],
      ["/foods/apple", "public_record"],
      ["/asset", "route"],
      ["/old-method", "route"],
    ]),
    manifest,
    directory,
    buildDate,
  );
  expect([
    result.passed,
    result.failed,
    result.unmeasured,
    result.ignoredStaleReports,
  ]).toEqual([1, 3, 2, 2]);
  expect(
    result.routes.find((r) => r.path === "/broken")?.evidence?.states[0]
      ?.overflow,
  ).toBe(true);
});
