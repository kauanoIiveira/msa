import {assertRole,assertId,knownKeys,requireThat} from '../domain/errors.js';
import {assertPeriod} from '../domain/time.js';
import {loadContext,contextKey} from '../domain/context.js';
import {effectiveRecords} from '../domain/indicators.js';
import {coverageFingerprint,classificationsComplete,evaluateCoverage} from '../domain/coverage.js';
export function createCoverageService({repo,actor,idFactory=()=>crypto.randomUUID()}) {
 async function records(){return {stops:effectiveRecords('stoppages',Object.values(await repo.get('stoppages')??{}),Object.values(await repo.get('corrections')??{})).items,classifications:Object.values(await repo.get('technicalRecords')??{}).filter(r=>r.kind==='classification')};}
 return {
  async preview(input){assertRole(actor,['admin','engineer','operator']);const context=await loadContext(repo,input.context);assertPeriod(input.startedAt,input.endedAt);const data={...input,context,...await records()};return {recordsFingerprint:coverageFingerprint(data),classified:classificationsComplete(data)};},
  async confirm(input){
   assertRole(actor,['admin','engineer','operator']);knownKeys(input,['context','startedAt','endedAt','complete','evidence','recordsFingerprint','supersedes']);
   requireThat(typeof input.complete==='boolean'&&typeof input.evidence==='string'&&input.evidence.trim().length>0&&input.evidence.length<=2000,'VALIDATION');
   const current=await this.preview(input);requireThat(input.recordsFingerprint===current.recordsFingerprint,'COVERAGE_CHANGED');requireThat(!input.complete||current.classified,'COVERAGE_INCOMPLETE');
   if(input.supersedes){const previous=await repo.get('coverageWitnesses/'+assertId(input.supersedes));requireThat(previous&&contextKey(previous.context)===contextKey(input.context)&&previous.startedAt===input.startedAt&&previous.endedAt===input.endedAt,'INVALID_REFERENCE');}
   const existing=Object.values(await repo.get('coverageWitnesses')??{}).filter(w=>contextKey(w.context)===contextKey(input.context)&&w.startedAt===input.startedAt&&w.endedAt===input.endedAt);
   if(existing.length)requireThat(input.supersedes&&existing.some(w=>w.id===input.supersedes),'COVERAGE_REVISION_REQUIRED');
   const id=assertId(idFactory()),row={...input,id,context:await loadContext(repo,input.context),createdBy:actor.uid,createdAt:repo.timestamp()};
   return repo.create('coverageWitnesses/'+id,row);
  },
  async evaluate(input){assertRole(actor,['admin','engineer','operator','viewer']);return evaluateCoverage({...input,...await records(),witnesses:Object.values(await repo.get('coverageWitnesses')??{})});}
 };
}
