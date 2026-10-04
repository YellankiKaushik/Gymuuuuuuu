import {readFileSync} from 'node:fs'
import console from 'node:console'
import process from 'node:process'
const path=process.argv[2],start=Number(process.argv[3]??0),end=Number(process.argv[4]??Infinity),root=JSON.parse(readFileSync(path,'utf8'))
const key=['records','foods','nutrients','identities'].find(key=>Array.isArray(root[key]));if(!key)throw new Error('No recognized record array; inspect this document separately.')
const records=root[key],shared=Object.fromEntries(Object.entries(records[0]??{}).filter(([key,value])=>records.every(record=>JSON.stringify(record[key])===JSON.stringify(value))))
if(start===0){if(process.argv[5]!=='records')console.log(JSON.stringify(Object.fromEntries(Object.entries(root).filter(([field])=>field!==key))));console.log(`Shared values identical in ALL ${records.length} records: ${JSON.stringify(shared)}`)}
records.slice(start,end).forEach((record,index)=>console.log(`${index+start}: ${JSON.stringify(Object.fromEntries(Object.entries(record).filter(([field])=>!(field in shared))))}`))
console.log(`Read ${Math.min(records.length,end)-start} record differences; shared fields plus differences reconstruct all input records without losing values.`)

