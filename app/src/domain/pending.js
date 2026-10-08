import {matchesScope} from './production-policy.js';
import {evaluateReading} from './limits.js';
import {contextKey} from './context.js';
export function buildPending({pendingBase={},period={},technical=[],productivity={},consultation,actor,asOf=Date.now()}){
 const open=[],checks=[],deviations=[],ctx=consultation?.context??{},eng=['admin','engineer'].includes(actor?.role),op=eng||actor?.role==='operator';
 const add=(rows,kind,row,route,tab,conditions,action=null)=>rows.push({id:kind+':'+row.id,kind,conditions,occurredAt:row.startedAt??row.occurredAt??row.createdAt,context:row.context,route,tab,recordType:kind,recordId:row.id,action});
 for(const s of pendingBase.effective?.stoppages??[])if(s.endedAt==null&&matchesScope(ctx,s.context)){const c=technical.filter(r=>r.kind==='classification'&&r.stopId===s.id).at(-1);add(open,'stoppages',s,'stoppages','open',['Parada em aberto',...(!c?['Classificação pendente']:[])],op?'close-stoppage':null);}
 for(const r of pendingBase.reviews??[])if(['waiting','analyzing'].includes(r.state))add(open,'reviews',r,'engineering','reviews',['Análise '+(r.state==='waiting'?'aguardando':'em andamento')],eng?'review':null);
 for(const r of pendingBase.corrections??[])if(r.state==='waiting')add(open,'corrections',r,'engineering','corrections',['Correção aguardando decisão'],eng&&r.createdBy!==actor.uid?'decide-correction':null);
 for(const r of technical.filter(r=>r.kind==='occurrence'&&matchesScope(ctx,r.context))){const last=technical.filter(x=>x.kind==='occurrence-decision'&&x.occurrenceId===r.id).at(-1);if(last?.decision!=='resolved')add(open,'occurrence',r,'engineering','occurrences',['Ocorrência '+(last?.decision==='analyzing'?'em análise':'aguardando análise')],eng?'decide-occurrence':null);}
 const missingReferences=new Set();
 for(const [id,h]of Object.entries(period.intervalHeaders??{}))if(h.endedAt<=asOf&&matchesScope(ctx,h.context)&&(period.plans??[]).some(p=>p.intervals?.some(i=>i.id===id))){
  const conditions=[];if(!period.closures?.[id])conditions.push('Confirmação pendente');if(!technical.some(r=>r.kind==='inspection'&&r.intervalId===id))conditions.push('Inspeção pendente');
  if(conditions.length)add(checks,'intervals',{...h,id},'production','records',conditions,op?'confirm':null);
  const group=contextKey(h.context);if(!missingReferences.has(group)&&!technical.some(r=>r.kind==='reference'&&matchesScope(r.context,h.context)&&r.effectiveFrom<=h.startedAt)){missingReferences.add(group);add(checks,'reference',{...h,id:group},'indicators',null,['Referência de ciclo ideal pendente'],eng?'reference':null);}
 }
 const diagnostics={'shift-conflict':'turno divergente','shift-required':'turno ausente','time-required':'horário ausente','no-shift-allocation':'quantidade sem detalhamento por turno'};
 for(const [kind,rows]of Object.entries(period.unallocated??{}))for(const row of rows)add(checks,kind,row,'history',kind,['Registro sem alocação: '+row.queryDiagnostics.map(d=>diagnostics[d]??d).join(', ')],null);
 for(const row of period.effective?.collections??[]){const outside=[],invalid=[];
  for(const r of Object.values(row.readings??{})){const result=evaluateReading(r,period.parameterVersions?.[r.versionId]);if(result.state==='outside')outside.push(r.parameterId);else if(result.severity==='data')invalid.push(r.parameterId);}
  if(outside.length)add(deviations,'collections',row,'parameters',null,['Leitura fora da referência: '+outside.join(', ')],null);
  if(invalid.length)add(checks,'collections',row,'history','collections',['Conferir leitura / referência: '+invalid.join(', ')],null);
 }
 for(const s of productivity.segments??[])if(s.state==='final'&&s.percent!=null&&s.percent<s.targetPercent)add(deviations,'productivity',{id:s.intervalId,context:s.context,startedAt:s.from},'production','summary',['Produção abaixo da meta aprovada'],null);
 const sort=(a,b)=>(a.kind==='stoppages'?0:1)-(b.kind==='stoppages'?0:1)||(a.occurredAt??0)-(b.occurredAt??0);
 return {open:open.sort(sort),checks:checks.sort(sort),deviations:deviations.sort(sort),complete:pendingBase.complete===true};
}
