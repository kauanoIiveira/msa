import {nhplCatalog,nhplItems} from '../catalog/nhpl.js';
import {assertRole,requireThat} from '../domain/errors.js';
import {stableStringify} from '../domain/canonical.js';
export function createNhplService({repo,actor}) {
 const compatible=(row,item)=>row?.active===true&&Object.entries(item.payload).every(([k,v])=>stableStringify(row[k])===stableStringify(v));
 async function preview(){const items=[];for(const item of nhplItems){const current=await repo.get(item.kind+'/'+item.id);items.push({...item,status:current?(compatible(current,item)?'existing':'conflict'):'new'});}return {pilot:nhplCatalog,items};}
 return {preview,async install({expectedPreview}={}){
  assertRole(actor,['admin']);const view=await preview();requireThat(!view.items.some(i=>i.status==='conflict'),'CONFLICT');
  if(expectedPreview)requireThat(stableStringify(expectedPreview)===stableStringify(view),'CONFLICT');
  for(const item of view.items)if(item.status==='new')await repo.create(item.kind+'/'+item.id,{...item.payload,id:item.id,active:true,createdBy:actor.uid,createdAt:repo.timestamp()});
  const previous=await repo.get('pilots/nhpl');if(previous){requireThat(previous.machineId===nhplCatalog.machineId&&previous.processId===nhplCatalog.processId,'CONFLICT');return previous;}
  return repo.create('pilots/nhpl',{...structuredClone(nhplCatalog),createdBy:actor.uid,createdAt:repo.timestamp()});
 }};
}
