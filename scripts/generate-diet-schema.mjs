import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const path =
    "DOCS_for_entire_apppliaction/GYM/Phase_09_Diet_Planning_Data_Schema.json",
  root = JSON.parse(readFileSync(path, "utf8"));
function convert(s) {
  if (s.$ref) return convert(root.$defs[s.$ref.slice(8)]);
  if (s.const !== undefined) return `z.literal(${JSON.stringify(s.const)})`;
  if (s.enum) return `z.enum(${JSON.stringify(s.enum)})`;
  if (Array.isArray(s.type))
    return `${convert({ ...s, type: s.type.find((t) => t !== "null") })}.nullable()`;
  let c;
  if (s.type === "boolean") return "z.boolean()";
  if (s.type === "string") {
    c = "z.string()";
    if (s.minLength !== undefined) c += `.min(${s.minLength})`;
    if (s.maxLength !== undefined) c += `.max(${s.maxLength})`;
    if (s.pattern) c += `.regex(new RegExp(${JSON.stringify(s.pattern)}))`;
    if (s.format === "date-time")
      c +=
        '.refine(v=>z.iso.datetime({offset:true}).safeParse(v).success,"Invalid timestamp")';
  } else if (["integer", "number"].includes(s.type)) {
    c = "z.number().finite()";
    if (s.type === "integer") c += ".int()";
    if (s.minimum !== undefined) c += `.min(${s.minimum})`;
    if (s.maximum !== undefined) c += `.max(${s.maximum})`;
    if (s.multipleOf) c += `.multipleOf(${s.multipleOf})`;
  } else if (s.type === "array") {
    c = `z.array(${convert(s.items)})`;
    if (s.minItems !== undefined) c += `.min(${s.minItems})`;
    if (s.maxItems !== undefined) c += `.max(${s.maxItems})`;
    if (s.uniqueItems)
      c +=
        '.refine(v=>new Set(v.map(i=>JSON.stringify(i))).size===v.length,"Duplicate array value")';
  } else if (s.type === "object") {
    if (s.additionalProperties !== false)
      return `z.record(z.string(),${convert(s.additionalProperties)})`;
    c = `z.strictObject({${Object.entries(s.properties)
      .map(
        ([k, v]) =>
          `${JSON.stringify(k)}:${convert(v)}${s.required?.includes(k) ? "" : ".optional()"}`,
      )
      .join(",\n")}})`;
  } else throw Error(JSON.stringify(s));
  return c;
}
mkdirSync("src/features/diet-planning", { recursive: true });
writeFileSync(
  "src/features/diet-planning/schema.generated.ts",
  `// Generated from ${path}.\nimport {z} from 'zod'\n` +
    [["backup", root], ...Object.entries(root.$defs)]
      .map(([name, s]) => `export const ${name}NormativeSchema=${convert(s)}\n`)
      .join(""),
);
mkdirSync("src/content/diet-planning", { recursive: true });
writeFileSync(
  "src/content/diet-planning/reference.json",
  readFileSync(
    "DOCS_for_entire_apppliaction/GYM/Phase_09_Diet_Planning_Reference_Data.json",
  ),
);
