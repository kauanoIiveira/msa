import {aggregateOee,periodReliability,periodMicroStops} from './period-metrics.js';
import {calculateOee,calculateReliability,unionSeconds} from './oee.js';
import {productiveWindows,latestPlans,netSeconds} from './planning.js';
import {matchesScope} from './production-policy.js';
import {buildProductivity} from './productivity.js';
import {stableStringify} from './canonical.js';
import {evaluateCoverage} from './coverage.js';
import {validateDate} from './time.js';
function dateWindow(fromDate,toDate){validateDate(fromDate);validateDate(toDate);return {from:Date.parse(fromDate+'T00:00:00-03:00'),to:Date.parse(toDate+'T00:00:00-03:00')+86400000};}
export function projectProductivity(state){
 const op=state.operationalQuery,context=op?.query.context??state.context,windows=op?.windows??[dateWindow(state.fromDate,state.toDate)],config={context,now:state.asOf??Date.now(),mode:state.client?.mode==='live'?'continuous':'manual',coverage:{complete:state.period.nhplComplete!==false&&(state.period.complete??state.period.coverage?.production)===true&&state.period.coverage?.corrections===true}};
 const views=windows.map(w=>buildProductivity({...state.period,production:state.period.effective?.production??[],losses:state.period.effective?.losses??[]},{...config,...w})),segments=views.flatMap(v=>v.segments).filter(s=>s.intervalId||views.length===1),available=segments.filter(s=>s.percent!=null),expected=available.reduce((n,s)=>n+s.expectedPieces,0),gross=available.reduce((n,s)=>n+s.grossPieces,0),targets=new Set(available.map(s=>s.targetPercent));
 const aggregate=expected?{state:state.period.coverage?.production===true&&segments.every(s=>['final','not-scheduled'].includes(s.state))?'final':'partial',percent:gross/expected*100,grossPieces:gross,expectedPieces:expected,plannedPieces:available.reduce((n,s)=>n+s.plannedPieces,0),targetPercent:targets.size===1?available[0].targetPercent:null,minimumPieces:available.reduce((n,s)=>n+s.minimumPieces,0),coverage:available.length/Math.max(1,segments.length)}:null;
 return {segments,aggregate,coverage:{complete:config.coverage.complete,evaluated:available.length,total:segments.length},from:windows[0].from,to:windows.at(-1).to};
}
export function projectWorkspaceMetrics(state,{now=state.asOf??Date.now()}={}) {
 const technical=state.technical??[],segments=(state.productivity??projectProductivity(state)).segments,plans=latestPlans(state.period.plans??[]),allStops=state.period.effective?.stoppages??[];
 const evaluated=segments.filter(s=>s.intervalId&&s.from<now&&s.state!=='programmed').map(s=>{
  const through=Math.min(now,s.to),plan=plans.find(p=>p.id===s.planRevisionId),planned=plan?netSeconds(plan,s.from,through):null;
  const refs=technical.filter(r=>r.kind==='reference'&&matchesScope(r.context,s.context)).sort((a,b)=>a.effectiveFrom-b.effectiveFrom);
  const ref=refs.filter(r=>r.effectiveFrom<=s.from).at(-1),crosses=refs.some(r=>r.effectiveFrom>s.from&&r.effectiveFrom<through);
  const applicable=refs.filter(r=>r.effectiveFrom<s.to),refConflict=new Set(applicable.map(r=>r.supersedes??'root')).size!==applicable.length;
  const stops=allStops.filter(r=>matchesScope(s.context,r.context)&&r.startedAt<through&&(r.endedAt??through)>s.from);
  const classified=stops.map(stop=>({stop,classification:technical.filter(r=>r.kind==='classification'&&r.stopId===stop.id).at(-1)}));
  const live=state.client?.mode==='live',gap=(state.liveCoverage?.gaps??[]).some(g=>g.from<through&&g.to>s.from);
  const pending=state.period.coverage?.stoppages!==true||classified.some(x=>!x.classification||(!live&&x.stop.endedAt==null)||x.stop.revisionConflict||x.classification.stopFingerprint!==stableStringify([x.stop.startedAt,x.stop.endedAt??null,x.stop.correctionId??null])||x.classification.category==='outside-plan'&&plan&&productiveWindows(plan).some(w=>x.stop.startedAt<w.endedAt&&(x.stop.endedAt??through)>w.startedAt));
  const loss=plan?productiveWindows(plan).reduce((sum,w)=>sum+unionSeconds(classified.filter(x=>x.classification?.category==='availability').map(x=>x.stop),Math.max(s.from,w.startedAt),Math.min(through,w.endedAt)),0):null;
  const inspection=technical.filter(r=>r.kind==='inspection'&&r.intervalId===s.intervalId).at(-1);
  const rows=(state.period.effective?.production??[]).filter(r=>r.intervalId===s.intervalId);
  const trusted=inspection?.productionFingerprint===stableStringify(rows.map(r=>[r.id,r.quantity,r.correctionId??null]).sort((a,b)=>a[0].localeCompare(b[0])));
  const result=calculateOee({plannedSeconds:planned,runSeconds:pending?null:planned-loss,idealSeconds:crosses?null:ref?.idealSeconds,total:s.grossPieces,firstPassGood:trusted?inspection.firstPassGood:null,complete:s.state==='final'&&state.period.nhplComplete===true});
  if(inspection&&!trusted)result.reason='inspection-outdated';
  if(crosses)result.reason='reference-crosses-period';
  if(refConflict){result.performance=null;result.oee=null;result.reason='reference-conflict';result.state='unavailable';}
  if(gap){result.runSeconds=null;result.availability=null;result.performance=null;result.oee=null;result.reason='history-incomplete';result.state='unavailable';}
  if(s.reason&&!['policy-required','policy-conflict','confirmation-required','production-required','awaiting-update','future'].includes(s.reason)){result.performance=null;result.quality=null;result.oee=null;result.reason=s.reason;result.state='unavailable';}
  const crossingFailure=classified.some(x=>x.classification?.failure&&(x.stop.startedAt<s.from||(x.stop.endedAt??Infinity)>s.to));
  const observed=evaluateCoverage({witnesses:state.period.coverageWitnesses??[],stops:allStops,classifications:technical.filter(r=>r.kind==='classification'),windows:[{from:s.from,to:through,context:s.context}],completeQuery:state.period.nhplComplete===true&&state.period.coverage?.stoppages===true});
  const rel=calculateReliability({operatingSeconds:result.runSeconds,repairs:classified.filter(x=>x.classification?.failure&&x.stop.startedAt>=s.from&&(x.stop.endedAt??Infinity)<=s.to).map(x=>x.classification),complete:(observed.complete||(state.client?.mode!=='workspace'&&inspection?.historyComplete===true))&&!pending&&!crossingFailure&&s.state==='final'});
  const micros=stops.filter(r=>r.endedAt!=null&&!r.planned&&(r.endedAt-r.startedAt)/1000<=(ref?.microStopSeconds??60));
  return {...s,...result,referenceId:ref?.id,inspectionId:inspection?.id,classificationIds:classified.map(x=>x.classification?.id).filter(Boolean),reliability:rel,microCount:micros.length,microSeconds:unionSeconds(micros,s.from,s.to)};
 });
 const valid=evaluated.filter(s=>s.oee!=null),aggregate=aggregateOee(evaluated),windows=state.operationalQuery?.windows??[dateWindow(state.fromDate,state.toDate)],manualCoverage=evaluated.length>0&&evaluated.every(s=>technical.find(r=>r.id===s.inspectionId)?.historyComplete===true);
 if(aggregate.oee!=null&&state.period.coverage?.production===false)aggregate.state='partial';
 const maintenanceWindows=plans.flatMap(plan=>productiveWindows(plan).flatMap(p=>windows.map(w=>({from:Math.max(p.startedAt,w.from),to:Math.min(p.endedAt,w.to,now),context:plan.context})).filter(w=>w.to>w.from)));
 const maintenance=evaluateCoverage({witnesses:state.period.coverageWitnesses??[],stops:allStops,classifications:technical.filter(r=>r.kind==='classification'),windows:maintenanceWindows,completeQuery:state.period.nhplComplete===true&&state.period.coverage?.stoppages===true});
 const reliability=periodReliability({plans,stops:allStops,classifications:technical.filter(r=>r.kind==='classification'),windows,now,coverage:{complete:state.period.nhplComplete===true&&state.period.coverage?.stoppages===true&&(state.client?.mode==='live'?state.liveCoverage?.complete===true:maintenance.complete||(state.client?.mode!=='workspace'&&manualCoverage)),provisional:state.client?.mode==='live'}}),micros=periodMicroStops({stops:allStops,references:technical.filter(r=>r.kind==='reference'),windows});
 return {productivity:state.productivity??projectProductivity(state),quality:aggregate.quality,segments:evaluated,aggregate,reliability,maintenance,coverage:{evaluated:valid.length,total:evaluated.length},microCount:micros.count,microSeconds:micros.seconds};
}
