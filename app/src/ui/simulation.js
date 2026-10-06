import {createLocalRepository} from './demo-workspace.js';
import {seedSyntheticWorkspace} from './demo-workspace.js';
import {createMsaServices} from '../services/create-msa.js';
import {requireThat} from '../domain/errors.js';
import {dateWindow,dayOffset} from './format.js';
import {eventDate} from '../domain/time.js';

export const simulationCases = [
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
];

export async function openSimulation(caseId,{papa=globalThis.Papa,now=Date.now}={}) {
  requireThat(simulationCases.some(c=>c.id===caseId),'INVALID_SCENARIO');
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
  return {repo:local.repo,services,actor,context,fromDate,toDate,range,displayName:'Fabiana Dias',dispose:local.dispose};
}
