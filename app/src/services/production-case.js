import {assertId,assertRole,knownKeys,requireThat} from '../domain/errors.js';
import {loadContext} from '../domain/context.js';
import {matchesScope} from '../domain/production-policy.js';
import {shiftAt,normalizeShift} from '../domain/shifts.js';
import {validateProductionCase,productionCaseContext} from '../domain/production-case.js';
export function createProductionCaseService({repo,actor,idFactory=()=>crypto.randomUUID()}) {
 const reader=()=>assertRole(actor,['admin','engineer','operator','viewer']);
 const stamp=(input)=>({...input,id:assertId(idFactory()),createdBy:actor.uid,createdAt:repo.timestamp()});
 async function legacy() {
  const rows=Object.values(await repo.get('production')??{}),out=[];
  for(const row of rows) {
   if(!row.context?.order||!row.context?.lot||!normalizeShift(row.context.shift)||!Number.isSafeInteger(row.startedAt)||!Number.isSafeInteger(row.endedAt)||row.endedAt<=row.startedAt)continue;
   try{await loadContext(repo,row.context);}catch{continue;}
   const {recipe,...ctx}=row.context;
   out.push({...ctx,id:'legacy_'+row.id,recipeVersionId:recipe,operationalDate:shiftAt(row.startedAt).operationalDate,startedAt:row.startedAt,endedAt:row.endedAt,status:'closed',legacy:true,sourceRecordId:row.id});
  }
  return out;
 }
 const recipes={
  async list(){reader();return Object.values(await repo.get('recipeVersions')??{});},
  async create(input){
   assertRole(actor,['admin','engineer']);knownKeys(input,['recipeId','productId','processId','label','material','thicknessMm','settings','source','status','supersedes']);
   for(const key of ['recipeId','productId','processId'])assertId(input[key],key);
   const process=await repo.get('processes/'+input.processId),product=await repo.get('products/'+input.productId);
   requireThat(process?.active===true&&product?.active===true&&product.processIds?.[input.processId]===true,'CONTEXT_MISMATCH');
   for(const key of ['label','source'])requireThat(typeof input[key]==='string'&&input[key].trim()&&input[key].length<=(key==='source'?2000:160),'VALIDATION',key);
   requireThat(['draft','approved'].includes(input.status),'VALIDATION','status');
   knownKeys(input.settings??{},Object.keys(input.settings??{}));requireThat(Object.keys(input.settings??{}).length<=100,'VALIDATION','settings');
   for(const [key,value]of Object.entries(input.settings??{})){assertId(key);requireThat(typeof value==='string'&&value.length<=100||typeof value==='number'&&Number.isFinite(value),'VALIDATION','settings');}
   if(input.material!=null)requireThat(typeof input.material==='string'&&input.material.trim()&&input.material.length<=160,'VALIDATION','material');
   if(input.thicknessMm!=null)requireThat(Number.isFinite(input.thicknessMm)&&input.thicknessMm>0,'INVALID_UNIT');
   if(input.supersedes){const previous=await repo.get('recipeVersions/'+assertId(input.supersedes));requireThat(previous?.recipeId===input.recipeId&&previous.productId===input.productId&&previous.processId===input.processId,'CONTEXT_MISMATCH');}
   const row=stamp({...input,settings:structuredClone(input.settings??{})});return repo.create('recipeVersions/'+row.id,row);
  }
 };
 async function list(query={}){
  reader();knownKeys(query,['context','fromDate','toDate','status']);
  const registered=Object.values(await repo.get('productionCases')??{}),rows=[...registered];
  for(const row of await legacy())if(!registered.some(r=>r.machineId===row.machineId&&r.order===row.order&&r.lot===row.lot&&r.startedAt===row.startedAt))rows.push(row);
  return {items:rows.filter(r=>matchesScope(query.context??{},productionCaseContext(r))&&(!query.fromDate||r.operationalDate>=query.fromDate)&&(!query.toDate||r.operationalDate<=query.toDate)&&(!query.status||r.status===query.status)).sort((a,b)=>b.startedAt-a.startedAt||a.id.localeCompare(b.id)),complete:true};
 }
 return {recipes,list,
  async create(input){assertRole(actor,['admin','engineer','operator']);const value=validateProductionCase(input);await loadContext(repo,productionCaseContext(value));
   if(value.recipeVersionId){const recipe=await repo.get('recipeVersions/'+value.recipeVersionId);requireThat(recipe?.productId===value.productId&&recipe.processId===value.processId,'CONTEXT_MISMATCH');}
   const row=stamp(value);return repo.create('productionCases/'+row.id,row);
  },
  async context(id){reader();assertId(id);const row=id.startsWith('legacy_')?(await legacy()).find(r=>r.id===id):await repo.get('productionCases/'+id);requireThat(row,'NOT_FOUND');return loadContext(repo,productionCaseContext(row));}
 };
}
