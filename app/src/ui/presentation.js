import {createLocalRepository} from './demo-workspace.js';
import {createMsaServices} from '../services/create-msa.js';
import {eventDate} from '../domain/time.js';
import {dateWindow,dayOffset} from './format.js';
import {requireThat} from '../domain/errors.js';
import {validateRule} from '../domain/limits.js';
import {ledgerView} from '../repositories/append-ledger.js';
const key='msa.nhpl.presentation.v3';
const context={machineId:'nhpl',processId:'nhpl-montagem',productId:'nhpl-vgard-hp',order:'OP-AP-001',lot:'LOTE-AP-001',shift:'1',variant:'Medium'};
const roots=['machines','processes','products','parameters','parameterVersions','reasons','targets','collections','production','losses','stoppages','reviews','corrections','pilots','productionPolicies','targetRevisions','productionPlans','productionIntervals','plannedCorrections','machineRuns','technicalRecords'];
export async function seedPresentation({papa,now=Date.now}={}) {
 const local=createLocalRepository({data:Object.fromEntries(roots.map(r=>[r,{}])),now});
 const actor={uid:'presentation-preparation',role:'admin'},s=createMsaServices({repo:local.repo,actor,papa,clock:now});
 try {
 await s.nhpl.install({});
 const day=dayOffset(eventDate(now()),-1),from=Date.parse(day+'T08:00:00-03:00'),range=dateWindow(day,day);
 for(const[metric,value]of [['productivityPercent',95],['taktSeconds',12]])await s.policies.create({id:'ap-'+metric,metric,value,effectiveFrom:range.from,context:{machineId:'nhpl',processId:context.processId},source:'Fabiana · respostas de 07/10/2026'});
 for(const[id,name,kind]of [['nhpl-stop','Interrupção de montagem','stop'],['nhpl-setup','Troca e preparação','stop'],['nhpl-reject','Inspeção dimensional','reject'],['nhpl-material','Perda de material','material'],['nhpl-rework','Retrabalho','rework']])await createMsaServices({repo:local.repo,actor,papa,idFactory:()=>id}).registry.create('reasons',{name,kind});
 const plan=await s.planning.approve({context,startedAt:from,endedAt:from+4*3600000,intervalMinutes:60,quantitySource:'informed',plannedPieces:1200});
 await s.technical.reference({context,idealSeconds:10,microStopSeconds:60,effectiveFrom:range.from,source:'Exemplo hipotético de apresentação · não é ciclo ideal aprovado da NHPL'});
 const quantities=[285,284,250,295];
 for(let i=0;i<4;i++){
  const h=plan.intervals[i],gross=quantities[i],good=gross-(i===2?10:5);
  await s.plannedProduction.record(h.id,{quantity:gross,basis:'gross',startedAt:h.startedAt,endedAt:h.endedAt,origin:'demo'});
  const last=await s.plannedProduction.record(h.id,{quantity:good,basis:'good',startedAt:h.startedAt,endedAt:h.endedAt,origin:'demo'});
  await s.plannedProduction.confirm(h.id,{expectedRevision:last.id,confirmedGrossPieces:gross});
  await s.operations.recordLoss({context,kind:'reject',amount:gross-good,unit:'pieces',reasonId:'nhpl-reject',occurredAt:h.endedAt-1000,origin:'demo'});
  await s.technical.inspect({intervalId:h.id,firstPassGood:good,historyComplete:true,note:'Inspeção e histórico de falhas completos somente neste exemplo didático'});
 }
 const stoppedAt=from+2*3600000+10*60000;
 await s.operations.startStoppage({id:'ap-failure',context,startedAt:stoppedAt,reasonId:'nhpl-stop',planned:false,origin:'demo'});
 await s.operations.closeStoppage('ap-failure',{endedAt:stoppedAt+600000,reasonId:'nhpl-stop',goodValidated:true});
 await s.technical.classify({stopId:'ap-failure',category:'availability',failure:true,repairStartedAt:stoppedAt+60000,repairEndedAt:stoppedAt+360000,note:'Exemplo: falha classificada com reparo de cinco minutos'});
 await s.operations.startStoppage({id:'ap-micro',context,startedAt:from+20*60000,reasonId:'nhpl-stop',planned:false,origin:'demo'});
 await s.operations.closeStoppage('ap-micro',{endedAt:from+20*60000+20000,reasonId:'nhpl-stop',goodValidated:true});
 await s.technical.classify({stopId:'ap-micro',category:'performance',failure:false,note:'Microparada demonstrativa tratada como perda de desempenho'});
 await s.operations.recordLoss({context,kind:'material',amount:1.2,unit:'kg',reasonId:'nhpl-material',occurredAt:from+3600000,origin:'demo'});
 const run=await s.runs.start({context,machineStartedAt:from-600000});let previous=run;
 for(const[field,at]of [['productionStartedAt',from],['productionEndedAt',from+4*3600000],['machineEndedAt',from+4*3600000+300000]])previous=await s.runs.advance(run.runId,{expectedRevision:previous.id,[field]:at});
 const refs=[];
 for(const[id,name,unit,lower,upper]of [['ap-fit','Dimensão de encaixe · exemplo didático','mm',9.5,10.5],['ap-test','Resultado de ensaio · exemplo didático','N',90,110]]){
  const registry=createMsaServices({repo:local.repo,actor,papa,idFactory:()=>id}).registry;
  await registry.create('parameters',{name,code:id,processId:context.processId});
  const v=await s.registry.createParameterVersion(id,{unit,nature:'measurement',status:'approved',rule:{kind:'range',lower,upper}});refs.push({id,v,mean:(lower+upper)/2,spread:(upper-lower)*.025});
 }
 const variation=[-1,1,-.5,.5,-.8,.8,-.2,.2,-.6,.6];
 const collections=[];
 for(let i=0;i<60;i++)collections.push(await s.operations.recordCollection({id:'ap-collection-'+i,context,origin:'demo',occurredAt:from+i*60000,readings:refs.map(r=>({parameterId:r.id,versionId:r.v.id,raw:String(r.mean+variation[i%10]*r.spread)}))}));
 const other=createMsaServices({repo:local.repo,actor:{uid:'presentation-operator',role:'operator'},papa,clock:now});
 await other.analysis.submitReview({collectionId:collections.at(-1).id,scope:'Nova análise · conferir montagem, inspeção e estudo Cp/Cpk didático'});
 const review=await other.analysis.submitReview({collectionId:collections[30].id,scope:'Revisão de ensaio · anexar evidências de Qualidade'});await s.analysis.startReview(review.id);
 await s.technical.evidence({reviewId:review.id,controlPlan:'Plano de controle fictício AP-01',inspection:'Inspeção didática registrada',testResult:'Resultado demonstrativo',performance:'Conferir histórico do estudo',note:'Não é laudo industrial'});
 const orig=collections[0],replacement=structuredClone(orig);replacement.readings[refs[0].id].raw='10.001';replacement.readings[refs[0].id].value=10.001;
 await other.analysis.requestCorrection({recordType:'collections',recordId:orig.id,replacement,reason:'Conferência didática da digitação'});
 await other.technical.occurrence({context,type:'maintenance',note:'Verificar causa da interrupção e retorno de peças boas · exemplo',occurredAt:stoppedAt});
 const markContext={...context,productId:'nhpl-mark-v',order:'OP-AP-002',lot:'LOTE-AP-002',shift:'2',variant:'Low'};
 const markPlan=await s.planning.approve({context:markContext,startedAt:from+5*3600000,endedAt:from+7*3600000,intervalMinutes:60,quantitySource:'informed',plannedPieces:600});
 await s.technical.reference({context:markContext,idealSeconds:10,microStopSeconds:60,effectiveFrom:range.from,source:'Exemplo hipotético MARK V · sem homologação industrial'});
 for(let i=0;i<2;i++){
  const h=markPlan.intervals[i],quantity=[286,292][i];
  await s.plannedProduction.record(h.id,{quantity,basis:'gross',startedAt:h.startedAt,endedAt:h.endedAt,origin:'demo'});
  const row=await s.plannedProduction.record(h.id,{quantity:quantity-4,basis:'good',startedAt:h.startedAt,endedAt:h.endedAt,origin:'demo'});
  await s.plannedProduction.confirm(h.id,{expectedRevision:row.id,confirmedGrossPieces:quantity});
  await s.technical.inspect({intervalId:h.id,firstPassGood:quantity-4,historyComplete:true,note:'Inspeção didática MARK V'});
  await s.operations.recordLoss({context:markContext,kind:'reject',amount:4,unit:'pieces',reasonId:'nhpl-reject',occurredAt:h.endedAt-1000,origin:'demo'});
 }
 for(let i=0;i<30;i++)await s.operations.recordCollection({id:'ap-mark-collection-'+i,context:markContext,origin:'demo',occurredAt:from+5*3600000+i*60000,readings:refs.map(r=>({parameterId:r.id,versionId:r.v.id,raw:String(r.mean+variation[i%10]*r.spread)}))});
 const next=Date.parse(eventDate(now())+'T16:00:00-03:00');
 await s.planning.approve({context,startedAt:next,endedAt:next+3600000,intervalMinutes:60,quantitySource:'informed',plannedPieces:300});
 const sourceId='ap-source',base={schemaVersion:1,sourceId,context};
 for(const event of [
  {...base,eventId:'stop',sequence:1,occurredAt:from+3*3600000+600000,type:'state',state:'stopped',reasonId:'nhpl-stop'},
  {...base,eventId:'good',sequence:2,occurredAt:from+3*3600000+620000,type:'good-validated',validated:true},
  {...base,eventId:'offline',sequence:4,occurredAt:from+4*3600000,type:'state',state:'disconnected'}
 ])await s.technical.ingest(event);
 await s.technical.classify({stopId:'evt_ap-source_stop',category:'performance',failure:false,note:'Microparada capturada por eventos de exemplo; fim com boa validada'});
 return {schemaVersion:1,fromDate:day,toDate:day,context,data:local.snapshot()};
 }finally{local.dispose();}
}
export async function openPresentation({storage=globalThis.localStorage,papa=globalThis.Papa,now=Date.now,actor={uid:'presentation-reader',role:'viewer'},displayName='Consulta NHPL',re=''}={}) {
 let saved=storage.getItem(key),pack;
 try{pack=saved?JSON.parse(saved):await seedPresentation({papa,now});}catch{throw Object.assign(new Error('Base local inválida. Preserve o backup antes de restaurar.'),{code:'DEMO_CORRUPT'});}
 requireThat(pack?.schemaVersion===1&&pack.context?.machineId==='nhpl'&&roots.every(r=>pack.data?.[r]&&typeof pack.data[r]==='object'&&!Array.isArray(pack.data[r])),'DEMO_CORRUPT');
 const data=pack.data;
 for(const p of Object.values(data.processes))requireThat(data.machines[p.machineId],'DEMO_CORRUPT');
 for(const p of Object.values(data.products))requireThat(p.processIds&&Object.keys(p.processIds).length&&Object.entries(p.processIds).every(([id,linked])=>linked===true&&data.processes[id]),'DEMO_CORRUPT');
 for(const p of Object.values(data.parameters))requireThat(data.processes[p.processId],'DEMO_CORRUPT');
 for(const v of Object.values(data.parameterVersions)){requireThat(data.parameters[v.parameterId],'DEMO_CORRUPT');validateRule(v.rule);}
 for(const c of Object.values(data.collections))requireThat(data.machines[c.context?.machineId]&&data.processes[c.context?.processId]?.machineId===c.context.machineId&&data.products[c.context.productId]?.processIds?.[c.context.processId]&&Object.values(c.readings??{}).every(r=>data.parameterVersions[r.versionId]?.parameterId===r.parameterId),'DEMO_CORRUPT');
 for(const root of ['productionPlans','productionIntervals','productionPolicies','machineRuns','targetRevisions'])for(const header of Object.values(data[root]))requireThat(ledgerView(header).complete,'DEMO_CORRUPT');
 if(!saved){saved=JSON.stringify(pack);storage.setItem(key,saved);}
 const local=createLocalRepository({data:pack.data,now,persist:data=>{
  const current=storage.getItem(key);requireThat(!current||current===saved,'CONFLICT');
  const observed=[...Object.values(data.collections??{}),...Object.values(data.production??{}),...Object.values(data.losses??{}),...Object.values(data.stoppages??{})].filter(r=>r.origin!=='demo').map(r=>r.eventDate).filter(Boolean);
  for(const h of Object.values(data.productionIntervals??{}))if(Object.values(h.events??{}).some(r=>r.kind==='production'&&r.origin!=='demo'))observed.push(h.eventDate);
  const next={...pack,toDate:[pack.toDate,...observed].sort().at(-1),data},serialized=JSON.stringify(next);storage.setItem(key,serialized);pack=next;saved=serialized;
 }});
 const sessionActor=structuredClone(actor),services=createMsaServices({repo:local.repo,actor:sessionActor,papa,clock:now});
 let off=()=>{};
 if(storage===globalThis.localStorage&&typeof window!=='undefined'){
  const listener=event=>{if(event.key===key&&event.newValue){try{const next=JSON.parse(event.newValue);requireThat(next.schemaVersion===1&&roots.every(r=>next.data?.[r]),'DEMO_CORRUPT');saved=event.newValue;pack=next;local.hydrate(next.data);}catch{sessionActor.role='viewer';}}};
  window.addEventListener('storage',listener);off=()=>window.removeEventListener('storage',listener);
 }
 return {mode:'presentation',actor:sessionActor,repo:local.repo,services,context:structuredClone(pack.context),get fromDate(){return pack.fromDate;},get toDate(){return pack.toDate;},get range(){return dateWindow(pack.fromDate,pack.toDate);},displayName,re,exportBackup:()=>JSON.stringify({...pack,data:local.snapshot()},null,2),dispose(){off();local.dispose();}};
}
