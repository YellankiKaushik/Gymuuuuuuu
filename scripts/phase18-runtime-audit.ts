import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const sourceRoot = join(process.cwd(), "src");
const allowedThirdPartyOrigins = new Set(["https://www.youtube-nocookie.com"]);
const forbiddenPackages =
  /^(?:@supabase\/|firebase$|firebase-admin$|stripe$|paypal-rest-sdk$)/;

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
    }),
  );
  return nested.flat();
}

const files = await sourceFiles(sourceRoot);
const findings: string[] = [];
for (const file of files) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(/\bfetch\s*\(\s*(['"`])([^'"`]+)\1/g)) {
    const target = match[2];
    if (target?.startsWith("http")) {
      const origin = new URL(target).origin;
      if (!allowedThirdPartyOrigins.has(origin))
        findings.push(`${file}: unreviewed fetch origin ${origin}`);
    }
  }
  if (/\b(?:posthog|mixpanel|amplitude|sentry|clarity|hotjar)\b/i.test(text)) {
    findings.push(
      `${file}: analytics/session-replay/error-telemetry identifier found`,
    );
  }
}

const manifest = JSON.parse(
  await readFile(join(process.cwd(), "package.json"), "utf8"),
) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
for (const name of Object.keys({
  ...manifest.dependencies,
  ...manifest.devDependencies,
})) {
  if (forbiddenPackages.test(name))
    findings.push(
      `package.json: prohibited runtime/service dependency ${name}`,
    );
}

if (findings.length) {
  console.error(findings.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Privacy/runtime audit passed: ${files.length} source files scanned; no unreviewed direct fetch origins, analytics, telemetry or prohibited service packages.`,
  );
}
