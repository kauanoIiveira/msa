import {assertId,requireThat} from '../domain/errors.js';
import {productionCaseContext} from '../domain/production-case.js';
import {buildOperationalQuery,selectOperationalPeriod} from '../ui/operational-query.js';
import {projectWorkspaceMetrics} from '../domain/workspace-metrics.js';

const machines=[
 {key:'p02',name:'Prensa P02',process:'Prensagem de suporte',product:'Suporte P02',parameters:[['FORCE','Força de prensagem','kN',25,0.2],['STROKE','Curso de prensagem','mm',18,0.05],['CYCLE','Tempo de ciclo','s',38,0.1]]},
 {key:'i03',name:'Injetora I03',process:'Injeção de carcaça',product:'Carcaça I03',parameters:[['TEMPERATURE','Temperatura de injeção','°C',220,0.4],['PRESSURE','Pressão de injeção','bar',80,0.5],['CYCLE','Tempo de ciclo','s',38,0.1]]},
 {key:'m04',name:'Montagem M04',process:'Montagem de conjunto',product:'Conjunto M04',parameters:[['TORQUE','Torque de aperto','N·m',3,0.02],['HEIGHT','Altura do conjunto','mm',40,0.05],['CYCLE','Tempo de ciclo','s',38,0.1]]}
];
const source='Exemplo próprio do pacote MSA: valores ilustrativos, sem especificação ou homologação industrial.';
export function buildMachineExpansion({baseManifestId,packageId,operationalDate,revision}){
 assertId(baseManifestId);assertId(packageId);assertId(revision);
 requireThat(/^\d{4}-\d{2}-\d{2}$/.test(operationalDate)&&new Date(operationalDate+'T12:00:00Z').toISOString().slice(0,10)===operationalDate,'INVALID_ANCHOR_DATE');
 const prefix=`${packageId}_rev_${revision}`,commands=[],ref=(id,path=[])=>({$ref:id,path});
 const add=(id,service,method,...args)=>{const command={id:prefix+'_'+id,service,method,args};commands.push(command);return command.id;};
 const at=hour=>Date.parse(operationalDate+'T00:00:00-03:00')+hour*3600000;
 for(const [key,name,kind] of [['stop','Ajuste mecânico','stop'],['reject','Peça fora da referência','reject'],['rework','Ajuste e reinspeção','rework']])add('reason_'+key,'registry','create','reasons',{name,kind});
 for(const machine of machines){
  const key=machine.key,machineId=add(key+'_machine','registry','create','machines',{name:machine.name,code:key.toUpperCase()})+'_1';
  const processId=add(key+'_process','registry','create','processes',{name:machine.process,machineId})+'_1';
  const productId=add(key+'_product','registry','create','products',{name:machine.product,code:key.toUpperCase()+'_PRODUCT',processIds:{[processId]:true}})+'_1';
  const parameters=machine.parameters.map(([code,name,unit,nominal,step])=>{
   const parameterId=add(key+'_'+code,'registry','create','parameters',{name,code:key.toUpperCase()+'_'+code,processId})+'_1';
   const versionId=add(key+'_v_'+code,'registry','createParameterVersion',parameterId,{unit,nature:'measurement',status:'draft',rule:{kind:'range',lower:nominal-step*10,upper:nominal+step*10}})+'_1';
   return {parameterId,versionId,nominal,step};
  });
  const recipe=add(key+'_recipe','productions.recipes','create',{recipeId:prefix+'_'+key,processId,productId,label:'Configuração '+machine.name,settings:Object.fromEntries(machine.parameters.map(([code,,,nominal])=>[code,nominal])),source,status:'draft'});
  add(key+'_policy','policies','create',{id:prefix+'_'+key+'_policy',metric:'productivityPercent',value:90,effectiveFrom:at(7),source,context:{machineId,processId}});
  for(let shift=1;shift<=3;shift++){
   const id=key+'_s'+shift,start=at(7+(shift-1)*8),end=start+4*3600000;
   const context={machineId,processId,productId,order:'OP-'+key.toUpperCase()+'-'+operationalDate.replaceAll('-','')+'-'+shift,lot:'LT-'+key.toUpperCase()+'-'+shift,shift:String(shift),recipe:ref(recipe,['id'])};
   add(id+'_case','productions','create',{...context,recipe:undefined,recipeVersionId:context.recipe,operationalDate,startedAt:start,endedAt:end,status:'closed'});
   // Commands remain JSON serializable and carry only accepted case fields.
   delete commands.at(-1).args[0].recipe;
   add(id+'_reference','technical','reference',{context,idealSeconds:30,microStopSeconds:30,effectiveFrom:start,source});
   const plan=add(id+'_plan','planning','approve',{context,startedAt:start,endedAt:end,intervalMinutes:60,quantitySource:'informed',plannedPieces:400});
   const run=add(id+'_run','runs','start',{context,machineStartedAt:start});
   const active=add(id+'_run_active','runs','advance',ref(run,['runId']),{expectedRevision:ref(run,['id']),productionStartedAt:start});
   const done=add(id+'_run_done','runs','advance',ref(run,['runId']),{expectedRevision:ref(active,['id']),productionEndedAt:end});
   add(id+'_run_closed','runs','advance',ref(run,['runId']),{expectedRevision:ref(done,['id']),machineEndedAt:end});
   for(let hour=0;hour<4;hour++){
    const interval=ref(plan,['intervals',hour,'id']);
    for(const [basis,quantity] of [['gross',90],['good',86]])add(id+'_'+basis+'_'+hour,'plannedProduction','record',interval,{id:prefix+'_'+id+'_'+basis+'_'+hour,quantity,basis,startedAt:start+hour*3600000,endedAt:start+(hour+1)*3600000,origin:'demo'});
    add(id+'_confirm_'+hour,'plannedProduction','confirm',interval,{expectedRevision:{$ledgerLast:interval},confirmedGrossPieces:90});
    add(id+'_inspect_'+hour,'technical','inspect',{intervalId:interval,firstPassGood:84,historyComplete:true,note:source});
   }
   for(const [kind,amount]of [['reject',16],['rework',8]])add(id+'_'+kind,'operations','recordLoss',{id:prefix+'_'+id+'_'+kind,context,origin:'demo',occurredAt:start+5400000,kind,unit:'pieces',amount,reasonId:prefix+'_reason_'+kind+'_1'});
   const stopId=prefix+'_'+id+'_stop';
   add(id+'_stop','operations','startStoppage',{id:stopId,context,origin:'demo',startedAt:start+1200000,planned:false,reasonId:prefix+'_reason_stop_1'});
   add(id+'_stop_close','operations','closeStoppage',stopId,{endedAt:start+1800000,reasonId:prefix+'_reason_stop_1'});
   add(id+'_classify','technical','classify',{stopId,category:'availability',failure:true,repairStartedAt:start+1260000,repairEndedAt:start+1740000,note:source});
   const coverage={context,startedAt:start,endedAt:end};
   add(id+'_coverage','coverage','confirm',{...coverage,complete:true,evidence:'Conferência de paradas e reparos do exemplo próprio MSA.',recordsFingerprint:{$coverage:coverage}});
   for(let n=0;n<30;n++)add(id+'_collection_'+n,'operations','recordCollection',{id:prefix+'_'+id+'_collection_'+n,context,origin:'demo',occurredAt:start+60000+n*7*60000,readings:parameters.map(p=>({parameterId:p.parameterId,versionId:p.versionId,raw:String(Number((p.nominal+([0,1,-1,2,-2,1,-1][n%7])*p.step).toFixed(3)))}))});
  }
 }
 return commands;
}

// Validate the expansion through the same services/projector as the UI. The
// immutable manifest independently checks every source record's content digest.
export async function validateMachineExpansion(services,manifest){
 const diagnostics=[],metricsByContext={};
 const all=(await services.productions.list()).items;
 const cases=all.filter(c=>c.id.startsWith((manifest.packageId??manifest.id)+'_rev_')&&/_(p02|i03|m04)_s[123]_case_1$/.test(c.id)&&manifest.entries.some(e=>e.path==='productionCases/'+c.id));
 if(!cases.length)return {diagnostics,metricsByContext};
 const technical=await services.technical.records();
 for(const row of cases){
  const context=productionCaseContext(row),query={context,fromDate:row.operationalDate,toDate:row.operationalDate,shift:row.shift};
  const op=buildOperationalQuery(query),raw=await services.history.loadPeriod({...op.query,limit:500,maxPages:20}),period=selectOperationalPeriod(raw,op);
  const projected=projectWorkspaceMetrics({period,technical,operationalQuery:op,fromDate:row.operationalDate,toDate:row.operationalDate,context,asOf:row.endedAt+1,client:{mode:'workspace'}});
  const indicators=await services.getIndicators(op.query,{from:row.startedAt,to:row.endedAt});
  const values={scrap:indicators.totals.rejectPercent,productivity:projected.productivity.aggregate?.percent,oee:projected.aggregate.oee,mtbf:projected.reliability.mtbf.value,mttr:projected.reliability.mttr.value};
  const readings=(raw.collections??[]).filter(c=>c.context.machineId===row.machineId&&c.context.shift===row.shift);
  if(Object.values(values).some(v=>!Number.isFinite(v))||readings.length<30)diagnostics.push({code:'MACHINE_EXPANSION_INCOMPLETE',caseId:row.id,values,readings:readings.length});
  metricsByContext[row.id]=values;
 }
 return {diagnostics,metricsByContext};
}
