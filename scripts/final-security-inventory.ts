import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { resolve, dirname, extname } from "node:path";

const git = (...args: string[]) =>
  execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  }).trim();
const paths = git("ls-files").split("\n");
const classifications = paths.map((path) => ({
  path,
  classification:
    path.startsWith("src/content/") ||
    path.startsWith("src/data/") ||
    path.startsWith("public/data/")
      ? "source data"
      : path.startsWith("src/") || path.startsWith("public/")
        ? "active runtime"
        : path.startsWith("tests/")
          ? "tests"
          : path.startsWith("docs/reports/") && /\.(json|png|webp)$/.test(path)
            ? "generated evidence"
            : path.startsWith("docs/phases/") ||
                path.startsWith("DOCS_for_entire_apppliaction/")
              ? "historical documentation"
              : path.startsWith("docs/") ||
                  path === "README.md" ||
                  path === "AGENTS.md"
                ? "current documentation"
                : path.startsWith("scripts/") ||
                    path.startsWith(".github/") ||
                    /(?:config|package|lock|\.nvmrc|\.gitignore|\.env.example)/.test(
                      path,
                    )
                  ? "active build tooling"
                  : "unknown",
}));
const todos: {
  path: string;
  line: number;
  marker: string;
  classification: string;
}[] = [];
const debug: { path: string; line: number }[] = [];
const links: {
  path: string;
  line: number;
  target: string;
  classification: string;
}[] = [];
const sinks: { path: string; line: number; kind: string }[] = [];
const storage: { path: string; line: number; kind: string }[] = [];
for (const path of paths) {
  if (!/\.(?:[cm]?[jt]sx?|md|json|ya?ml|txt)$/.test(path)) continue;
  const content = await readFile(path, "utf8");
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    for (const match of line.matchAll(
      /\b(TODO|FIXME|HACK|TEMP|XXX|DEPRECATED)\b/g,
    ))
      todos.push({
        path,
        line: index + 1,
        marker: match[1]!,
        classification: path.startsWith("src/")
          ? "runtime review required"
          : path.startsWith("tests/")
            ? "test fixture/reference"
            : "historical or tooling reference; preserved",
      });
    if (
      path.startsWith("src/") &&
      /console\.(?:log|debug|warn)\s*\(|\bdebugger\s*;/.test(line)
    )
      debug.push({ path, line: index + 1 });
    if (path.startsWith("src/")) {
      const sink =
        /dangerouslySetInnerHTML|\binnerHTML\b|\bouterHTML\b|insertAdjacentHTML|document\.write|\beval\s*\(|new Function/.exec(
          line,
        );
      if (sink) sinks.push({ path, line: index + 1, kind: sink[0] });
      for (const match of line.matchAll(/\b(localStorage|sessionStorage)\b/g))
        storage.push({ path, line: index + 1, kind: match[1]! });
    }
    if (extname(path) !== ".md") continue;
    for (const match of line.matchAll(
      /\]\((?:<([^>]+)>|([^\s)]+))(?:\s+"[^"]*")?\)/g,
    )) {
      const target = (match[1] ?? match[2]!).split("#")[0]!.split("?")[0]!;
      if (!target || /^(?:https?:|mailto:|app:|codex:|\/)/.test(target))
        continue;
      try {
        await stat(resolve(dirname(path), decodeURIComponent(target)));
      } catch {
        links.push({
          path,
          line: index + 1,
          target,
          classification:
            path.startsWith("docs/phases/") ||
            path.startsWith("DOCS_for_entire_apppliaction/")
              ? "historical reference; preserve and annotate"
              : "current reference requires review",
        });
      }
    }
  }
}
const report = {
  schemaVersion: 1,
  testedCommit: git("rev-parse", "HEAD"),
  generatedAt: new Date().toISOString(),
  filesClassified: paths.length,
  classifications,
  todos,
  debug,
  sinks,
  storage,
  brokenRelativeLinks: links,
  deletionPolicy:
    "No deletion, move, rename, untracking or history rewrite is authorized.",
};
await mkdir("artifacts/final-security", { recursive: true });
await writeFile(
  "artifacts/final-security/inventory.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      filesClassified: paths.length,
      todoMatches: todos.length,
      runtimeTodos: todos.filter(
        (x) => x.classification === "runtime review required",
      ),
      debug,
      sinks,
      brokenRelativeLinks: links,
    },
    null,
    2,
  ),
);
