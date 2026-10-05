import { writeFileSync, readFileSync } from "node:fs";
const routes = [
  ["recovery", "/recovery", "Recovery", "pages", "RecoveryOverview", ""],
  [
    "recovery_.check-in",
    "/recovery/check-in",
    "Daily recovery check-in",
    "pages",
    "RecoveryCheckIn",
    "",
  ],
  [
    "recovery_.history",
    "/recovery/history",
    "Recovery history",
    "pages",
    "RecoveryHistory",
    'kind="checkin"',
  ],
  [
    "recovery_.topics",
    "/recovery/topics",
    "Recovery topics",
    "info-pages",
    "RecoveryKnowledge",
    'domain="recovery"',
  ],
  [
    "recovery_.topics_.$topicSlug",
    "/recovery/topics/$topicSlug",
    "Recovery topic",
    "info-pages",
    "RecoveryKnowledge",
    "slug={Route.useParams().topicSlug}",
  ],
  ["sleep", "/sleep", "Sleep", "pages", "RecoveryOverview", "sleepOnly"],
  ["sleep_.log", "/sleep/log", "Sleep diary", "pages", "SleepDiary", ""],
  [
    "sleep_.history",
    "/sleep/history",
    "Sleep history",
    "pages",
    "RecoveryHistory",
    'kind="sleep"',
  ],
  [
    "sleep_.methodology",
    "/sleep/methodology",
    "Sleep methodology",
    "info-pages",
    "SleepMethodology",
    "",
  ],
  [
    "mobility",
    "/mobility",
    "Mobility",
    "info-pages",
    "RecoveryKnowledge",
    'domain="mobility" routines',
  ],
  [
    "mobility_.routines.$routineSlug",
    "/mobility/routines/$routineSlug",
    "Reviewed mobility routine",
    "info-pages",
    "RecoveryKnowledge",
    "routines slug={Route.useParams().routineSlug}",
  ],
  [
    "mobility_.session.$routineId",
    "/mobility/session/$routineId",
    "Routine session",
    "routines",
    "RoutinePlayer",
    "routineId={Route.useParams().routineId}",
  ],
  [
    "mobility_.history",
    "/mobility/history",
    "Mobility history",
    "routines",
    "MobilityHistory",
    "",
  ],
  [
    "mobility_.custom",
    "/mobility/custom",
    "My mobility routines",
    "routines",
    "LocalRoutines",
    "",
  ],
  [
    "mobility_.custom_.create",
    "/mobility/custom/create",
    "Build a local routine",
    "routines",
    "RoutineBuilder",
    "",
  ],
  [
    "warm-ups",
    "/warm-ups",
    "Warm-ups",
    "info-pages",
    "RecoveryKnowledge",
    "routines",
  ],
  [
    "warm-ups_.$routineSlug",
    "/warm-ups/$routineSlug",
    "Reviewed warm-up",
    "info-pages",
    "RecoveryKnowledge",
    "routines slug={Route.useParams().routineSlug}",
  ],
  [
    "recovery_.settings",
    "/recovery/settings",
    "Recovery backup and settings",
    "info-pages",
    "RecoverySettingsPage",
    "",
  ],
  [
    "recovery_.privacy",
    "/recovery/privacy",
    "Recovery privacy",
    "info-pages",
    "RecoveryPrivacy",
    "",
  ],
];
for (const [file, path, title, source, component, props] of routes) {
  writeFileSync(
    `src/routes/${file}.tsx`,
    `import {createFileRoute} from '@tanstack/react-router';\nimport {recoveryMetadata} from '../features/recovery/metadata';\nimport {RecoveryPage} from '../features/recovery/workspace';\nimport {${component}} from '../features/recovery/${source}';\nexport const Route=createFileRoute('${file
      .split(".")

      .join("/")
      .replace(
        /^/,
        "/",
      )}')({head:()=>recoveryMetadata('${path}'),component:Page});\nfunction Page(){return <RecoveryPage title=${JSON.stringify(title)}><${component} ${props}/></RecoveryPage>;}\n`,
  );
}
let nav = readFileSync("src/data/navigation.ts", "utf8");
const marker = "export const modules: readonly ModuleDefinition[] = [";
const existing = new Set(
  [...nav.matchAll(/path: '([^']+)'/g)].map((m) => m[1]),
);
nav = nav.replace(
  marker,
  marker +
    "\n" +
    routes
      .filter((r) => !existing.has(r[1]))
      .map(
        ([, path, title]) =>
          `  { path: '${path}', title: '${title}', domain: 'Recover', phase: 12, description: 'Optional device-local recovery, sleep and routine tools.' },`,
      )
      .join("\n"),
);
nav = nav.replace(
  "module.path.startsWith('/nutrition/')",
  "module.path.startsWith('/recovery/') || module.path.startsWith('/sleep/') || module.path.startsWith('/mobility/') || module.path.startsWith('/warm-ups/') || module.path.startsWith('/nutrition/')",
);
writeFileSync("src/data/navigation.ts", nav);
