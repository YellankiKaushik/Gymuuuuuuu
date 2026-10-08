import { execFileSync } from "node:child_process";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const rules = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  [
    "github-token",
    /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/,
  ],
  ["aws-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  [
    "provider-secret",
    /\b(?:sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{35,}|sk_live_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{25,})\b/,
  ],
  ["google-api-key", /\bAIza[A-Za-z0-9_-]{35}\b/],
  [
    "credential-url",
    /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s:/]+:[^\s@/]+@/,
  ],
  [
    "literal-bearer",
    /Bearer\s+[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{16,}/,
  ],
] as const;
const git = (...args: string[]) =>
  execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  }).trim();
const tracked = git("ls-files").split("\n");
const findings: {
  scope: string;
  path: string;
  rule: string;
  object?: string;
}[] = [];
const scan = (
  content: string,
  scope: string,
  path: string,
  object?: string,
) => {
  for (const [rule, pattern] of rules)
    if (pattern.test(content)) findings.push({ scope, path, rule, object });
};
for (const path of tracked)
  scan((await readFile(path)).toString("utf8"), "current-tree", path);
const objects = git("rev-list", "--objects", "--all")
  .split("\n")
  .map((line) => ({
    sha: line.split(" ")[0]!,
    path: line.slice(line.indexOf(" ") + 1),
  }));
const checked = execFileSync(
  "git",
  ["cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize)"],
  {
    input: objects.map((x) => x.sha).join("\n") + "\n",
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  },
);
const blobs = checked
  .trim()
  .split("\n")
  .filter((line) => line.split(" ")[1] === "blob")
  .map((line) => line.split(" ")[0]!);
const pathBySha = new Map(objects.map((x) => [x.sha, x.path]));
let historicalBytes = 0;
for (let index = 0; index < blobs.length; index += 100) {
  const group = blobs.slice(index, index + 100);
  const data = execFileSync("git", ["cat-file", "--batch"], {
    input: group.join("\n") + "\n",
    maxBuffer: 512 * 1024 * 1024,
  });
  let offset = 0;
  for (const sha of group) {
    const end = data.indexOf(10, offset),
      header = data.subarray(offset, end).toString("utf8"),
      size = Number(header.split(" ")[2]);
    if (!Number.isFinite(size)) throw Error("Unexpected Git object header.");
    offset = end + 1;
    scan(
      data.subarray(offset, offset + size).toString("utf8"),
      "reachable-history",
      pathBySha.get(sha) ?? "unknown",
      sha,
    );
    historicalBytes += size;
    offset += size + 1;
  }
}
async function list(root: string): Promise<string[]> {
  try {
    return (
      await Promise.all(
        (await readdir(root, { withFileTypes: true })).map((item) =>
          item.isDirectory()
            ? list(join(root, item.name))
            : [join(root, item.name)],
        ),
      )
    ).flat();
  } catch {
    return [];
  }
}
const bundle = await list(".output/public");
for (const path of bundle)
  scan((await readFile(path)).toString("utf8"), "public-bundle", path);
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  testedCommit: git("rev-parse", "HEAD"),
  trackedFiles: tracked.length,
  reachableCommits: Number(git("rev-list", "--all", "--count")),
  uniqueHistoryBlobs: blobs.length,
  historicalBytes,
  publicBundleFiles: bundle.length,
  rules: rules.map((x) => x[0]),
  findings,
  limitations:
    "Read-only scan of fetched reachable Git objects and current files; patterns do not establish absence of all credentials. Binary strings scanned; screenshot OCR and inaccessible/unreachable remote history are not covered. No credential values printed.",
};
await mkdir("artifacts/final-security", { recursive: true });
await writeFile(
  "artifacts/final-security/secrets.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (findings.length) process.exitCode = 1;
