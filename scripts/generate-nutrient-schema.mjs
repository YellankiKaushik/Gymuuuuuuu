import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
const path='DOCS_for_entire_apppliaction/GYM/Phase_08_Nutrient_Data_Schema.json',root=JSON.parse(readFileSync(path,'utf8'))
function convert(s){
  if(s.$ref)return convert(root.$defs[s.$ref.slice(8)])
  if(s.anyOf)return `z.union([${s.anyOf.map(convert).join(',')}])`
  if(s.enum)return `z.enum(${JSON.stringify(s.enum)})`
  if(Array.isArray(s.type))return `${convert({...s,type:s.type.find(t=>t!=='null')})}.nullable()`
  let c
  if(s.type==='null')c='z.null()'
  else if(s.type==='string'){c='z.string()';if(s.minLength!==undefined)c+=`.min(${s.minLength})`;if(s.maxLength!==undefined)c+=`.max(${s.maxLength})`;if(s.pattern)c+=`.regex(new RegExp(${JSON.stringify(s.pattern)}))`;if(s.format==='date')c+='.refine(v=>z.iso.date().safeParse(v).success,"Invalid date")'}
  else if(['integer','number'].includes(s.type)){c='z.number().finite()';if(s.type==='integer')c+='.int()';if(s.minimum!==undefined)c+=`.min(${s.minimum})`;if(s.maximum!==undefined)c+=`.max(${s.maximum})`}
  else if(s.type==='array'){c=`z.array(${convert(s.items)})`;if(s.minItems!==undefined)c+=`.min(${s.minItems})`;if(s.uniqueItems)c+='.refine(v=>new Set(v.map(i=>JSON.stringify(i))).size===v.length,"Duplicate array value")'}
  else if(s.type==='object'){if(s.additionalProperties!==false)throw Error('Unbounded object');c=`z.strictObject({${Object.entries(s.properties).map(([k,v])=>`${JSON.stringify(k)}:${convert(v)}${s.required?.includes(k)?'':'.optional()'}`).join(',\n')}})`}
  else throw Error(JSON.stringify(s));return c
}
mkdirSync('src/features/nutrients',{recursive:true});mkdirSync('src/content/nutrients/topics',{recursive:true})
let code=`// Generated from ${path}; do not hand edit.\nimport {z} from 'zod'\n`
for(const [name,s]of [['nutrient',root],...Object.entries(root.$defs)])code+=`export const ${name}NormativeSchema=${convert(s)}\n`
writeFileSync('src/features/nutrients/schema.generated.ts',code)
const seed=JSON.parse(readFileSync('DOCS_for_entire_apppliaction/GYM/Phase_08_Seed_Nutrient_Taxonomy.json','utf8'))
writeFileSync('src/content/nutrients/reference.json',JSON.stringify(seed.referenceData,null,2)+'\n');writeFileSync('src/content/nutrients/identities.json',JSON.stringify(seed.nutrients,null,2)+'\n')
try{readFileSync('src/content/nutrients/records.json')}catch{writeFileSync('src/content/nutrients/records.json','[]\n')}
