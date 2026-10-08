import { execFileSync } from "node:child_process";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const rules = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  [
    "github-token",
    /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/,
  ],
  ["aws-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["openai-secret", /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{35,}\b/],
] as const;
const findings: { path: string; rule: string }[] = [];
const envFiles = tracked.filter((file) => /(?:^|\/)\.env(?:\.|$)/.test(file));
for (const path of envFiles)
  if (!path.endsWith(".env.example"))
    findings.push({ path, rule: "tracked-environment-file" });
async function scan(path: string) {
  if (!/\.(?:[cm]?[jt]sx?|json|md|txt|ya?ml|example)$/.test(path)) return;
  const text = await readFile(path, "utf8");
  for (const [rule, pattern] of rules)
    if (pattern.test(text)) findings.push({ path, rule });
}
async function files(root: string): Promise<string[]> {
  return (
    await Promise.all(
      (await readdir(root, { withFileTypes: true })).map((item) =>
        item.isDirectory()
          ? files(join(root, item.name))
          : [join(root, item.name)],
      ),
    )
  ).flat();
}
const bundle = await files(".output/public");
for (const path of [...tracked, ...bundle]) await scan(path);
const report = {
  schemaVersion: 1,
  testedCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  trackedFilesScanned: tracked.length,
  publicBundleFilesScanned: bundle.length,
  trackedEnvironmentFiles: envFiles,
  productionServerSha256: createHash("sha256")
    .update(await readFile(".output/server/index.mjs"))
    .digest("hex"),
  secretFindings: findings,
  limitations:
    "Pattern-based current-tree/bundle scan; no claim of formal penetration testing or historical secret scanning.",
};
await mkdir("docs/reports", { recursive: true });
await writeFile(
  "docs/reports/pre-vercel-security.json",
  JSON.stringify(report, null, 2) + "\n",
);
if (findings.length)
  throw Error(
    `${findings.length} potential secret findings. Only file names and rule IDs are retained; review without printing values.`,
  );
console.log(
  `Security scan passed: ${tracked.length} tracked files, ${bundle.length} public bundle files; no matching secrets.`,
);
