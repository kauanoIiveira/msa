import {createMsaServices} from '../../app/src/services/create-msa.js';
import {getMsaParameterCatalog} from '../../app/src/catalog/msa-parameters.js';
import {requireThat} from '../../app/src/domain/errors.js';
import {eventDate} from '../../app/src/domain/time.js';

export const scenarioRoots=['machines','processes','products','parameters','parameterVersions','reasons','targets','collections','production','losses','stoppages','reviews','corrections'];
export async function populatePresentationScenario({repo,actor,papa,now=Date.now}){
  for(const root of scenarioRoots)requireThat(!Object.keys(await repo.get(root)??{}).length,'EMPTY_WORKSPACE_REQUIRED');
  const options={repo,actor,papa,clock:now},services=createMsaServices(options);
  const registry=id=>createMsaServices({...options,idFactory:()=>id}).registry;
  const context=productId=>({machineId:'c26-t20',processId:'c26-selo',productId});
  await registry('c26-t20').create('machines',{name:'T20',code:'T20'});
  await registry('c26-selo').create('processes',{name:'Formação e corte de selos',machineId:'c26-t20'});
  for(const [id,name,code] of [['c26-a03','Selo A03','A03'],['c26-a05','Selo A05','A05']])await registry(id).create('products',{name,code,processIds:{'c26-selo':true}});
  const catalog=getMsaParameterCatalog(),natureByCode=Object.fromEntries(catalog.map(p=>[p.code,['environment','dimension','utility'].includes(p.group)?'measurement':'setpoint']));
  const installed=await services.catalog.install({processId:'c26-selo',natureByCode,confirmed:true}),versions=new Map();
  for(const item of installed.items){
    const reference=catalog.find(p=>p.code===item.code);let versionId=item.versionId;
    if(reference.draftRule.kind!=='pending'){
      versionId=`c26_${reference.source.column}_approved`;
      await registry(versionId).createParameterVersion(item.parameterId,{unit:reference.unit,nature:natureByCode[item.code],status:'approved',rule:reference.draftRule});
    }
    versions.set(item.code,{parameterId:item.parameterId,versionId});
  }
  const reasons=[['setup','Troca de produto e ajuste','stop'],['air','Ajuste do circuito de ar','stop'],['feed','Reposição de material','stop'],['cut','Ajuste do corte','stop'],['dimension','Dimensão fora da especificação','reject'],['edge','Acabamento irregular','reject'],['trim','Aparas de corte','material'],['restart','Perda na partida','material'],['rework','Revisão de acabamento','rework']];
  for(const [id,name,kind] of reasons)await registry(`c26-${id}`).create('reasons',{name,kind});
  const endDate=eventDate(now()),noon=Date.parse(`${endDate}T12:00:00Z`),reviewRows=[];
  for(let day=0;day<14;day++){
    const eventDate=new Date(noon-(13-day)*86400000).toISOString().slice(0,10);
    for(let product=0;product<2;product++){
      const ctx=context(product?'c26-a05':'c26-a03'),slot=`${day+1}_${product+1}`,hour=product?13:8;
      const start=Date.parse(`${eventDate}T${String(hour).padStart(2,'0')}:00:00-03:00`),end=start+4*3600000,occurredAt=start+3*3600000;
      const source={file:'cenario-ficticio-c26',sheet:'Serie de apresentacao',row:day*2+product+1};
      const envelope={context:ctx,origin:'demo',source,occurredAt};
      const readings=catalog.map(p=>{
        const {lower,upper}=p.source.limits;const variation=((day*3+product*2)%7-3)/12;let value;
        if(p.code==='MSA_BH')value=77.5+variation;
        else if(p.code==='MSA_CH')value=-590-(day%5)*8-product*6;
        else if(p.group==='heating'&&lower===0&&upper===0)value=242+(day%4)*1.5+product;
        else if(upper==null)value=lower+0.25+(day%4)*0.07;
        else value=(lower+upper)/2+variation*(upper-lower);
        if(p.code==='MSA_BD'&&[9,13].includes(day)&&product===0)value=36.4;
        if(p.code==='MSA_CF'&&day===13&&product===0)value=6.2;
        if(p.code==='MSA_AX'&&day===11&&product===1)value=415.3;
        return {...versions.get(p.code),raw:String(Number(value.toFixed(3)))};
      });
      const collectionId=`c26_collection_${slot}`;
      await services.operations.recordCollection({...envelope,id:collectionId,readings});
      const gross=1080+(day%5)*18-product*48,rejects=14+(day%4)*5+(day===13&&product===0?22:0);
      for(const [basis,quantity] of [['gross',gross],['good',gross-rejects]])await services.operations.recordProduction({...envelope,id:`c26_production_${basis}_${slot}`,startedAt:start,endedAt:end,quantity,basis});
      const dimension=Math.floor(rejects*0.6);
      for(const [reason,amount] of [['dimension',dimension],['edge',rejects-dimension]])await services.operations.recordLoss({...envelope,id:`c26_reject_${reason}_${slot}`,kind:'reject',unit:'pieces',amount,reasonId:`c26-${reason}`});
      await services.operations.recordLoss({...envelope,id:`c26_material_${slot}`,kind:'material',unit:'kg',amount:Number((2.8+(day%5)*0.22+product*0.15).toFixed(2)),reasonId:'c26-trim'});
      if(day%3===0)await services.operations.recordLoss({...envelope,id:`c26_rework_${slot}`,kind:'rework',unit:'pieces',amount:6+(day%4)*2,reasonId:'c26-rework'});
      const reasonId=`c26-${['setup','feed','cut','air'][day%4]}`,minutes=8+(day%5)*3;
      await services.operations.startStoppage({...envelope,id:`c26_stop_${slot}`,startedAt:start+600000,planned:day%4===0,reasonId});
      await services.operations.closeStoppage(`c26_stop_${slot}`,{endedAt:start+600000+minutes*60000,reasonId});
      if(product===0&&[8,9,12,13].includes(day))reviewRows.push({day,collectionId});
      if(product===1&&day===13)await services.operations.startStoppage({...envelope,id:'c26_stop_open',startedAt:start+3.5*3600000,planned:false,reasonId:'c26-air'});
    }
  }
  for(const row of reviewRows){
    const id=`c26_review_${row.day}`,analysis=createMsaServices({...options,idFactory:()=>id}).analysis;
    await analysis.submitReview({collectionId:row.collectionId,scope:row.day===13?'Verificar resfriamento e pressão antes da decisão.':'Conferir parâmetros e registros do período.'});
    if(row.day!==13)await analysis.startReview(id);
    if([8,9].includes(row.day))await analysis.decideReview(id,{decision:row.day===8?'approved':'rejected',justification:row.day===8?'Faixas avaliadas sem desvio nas leituras revisadas.':'Resfriamento acima do limite da versão. Solicitar ajuste e nova coleta.'});
  }
  const fromDate=new Date(noon-6*86400000).toISOString().slice(0,10);
  for(const [id,metric,unit,operator,threshold,name] of [['production','producedPieces','pieces','lower',7000,'Produção semanal'],['stop','stopMinutes','minutes','upper',100,'Limite de paradas na semana'],['reject','rejectedPieces','pieces','upper',140,'Limite de refugos na semana'],['mass','lossKg','kg','upper',24,'Limite de perda de material']])await registry(`c26_target_${id}`).create('targets',{name,metric,unit,operator,threshold,context:context('c26-a03'),fromDate,toDate:endDate});
  const original=await repo.get('production/c26_production_gross_13_1');
  await services.analysis.requestCorrection({recordType:'production',recordId:original.id,replacement:{...original,quantity:1134},reason:'Conferir divergência entre contagem de saída e apontamento.'});
  return {context:context('c26-a03'),fromDate,toDate:endDate};
}
