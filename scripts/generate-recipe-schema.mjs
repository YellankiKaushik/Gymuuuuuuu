import process from "node:process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const path =
    "DOCS_for_entire_apppliaction/GYM/Phase_11_Recipes_Meal_Plans_Data_Schema.json",
  root = JSON.parse(readFileSync(path, "utf8"));
function convert(s) {
  if (s.$ref) return convert(root.$defs[s.$ref.slice(8)]);
  if (s.anyOf) return `z.union([${s.anyOf.map(convert).join(",")}])`;
  if (s.const !== undefined) return `z.literal(${JSON.stringify(s.const)})`;
  if (s.enum) return `z.enum(${JSON.stringify(s.enum)})`;
  if (Array.isArray(s.type))
    return `${convert({ ...s, type: s.type.find((t) => t !== "null") })}.nullable()`;
  let c;
  if (s.type === "null") return "z.null()";
  if (s.type === "boolean") return "z.boolean()";
  if (s.type === "string") {
    c =
      s.format === "date-time"
        ? "z.iso.datetime({offset:true})"
        : s.format === "date"
          ? "z.iso.date()"
          : "z.string()";
    if (s.minLength !== undefined) c += `.min(${s.minLength})`;
    if (s.maxLength !== undefined) c += `.max(${s.maxLength})`;
    if (s.pattern) c += `.regex(new RegExp(${JSON.stringify(s.pattern)}))`;
  } else if (["integer", "number"].includes(s.type)) {
    c = "z.number().finite()";
    if (s.type === "integer") c += ".int()";
    if (s.minimum !== undefined) c += `.min(${s.minimum})`;
    if (s.maximum !== undefined) c += `.max(${s.maximum})`;
    if (s.exclusiveMinimum !== undefined) c += `.gt(${s.exclusiveMinimum})`;
  } else if (s.type === "array") {
    c = `z.array(${convert(s.items)})`;
    if (s.minItems !== undefined) c += `.min(${s.minItems})`;
    if (s.maxItems !== undefined) c += `.max(${s.maxItems})`;
    if (s.uniqueItems)
      c +=
        '.refine(v=>new Set(v.map(i=>JSON.stringify(i))).size===v.length,"Duplicate array value")';
  } else if (s.type === "object") {
    if (!s.properties) return "z.record(z.string(),z.json())";
    c = `z.strictObject({${Object.entries(s.properties)
      .map(
        ([k, v]) =>
          `${JSON.stringify(k)}:${convert(v)}${s.required?.includes(k) ? "" : ".optional()"}`,
      )
      .join(",\n")}})`;
  } else throw Error(JSON.stringify(s));
  return c;
}
mkdirSync("src/features/recipes-meal-plans", { recursive: true });
writeFileSync(
  "src/features/recipes-meal-plans/schema.generated.ts",
  `// Generated from ${path}. Conditional recipe/plan snapshots are enforced in schema.ts.\nimport {z} from 'zod'\n` +
    [["backup", root], ...Object.entries(root.$defs)]
      .map(([name, s]) => `export const ${name}NormativeSchema=${convert(s)}\n`)
      .join(""),
);
if (!process.argv.includes("--schema-only")) {
  mkdirSync("src/content/recipes", { recursive: true });
  const reference = JSON.parse(
    readFileSync(
      "DOCS_for_entire_apppliaction/GYM/Phase_11_Recipes_Meal_Plans_Reference_Data.json",
      "utf8",
    ),
  );
  delete reference.testVectors;
  writeFileSync(
    "src/content/recipes/reference.json",
    JSON.stringify(reference, null, 2) + "\n",
  );
}
