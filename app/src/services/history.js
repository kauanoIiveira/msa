import {requireThat,knownKeys,assertId} from '../domain/errors.js';
import {validateDate} from '../domain/time.js';
import {effectiveRecords} from '../domain/indicators.js';
import {projectIntervalProduction} from '../repositories/operation-records.js';
import {ledgerView} from '../repositories/append-ledger.js';
import {normalizeCorrection} from '../domain/review.js';
const kinds=['collections','production','stoppages','losses','reviews','corrections'];
const operations=['collections','production','stoppages','losses'];
const included=(row,dataset)=>!dataset||dataset==='all'||(dataset==='presentation'?row.origin==='demo':row.origin!=='demo');
const matches=(row,context)=>!context||Object.entries(context).every(([key,value])=>row.context?.[key]===value);
export function createHistoryService({repo}) {
  function validate(kind,q={}) {
    requireThat(kinds.includes(kind),'INVALID_KIND');knownKeys(q,['fromDate','toDate','limit','cursor','context','maxPages','dataset']);
    if(q.dataset!=null)requireThat(['all','operational','presentation'].includes(q.dataset),'INVALID_QUERY','dataset');
    if(q.fromDate) validateDate(q.fromDate);if(q.toDate) validateDate(q.toDate);
    requireThat(!q.fromDate||!q.toDate||q.fromDate<=q.toDate,'INVALID_PERIOD');
    if(q.limit!=null) requireThat(Number.isInteger(q.limit)&&q.limit>0&&q.limit<=500,'INVALID_QUERY');
    if(q.cursor) {validateDate(q.cursor.date);assertId(q.cursor.key);requireThat((!q.fromDate||q.cursor.date>=q.fromDate)&&(!q.toDate||q.cursor.date<=q.toDate),'INVALID_QUERY');}
    if(q.context) {knownKeys(q.context,['machineId','processId','productId','recipe','lot','order','shift','variant']);for(const key of ['machineId','processId','productId']) if(q.context[key]) assertId(q.context[key]);}
    return q;
  }
  const filtered=async(page,q,kind)=>{
    const selected=await Promise.all(page.items.map(async entry=>{
      const row=kind==='corrections'?normalizeCorrection(entry):entry;
      if(kind==='corrections'||kind==='reviews'){
        if(!q.context&&(!q.dataset||q.dataset==='all'))return row;
        const type=kind==='reviews'?'collections':row.recordType,id=kind==='reviews'?row.collectionId:row.recordId;
        if(!operations.includes(type)||!id)return null;
        const original=await repo.get(`${type}/${assertId(id)}`);
        return original&&matches(original,q.context)&&included(original,q.dataset)?row:null;
      }
      return matches(row,q.context)&&included(row,q.dataset)?row:null;
    }));
    return {...page,items:selected.filter(Boolean)};
  };
  return {
    async list(kind,q={}) {validate(kind,q);return filtered(await repo.list(kind,q),q,kind);},
    watch(kind,q,onNext,onError) {
      validate(kind,q);let active=true,revision=0;
      const off=repo.watch(kind,q,page=>{const ticket=++revision;filtered(page,q,kind).then(result=>{if(active&&ticket===revision)onNext(result);}).catch(error=>{if(active)onError?.(error);});},onError);
      return()=>{active=false;off();};
    },
    async loadPeriod(q) {
      validate('collections',q);const maxPages=q.maxPages??20;requireThat(Number.isInteger(maxPages)&&maxPages>=1&&maxPages<=100,'INVALID_QUERY');
      const result={complete:true,coverage:{},notes:[]};
      for(const kind of kinds) {
        let cursor=null,done=false;const rows=[];
        // Scan earlier interval starts and correction requests, otherwise a date filter hides carry-over records.
        const allEarlier=['stoppages','production','corrections'].includes(kind);
        for(let page=0;page<maxPages&&!done;page++) {
          const current=await this.list(kind,{...q,dataset:undefined,...(allEarlier?{fromDate:undefined}:{}),context:kind==='corrections'?undefined:q.context,cursor});
          rows.push(...current.items);done=current.complete;cursor=current.nextCursor;
          if(!done&&!cursor) break;
        }
        result[kind]=rows;result.coverage[kind]=done;if(!done) {result.complete=false;result.notes.push(`page-cap:${kind}`);}
      }
      result.parameterVersions=await repo.get('parameterVersions')??{};result.targets=Object.values(await repo.get('targets')??{});
      result.nhplComplete=true;
      const optional=async path=>{try{return await repo.get(path)??{};}catch(error){if(error.code!=='FORBIDDEN')throw error;result.nhplComplete=false;return {};}};
      result.pilot=await optional('pilots/nhpl');result.intervalHeaders=await optional('productionIntervals');
      try{result.coverageWitnesses=Object.values(await repo.get('coverageWitnesses')??{});result.coverageWitnessesAvailable=true;}
      catch(error){if(!['FORBIDDEN','INVALID_PATH'].includes(error.code))throw error;result.coverageWitnesses=[];result.coverageWitnessesAvailable=false;}
      result.policies=[];result.plans=[];result.closures={};result.runs=[];result.retiredIntervals=[];
      const readChains=(headers,key)=>{for(const header of Object.values(headers)){try{const chain=ledgerView(header);result.nhplComplete&&=chain.complete;result[key].push(...chain.events);}catch{result.nhplComplete=false;}}};
      readChains(await optional('productionPolicies'),'policies');readChains(await optional('productionPlans'),'plans');readChains(await optional('machineRuns'),'runs');
      for(const [id,header] of Object.entries(result.intervalHeaders)){try{const chain=ledgerView(header);result.nhplComplete&&=chain.complete;if(!chain.complete){delete result.intervalHeaders[id];continue;}if(chain.last?.kind==='closure')result.closures[id]=chain.last;if(chain.last?.kind==='retire')result.retiredIntervals.push(id);}catch{result.nhplComplete=false;delete result.intervalHeaders[id];}}
      const projected=projectIntervalProduction(result.intervalHeaders).filter(r=>matches(r,q.context)&&(!q.toDate||r.eventDate<=q.toDate));
      result.production.push(...projected);const plannedCorrections=Object.values(await optional('plannedCorrections'));
      result.corrections.push(...plannedCorrections.filter(c=>projected.some(r=>r.id===c.recordId)));
      result.targetRevisions=await optional('targetRevisions');
      result.targets=result.targets.flatMap(target=>{const revisions=result.targetRevisions[target.id];if(!revisions)return [target];try{const view=ledgerView(revisions);if(!view.complete){result.nhplComplete=false;return [target];}const applicable=view.events.filter(r=>r.fromDate<=q.fromDate&&r.toDate>=q.toDate).at(-1);return [applicable?{...target,...applicable,id:target.id,revisionId:applicable.id}:target];}catch{result.nhplComplete=false;return [target];}});
      result.excludedPresentationCount=operations.reduce((n,kind)=>n+result[kind].filter(r=>r.origin==='demo'&&!included(r,q.dataset)).length,0);
      for(const kind of operations)result[kind]=result[kind].filter(r=>included(r,q.dataset));
      if(q.dataset&&q.dataset!=='all') {
        result.reviews=result.reviews.filter(r=>result.collections.some(c=>c.id===r.collectionId));
        result.corrections=result.corrections.filter(r=>operations.includes(r.recordType)&&result[r.recordType].some(original=>original.id===r.recordId));
      }
      result.effective={};
      for(const kind of ['collections','production','losses','stoppages']) {
        const effective=effectiveRecords(kind,result[kind],result.corrections);result.effective[kind]=effective.items;
        if(effective.conflicts.length) {result.complete=false;result.notes.push(`revision-conflict:${kind}`);}
      }
      return result;
    }
  };
}
