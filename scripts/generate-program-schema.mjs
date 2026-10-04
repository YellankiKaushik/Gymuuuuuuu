import console from 'node:console'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
const sourcePath = 'DOCS_for_entire_apppliaction/GYM/Phase_05_Workout_Program_Data_Schema.json'
const root = JSON.parse(readFileSync(sourcePath, 'utf8'))
const quote = JSON.stringify
function convert(schema, path = '') {
  if (schema.$ref) { const key = schema.$ref.replace('#/$defs/', ''); if (!root.$defs[key]) throw new Error(`Unresolved reference ${schema.$ref}`); return convert(root.$defs[key], path) }
  if (schema.const !== undefined) return `z.literal(${quote(schema.const)})`
  if (schema.enum) return `z.enum(${quote(schema.enum)})`
  if (schema.oneOf) return `z.union([${schema.oneOf.map((item) => convert(item, path)).join(',')}])`
  if (Array.isArray(schema.type)) { const nonNull = schema.type.filter((type) => type !== 'null'); if (nonNull.length !== 1) throw new Error(`Unsupported union at ${path}`); return `${convert({ ...schema, type: nonNull[0] }, path)}.nullable()` }
  let value
  if (schema.type === 'string') {
    value = 'z.string()'
    if (schema.minLength !== undefined) value += `.min(${schema.minLength})`
    if (schema.maxLength !== undefined) value += `.max(${schema.maxLength})`
    // Supplied semantic-version regex is double escaped; preserve other patterns.
    const pattern = path.split('.').at(-1) === 'version' ? schema.pattern?.split(String.raw`\\.`).join(String.raw`\.`) : schema.pattern
    if (pattern) value += `.regex(new RegExp(${quote(pattern)}))`
    if (schema.format === 'date') value += '.refine((value) => z.iso.date().safeParse(value).success, "Invalid date")'
    if (schema.format === 'uri') value += '.refine((value) => z.url().safeParse(value).success && ["http:", "https:"].includes(new URL(value).protocol), "Invalid HTTP(S) URL")'
  } else if (schema.type === 'integer' || schema.type === 'number') {
    value = 'z.number().finite()'
    if (schema.type === 'integer') value += '.int()'
    if (schema.minimum !== undefined) value += `.min(${schema.minimum})`
    if (schema.maximum !== undefined) value += `.max(${schema.maximum})`
  } else if (schema.type === 'boolean') value = 'z.boolean()'
  else if (schema.type === 'null') value = 'z.null()'
  else if (schema.type === 'array') {
    value = `z.array(${convert(schema.items, `${path}[]`)})`
    if (schema.minItems !== undefined) value += `.min(${schema.minItems})`
    if (schema.maxItems !== undefined) value += `.max(${schema.maxItems})`
    if (schema.uniqueItems) value += '.refine((items) => new Set(items.map((item) => JSON.stringify(item))).size === items.length, "Duplicate array value")'
  } else if (schema.type === 'object') {
    if (schema.additionalProperties !== false) throw new Error(`Object needs explicit handling at ${path}`)
    value = `z.strictObject({${Object.entries(schema.properties).map(([key, property]) => `${quote(key)}:${convert(property, path ? `${path}.${key}` : key)}${schema.required?.includes(key) ? '' : '.optional()'}`).join(',\n')}})`
  } else throw new Error(`Unsupported schema at ${path}: ${quote(schema)}`)
  return value
}
let code = `// Generated from ${sourcePath}. Regenerate with node scripts/generate-program-schema.mjs.\nimport { z } from 'zod'\n\n`
code += `export const normativeProgramSchema = ${convert(root)}.superRefine((record,ctx)=>{\n`
for (const clause of root.allOf) {
  const predicate = Object.entries(clause.if.properties).map(([key, condition]) => `record[${quote(key)}] === ${quote(condition.const)}`).join(' && ')
  code += `if(${predicate}){\n`
  for (const key of clause.then.required ?? []) code += `if(record[${quote(key)}] === undefined)ctx.addIssue({code:'custom',path:[${quote(key)}],message:'Required by conditional schema'});\n`
  for (const [key, constraints] of Object.entries(clause.then.properties ?? {})) if (constraints.minItems) code += `if(Array.isArray(record[${quote(key)}]) && record[${quote(key)}]!.length < ${constraints.minItems})ctx.addIssue({code:'custom',path:[${quote(key)}],message:'Insufficient publication items'});\n`
  code += '}\n'
}
code += '})\nexport type Program = z.infer<typeof normativeProgramSchema>\n'
mkdirSync('src/features/programs', { recursive: true })
writeFileSync('src/features/programs/schema.generated.ts', code)
console.log('Generated all Phase 05 schema fields, references, enums, required fields and conditionals.')

