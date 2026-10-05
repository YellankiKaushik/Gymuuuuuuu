import process from "node:process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const path = "DOCS_for_entire_apppliaction/GYM/Phase_07_Food_Data_Schema.json";
const root = JSON.parse(readFileSync(path, "utf8"));
function convert(s) {
  if (s.$ref) return convert(root.$defs[s.$ref.slice(8)]);
  if ("const" in s) return `z.literal(${JSON.stringify(s.const)})`;
  if (s.enum) return `z.enum(${JSON.stringify(s.enum)})`;
  if (Array.isArray(s.type))
    return `${convert({ ...s, type: s.type.find((t) => t !== "null") })}.nullable()`;
  let c;
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
  } else if (["number", "integer"].includes(s.type)) {
    c = "z.number().finite()";
    if (s.type === "integer") c += ".int()";
    if (s.minimum !== undefined) c += `.min(${s.minimum})`;
    if (s.maximum !== undefined) c += `.max(${s.maximum})`;
    if (s.exclusiveMinimum !== undefined) c += `.gt(${s.exclusiveMinimum})`;
    if (s.exclusiveMaximum !== undefined) c += `.lt(${s.exclusiveMaximum})`;
  } else if (s.type === "boolean") c = "z.boolean()";
  else if (s.type === "array") {
    c = `z.array(${convert(s.items)})`;
    if (s.minItems !== undefined) c += `.min(${s.minItems})`;
    if (s.maxItems !== undefined) c += `.max(${s.maxItems})`;
    if (s.uniqueItems)
      c +=
        '.refine(v=>new Set(v.map(i=>JSON.stringify(i))).size===v.length,"Duplicate array value")';
  } else if (s.type === "object") {
    if (s.additionalProperties !== false) throw Error("Unbounded object");
    c = `z.strictObject({${Object.entries(s.properties)
      .map(
        ([k, v]) =>
          `${JSON.stringify(k)}:${convert(v)}${s.required?.includes(k) ? "" : ".optional()"}`,
      )
      .join(",\n")}})`;
  } else throw Error(JSON.stringify(s));
  return c;
}
mkdirSync("src/features/foods", { recursive: true });
let c = `// Generated from ${path}; do not hand edit.\nimport {z} from 'zod'\n`;
for (const [name, s] of [["food", root], ...Object.entries(root.$defs)])
  c += `export const ${name}NormativeSchema=${convert(s)}\n`;
writeFileSync("src/features/foods/schema.generated.ts", c);
if (!process.argv.includes("--schema-only")) {
  const seed = JSON.parse(
    readFileSync(
      "DOCS_for_entire_apppliaction/GYM/Phase_07_Seed_Food_Taxonomy.json",
      "utf8",
    ),
  );
  mkdirSync("src/content/foods/shards", { recursive: true });
  writeFileSync(
    "src/content/foods/reference.json",
    JSON.stringify(seed.referenceData, null, 2) + "\n",
  );
  writeFileSync(
    "src/content/foods/identities.json",
    JSON.stringify(seed.foods, null, 2) + "\n",
  );
  // Public release input is separate from draft identity seeds.
  try {
    readFileSync("src/content/foods/records.json");
  } catch {
    writeFileSync("src/content/foods/records.json", "[]\n");
  }
}
