import {assertRole,assertId,requireThat,knownKeys} from '../domain/errors.js';
import {loadContext,contextKey} from '../domain/context.js';
import {stableStringify} from '../domain/canonical.js';
import {assertInstant,eventDate} from '../domain/time.js';
import {projectIntervalProduction} from '../repositories/operation-records.js';
import {effectiveRecords} from '../domain/indicators.js';
export function createTechnicalService({repo,actor,clock=Date.now,idFactory=()=>crypto.randomUUID(),operations,plannedProduction}) {
 const write=async(kind,payload,id=idFactory())=>repo.create('technicalRecords/'+assertId(id),{id,kind,...structuredClone(payload),createdBy:actor.uid,createdAt:repo.timestamp(),eventDate:eventDate(payload.occurredAt??payload.effectiveFrom??clock())});
 const editable=()=>assertRole(actor,['admin','engineer','operator']),technical=()=>assertRole(actor,['admin','engineer']);
 const text=(s)=>requireThat(typeof s==='string'&&s.trim().length>0&&s.length<=2000,'VALIDATION');
 async function records(){return Object.values(await repo.get('technicalRecords')??{});}
 return {
  records,
  async reference(payload){technical();knownKeys(payload,['context','idealSeconds','source','effectiveFrom','microStopSeconds','supersedes']);await loadContext(repo,payload.context);text(payload.source);requireThat(Number.isFinite(payload.idealSeconds)&&payload.idealSeconds>0&&payload.idealSeconds<=3600,'INVALID_QUANTITY');requireThat(Number.isSafeInteger(payload.microStopSeconds)&&payload.microStopSeconds>0&&payload.microStopSeconds<=3600,'VALIDATION');assertInstant(payload.effectiveFrom);
   const existing=(await records()).filter(r=>r.kind==='reference'&&contextKey(r.context)===contextKey(payload.context)).sort((a,b)=>a.effectiveFrom-b.effectiveFrom);
   if(existing.length)requireThat(payload.supersedes===existing.at(-1).id&&payload.effectiveFrom>existing.at(-1).effectiveFrom,'CONFLICT');
   else requireThat(!payload.supersedes,'CONFLICT');return write('reference',payload);
  },
  async inspect(payload){editable();knownKeys(payload,['intervalId','firstPassGood','historyComplete','note']);const h=await repo.get('productionIntervals/'+assertId(payload.intervalId));requireThat(h,'NOT_FOUND');requireThat(Number.isSafeInteger(payload.firstPassGood)&&payload.firstPassGood>=0&&typeof payload.historyComplete==='boolean','INVALID_QUANTITY');text(payload.note);
   const rows=effectiveRecords('production',projectIntervalProduction({[payload.intervalId]:h}),Object.values(await repo.get('plannedCorrections')??{}));requireThat(!rows.conflicts.length,'REVISION_CONFLICT');
   const gross=rows.items.filter(r=>r.basis==='gross'),good=rows.items.filter(r=>r.basis==='good');requireThat(gross.length&&good.length&&payload.firstPassGood<=gross.reduce((n,r)=>n+r.quantity,0)&&payload.firstPassGood<=good.reduce((n,r)=>n+r.quantity,0),'INVALID_QUANTITY');
   return write('inspection',{...payload,context:h.context,productionFingerprint:stableStringify(rows.items.map(r=>[r.id,r.quantity,r.correctionId??null]).sort((a,b)=>a[0].localeCompare(b[0])))});},
  async classify(payload){technical();knownKeys(payload,['stopId','category','failure','repairStartedAt','repairEndedAt','note']);const original=await repo.get('stoppages/'+assertId(payload.stopId));requireThat(original,'NOT_FOUND');const stop=effectiveRecords('stoppages',[original],Object.values(await repo.get('corrections')??{})).items[0];requireThat(!stop.revisionConflict,'REVISION_CONFLICT');requireThat(['availability','performance','outside-plan'].includes(payload.category)&&typeof payload.failure==='boolean','VALIDATION');text(payload.note);
   if(payload.failure){assertInstant(payload.repairStartedAt);assertInstant(payload.repairEndedAt);requireThat(payload.repairStartedAt>=stop.startedAt&&payload.repairEndedAt>=payload.repairStartedAt&&payload.repairEndedAt<=(stop.endedAt??clock()),'INVALID_TIME');}
   return write('classification',{...payload,context:stop.context,stopFingerprint:stableStringify([stop.startedAt,stop.endedAt??null,stop.correctionId??null])});},
  async occurrence(payload){editable();knownKeys(payload,['context','type','note','occurredAt']);await loadContext(repo,payload.context);requireThat(['process','quality','maintenance','safety'].includes(payload.type),'VALIDATION');text(payload.note);assertInstant(payload.occurredAt);return write('occurrence',{...payload,state:'waiting'});},
  async decideOccurrence(id,payload){technical();knownKeys(payload,['decision','note']);requireThat(['analyzing','resolved','new-analysis'].includes(payload.decision),'INVALID_TRANSITION');text(payload.note);const original=(await records()).find(r=>r.id===id&&r.kind==='occurrence');requireThat(original,'NOT_FOUND');return write('occurrence-decision',{...payload,occurrenceId:id,context:original.context});},
  async evidence(payload){technical();knownKeys(payload,['reviewId','controlPlan','inspection','testResult','performance','note']);requireThat(await repo.get('reviews/'+assertId(payload.reviewId)),'NOT_FOUND');for(const k of ['controlPlan','inspection','testResult','performance','note'])text(payload[k]);return write('evidence',payload);},
  async ingest(event){editable();knownKeys(event,['schemaVersion','sourceId','eventId','sequence','occurredAt','context','type','state','validated','reasonId','quantity','basis','intervalId','epoch','count','parameterId','versionId','raw']);
   requireThat(event.schemaVersion===1,'EVENT_FORMAT');assertId(event.sourceId);assertId(event.eventId);assertInstant(event.occurredAt);requireThat(event.occurredAt<=clock(),'INVALID_TIME');await loadContext(repo,event.context);
   const all=await records(),events=all.filter(r=>r.kind==='event'&&r.event.sourceId===event.sourceId),prior=events.find(r=>r.event.eventId===event.eventId);
   if(prior){requireThat(stableStringify(prior.event)===stableStringify(event),'EVENT_CONFLICT');return {duplicate:true,id:prior.id};}
   const last=events.sort((a,b)=>a.event.sequence-b.event.sequence).at(-1)?.event;
   requireThat(Number.isSafeInteger(event.sequence)&&event.sequence>0&&(!last||event.sequence>last.sequence&&event.occurredAt>=last.occurredAt),'EVENT_ORDER');
   const ctxSame=!last||contextKey(last.context)===contextKey(event.context);requireThat(ctxSame,'EVENT_CONTEXT');
   const identity='evt_'+event.sourceId+'_'+event.eventId;requireThat(identity.length<=90,'INVALID_REFERENCE');let baseline=false;
   const rows=await repo.get('stoppages')??{},open=Object.values(rows).find(r=>r.id.startsWith('evt_'+event.sourceId+'_')&&r.endedAt==null);
   if(event.type==='state'){
    requireThat(['running','stopped','disconnected'].includes(event.state),'EVENT_FORMAT');
    if(event.state==='stopped'&&!open){const r=await repo.get('stoppages/'+identity);if(!r)await operations.startStoppage({id:identity,context:event.context,startedAt:event.occurredAt,reasonId:assertId(event.reasonId??'nhpl-stop'),planned:false,origin:'import'});}
   }else if(event.type==='good-validated'){
    requireThat(event.validated===true,'QUALITY_REQUIRED');if(open)await operations.closeStoppage(open.id,{endedAt:event.occurredAt,reasonId:open.reasonId,goodValidated:true});
   }else if(event.type==='production'||event.type==='counter'){
    let quantity=event.quantity;
    if(event.type==='counter'){
     assertId(event.epoch);requireThat(Number.isSafeInteger(event.count)&&event.count>=0,'INVALID_QUANTITY');
     const previous=events.filter(r=>r.event.type==='counter'&&r.event.epoch===event.epoch&&r.event.intervalId===event.intervalId&&r.event.basis===event.basis).at(-1)?.event;
     baseline=!previous;quantity=previous?event.count-previous.count:null;requireThat(baseline||quantity>=0,'COUNTER_RESET');
    }
    requireThat((baseline||Number.isSafeInteger(quantity)&&quantity>=0)&&['gross','good'].includes(event.basis),'INVALID_QUANTITY');const header=await repo.get('productionIntervals/'+assertId(event.intervalId));requireThat(header&&contextKey(header.context)===contextKey(event.context),'EVENT_CONTEXT');
    if(!baseline&&!Object.values(header.events??{}).some(r=>r.clientId===identity))await plannedProduction.record(event.intervalId,{id:identity,quantity,basis:event.basis,startedAt:Math.max(header.startedAt,last?.occurredAt??header.startedAt),endedAt:Math.min(header.endedAt,event.occurredAt),origin:'import'});
   }else if(event.type==='measurement'){
    if(!await repo.get('collections/'+identity))await operations.recordCollection({id:identity,context:event.context,occurredAt:event.occurredAt,origin:'import',readings:[{parameterId:event.parameterId,versionId:event.versionId,raw:event.raw}]});
   }else requireThat(false,'EVENT_FORMAT');
   // Persist the receipt after its deterministic side effect; a retry reconciles that effect first.
   return write('event',{event,context:event.context,occurredAt:event.occurredAt,gap:Boolean(last&&event.sequence>last.sequence+1),baseline},identity);
  }
 };
}
