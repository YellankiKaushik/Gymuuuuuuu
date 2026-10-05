import { writeFileSync, readFileSync } from "node:fs";
const routes = [
  ["/cardio", "Cardio & conditioning", "pages", "HomePage", ""],
  [
    "/cardio/learn",
    "Cardio learning library",
    "info-pages",
    "KnowledgePage",
    'kind="learn"',
  ],
  [
    "/cardio/learn/$topicSlug",
    "Reviewed cardio topic",
    "info-pages",
    "KnowledgePage",
    'kind="learn" slug={Route.useParams().topicSlug}',
  ],
  [
    "/cardio/modalities",
    "Reviewed activity guidance",
    "info-pages",
    "KnowledgePage",
    'kind="modalities"',
  ],
  [
    "/cardio/modalities/$modalitySlug",
    "Reviewed modality",
    "info-pages",
    "KnowledgePage",
    'kind="modalities" slug={Route.useParams().modalitySlug}',
  ],
  [
    "/cardio/plans",
    "Reviewed cardio plan finder",
    "info-pages",
    "KnowledgePage",
    'kind="plans"',
  ],
  [
    "/cardio/plans/$planSlug",
    "Reviewed cardio plan",
    "info-pages",
    "KnowledgePage",
    'kind="plans" slug={Route.useParams().planSlug}',
  ],
  [
    "/cardio/custom-plans",
    "My cardio plans",
    "builders",
    "MyPlansPage",
    'kind="plan"',
  ],
  [
    "/cardio/custom-plans/create",
    "Build my cardio plan",
    "builders",
    "BuilderPage",
    'kind="plan"',
  ],
  [
    "/conditioning",
    "Conditioning routines",
    "info-pages",
    "ConditioningPage",
    "",
  ],
  [
    "/conditioning/routines/$routineSlug",
    "Reviewed conditioning routine",
    "info-pages",
    "KnowledgePage",
    'kind="routine" slug={Route.useParams().routineSlug}',
  ],
  [
    "/conditioning/custom",
    "Build my conditioning routine",
    "builders",
    "BuilderPage",
    'kind="routine"',
  ],
  [
    "/cardio/session/new",
    "Start or record cardio",
    "session-pages",
    "NewSessionPage",
    "",
  ],
  [
    "/cardio/session/active",
    "Active cardio session",
    "session-pages",
    "ActiveSessionPage",
    "",
  ],
  ["/cardio/history", "Cardio history", "pages", "HistoryPage", ""],
  [
    "/cardio/history/$sessionId",
    "Cardio session record",
    "session-pages",
    "SessionDetailPage",
    "sessionId={Route.useParams().sessionId}",
  ],
  [
    "/cardio/progress",
    "Cardio observations over time",
    "pages",
    "ProgressPage",
    "",
  ],
  [
    "/cardio/calculators/pace",
    "Pace & speed calculator",
    "calculator-pages",
    "PacePage",
    "",
  ],
  [
    "/cardio/calculators/intensity",
    "Intensity methods",
    "calculator-pages",
    "IntensityPage",
    "",
  ],
  [
    "/cardio/methodology",
    "Cardio methodology",
    "info-pages",
    "MethodologyPage",
    "",
  ],
  [
    "/cardio/settings",
    "Cardio settings & backup",
    "info-pages",
    "SettingsPage",
    "",
  ],
  [
    "/cardio/privacy",
    "Cardio local data & privacy",
    "info-pages",
    "PrivacyPage",
    "",
  ],
];
for (const [path, , file, component, props] of routes) {
  const parts = path.slice(1).split("/");
  const name = parts
    .map((p, i) => (i < parts.length - 1 ? `${p}_` : p))
    .join(".");
  const routeId = `/${parts.map((p, i) => (i < parts.length - 1 ? `${p}_` : p)).join("/")}`;
  writeFileSync(
    `src/routes/${name}.tsx`,
    `import {createFileRoute} from '@tanstack/react-router';\nimport {cardioMetadata} from '../features/cardio/metadata';\nimport {${component}} from '../features/cardio/${file}';\nexport const Route=createFileRoute('${routeId}')({head:()=>cardioMetadata('${path}'),component:Page});\nfunction Page(){return <${component} ${props}/>;}\n`,
  );
}
const navPath = "src/data/navigation.ts";
let nav = readFileSync(navPath, "utf8");
nav = nav.replace(
  "path: '/cardio', title: 'Cardio & conditioning', domain: 'Train', phase: 7",
  "path: '/cardio', title: 'Cardio & conditioning', domain: 'Train', phase: 13",
);
const additions = routes
  .filter(
    ([path]) =>
      path !== "/cardio" &&
      !nav.includes(`path: '${path}'`) &&
      !nav.includes(`path:${JSON.stringify(path)}`) &&
      !nav.includes(`path: ${JSON.stringify(path)}`),
  )
  .map(
    ([path, title]) =>
      `  {path:${JSON.stringify(path)},title:${JSON.stringify(title)},domain:'Train',phase:13,description:'Method-labelled cardio tools and optional browser-local activity records.'},`,
  )
  .join("\n");
nav = nav.replace(
  "export const modules: readonly ModuleDefinition[] = [",
  `export const modules: readonly ModuleDefinition[] = [\n${additions}`,
);
if (!nav.includes("module.path.startsWith('/cardio/')"))
  nav = nav.replace(
    "module.path.startsWith('/recovery/')",
    "module.path.startsWith('/cardio/') || module.path.startsWith('/conditioning/') || module.path.startsWith('/recovery/')",
  );
nav = nav.replace(
  "'/workout/history', '/cardio']",
  "'/workout/history', '/cardio', '/conditioning']",
);
writeFileSync(navPath, nav);
