import {assertId,requireThat} from '../domain/errors.js';
import {productionCaseContext,productionCaseFields} from '../domain/production-case.js';
import {buildOperationalQuery,selectOperationalPeriod} from '../ui/operational-query.js';
import {projectWorkspaceMetrics} from '../domain/workspace-metrics.js';

const source='Exemplo próprio MSA para avaliação operacional; valores ilustrativos, sem evidência ou homologação industrial.';
const values=value=>Object.values(value??{});
const latest=rows=>[...rows].sort((a,b)=>(b.occurredAt??b.endedAt??0)-(a.occurredAt??a.endedAt??0)||b.id.localeCompare(a.id))[0];
export function buildEvaluationExamples({snapshot,baseManifestId,revision='evaluation'}){
 assertId(baseManifestId);assertId(revision);requireThat(revision==='evaluation','INVALID_REVISION');
 const base=snapshot.presentationManifests?.[baseManifestId];requireThat(base?.state==='published','BASE_MANIFEST_REQUIRED');
 const prefix=base.packageId+'_rev_'+revision,commands=[],ref=(id,path=[])=>({$ref:id,path});
 const add=(key,service,method,...args)=>{const id=prefix+'_'+key;commands.push({id,service,method,args});return id;};
 const own=row=>row.origin==='demo'&&row.id.startsWith(base.packageId+'_');
 const scopes=[['vgard','nhpl','nhpl-vgard-hp'],['mark','nhpl','nhpl-mark-v'],...['p02','i03','m04'].map(key=>[key,base.packageId+'_rev_machines_'+key+'_machine_1',null])];
 for(const [index,[key,machineId,productId]] of scopes.entries()){
  const col=latest(values(snapshot.collections).filter(r=>own(r)&&r.context.machineId===machineId&&(!productId||r.context.productId===productId)&&r.context.shift==='3'&&r.eventDate>=base.toOperationalDate));
  requireThat(col,'EVALUATION_SOURCE_REQUIRED',key);
  const review=add(key+'_review','analysis','submitReview',{collectionId:col.id,scope:source+' Conferir registro e rastreabilidade da coleta.'});
  if(index%3!==0)add(key+'_review_start','analysis','startReview',ref(review,['id']));
  if(index===2){add(key+'_review_evidence','technical','evidence',{reviewId:ref(review,['id']),controlPlan:source,inspection:'Conferência visual ilustrativa do registro.',testResult:'Registro coerente no exemplo.',performance:'Avaliação restrita aos dados de exemplo.',note:source});add(key+'_review_decide','analysis','decideReview',ref(review,['id']),{decision:'approved',justification:source+' Análise ilustrativa concluída.'});}
  const replacement=structuredClone(col),reading=Object.values(replacement.readings).find(r=>Number.isFinite(r.value));requireThat(reading,'EVALUATION_SOURCE_REQUIRED');
  reading.raw=String(Number((reading.value+0.01).toFixed(4)));reading.value=Number(reading.raw);reading.status='valid';
  add(key+'_correction','analysis','requestCorrection',{recordType:'collections',recordId:col.id,replacement,reason:source+' Solicitação ilustrativa de ajuste de digitação; aguarda decisão de outro responsável.'});
  const occurrence=add(key+'_occurrence','technical','occurrence',{context:col.context,type:['quality','process','maintenance','quality','process'][index],occurredAt:col.occurredAt,note:source+' Verificar '+key.toUpperCase()+' durante a avaliação.'});
  if(index%3!==0)add(key+'_occurrence_analyze','technical','decideOccurrence',ref(occurrence,['id']),{decision:'analyzing',note:source+' Conferência iniciada.'});
  if(index===2)add(key+'_occurrence_resolve','technical','decideOccurrence',ref(occurrence,['id']),{decision:'resolved',note:source+' Conferência ilustrativa concluída.'});
 }
 for(const [index,key]of ['p02','i03','m04'].entries()){
  const previous=latest(values(snapshot.productionCases).filter(c=>c.id.startsWith(base.packageId+'_rev_machines_'+key+'_s3_case_')&&c.operationalDate===base.toOperationalDate&&c.status==='closed'));
  requireThat(previous,'EVALUATION_SOURCE_REQUIRED',key);
  const start=previous.endedAt,end=start+4*3600000,context={...productionCaseContext(previous),order:'OP-AVALIACAO-'+key.toUpperCase(),lot:'LT-AVALIACAO-'+key.toUpperCase()};
  const oldStops=values(snapshot.stoppages).filter(s=>own(s)&&s.context.order===previous.order&&s.endedAt!=null),reasonId=oldStops[0]?.reasonId;
  requireThat(reasonId&&end===Date.parse(base.toOperationalDate+'T07:00:00-03:00')+86400000,'EVALUATION_SOURCE_REQUIRED');
  const payload={...previous,...context,recipeVersionId:context.recipe,startedAt:start,endedAt:end};
  add(key+'_case','productions','create',Object.fromEntries(productionCaseFields.filter(field=>payload[field]!=null).map(field=>[field,payload[field]])));
  add(key+'_reference','technical','reference',{context,idealSeconds:30,microStopSeconds:30,effectiveFrom:start,source});
  const plan=add(key+'_plan','planning','approve',{context,startedAt:start,endedAt:end,intervalMinutes:60,quantitySource:'informed',plannedPieces:400});
  const run=add(key+'_run','runs','start',{context,machineStartedAt:start}),active=add(key+'_run_active','runs','advance',ref(run,['runId']),{expectedRevision:ref(run,['id']),productionStartedAt:start});
  const done=add(key+'_run_done','runs','advance',ref(run,['runId']),{expectedRevision:ref(active,['id']),productionEndedAt:end});
  add(key+'_run_close','runs','advance',ref(run,['runId']),{expectedRevision:ref(done,['id']),machineEndedAt:end});
  const gross=92-index*3,good=gross-3-index,first=good-2;
  for(let hour=0;hour<4;hour++){
   const interval=ref(plan,['intervals',hour,'id']);
   for(const [basis,quantity]of [['gross',gross],['good',good]])add(key+'_'+basis+'_'+hour,'plannedProduction','record',interval,{id:prefix+'_'+key+'_'+basis+'_'+hour,quantity,basis,startedAt:start+hour*3600000,endedAt:start+(hour+1)*3600000,origin:'demo'});
   add(key+'_confirm_'+hour,'plannedProduction','confirm',interval,{expectedRevision:{$ledgerLast:interval},confirmedGrossPieces:gross});
   add(key+'_inspect_'+hour,'technical','inspect',{intervalId:interval,firstPassGood:first,historyComplete:true,note:source});
  }
  for(const [kind,amount]of [['reject',4*(gross-good)],['rework',4*(good-first)]]){
   const reason=values(snapshot.losses).find(r=>own(r)&&r.context.machineId===previous.machineId&&r.kind===kind)?.reasonId;requireThat(reason,'EVALUATION_SOURCE_REQUIRED');
   add(key+'_'+kind,'operations','recordLoss',{id:prefix+'_'+key+'_'+kind,context,origin:'demo',occurredAt:start+5400000,kind,unit:'pieces',amount,reasonId:reason});
  }
  for(const [kind,offset,duration]of [['failure',1200000,600000+index*120000],['micro',7200000,20000+index*3000]]){
   const stopId=prefix+'_'+key+'_'+kind,startedAt=start+offset,endedAt=startedAt+duration;
   add(key+'_'+kind,'operations','startStoppage',{id:stopId,context,origin:'demo',startedAt,planned:false,reasonId});
   add(key+'_'+kind+'_close','operations','closeStoppage',stopId,{endedAt,reasonId});
   add(key+'_'+kind+'_classify','technical','classify',{stopId,category:kind==='micro'?'performance':'availability',failure:kind==='failure',...(kind==='failure'?{repairStartedAt:startedAt+60000,repairEndedAt:endedAt-60000}:{}),note:source});
  }
  const coverage={context,startedAt:start,endedAt:end};add(key+'_coverage','coverage','confirm',{...coverage,complete:true,evidence:source+' Conferência de ambas as paradas e do reparo.',recordsFingerprint:{$coverage:coverage}});
 }
 return commands;
}

export async function validateEvaluationExamples(services,manifest){
 const diagnostics=[],metricsByContext={},prefix=(manifest.packageId??manifest.id)+'_rev_evaluation_';
 const cases=(await services.productions.list()).items.filter(c=>c.id.startsWith(prefix)&&/_case_1$/.test(c.id)&&manifest.entries.some(e=>e.path==='productionCases/'+c.id));
 if(!cases.length)return {diagnostics,metricsByContext};
 const technical=await services.technical.records();
 for(const row of cases){
  const context=productionCaseContext(row),op=buildOperationalQuery({context,fromDate:row.operationalDate,toDate:row.operationalDate,shift:row.shift}),raw=await services.history.loadPeriod({...op.query,limit:500,maxPages:20}),period=selectOperationalPeriod(raw,op);
  const projected=projectWorkspaceMetrics({period,technical,operationalQuery:op,context,fromDate:row.operationalDate,toDate:row.operationalDate,asOf:row.endedAt+1,client:{mode:'workspace'}}),indicators=await services.getIndicators(op.query,{from:row.startedAt,to:row.endedAt});
  const totals=indicators.totals,first=technical.filter(r=>r.kind==='inspection'&&r.context.order===row.order).reduce((n,r)=>n+r.firstPassGood,0),rework=(raw.losses??[]).filter(r=>r.kind==='rework').reduce((n,r)=>n+r.amount,0);
  const metric={productivity:projected.productivity.aggregate?.percent,oee:projected.aggregate.oee,mtbf:projected.reliability.mtbf.value,mttr:projected.reliability.mttr.value,scrap:totals.rejectPercent};
  if(Object.values(metric).some(v=>!Number.isFinite(v))||totals.grossPieces-totals.goodPieces!==totals.rejectedPieces||totals.goodPieces-first!==rework)diagnostics.push({code:'EVALUATION_CASE_INCOMPLETE',caseId:row.id});
  metricsByContext[row.id]=metric;
 }
 return {diagnostics,metricsByContext};
}
