import { readFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const [pkg, lock, strictConfig, nvmVersion, nodeVersion] = await Promise.all([
  readFile("package.json", "utf8").then(
    (text) =>
      JSON.parse(text) as {
        name: string;
        version: string;
        private: boolean;
        packageManager: string;
        engines: { node: string; npm: string };
      },
  ),
  readFile("package-lock.json", "utf8").then(
    (text) =>
      JSON.parse(text) as {
        name: string;
        version: string;
        lockfileVersion: number;
      },
  ),
  readFile("tsconfig.json", "utf8").then(
    (text) =>
      JSON.parse(text) as {
        compilerOptions?: { strict?: boolean; noEmit?: boolean };
      },
  ),
  readFile(".nvmrc", "utf8").then((text) => text.trim()),
  readFile(".node-version", "utf8").then((text) => text.trim()),
]);
const entries = await readdir(".");
const lockfiles = entries.filter((name) =>
  /^(?:package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?)$/.test(
    name,
  ),
);
const tracked = execFileSync("git", ["ls-files", "--cached"], {
  encoding: "utf8",
}).split(/\r?\n/);
const trackedEnvironmentFiles = tracked.filter(
  (name) => /^\.env(?:\..*)?$/.test(name) && name !== ".env.example",
);
const failures: string[] = [];
const vercel = JSON.parse(await readFile("vercel.json", "utf8")) as {
  headers?: { headers?: { key: string; value: string }[] }[];
};
const configuredHeaderNames = new Set(
  vercel.headers?.flatMap(
    (entry) => entry.headers?.map((header) => header.key) ?? [],
  ) ?? [],
);

if (
  !pkg.private ||
  lock.name !== pkg.name ||
  lock.version !== pkg.version ||
  lock.lockfileVersion < 3
) {
  failures.push(
    "The private package manifest and npm lockfile identity/version/format do not match.",
  );
}
if (
  pkg.packageManager !== "npm@11.9.0" ||
  !pkg.engines.node.includes("24.16.0") ||
  !pkg.engines.npm.includes("11.9.0")
) {
  failures.push(
    "package.json must declare the supported pinned Node 24/npm 11 toolchain.",
  );
}
if (nvmVersion !== "24.16.0" || nodeVersion !== nvmVersion)
  failures.push(
    ".nvmrc and .node-version must pin the same supported Node patch.",
  );
if (lockfiles.length !== 1 || lockfiles[0] !== "package-lock.json")
  failures.push(
    `Expected one npm lockfile; found ${lockfiles.join(", ") || "none"}.`,
  );
if (
  !strictConfig.compilerOptions?.strict ||
  !strictConfig.compilerOptions.noEmit
)
  failures.push("TypeScript strict/no-emit settings must remain enabled.");
if (trackedEnvironmentFiles.length)
  failures.push(
    `Environment files must not be committed: ${trackedEnvironmentFiles.join(", ")}`,
  );
for (const header of [
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Strict-Transport-Security",
])
  if (!configuredHeaderNames.has(header))
    failures.push(
      `vercel.json: required static security header ${header} is missing.`,
    );

const workflows = await readdir(join(".github", "workflows"));
for (const workflow of workflows.filter(
  (name) => name.endsWith(".yml") || name.endsWith(".yaml"),
)) {
  const text = await readFile(join(".github", "workflows", workflow), "utf8");
  for (const use of text.matchAll(/^\s+uses:\s+([^\s#]+)(?:\s+#.*)?$/gm)) {
    if (!/@[a-f0-9]{40}(?:\s+#|$)/.test(use[1] ?? ""))
      failures.push(
        `${workflow}: action reference is not pinned to a full commit SHA (${use[1]}).`,
      );
  }
  if (!/^permissions:\s*\n\s+contents:\s+read\s*$/m.test(text))
    failures.push(
      `${workflow}: explicitly declare least-privilege contents: read permissions.`,
    );
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Repository contract passed: ${lockfiles[0]}, strict TypeScript, pinned Node/npm, no committed env files and ${workflows.length} least-privilege workflow(s) with SHA-pinned actions.`,
  );
}
