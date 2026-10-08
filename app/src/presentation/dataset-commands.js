import {createMsaServices} from '../services/create-msa.js';
function resolve(value,results,repo,actor){
  if(Array.isArray(value))return Promise.all(value.map(v=>resolve(v,results,repo,actor)));
  if(value&&typeof value==='object'){
    if(value.$ref)return Promise.resolve(value.path.reduce((node,key)=>node?.[key],results.get(value.$ref)));
    if(value.$ledgerLast)return resolve(value.$ledgerLast,results,repo,actor).then(id=>repo.get(`productionIntervals/${id}`)).then(r=>Object.values(r?.events??{}).sort((a,b)=>a.sequence-b.sequence).at(-1)?.id??null);
    if(value.$coverage)return resolve(value.$coverage,results,repo,actor).then(input=>createMsaServices({repo,actor}).coverage.preview(input)).then(r=>r.recordsFingerprint);
    return Promise.all(Object.entries(value).map(async([k,v])=>[k,await resolve(v,results,repo,actor)])).then(Object.fromEntries);
  }
  return Promise.resolve(value);
}

export async function runPresentationCommands(commands,{repo,actor,clock,onCommand}){
 const results=new Map();
 for(const command of commands){
  onCommand?.(command);let number=0;
  const args=await Promise.all(command.args.map(arg=>resolve(arg,results,repo,actor)));
  const services=createMsaServices({repo,actor,clock,idFactory:()=>command.id+'_'+(++number),enforceOperationalShifts:true});
  const owner=command.service.split('.').reduce((node,key)=>node?.[key],services);
  if(command.service==='presentation'||typeof owner?.[command.method]!=='function')throw new Error('INVALID_COMMAND');
  results.set(command.id,await owner[command.method](...args));
 }
 return results;
}
