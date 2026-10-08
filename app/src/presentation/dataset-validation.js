import {presentationExampleIdentity} from './example-identity.js';
import {productionCaseContext} from '../domain/production-case.js';
import {stableStringify} from '../domain/canonical.js';
import {getMsaParameterCatalog} from '../catalog/msa-parameters.js';
import {coverageFingerprint,classificationsComplete} from '../domain/coverage.js';
import {datasetHash,manifestEntryValue,manifestEntryScope} from './dataset-hash.js';
import {buildOperationalQuery,selectOperationalPeriod} from '../ui/operational-query.js';
import {projectWorkspaceMetrics} from '../domain/workspace-metrics.js';
import {buildIndicators} from '../domain/indicators.js';
import {shiftAt} from '../domain/shifts.js';

const dayMs=86400000;
const date=(first,n)=>new Date(Date.parse(first+'T12:00:00Z')+n*dayMs).toISOString().slice(0,10);
const values=value=>Object.values(value??{});
const sum=(rows,key)=>rows.reduce((total,row)=>total+row[key],0);
function pathValue(snapshot,path){return path.split('/').reduce((node,key)=>node?.[key],snapshot);}

export async function validatePresentationDataset(snapshot,manifest){
  const diagnostics=[],metricsByContext={};
  const issue=(code,detail)=>diagnostics.push({code,...detail});
  if(manifest?.origin!=='demo'||!['prepared','published'].includes(manifest?.state))issue('MANIFEST_INVALID');
  if(!manifest?.fromOperationalDate||date(manifest.fromOperationalDate,6)!==manifest.toOperationalDate)issue('PERIOD_INVALID');
  const entries=manifest?.entries??[];
  if(!entries.length||new Set(entries.map(e=>e.path)).size!==entries.length||entries.some((e,index)=>e.index!==index||!['record','ledger-header'].includes(e.scope)||e.scope==='ledger-header'&&manifestEntryScope(e.path)!=='ledger-header'))issue('MANIFEST_ENTRIES_INVALID');
  for(const entry of manifest?.entries??[]){const row=pathValue(snapshot,entry.path);if(row==null||await datasetHash(manifestEntryValue(row,entry))!==entry.hash)issue('CONTENT_CONFLICT',{path:entry.path});}
  const plans=values(snapshot.productionPlans?.nhpl?.events).filter(e=>e.kind==='plan');
  const cases=values(snapshot.productionCases),stops=values(snapshot.stoppages),classifications=values(snapshot.technicalRecords).filter(r=>r.kind==='classification');
  const inspections=values(snapshot.technicalRecords).filter(r=>r.kind==='inspection'),references=values(snapshot.technicalRecords).filter(r=>r.kind==='reference');
  const witnesses=values(snapshot.coverageWitnesses),losses=values(snapshot.losses),collections=values(snapshot.collections);
  const prefix=manifest?.packageId??manifest?.id??'';
  const own=row=>String(row?.id??'').startsWith(prefix+'_');
  const ownedPlans=plans.filter(p=>String(p.planId).startsWith(prefix+'_'));
  if(ownedPlans.length!==42)issue('PLAN_COUNT',{actual:ownedPlans.length});
  for(let d=0;d<7;d++)for(let shift=1;shift<=3;shift++)for(let product=0;product<2;product++){
    const day=date(manifest.fromOperationalDate,d),key=`d${d}_s${shift}_p${product}`;
    const plan=ownedPlans.find(p=>String(p.planId).startsWith(`${prefix}_plan_${key}_`));
    if(!plan){issue('PLAN_MISSING',{key});continue;}
    const context=plan.context,matchingCase=cases.find(c=>own(c)&&c.operationalDate===day&&c.shift===String(shift)&&c.productId===context.productId&&c.order===context.order&&c.lot===context.lot&&c.startedAt===plan.startedAt&&c.endedAt===plan.endedAt);
    if(!matchingCase||!matchingCase.recipeVersionId)issue('CASE_MISSING',{key});
    if(plan.intervals.length<4||plan.intervals.some((i,n)=>n&&plan.intervals[n-1].endedAt!==i.startedAt))issue('INTERVALS_INVALID',{key});
    const ledgers=plan.intervals.map(i=>snapshot.productionIntervals?.[i.id]);
    const events=ledgers.flatMap(h=>values(h?.events)),gross=events.filter(e=>e.kind==='production'&&e.basis==='gross'),good=events.filter(e=>e.kind==='production'&&e.basis==='good');
    const closures=events.filter(e=>e.kind==='closure');
    if(gross.length!==plan.intervals.length||good.length!==plan.intervals.length||closures.length!==plan.intervals.length)issue('PRODUCTION_INCOMPLETE',{key});
    const planInspections=inspections.filter(r=>own(r)&&plan.intervals.some(i=>i.id===r.intervalId));
    if(planInspections.length!==plan.intervals.length)issue('INSPECTION_INCOMPLETE',{key});
    const planStops=stops.filter(s=>own(s)&&s.context?.order===context.order&&s.context?.shift===context.shift&&s.startedAt>=plan.startedAt&&s.startedAt<plan.endedAt);
    const failed=planStops.filter(s=>classifications.some(c=>own(c)&&c.stopId===s.id&&c.failure===true&&c.repairEndedAt!=null));
    const witness=witnesses.find(w=>own(w)&&w.startedAt===plan.startedAt&&w.endedAt===plan.endedAt&&w.context?.productId===context.productId);
    if(failed.length!==1||planStops.some(s=>s.endedAt==null))issue('REPAIR_INCOMPLETE',{key});
    if(!witness||!witness.complete||!witness.evidence||witness.recordsFingerprint!==coverageFingerprint({...witness,stops:planStops,classifications})||!classificationsComplete({...witness,stops:planStops,classifications}))issue('COVERAGE_INCOMPLETE',{key});
    const reference=references.find(r=>own(r)&&r.context?.productId===context.productId&&r.context?.shift===context.shift&&r.effectiveFrom<=plan.startedAt);
    if(!reference||!Number.isFinite(reference.idealSeconds))issue('REFERENCE_MISSING',{key});
    const grossPieces=sum(gross,'quantity'),goodPieces=sum(good,'quantity'),firstPassGood=sum(planInspections,'firstPassGood'),plannedPieces=plan.plannedPieces;
    const rejectPieces=sum(losses.filter(r=>own(r)&&r.kind==='reject'&&r.unit==='pieces'&&r.context?.productId===context.productId&&r.context?.shift===context.shift&&r.occurredAt>=plan.startedAt&&r.occurredAt<plan.endedAt),'amount');
    const reworkPieces=sum(losses.filter(r=>own(r)&&r.kind==='rework'&&r.unit==='pieces'&&r.context?.productId===context.productId&&r.context?.shift===context.shift&&r.occurredAt>=plan.startedAt&&r.occurredAt<plan.endedAt),'amount');
    const lossKg=sum(losses.filter(r=>own(r)&&r.unit==='kg'&&r.context?.productId===context.productId&&r.context?.shift===context.shift&&r.occurredAt>=plan.startedAt&&r.occurredAt<plan.endedAt),'amount');
    const stopSeconds=sum(planStops.map(s=>({seconds:(s.endedAt-s.startedAt)/1000})),'seconds'),repairSeconds=sum(failed.map(s=>{const c=classifications.find(r=>r.stopId===s.id);return {seconds:(c.repairEndedAt-c.repairStartedAt)/1000};}),'seconds');
    const plannedSeconds=(plan.endedAt-plan.startedAt)/1000,productiveSeconds=plannedSeconds-stopSeconds;
    const kpi={plannedPieces,grossPieces,goodPieces,firstPassGood,rejectPieces,reworkPieces,lossKg,productivityPercent:100*grossPieces/plannedPieces,scrapPercent:100*rejectPieces/grossPieces,mtbfSeconds:productiveSeconds/failed.length,mttrSeconds:repairSeconds/failed.length,oee:firstPassGood*reference?.idealSeconds/plannedSeconds};
    if(grossPieces-goodPieces!==rejectPieces)issue('REJECT_RECONCILIATION',{key});
    if(goodPieces-firstPassGood!==reworkPieces)issue('REWORK_RECONCILIATION',{key});
    if(Object.values(kpi).some(v=>!Number.isFinite(v)))issue('KPI_NOT_FINITE',{key});
    if(Math.abs(kpi.productivityPercent-90)>1e-9||Math.abs(kpi.scrapPercent-100*rejectPieces/grossPieces)>1e-9)issue('KPI_MEMORY_MISMATCH',{key});
    metricsByContext[key]=kpi;
  }
  const seloCase=snapshot.productionCases?.[prefix+'_case_selo_1'];
  if(!seloCase)issue('T20_CASE_MISSING');
  else {
    const context=productionCaseContext(seloCase),same=row=>stableStringify(row.context)===stableStringify(context);
    const production=values(snapshot.production).filter(r=>own(r)&&same(r)),rejects=losses.filter(r=>own(r)&&same(r)&&r.kind==='reject'&&r.unit==='pieces'&&r.occurredAt>=seloCase.startedAt&&r.occurredAt<seloCase.endedAt);
    const totals=buildIndicators({production,losses:rejects},{from:seloCase.startedAt,to:seloCase.endedAt,complete:true}).totals;
    if(production.length!==2||rejects.length!==1||totals.grossPieces!==100||totals.goodPieces!==95||totals.rejectedPieces!==5||totals.rejectPercent!==5)issue('T20_SCRAP_REFERENCE_INCOMPLETE');
  }
  const sorted=[...ownedPlans].sort((a,b)=>a.startedAt-b.startedAt);
  if(sorted.some((p,i)=>i&&sorted[i-1].endedAt>p.startedAt))issue('PLAN_OVERLAP');
  for(const productId of ['nhpl-vgard-hp','nhpl-mark-v'])for(const shift of ['1','2','3']){
    const study=collections.filter(c=>own(c)&&c.context?.productId===productId&&c.context?.shift===shift);
    if(study.length<30)issue('STUDY_TOO_SMALL',{productId,shift,count:study.length});
    if(new Set(study.map(c=>JSON.stringify(c.context))).size!==1)issue('STUDY_CONTEXT_MIXED',{productId,shift});
    if(study.some(c=>Object.values(c.readings??{}).some(r=>snapshot.parameters?.[r.parameterId]?.processId!=='nhpl-montagem')))issue('STUDY_PARAMETER_MISMATCH',{productId,shift});
  }
  const selo=collections.filter(c=>own(c)&&c.context?.machineId?.includes('_t20_machine_'));
  if(selo.length<30||selo.some(c=>Object.keys(c.readings??{}).length!==getMsaParameterCatalog().length))issue('SELO_STUDY_INCOMPLETE');
  if(!collections.some(c=>own(c)&&values(c.readings).some(r=>r.value===0))||!selo.some(c=>values(c.readings).some(r=>r.value<0)))issue('ZERO_OR_VACUUM_MISSING');
  const runs=values(snapshot.machineRuns).filter(r=>String(r.runId).startsWith(prefix+'_'));
  if(runs.length!==42||runs.some(r=>{
    const events=values(r.events).sort((a,b)=>a.sequence-b.sequence),last=events.at(-1);
    return events.length!==4||last?.machineEndedAt==null||last.machineStartedAt>last.productionStartedAt||last.productionStartedAt>last.productionEndedAt||last.productionEndedAt>last.machineEndedAt;
  }))issue('MANUAL_RUNS_INCOMPLETE');
  const selected=snapshot.productionCases?.[manifest?.defaultSelection?.recording?.productionCaseId];
  if(!selected||selected.operationalDate!==manifest.toOperationalDate||selected.shift!=='3'||selected.productId!=='nhpl-mark-v')issue('DEFAULT_SELECTION_INVALID');
  else {const selection=manifest.defaultSelection,expected=productionCaseContext(selected);if(stableStringify(selection.recording.context)!==stableStringify(expected)||stableStringify(selection.query.context)!==stableStringify(expected)||selection.query.fromDate!==selected.operationalDate||selection.query.toDate!==selected.operationalDate||selection.query.shift!==selected.shift)issue('DEFAULT_SELECTION_CONTEXT_MISMATCH');}
  if(!stops.some(s=>s.id===`${prefix}_boundary_failure`&&s.endedAt>s.startedAt&&shiftAt(s.startedAt).shift!==shiftAt(s.endedAt).shift))issue('BOUNDARY_FAILURE_MISSING');
  if(snapshot.corrections&&values(snapshot.corrections).some(r=>r.revisionConflict))issue('REVISION_CONFLICT');
  return {ok:diagnostics.length===0,metricsByContext,diagnostics};
}

// Cross-check the independent package arithmetic against the same projection
// used by the workspace. No card is emitted when a source is incomplete.
export async function validatePresentationProjection(services,manifest,expected){
  const diagnostics=[];
  const prefix=manifest.packageId??manifest.id,selo=await services.productions.list({context:{machineId:prefix+'_t20_machine_1'},fromDate:manifest.fromOperationalDate,toDate:manifest.fromOperationalDate}),seloCase=selo.items.find(r=>r.id===prefix+'_case_selo_1');
  if(seloCase){const projected=await services.getIndicators({context:productionCaseContext(seloCase),fromDate:manifest.fromOperationalDate,toDate:manifest.fromOperationalDate},{from:seloCase.startedAt,to:seloCase.endedAt});if(projected.totals.rejectPercent!==5)diagnostics.push({code:'T20_PROJECTED_SCRAP_UNAVAILABLE'});}
  else diagnostics.push({code:'T20_CASE_MISSING'});
  const raw=await services.history.loadPeriod({context:{machineId:'nhpl'},fromDate:manifest.fromOperationalDate,toDate:date(manifest.toOperationalDate,1),limit:500,maxPages:20});
  const technical=await services.technical.records(),asOf=Date.parse(manifest.toOperationalDate+'T07:00:00-03:00')+86400000;
  const study=buildIndicators({...raw,...raw.effective},{from:Date.parse(manifest.fromOperationalDate+'T07:00:00-03:00'),to:asOf,complete:raw.complete});
  const offsetStudies=study.statistics.filter(s=>String(s.parameterId).includes('NHPL_ALIGNMENT_OFFSET'));
  if(offsetStudies.length!==6||offsetStudies.some(s=>s.cep?.nValid<30||s.cep?.reason||s.cep?.signals.length||!Number.isFinite(s.cep?.cp)||!Number.isFinite(s.cep?.cpk)))diagnostics.push({code:'CAPABILITY_STUDY_INCOMPLETE',studies:offsetStudies.map(s=>({n:s.cep?.nValid,reason:s.cep?.reason,signals:s.cep?.signals.length}))});
  for(let d=0;d<7;d++)for(let shift=1;shift<=3;shift++)for(let product=0;product<2;product++){
    const key=`d${d}_s${shift}_p${product}`,day=date(manifest.fromOperationalDate,d),recipeKey=product?'mark':'vgard';
    const recipeId=values(await services.productions.recipes.list()).find(r=>r.recipeId===`${manifest.packageId??manifest.id}_${recipeKey}`)?.id;
    const consultation={context:{machineId:'nhpl',processId:'nhpl-montagem',productId:product?'nhpl-mark-v':'nhpl-vgard-hp',...presentationExampleIdentity(manifest.packageId??manifest.id,recipeKey).context,...(recipeId?{recipe:recipeId}:{})},fromDate:day,toDate:day,shift:String(shift)};
    const op=buildOperationalQuery(consultation),period=selectOperationalPeriod(raw,op);
    const projected=projectWorkspaceMetrics({period,technical,operationalQuery:op,fromDate:day,toDate:day,context:consultation.context,asOf,client:{mode:'workspace'}});
    const expectedRow=expected[key];
    if(!expectedRow||!Number.isFinite(projected.aggregate.oee)||!Number.isFinite(projected.reliability.mtbf.value)||!Number.isFinite(projected.reliability.mttr.value)||!Number.isFinite(projected.productivity.aggregate?.percent))diagnostics.push({code:'PROJECTED_KPI_UNAVAILABLE',key,reason:projected.aggregate.reason??projected.reliability.mtbf.reason});
    else if(Math.abs(projected.aggregate.oee-expectedRow.oee)>1e-9||Math.abs(projected.reliability.mtbf.value-expectedRow.mtbfSeconds)>1e-9||Math.abs(projected.reliability.mttr.value-expectedRow.mttrSeconds)>1e-9||Math.abs(projected.productivity.aggregate.percent-expectedRow.productivityPercent)>1e-9)diagnostics.push({code:'PROJECTED_KPI_MISMATCH',key,expected:expectedRow.oee,actual:projected.aggregate.oee});
  }
  return diagnostics;
}
