import {resolvePolicy,matchesScope} from './production-policy.js';
import {latestPlans,conflictingPlans,netSeconds} from './planning.js';
export function buildProductivity(data,{context,from,to,now=Date.now(),coverage={complete:true},mode='manual'}) {
 const plans=latestPlans(data.plans??[]).filter(p=>matchesScope(context,p.context)&&p.startedAt<to&&p.endedAt>from),segments=[];
 const planConflicts=conflictingPlans(latestPlans(data.plans??[]));
 for(const plan of plans)for(const interval of plan.intervals){
  if(interval.startedAt>=to||interval.endedAt<=from)continue;
  const start=Math.max(from,interval.startedAt),end=Math.min(to,interval.endedAt),policy=resolvePolicy(data.policies??[],{context:plan.context,from:start,to:end});
  const policyRows=policy.segments.length?policy.segments:[{from:start,to:end,value:null,id:null}];
  for(const target of policyRows){
   const rows=(data.production??[]).filter(r=>r.intervalId===interval.id&&r.planRevisionId===plan.id&&matchesScope(plan.context,r.context));const gross=rows.filter(r=>r.basis==='gross'),good=rows.filter(r=>r.basis==='good');const closed=data.closures?.[interval.id];
   const whole=target.from===interval.startedAt&&target.to===interval.endedAt;
   const pieces=gross.length?gross.reduce((s,r)=>s+r.quantity,0):null;
   const programmed=interval.startedAt>=now,open=interval.endedAt>now;
   const duration=netSeconds(plan,interval.startedAt,interval.endedAt),elapsed=netSeconds(plan,interval.startedAt,Math.min(now,interval.endedAt));
   let state=programmed?'programmed':open?'partial':closed?'final':'unavailable',reason=programmed?'future':open?'awaiting-update':closed?null:'confirmation-required';
   if(!coverage.complete||data.coverage?.complete===false||planConflicts.some(r=>r.planId===plan.planId)||policy.conflicts.length||rows.some(r=>r.revisionConflict)||!whole||target.value==null||policyRows.length>1||(closed?.planRevisionId&&closed.planRevisionId!==plan.id)||(!programmed&&pieces===null)){state='unavailable';reason=!coverage.complete||data.coverage?.complete===false?'incomplete-query':planConflicts.length?'plan-conflict':policy.conflicts.length?'policy-conflict':rows.some(r=>r.revisionConflict)?'correction-conflict':!whole||policyRows.length>1?'no-period-allocation':target.value==null?'policy-required':pieces===null?'production-required':'revision-mismatch';}
   const recordedIds=new Set(rows.map(r=>r.id));if(closed&&closed.recordIds?.some(id=>!recordedIds.has(id))){state='unavailable';reason='incomplete-query';}
   if(closed&&(!Array.isArray(closed.recordIds)||new Set(closed.recordIds).size!==recordedIds.size||closed.recordIds.length!==recordedIds.size||(!rows.some(r=>r.correctionId)&&closed.confirmedGrossPieces!==pieces))){state='unavailable';reason='confirmation-mismatch';}
   if(closed&&rows.some(r=>r.correctionId&&(data.corrections??[]).some(c=>c.id===r.correctionId&&c.decision?.at<=closed.createdAt&&!closed.correctionIds?.includes(c.id)))){state='unavailable';reason='confirmation-outdated';}
   if(data.retiredIntervals?.includes(interval.id)){state='unavailable';reason='revision-pending';}
   if(interval.plannedPieces===0&&['production-required','confirmation-required'].includes(reason)){state=pieces>0?'inconsistent':'not-scheduled';reason=pieces>0?'production-without-plan':null;}
   if(interval.plannedPieces===0&&state!=='unavailable'){state=pieces>0?'inconsistent':'not-scheduled';reason=pieces>0?'production-without-plan':null;}
   const denominator=open?interval.plannedPieces*(duration?elapsed/duration:0):interval.plannedPieces;
   const evaluable=['final','partial'].includes(state)&&pieces!=null&&denominator>0&&(!open||mode==='continuous');
   const percent=evaluable?100*pieces/denominator:null,minimum=target.value!=null?Math.ceil(interval.plannedPieces*target.value/100):null;
   const rejected=(data.losses??[]).filter(r=>r.kind==='reject'&&r.unit==='pieces'&&matchesScope(plan.context,r.context)&&r.occurredAt>=target.from&&r.occurredAt<target.to);
   segments.push({state,reason,from:target.from,to:target.to,intervalId:interval.id,planId:plan.planId,planRevisionId:plan.id,policyRevisionId:target.id,context:plan.context,plannedPieces:interval.plannedPieces,expectedPieces:denominator,grossPieces:pieces,goodPieces:good.length?good.reduce((s,r)=>s+r.quantity,0):null,rejectedPieces:rejected.length?rejected.reduce((s,r)=>s+r.amount,0):null,percent,targetPercent:target.value,minimumPieces:minimum,remainingPieces:minimum!=null&&pieces!=null?Math.max(0,minimum-pieces):null,excessPieces:minimum!=null&&pieces!=null?Math.max(0,pieces-minimum):null,evaluation:percent==null?'unavailable':pieces*100>=denominator*target.value?'met':'below',quantitySource:plan.quantitySource,taktRevisionId:plan.taktRevision?.id,taktSeconds:plan.taktRevision?.value,source:target.source,recordIds:rows.map(r=>r.id),correctionIds:rows.map(r=>r.correctionId).filter(Boolean),confirmedAt:closed?.createdAt??null,lastRecordAt:rows.length?Math.max(...rows.map(r=>r.createdAt)):null});
  }
 }
 const obsolete=new Map();for(const row of data.production??[])if(row.intervalId&&row.startedAt<to&&row.endedAt>from&&matchesScope(context,row.context)&&!plans.some(p=>p.id===row.planRevisionId)){const list=obsolete.get(row.intervalId)??[];list.push(row);obsolete.set(row.intervalId,list);}
 for(const [intervalId,rows] of obsolete)segments.push({state:'inconsistent',reason:'obsolete-plan',intervalId,planId:rows[0].planId,planRevisionId:rows[0].planRevisionId,context:rows[0].context,from:Math.min(...rows.map(r=>r.startedAt)),to:Math.max(...rows.map(r=>r.endedAt)),grossPieces:rows.some(r=>r.basis==='gross')?rows.filter(r=>r.basis==='gross').reduce((s,r)=>s+r.quantity,0):null,percent:null,evaluation:'unavailable',recordIds:rows.map(r=>r.id),correctionIds:rows.map(r=>r.correctionId).filter(Boolean)});
 if(!segments.length)segments.push({state:'unavailable',reason:'planning-required',percent:null,evaluation:'unavailable',context,recordIds:[],correctionIds:[]});
 const available=segments.filter(s=>s.percent!=null),targets=new Set(available.map(s=>s.targetPercent));let aggregate=null;
 if(available.length&&targets.size===1){const planned=available.reduce((s,r)=>s+r.expectedPieces,0),gross=available.reduce((s,r)=>s+r.grossPieces,0),target=available[0].targetPercent;aggregate={state:segments.every(s=>['final','not-scheduled'].includes(s.state))?'final':'partial',percent:100*gross/planned,grossPieces:gross,plannedPieces:available.reduce((s,r)=>s+r.plannedPieces,0),expectedPieces:planned,targetPercent:target,minimumPieces:Math.ceil(available.reduce((s,r)=>s+r.plannedPieces,0)*target/100),evaluation:gross*100>=planned*target?'met':'below',coverage:(available.length+segments.filter(s=>s.state==='not-scheduled').length)/segments.length};}
 return {segments,aggregate,complete:segments.every(s=>['final','not-scheduled'].includes(s.state)),coverage:{...coverage,evaluated:available.length,total:segments.length},from,to,mode};
}
