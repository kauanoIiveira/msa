import {assertRole,assertId,requireThat,knownKeys} from '../domain/errors.js';
import {loadContext} from '../domain/context.js';
import {initLedger,readLedger,appendLedgerEvent} from '../repositories/append-ledger.js';
const fields=['machineStartedAt','productionStartedAt','productionEndedAt','machineEndedAt'];
export function createMachineRunService({repo,actor,clock=Date.now,idFactory=()=>crypto.randomUUID()}) {
 const options={actor,idFactory},allowed=()=>assertRole(actor,['admin','engineer','operator']);
 const instant=value=>requireThat(Number.isSafeInteger(value)&&value>=0&&value<=clock(),'INVALID_TIME');
 return {
  async start(payload){allowed();knownKeys(payload,['context','machineStartedAt']);const context=await loadContext(repo,payload.context);requireThat(context.machineId==='nhpl','INVALID_REFERENCE');instant(payload.machineStartedAt);
   const runId=assertId(idFactory()),path='machineRuns/'+runId;
   await initLedger(repo,path,{context,runId},options);
   return appendLedgerEvent(repo,path,{expectedEventId:null,event:{kind:'run',runId,context,machineStartedAt:payload.machineStartedAt,createdBy:actor.uid,createdAt:repo.timestamp()}},options);
  },
  async advance(runId,payload){allowed();knownKeys(payload,['expectedRevision',...fields.slice(1)]);const path='machineRuns/'+assertId(runId),view=await readLedger(repo,path);
   requireThat(view.complete&&view.last,'INCOMPLETE_DATA');const previous=view.last,index=fields.findIndex(field=>previous[field]==null);
   requireThat(index>0,'INVALID_TRANSITION');const field=fields[index];requireThat(Object.keys(payload).filter(k=>k!=='expectedRevision').length===1&&payload[field]!=null,'INVALID_TRANSITION');instant(payload[field]);requireThat(payload[field]>=previous[fields[index-1]],'INVALID_TIME');
   const times=Object.fromEntries(fields.filter(f=>previous[f]!=null).map(f=>[f,previous[f]]));
   return appendLedgerEvent(repo,path,{expectedEventId:payload.expectedRevision,event:{kind:'run',runId,context:view.header.context,...times,[field]:payload[field],createdBy:actor.uid,createdAt:repo.timestamp()},terminal:index===3},options);
  }
 };
}
