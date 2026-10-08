import {createLocalRepository} from './demo-workspace.js';
import {createMsaServices} from '../services/create-msa.js';
import {eventDate} from '../domain/time.js';
import {dayOffset} from './format.js';
import {shiftAt} from '../domain/shifts.js';

export async function populateTechnicalExamples({data,papa,now}){
 const local=createLocalRepository({data,now});let sequence=0;
 const options={repo:local.repo,papa,clock:now,idFactory:()=>`final_technical_${++sequence}`},operator=createMsaServices({...options,actor:{uid:'final-example-operator',role:'operator'}}),engineering=createMsaServices({...options,actor:{uid:'final-example-preparation',role:'admin'}});
 try{
  for(const productId of ['nhpl-vgard-hp','nhpl-mark-v']){
   const collections=await local.repo.get('collections'),rows=Object.values(collections).filter(c=>c.context.productId===productId&&c.origin==='demo');if(!rows.length)continue;
   if(!Object.values(await local.repo.get('reviews')??{}).some(r=>r.context.productId===productId)){
    await operator.analysis.submitReview({collectionId:rows.at(-1).id,scope:'Conferir montagem, inspeção e capacidade do processo'});
    const review=await operator.analysis.submitReview({collectionId:rows[0].id,scope:'Conferência do ensaio e das evidências de Qualidade'});await engineering.analysis.startReview(review.id);
    await engineering.technical.evidence({reviewId:review.id,controlPlan:'Plano de controle da montagem',inspection:'Inspeção de primeira passagem vinculada',testResult:'Leituras do ensaio registradas',performance:'Estudo com medições do período',note:'Evidência de exemplo; referência preservada no histórico'});
   }
   if(!Object.values(await local.repo.get('corrections')??{}).some(c=>collections[c.recordId]?.context.productId===productId)){
    const original=rows[0],replacement=structuredClone(original),reading=replacement.readings['ap-fit'];if(!reading)continue;
    reading.value=Number((reading.value+.001).toFixed(3));reading.raw=String(reading.value);
    await operator.analysis.requestCorrection({recordType:'collections',recordId:original.id,replacement,reason:'Conferência de digitação da dimensão; aguarda outra pessoa responsável'});
   }
  }
  return local.snapshot();
 }finally{local.dispose();}
}

// Add complete examples through the normal services. Existing records are retained.
export async function populateFinalExamples({data,papa,now}){
 const local=createLocalRepository({data,now}),actor={uid:'final-example-preparation',role:'admin'};let sequence=0;
 const s=createMsaServices({repo:local.repo,actor,papa,clock:now,enforceOperationalShifts:true,idFactory:()=>`final_example_${++sequence}`});
 const day=dayOffset(eventDate(now()),-1),nextDay=eventDate(now());
 const schedule=[['nhpl-mark-v','1',day,'07:00'],['nhpl-vgard-hp','1',day,'12:00'],['nhpl-vgard-hp','2',day,'17:00'],['nhpl-mark-v','2',day,'18:00'],['nhpl-vgard-hp','3',day,'23:00'],['nhpl-mark-v','3',nextDay,'00:00']];
 try{
  for(const [productId,shift,date,hour]of schedule){
   const context={machineId:'nhpl',processId:'nhpl-montagem',productId,shift,order:`OP-MONTAGEM-${productId==='nhpl-mark-v'?'MARK':'VGARD'}-${shift}`,lot:`LOTE-MONTAGEM-${shift}`,variant:'Medium'},from=Date.parse(date+'T'+hour+':00-03:00'),to=from+3600000;
   const plan=await s.planning.approve({context,startedAt:from,endedAt:to,intervalMinutes:60,quantitySource:'informed',plannedPieces:300}),id=plan.intervals[0].id;
   await s.technical.reference({context,idealSeconds:10,microStopSeconds:60,effectiveFrom:from,source:'Referência de montagem; origem do conjunto preservada no histórico'});
   for(const [basis,quantity]of [['gross',285],['good',280]])await s.plannedProduction.record(id,{basis,quantity,startedAt:from,endedAt:to,origin:'demo'});
   const header=await local.repo.get('productionIntervals/'+id);const last=Object.values(header.events).at(-1);
   await s.plannedProduction.confirm(id,{expectedRevision:last.id,confirmedGrossPieces:285});
   await s.technical.inspect({intervalId:id,firstPassGood:280,historyComplete:true,note:'Inspeção vinculada aos apontamentos deste intervalo'});
   const stop=await s.operations.startStoppage({context,startedAt:from+1200000,planned:false,reasonId:'nhpl-stop',origin:'demo'});
   await s.operations.closeStoppage(stop.id,{endedAt:from+1800000,reasonId:'nhpl-stop',goodValidated:true});
   await s.technical.classify({stopId:stop.id,category:'availability',failure:true,repairStartedAt:from+1260000,repairEndedAt:from+1560000,note:'Falha com início e fim do reparo registrados'});
   for(const [kind,amount,unit,reasonId]of [['reject',5,'pieces','nhpl-reject'],['material',.45,'kg','nhpl-material'],['rework',3,'pieces','nhpl-rework']])await s.operations.recordLoss({context,kind,amount,unit,reasonId,occurredAt:to-1000,origin:'demo'});
   const versions=Object.values(await local.repo.get('parameterVersions')).filter(v=>v.status==='approved');
   const readings=['ap-fit','ap-test'].map(parameterId=>({parameterId,versionId:versions.filter(v=>v.parameterId===parameterId).at(-1).id}));
   for(let i=0;i<30;i++)await s.operations.recordCollection({context,origin:'demo',occurredAt:from+i*60000,readings:readings.map((r,j)=>({...r,raw:String(Number(((j?100:10)+Math.sin(i*1.3)*(j?.7:.02)).toFixed(3)))}))});
   let run=await s.runs.start({context,machineStartedAt:from-300000});for(const [field,at]of [['productionStartedAt',from],['productionEndedAt',to],['machineEndedAt',to+300000]])run=await s.runs.advance(run.runId,{expectedRevision:run.id,[field]:at});
  }
  for(const productId of ['nhpl-vgard-hp','nhpl-mark-v']){
   const context={machineId:'nhpl',processId:'nhpl-montagem',productId,shift:shiftAt(now()).shift,order:'OP-ACOMPANHAMENTO-'+productId,lot:'LOTE-ACOMPANHAMENTO'},at=now()-300000;
   const stop=await s.operations.startStoppage({context,startedAt:at,planned:false,reasonId:'nhpl-setup',origin:'demo'});
   await s.technical.classify({stopId:stop.id,category:'outside-plan',failure:false,note:'Preparação fora das janelas produtivas registradas'});
   await s.technical.occurrence({context,type:'maintenance',note:'Conferir preparação e liberar o próximo lote após validação da operação.',occurredAt:at});
  }
  if(!Object.keys(await local.repo.get('targets')??{}).length)await s.registry.create('targets',{name:'Referência de produção do período',metric:'producedPieces',unit:'pieces',operator:'lower',threshold:285,fromDate:day,toDate:nextDay,context:{machineId:'nhpl',processId:'nhpl-montagem',productId:'nhpl-vgard-hp',order:'OP-MONTAGEM-VGARD-1',lot:'LOTE-MONTAGEM-1',shift:'1',variant:'Medium'}});
  return {data:await populateTechnicalExamples({data:local.snapshot(),papa,now}),toDate:nextDay};
 }finally{local.dispose();}
}
