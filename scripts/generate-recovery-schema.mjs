import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const path =
  "DOCS_for_entire_apppliaction/GYM/Phase_12_Recovery_Sleep_Mobility_Data_Schema.json";
const root = JSON.parse(readFileSync(path, "utf8"));
function convert(s) {
  if (s.$ref) return convert(root.$defs[s.$ref.slice(8)]);
  if (s.anyOf) return `z.union([${s.anyOf.map(convert).join(",")}])`;
  if (s.const !== undefined) return `z.literal(${JSON.stringify(s.const)})`;
  if (s.enum) return `z.enum(${JSON.stringify(s.enum)})`;
  if (Array.isArray(s.type))
    return `${convert({ ...s, type: s.type.find((t) => t !== "null") })}.nullable()`;
  if (s.type === "null") return "z.null()";
  if (s.type === "boolean") return "z.boolean()";
  let c;
  if (s.type === "string") {
    c = "z.string()";
    for (const [key, fn] of [
      ["minLength", "min"],
      ["maxLength", "max"],
    ])
      if (s[key] !== undefined) c += `.${fn}(${s[key]})`;
    if (s.pattern) c += `.regex(new RegExp(${JSON.stringify(s.pattern)}))`;
    if (s.format === "date-time")
      c +=
        '.refine(v=>z.iso.datetime({offset:true}).safeParse(v).success,"Invalid timestamp")';
    if (s.format === "date")
      c += '.refine(v=>z.iso.date().safeParse(v).success,"Invalid date")';
  } else if (s.type === "number" || s.type === "integer") {
    c = "z.number().finite()";
    if (s.type === "integer") c += ".int()";
    for (const [key, fn] of [
      ["minimum", "min"],
      ["maximum", "max"],
      ["exclusiveMinimum", "gt"],
    ])
      if (s[key] !== undefined) c += `.${fn}(${s[key]})`;
  } else if (s.type === "array")
    c = `z.array(${convert(s.items)})${s.minItems !== undefined ? `.min(${s.minItems})` : ""}${s.maxItems !== undefined ? `.max(${s.maxItems})` : ""}`;
  else if (s.type === "object")
    c = s.properties
      ? `z.strictObject({${Object.entries(s.properties)
          .map(
            ([k, v]) =>
              `${JSON.stringify(k)}:${convert(v)}${s.required?.includes(k) ? "" : ".optional()"}`,
          )
          .join(",")}})`
      : "z.record(z.string(),z.json())";
  else c = "z.json()";
  return c;
}
mkdirSync("src/features/recovery", { recursive: true });
writeFileSync(
  "src/features/recovery/schema.generated.ts",
  `// Generated from ${path}; behavioral companions live in schema.ts.\nimport {z} from 'zod';\n` +
    [["backup", root], ...Object.entries(root.$defs)]
      .map(
        ([name, s]) => `export const ${name}NormativeSchema=${convert(s)};\n`,
      )
      .join(""),
);
mkdirSync("src/content/recovery", { recursive: true });
const reference = JSON.parse(
  readFileSync(
    "DOCS_for_entire_apppliaction/GYM/Phase_12_Recovery_Sleep_Mobility_Reference_Data.json",
    "utf8",
  ),
);
delete reference.testVectors;
writeFileSync(
  "src/content/recovery/reference.json",
  JSON.stringify(reference, null, 2) + "\n",
);
