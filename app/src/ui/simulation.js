import {createLocalRepository} from './demo-workspace.js';
import {seedSyntheticWorkspace} from './demo-workspace.js';
import {createMsaServices} from '../services/create-msa.js';
import {requireThat} from '../domain/errors.js';
import {dateWindow,dayOffset} from './format.js';
import {eventDate} from '../domain/time.js';
import {seedPresentation} from './presentation.js';
import {populateFinalExamples} from './complete-presentation.js';

export const simulationCases = [
  {id:'complete',name:'NHPL · visão completa · três turnos e indicadores'},
  {id:'nhpl-met',name:'NHPL · 285 / 300 · meta atingida'},
  {id:'nhpl-below',name:'NHPL · 284 / 300 · abaixo da meta'},
  {id:'nhpl-missing',name:'NHPL · apontamento ausente'},
  {id:'normal',name:'Processo dentro dos limites'},
  {id:'outside',name:'Parâmetro fora da faixa'},
  {id:'stoppage',name:'Parada e retomada'},
  {id:'losses',name:'Refugos e perda de material'},
  {id:'target',name:'Meta não atingida'},
  {id:'missing',name:'Leitura ausente'},
  {id:'invalid',name:'Leitura inválida'},
  {id:'pending',name:'Limite pendente'},
  {id:'constant',name:'Dispersão zero'},
  {id:'insufficient',name:'Amostra insuficiente'},
  {id:'engineering',name:'Análise pela Engenharia'},
  {id:'cep-stable',name:'CEP · estudo estável com 60 medições'},
  {id:'cep-unstable',name:'CEP · sinal de instabilidade'},
];

export async function openSimulation(caseId,{papa=globalThis.Papa,now=Date.now,effectiveActor}={}) {
  requireThat(simulationCases.some(c=>c.id===caseId),'INVALID_SCENARIO');
  if(caseId==='complete'){
    const pack=await seedPresentation({papa,now,includeFuturePlan:false,coherentShifts:true});
    const added=await populateFinalExamples({data:pack.data,papa,now}),local=createLocalRepository({data:added.data,now});
    const actor=effectiveActor??{uid:'simulation-viewer',role:'viewer'},context={machineId:pack.context.machineId,processId:pack.context.processId,productId:pack.context.productId},fromDate=pack.fromDate,toDate=added.toDate;
    return {repo:local.repo,services:createMsaServices({repo:local.repo,actor,papa,clock:now,enforceOperationalShifts:true}),actor,context,fromDate,toDate,range:dateWindow(fromDate,toDate),displayName:'Simulação completa',dispose:local.dispose};
  }
  if(caseId.startsWith('nhpl-')){
    const local=createLocalRepository({data:{},now}),preparationActor={uid:'simulation-preparation',role:'admin'},prepare=createMsaServices({repo:local.repo,actor:preparationActor,papa,clock:now});
    const pilot=await prepare.nhpl.install({}),context={machineId:pilot.machineId,processId:pilot.processId,productId:pilot.productIds[0],order:'OP-SIM',lot:'LOTE-SIM',shift:'1'};
    const toDate=eventDate(now()),range=dateWindow(toDate,toDate),end=Math.min(range.to-1,now()-60000),start=end-3600000;
    await prepare.policies.create({id:'simulation-productivity',metric:'productivityPercent',value:95,effectiveFrom:range.from-86400000,source:'Fabiana · respostas de 07/10/2026',context:{machineId:context.machineId,processId:context.processId}});
    await prepare.policies.create({id:'simulation-takt',metric:'taktSeconds',value:12,effectiveFrom:range.from-86400000,source:'Fabiana · takt informado',context:{machineId:context.machineId,processId:context.processId}});
    const plan=await prepare.planning.approve({context,startedAt:start,endedAt:end,intervalMinutes:60,quantitySource:'informed',plannedPieces:300});
    if(caseId!=='nhpl-missing'){const row=await prepare.plannedProduction.record(plan.intervals[0].id,{quantity:caseId==='nhpl-met'?285:284,basis:'gross',startedAt:start,endedAt:end,origin:'demo'});await prepare.plannedProduction.confirm(plan.intervals[0].id,{expectedRevision:row.id,confirmedGrossPieces:row.quantity});}
    const actor=effectiveActor??{uid:'simulation-viewer',role:'viewer'};
    return {repo:local.repo,services:createMsaServices({repo:local.repo,actor,papa,clock:now}),actor,context,fromDate:toDate,toDate,range,displayName:'Simulação NHPL',dispose:local.dispose};
  }
  const roots=['machines','processes','products','parameters','parameterVersions','reasons','targets','collections','production','losses','stoppages','reviews','corrections'];
  const baseline=createLocalRepository({data:Object.fromEntries(roots.map(r=>[r,{}])),now});
  const actor={uid:'simulation-admin',role:'admin'};
  let context,data;
  try {
    context=await seedSyntheticWorkspace({repo:baseline.repo,papa,now,actor,reviewActor:{uid:'simulation-operator',role:'operator'}});
    data=baseline.snapshot();
  } finally { baseline.dispose(); }
  // Only an unpublished, in-memory fixture is varied. Operational records are never edited.
  data.processes[context.processId].name='Termoformagem';
  data.products[context.productId].name='Selo A03';
  const reasonNames={stop:'Ajuste da máquina',reject:'Dimensão fora da especificação',material:'Aparas de corte',rework:'Revisão de acabamento'};
  for(const r of Object.values(data.reasons))r.name=reasonNames[r.kind];
  for(const r of Object.values(data.reviews))r.scope='Verificar parâmetros e registros da coleta.';
  const versions=data.parameterVersions;
  const parameters=Object.values(data.parameters);
  for(const collection of Object.values(data.collections)){
    for(const reading of Object.values(collection.readings)){
      const rule=versions[reading.versionId].rule;
      if(rule.kind!=='pending'){
        const midpoint=rule.kind==='range'?(rule.lower+rule.upper)/2:rule.lower+0.3;
        const spread=rule.kind==='range'?(rule.upper-rule.lower)*0.06:0.05;
        const value=midpoint+(Number(collection.id.split('-').at(-1))%5-2)*spread;
        reading.raw=String(Number(value.toFixed(4)));reading.value=Number(reading.raw);
      }else if(parameters.find(p=>p.id===reading.parameterId)?.name.startsWith('Aquecimento')&&reading.value===0){
        reading.value=243.5;reading.raw='243.5';
      }
    }
  }
  const passo=parameters.find(p=>p.code==='MSA_AX');
  const collections=Object.values(data.collections).sort((a,b)=>a.occurredAt-b.occurredAt);
  const last=collections.at(-1),reading=last.readings[passo.id];
  if(caseId.startsWith('cep-')) {
    const bf=parameters.find(p=>p.code==='MSA_BF'),versionId=last.readings[bf.id].versionId;
    const reference=[49.6,47.6,49.9,51.3,47.8,51.2,52.6,52.4,53.6,52.1];
    data.collections={};data.reviews={};data.corrections={};
    const day=eventDate(now()),start=Date.parse(day+'T08:00:00-03:00');
    for(let i=0;i<60;i++) {
      const id='simulation-cep-'+i,value=caseId==='cep-unstable'&&i===59?0.97:Number((0.85+(reference[i%10]-50.81)*0.004).toFixed(5));
      data.collections[id]={id,context,origin:'demo',createdBy:actor.uid,createdAt:now(),eventDate:day,timePrecision:'instant',occurredAt:start+i*300000,
        source:{file:'simulacao-local',sheet:caseId,row:i+1},readings:{[bf.id]:{parameterId:bf.id,versionId,status:'valid',value,raw:String(value)}}};
    }
  }
  if(caseId==='outside'){reading.raw='415.3';reading.value=415.3;}
  if(caseId==='missing'){reading.raw='';reading.value=null;reading.status='missing';}
  if(caseId==='invalid'){reading.raw='erro';reading.value=null;reading.status='invalid';}
  if(caseId==='constant')for(const c of collections){c.readings[passo.id].value=413.5;c.readings[passo.id].raw='413.5';}
  if(caseId==='insufficient')for(const c of collections.slice(0,-1))delete c.readings[passo.id];
  const local=createLocalRepository({data,now});
  const services=createMsaServices({repo:local.repo,papa,actor,clock:now});
  const toDate=eventDate(now()),fromDate=dayOffset(toDate,-6),range=dateWindow(fromDate,toDate);
  const envelope={context,origin:'demo',source:{file:'simulacao-local',sheet:caseId,row:1},occurredAt:last.occurredAt+60000};
  if(caseId==='stoppage')await services.operations.startStoppage({...envelope,id:'simulation-stop',startedAt:last.occurredAt+60000,planned:false,reasonId:'demo-stop'});
  if(caseId==='losses'){
    const gross=Object.values(data.production).find(p=>p.basis==='gross'&&p.eventDate===toDate);
    const good=Object.values(data.production).find(p=>p.basis==='good'&&p.eventDate===toDate);
    // Build a new, isolated day with a consistent gross = good + rejected balance.
    await local.repo.transact(`production/${good.id}`,r=>({...r,quantity:Math.round(gross.quantity*.2)}));
    const loss=Object.values(data.losses).find(l=>l.kind==='reject'&&l.eventDate===toDate);
    await local.repo.transact(`losses/${loss.id}`,r=>({...r,amount:gross.quantity-Math.round(gross.quantity*.2)}));
    await services.operations.recordLoss({...envelope,id:'simulation-material',kind:'material',unit:'kg',amount:24,reasonId:'demo-material'});
  }
  if(caseId==='target')await services.registry.create('targets',{name:'Produção semanal',metric:'producedPieces',unit:'pieces',operator:'lower',threshold:40000,context,fromDate,toDate});
  if(caseId==='engineering'){
    const review=Object.values(data.reviews).find(r=>r.state==='analyzing');
    await services.analysis.decideReview(review.id,{decision:'rejected',justification:'Revisão do cenário local. Solicitar ajuste e nova coleta.'});
  }
  const sessionActor=effectiveActor??{uid:'simulation-viewer',role:'viewer'};
  return {repo:local.repo,services:createMsaServices({repo:local.repo,papa,actor:sessionActor,clock:now}),actor:sessionActor,context,fromDate,toDate,range,displayName:'Simulação local',dispose:local.dispose};
}
