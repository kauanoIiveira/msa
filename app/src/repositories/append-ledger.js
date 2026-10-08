import {assertId,requireThat} from '../domain/errors.js';
import {stableStringify} from '../domain/canonical.js';
export function ledgerView(header,{maxEvents=1000}={}) {
 requireThat(header?.firstSlotId,'NOT_FOUND');const events=[],seen=new Set();let slot=header.firstSlotId,previous=null;
 while(header.events?.[slot]) {
  requireThat(!seen.has(slot),'REVISION_CONFLICT');seen.add(slot);const event=header.events[slot];
  requireThat(event.id===slot&&event.sequence===events.length+1&&(event.previousEventId??null)===(previous?.id??null),'REVISION_CONFLICT');
  events.push(event);if(events.length>=maxEvents&&event.nextSlotId&&header.events?.[event.nextSlotId])return {header,events,last:event,complete:false};
  previous=event;slot=event.nextSlotId;if(!slot)break;
 }
 const complete=events.length===Object.keys(header.events??{}).length;
 return {header,events,last:events.at(-1)??null,complete};
}
export async function readLedger(repo,path,options){return ledgerView(await repo.get(path),options);}
export async function initLedger(repo,path,metadata,{actor,idFactory=()=>crypto.randomUUID()}={}){
 const compatible=header=>{requireThat(Object.entries(metadata).every(([k,v])=>stableStringify(header?.[k])===stableStringify(v)),'CONFLICT');return header;};
 const existing=await repo.get(path);if(existing)return compatible(existing);
 const header={...metadata,firstSlotId:assertId(idFactory()),createdBy:actor.uid,createdAt:repo.timestamp()};
 try{return await repo.create(path,header);}catch(error){if(error.code!=='CONFLICT')throw error;return compatible(await repo.get(path));}
}
export async function appendLedgerEvent(repo,path,{expectedEventId,event,terminal=false},{idFactory=()=>crypto.randomUUID()}={}){
 const view=await readLedger(repo,path);requireThat(view.complete,'INCOMPLETE_DATA');requireThat((view.last?.id??null)===(expectedEventId??null),'CONFLICT');requireThat(!view.last||view.last.nextSlotId,'CORRECTION_REQUIRED');
 const id=assertId(view.last?.nextSlotId??view.header.firstSlotId);
 return repo.create(path+'/events/'+id,{...event,id,sequence:view.events.length+1,...(view.last?{previousEventId:view.last.id}:{}),...(!terminal?{nextSlotId:assertId(idFactory())}:{})});
}
