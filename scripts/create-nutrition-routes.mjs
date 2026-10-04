import { writeFileSync } from "node:fs";
const base = "src/routes/";
writeFileSync(
  base + "nutrition.tsx",
  `import {createFileRoute,Outlet} from '@tanstack/react-router'
import {NutritionProvider} from '../features/nutrition-tracker/workspace'
import {NutritionLayoutNav} from '../features/nutrition-tracker/pages'
export const Route=createFileRoute('/nutrition')({head:()=>({meta:[{title:'Nutrition diary | Fitness OS'},{name:'robots',content:'noindex'}]}),component:()=> <NutritionProvider><NutritionLayoutNav/><Outlet/></NutritionProvider>})
`,
);
const pages = [
  ["nutrition.index", "/nutrition/", "NutritionDayPage", ""],
  ["nutrition.add", "/nutrition/add", "NutritionAddPage", ""],
  ["nutrition.history", "/nutrition/history", "NutritionHistoryPage", ""],
  [
    "nutrition.custom-foods.index",
    "/nutrition/custom-foods/",
    "CustomFoodPage",
    "",
  ],
  ["nutrition.settings", "/nutrition/settings", "NutritionSettingsPage", ""],
  [
    "nutrition.methodology",
    "/nutrition/methodology",
    "NutritionInformationPage",
    "",
  ],
  [
    "nutrition.privacy",
    "/nutrition/privacy",
    "NutritionInformationPage",
    "privacy",
  ],
];
for (const [file, path, component, props] of pages)
  writeFileSync(
    base + file + ".tsx",
    `import {createFileRoute} from '@tanstack/react-router'
import {${component}} from '../features/nutrition-tracker/pages'
export const Route=createFileRoute('${path}')({component:()=> <${component} ${props}/>})
`,
  );
for (const [file, path] of [
  ["nutrition.day", "/nutrition/day"],
  ["nutrition.custom-foods", "/nutrition/custom-foods"],
])
  writeFileSync(
    base + file + ".tsx",
    `import {createFileRoute,Outlet} from '@tanstack/react-router'
export const Route=createFileRoute('${path}')({component:Outlet})
`,
  );
for (const [file, path, component, param, prop] of [
  [
    "nutrition.day.$date",
    "/nutrition/day/$date",
    "NutritionDayPage",
    "date",
    "selectedDate",
  ],
  [
    "nutrition.custom-foods.$customFoodId",
    "/nutrition/custom-foods/$customFoodId",
    "CustomFoodPage",
    "customFoodId",
    "selectedId",
  ],
])
  writeFileSync(
    base + file + ".tsx",
    `import {createFileRoute} from '@tanstack/react-router'
import {${component}} from '../features/nutrition-tracker/pages'
export const Route=createFileRoute('${path}')({component:Page})
function Page(){const {${param}}=Route.useParams();return <${component} ${prop}={${param}}/>}
`,
  );
