import { writeFileSync, readFileSync } from "node:fs";
const routes = [
  ["/supplements", "Supplements & evidence", "info-pages", "HomePage", ""],
  [
    "/supplements/ingredients",
    "Ingredient library",
    "info-pages",
    "LibraryPage",
    'kind="ingredients"',
  ],
  [
    "/supplements/ingredients/$ingredientSlug",
    "Reviewed supplement ingredient",
    "info-pages",
    "LibraryPage",
    'kind="ingredients" slug={Route.useParams().ingredientSlug}',
  ],
  [
    "/supplements/compare",
    "Compare supplement evidence",
    "info-pages",
    "ComparePage",
    "",
  ],
  [
    "/supplements/evidence",
    "Claim-level evidence",
    "info-pages",
    "LibraryPage",
    'kind="evidence"',
  ],
  [
    "/supplements/evidence/$claimSlug",
    "Reviewed supplement claim",
    "info-pages",
    "LibraryPage",
    'kind="evidence" slug={Route.useParams().claimSlug}',
  ],
  ...[
    "safety",
    "quality",
    "anti-doping",
    "frameworks",
    "methodology",
    "privacy",
  ].map((kind) => [
    `/supplements/${kind}`,
    `Supplement ${kind}`,
    "info-pages",
    "GuidancePage",
    `kind="${kind}"`,
  ]),
  [
    "/supplements/products",
    "My products & intake",
    "product-pages",
    "ProductsPage",
    "",
  ],
  [
    "/supplements/products/create",
    "Capture product label",
    "product-pages",
    "ProductEditorPage",
    "",
  ],
  [
    "/supplements/products/$productId",
    "Product label versions",
    "product-pages",
    "ProductEditorPage",
    "productId={Route.useParams().productId}",
  ],
  [
    "/supplements/trials",
    "Personal supplement trials",
    "trial-pages",
    "TrialsPage",
    "",
  ],
  [
    "/supplements/trials/create",
    "Create personal trial",
    "trial-pages",
    "TrialEditorPage",
    "",
  ],
  [
    "/supplements/trials/$trialId",
    "Personal trial record",
    "trial-pages",
    "TrialEditorPage",
    "trialId={Route.useParams().trialId}",
  ],
  [
    "/supplements/adverse-events",
    "Suspected adverse events",
    "event-pages",
    "EventsPage",
    "",
  ],
  [
    "/supplements/settings",
    "Supplement backup & settings",
    "info-pages",
    "SettingsPage",
    "",
  ],
];
for (const [path, , file, component, props] of routes) {
  const parts = path.slice(1).split("/"),
    segments = parts.map((p, i) => (i < parts.length - 1 ? `${p}_` : p));
  writeFileSync(
    `src/routes/${segments.join(".")}.tsx`,
    `import {createFileRoute} from '@tanstack/react-router';\nimport {supplementMetadata} from '../features/supplements/metadata';\nimport {${component}} from '../features/supplements/${file}';\nexport const Route=createFileRoute('/${segments.join("/")}')({head:()=>supplementMetadata('${path}'),component:Page});\nfunction Page(){return <${component} ${props}/>;}\n`,
  );
}
const path = "src/data/navigation.ts";
let nav = readFileSync(path, "utf8");
const additions = routes
  .filter(
    ([url]) =>
      url !== "/supplements" &&
      !new RegExp(`path:\\s*["']${url.replaceAll("$", "\\$")}["']`).test(nav),
  )
  .map(
    ([url, title]) =>
      `{path:${JSON.stringify(url)},title:${JSON.stringify(title)},domain:'Eat',phase:14,description:'Claim-specific evidence and optional browser-local supplement records.'},`,
  )
  .join("\n");
nav = nav.replace(
  "export const modules: readonly ModuleDefinition[] = [",
  `export const modules: readonly ModuleDefinition[] = [\n${additions}`,
);
nav = nav.replace(/(path: '\/supplements'[^\n]*phase: )\d+/, "$114");
writeFileSync(path, nav);
