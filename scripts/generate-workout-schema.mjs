import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const path =
    "DOCS_for_entire_apppliaction/GYM/Phase_06_Workout_Tracker_Data_Schema.json",
  root = JSON.parse(readFileSync(path, "utf8"));
function convert(schema) {
  if (schema.$ref)
    return convert(root.$defs[schema.$ref.slice("#/$defs/".length)]);
  if ("const" in schema) return `z.literal(${JSON.stringify(schema.const)})`;
  if (schema.enum)
    return schema.enum.every((item) => typeof item === "string")
      ? `z.enum(${JSON.stringify(schema.enum)})`
      : `z.union([${schema.enum.map((item) => `z.literal(${JSON.stringify(item)})`).join(",")}])`;
  if (schema.oneOf) return `z.union([${schema.oneOf.map(convert).join(",")}])`;
  if (Array.isArray(schema.type))
    return `${convert({ ...schema, type: schema.type.find((type) => type !== "null") })}.nullable()`;
  let code;
  if (schema.type === "string") {
    code = "z.string()";
    if (schema.minLength !== undefined) code += `.min(${schema.minLength})`;
    if (schema.maxLength !== undefined) code += `.max(${schema.maxLength})`;
    if (schema.pattern)
      code += `.regex(new RegExp(${JSON.stringify(schema.pattern)}))`;
    if (schema.format === "date-time")
      code +=
        '.refine(value=>z.iso.datetime({offset:true}).safeParse(value).success,"Invalid timestamp")';
    if (schema.format === "date")
      code +=
        '.refine(value=>z.iso.date().safeParse(value).success,"Invalid date")';
  } else if (["integer", "number"].includes(schema.type)) {
    code = "z.number().finite()";
    if (schema.type === "integer") code += ".int()";
    if (schema.minimum !== undefined) code += `.min(${schema.minimum})`;
    if (schema.maximum !== undefined) code += `.max(${schema.maximum})`;
  } else if (schema.type === "boolean") code = "z.boolean()";
  else if (schema.type === "null") code = "z.null()";
  else if (schema.type === "array") {
    code = `z.array(${convert(schema.items)})`;
    if (schema.uniqueItems)
      code +=
        '.refine(items=>new Set(items.map(item=>JSON.stringify(item))).size===items.length,"Duplicate array value")';
  } else if (schema.type === "object") {
    if (schema.additionalProperties !== false)
      throw new Error("Unbounded object");
    code = `z.strictObject({${Object.entries(schema.properties)
      .map(
        ([key, value]) =>
          `${JSON.stringify(key)}:${convert(value)}${schema.required?.includes(key) ? "" : ".optional()"}`,
      )
      .join(",\n")}})`;
  } else throw new Error(JSON.stringify(schema));
  return code;
}
let code = `// Generated from ${path}; do not hand edit.\nimport {z} from 'zod'\n`;
for (const key of [
  "workoutPreferences",
  "programTrackingState",
  "customExercise",
  "workoutSet",
  "workoutExercise",
  "workoutSession",
  "performance",
  "effort",
])
  code += `export const ${key}NormativeSchema=${convert(root.$defs[key])}\nexport type ${key[0].toUpperCase() + key.slice(1)}=z.infer<typeof ${key}NormativeSchema>\n`;
code += `export const workoutBackupNormativeSchema=${convert(root)}\nexport type WorkoutBackup=z.infer<typeof workoutBackupNormativeSchema>\n`;
mkdirSync("src/features/workout-tracker", { recursive: true });
writeFileSync("src/features/workout-tracker/schema.generated.ts", code);
