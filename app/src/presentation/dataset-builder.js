import {createMsaServices} from '../services/create-msa.js';
import {createSnapshotRepository} from './snapshot-repository.js';
import {datasetHash} from './dataset-hash.js';
import {presentationParameterMap,exampleReading} from './parameter-map.js';
import {validatePresentationDataset,validatePresentationProjection} from './dataset-validation.js';

// Memberships are readable only at members/<auth.uid> in the deployed rules.
// An optional external backup can preserve them in the isolated snapshot.
const roots=['machines','processes','products','pilots','parameters','parameterVersions','reasons','targets','targetRevisions','recipeVersions','productionCases','productionPolicies','productionPlans','productionIntervals','collections','production','losses','stoppages','machineRuns','reviews','technicalRecords','coverageWitnesses','corrections','plannedCorrections'];
const sourceSnapshots=new WeakMap();
const dayMs=86400000,hourMs=3600000;
const dayOffset=(day,n)=>new Date(Date.parse(day+'T12:00:00Z')+n*dayMs).toISOString().slice(0,10);
const instant=(day,hour)=>Date.parse(`${day}T00:00:00-03:00`)+hour*hourMs;
const ref=(command,path=[])=>({$ref:command,path});
function resolve(value,results,repo,actor){
  if(Array.isArray(value))return Promise.all(value.map(v=>resolve(v,results,repo,actor)));
  if(value&&typeof value==='object'){
    if(value.$ref)return Promise.resolve(value.path.reduce((node,key)=>node?.[key],results.get(value.$ref)));
    if(value.$ledgerLast)return resolve(value.$ledgerLast,results,repo,actor).then(id=>repo.get(`productionIntervals/${id}`)).then(r=>Object.values(r?.events??{}).sort((a,b)=>a.sequence-b.sequence).at(-1)?.id??null);
    if(value.$coverage)return resolve(value.$coverage,results,repo,actor).then(input=>createMsaServices({repo,actor}).coverage.preview(input)).then(r=>r.recordsFingerprint);
    return Promise.all(Object.entries(value).map(async([k,v])=>[k,await resolve(v,results,repo,actor)])).then(Object.fromEntries);
  }
  return Promise.resolve(value);
}

export function buildPresentationDataset({anchorOperationalDate,version='1',existingSnapshot={}}){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(anchorOperationalDate)||new Date(anchorOperationalDate+'T12:00:00Z').toISOString().slice(0,10)!==anchorOperationalDate)throw new Error('INVALID_ANCHOR_DATE');
  if(!/^[A-Za-z0-9_-]+$/.test(version))throw new Error('INVALID_VERSION');
  const prefix=`presentation_${anchorOperationalDate.replaceAll('-','')}_${version}`,from=dayOffset(anchorOperationalDate,-7),to=dayOffset(anchorOperationalDate,-1),commands=[];
  const add=(id,service,method,...args)=>{commands.push({id:`${prefix}_${id}`,service,method,args});return commands.at(-1).id;};
  add('install_nhpl','nhpl','install',{});
  add('t20_machine','registry','create','machines',{name:'T20 · Exemplo de selo',code:'T20'});
  add('t20_process','registry','create','processes',{name:'Formação e corte de selos',machineId:`${prefix}_t20_machine_1`});
  add('t20_product','registry','create','products',{name:'Selo V-Gard · exemplo',code:'SELO-VGARD',processIds:{[`${prefix}_t20_process_1`]:true}});
  for(const [key,name,kind] of [['stop','Parada de exemplo','stop'],['reject','Refugo de exemplo','reject'],['material','Perda de material de exemplo','material'],['rework','Retrabalho de exemplo','rework']])add(`reason_${key}`,'registry','create','reasons',{name,kind});
  const map=presentationParameterMap(prefix);
  for(const item of [...map.t20,...map.nhpl]){
    const row=item.reference,nature=['environment','dimension','utility','quality','alignment'].includes(row.group)?'measurement':'setpoint';
    add(`parameter_${item.catalogCode}`,'registry','create','parameters',{name:row.name,code:item.catalogCode,processId:item.processId==='c26-selo'?`${prefix}_t20_process_1`:item.processId});
    add(`version_${item.catalogCode}`,'registry','createParameterVersion',item.parameterId,{unit:row.unit,nature,status:item.catalogCode==='NHPL_ALIGNMENT_OFFSET'?'approved':'draft',rule:row.draftRule});
  }
  const recipe={};for(const [key,productId] of [['vgard','nhpl-vgard-hp'],['mark','nhpl-mark-v']])recipe[key]=add(`recipe_${key}`,'productions.recipes','create',{recipeId:`${prefix}_${key}`,productId,processId:'nhpl-montagem',label:`Configuração de exemplo ${key}`,settings:{},source:'Referência de exemplo; limites industriais pendentes',status:'draft'});
  add('productivity_reference','policies','create',{id:`${prefix}_productivity_policy`,metric:'productivityPercent',value:90,effectiveFrom:instant(from,7),source:'Meta de exemplo para roteiro; sem homologação industrial',context:{machineId:'nhpl',processId:'nhpl-montagem'}});
  for(let shift=1;shift<=3;shift++)for(let product=0;product<2;product++){
    const recipeKey=product?'mark':'vgard';
    add(`ideal_reference_s${shift}_p${product}`,'technical','reference',{
      context:{machineId:'nhpl',processId:'nhpl-montagem',productId:product?'nhpl-mark-v':'nhpl-vgard-hp',order:`${prefix}_order_${recipeKey}`,lot:`${prefix}_lot_${recipeKey}`,shift:String(shift),recipe:ref(recipe[recipeKey],['id'])},
      idealSeconds:30,source:'Ciclo ideal de exemplo para cálculo do roteiro; não é o takt de 12 s nem especificação industrial.',effectiveFrom:instant(from,7),microStopSeconds:30
    });
  }
  const t20Recipe=add('recipe_selo','productions.recipes','create',{recipeId:`${prefix}_selo`,productId:`${prefix}_t20_product_1`,processId:`${prefix}_t20_process_1`,label:'Selo V-Gard · configuração de exemplo',settings:{},source:'Modelo T20A03(EN)5, aba Selo; parâmetros e limites industriais pendentes',status:'draft'});
  const t20ctx={machineId:`${prefix}_t20_machine_1`,processId:`${prefix}_t20_process_1`,productId:`${prefix}_t20_product_1`,order:`${prefix}_order_selo`,lot:`${prefix}_lot_selo`,shift:'1',recipe:ref(t20Recipe,['id'])};
  add('case_selo','productions','create',{machineId:t20ctx.machineId,processId:t20ctx.processId,productId:t20ctx.productId,order:t20ctx.order,lot:t20ctx.lot,shift:'1',recipeVersionId:ref(t20Recipe,['id']),operationalDate:from,startedAt:instant(from,7),endedAt:instant(from,11),status:'closed'});
  for(let n=0;n<30;n++)add(`selo_collection_${n}`,'operations','recordCollection',{id:`${prefix}_selo_collection_${n}`,context:t20ctx,origin:'demo',occurredAt:instant(from,8)+n*60000,readings:map.t20.map(item=>exampleReading(item,n))});
  const boundaryStop=`${prefix}_boundary_failure`;
  add('boundary_stop','operations','startStoppage',{id:boundaryStop,context:t20ctx,origin:'demo',startedAt:instant(from,14)+55*60000,planned:false,reasonId:`${prefix}_reason_stop_1`});
  add('boundary_close','operations','closeStoppage',boundaryStop,{endedAt:instant(from,15)+5*60000,reasonId:`${prefix}_reason_stop_1`});
  add('boundary_classification','technical','classify',{stopId:boundaryStop,category:'availability',failure:true,repairStartedAt:instant(from,14)+56*60000,repairEndedAt:instant(from,15)+4*60000,note:'Falha de exemplo cruzando fronteira do turno, em contexto T20 separado.'});
  for(let d=0;d<7;d++){
    const day=dayOffset(from,d);
    for(let shift=1;shift<=3;shift++)for(let product=0;product<2;product++){
      const key=`d${d}_s${shift}_p${product}`,productId=product?'nhpl-mark-v':'nhpl-vgard-hp',recipeKey=product?'mark':'vgard';
      const start=instant(day,shift===1?7:shift===2?15:23)+product*4*hourMs,end=start+4*hourMs;
      const context={machineId:'nhpl',processId:'nhpl-montagem',productId,order:`${prefix}_order_${recipeKey}`,lot:`${prefix}_lot_${recipeKey}`,shift:String(shift),recipe:ref(recipe[recipeKey],['id'])};
      const caseInput={machineId:'nhpl',processId:'nhpl-montagem',productId,order:context.order,lot:context.lot,shift:String(shift),recipeVersionId:ref(recipe[recipeKey],['id']),operationalDate:day,startedAt:start,endedAt:end,status:'closed'};
      add(`case_${key}`,'productions','create',caseInput);
      const plan=add(`plan_${key}`,'planning','approve',{context,startedAt:start,endedAt:end,intervalMinutes:60,quantitySource:'informed',plannedPieces:400});
      const runStart=add(`run_start_${key}`,'runs','start',{context,machineStartedAt:start});
      const runProductionStart=add(`run_production_start_${key}`,'runs','advance',ref(runStart,['runId']),{expectedRevision:ref(runStart,['id']),productionStartedAt:start+5*60000});
      const runProductionEnd=add(`run_production_end_${key}`,'runs','advance',ref(runStart,['runId']),{expectedRevision:ref(runProductionStart,['id']),productionEndedAt:end-5*60000});
      add(`run_machine_end_${key}`,'runs','advance',ref(runStart,['runId']),{expectedRevision:ref(runProductionEnd,['id']),machineEndedAt:end});
      for(let i=0;i<4;i++){
        const interval=ref(plan,['intervals',i,'id']),a=start+i*hourMs,b=a+hourMs;
        add(`gross_${key}_${i}`,'plannedProduction','record',interval,{id:`${prefix}_gross_${key}_${i}`,quantity:90,basis:'gross',startedAt:a,endedAt:b,origin:'demo'});
        add(`good_${key}_${i}`,'plannedProduction','record',interval,{id:`${prefix}_good_${key}_${i}`,quantity:86,basis:'good',startedAt:a,endedAt:b,origin:'demo'});
        // The ledger revision is resolved after both increments, from the isolated replay state.
        add(`closure_${key}_${i}`,'plannedProduction','confirm',interval,{expectedRevision:{$ledgerLast:interval},confirmedGrossPieces:90});
        add(`inspection_${key}_${i}`,'technical','inspect',{intervalId:interval,firstPassGood:84,historyComplete:true,note:'Inspeção de primeira passagem do exemplo; cobertura de falhas separada.'});
      }
      const occurrence=start+90*60000;
      add(`reject_${key}`,'operations','recordLoss',{id:`${prefix}_reject_${key}`,context,origin:'demo',occurredAt:occurrence,kind:'reject',unit:'pieces',amount:16,reasonId:`${prefix}_reason_reject_1`});
      add(`material_${key}`,'operations','recordLoss',{id:`${prefix}_material_${key}`,context,origin:'demo',occurredAt:occurrence,kind:'material',unit:'kg',amount:1.2,reasonId:`${prefix}_reason_material_1`});
      add(`rework_${key}`,'operations','recordLoss',{id:`${prefix}_rework_${key}`,context,origin:'demo',occurredAt:occurrence,kind:'rework',unit:'pieces',amount:8,reasonId:`${prefix}_reason_rework_1`});
      const stopId=`${prefix}_stop_${key}`,stopStart=start+20*60000;
      add(`stop_${key}`,'operations','startStoppage',{id:stopId,context,origin:'demo',startedAt:stopStart,planned:false,reasonId:`${prefix}_reason_stop_1`});
      add(`stop_close_${key}`,'operations','closeStoppage',stopId,{endedAt:stopStart+10*60000,reasonId:`${prefix}_reason_stop_1`,goodValidated:true});
      add(`classification_${key}`,'technical','classify',{stopId,category:'availability',failure:true,repairStartedAt:stopStart+60000,repairEndedAt:stopStart+9*60000,note:'Falha e reparo concluídos no exemplo.'});
      const coverage={context,startedAt:start,endedAt:end};
      add(`coverage_${key}`,'coverage','confirm',{...coverage,complete:true,evidence:'Conferência explícita de paradas, falhas e classificação do pacote de exemplo.',recordsFingerprint:{$coverage:coverage}});
      for(let i=0;i<5;i++)add(`collection_${key}_${i}`,'operations','recordCollection',{id:`${prefix}_collection_${key}_${i}`,context,origin:'demo',occurredAt:start+6*60000+i*42*60000,readings:map.nhpl.map(item=>exampleReading(item,d*5+i))});
    }
  }
  const lastContext={machineId:'nhpl',processId:'nhpl-montagem',productId:'nhpl-mark-v',order:`${prefix}_order_mark`,lot:`${prefix}_lot_mark`,shift:'3',recipe:`${prefix}_recipe_mark_1`};
  const dataset={manifest:{id:prefix,version,origin:'demo',fromOperationalDate:from,toOperationalDate:to,defaultSelection:{query:{context:lastContext,fromDate:to,toDate:to,shift:'3'},recording:{productionCaseId:`${prefix}_case_d6_s3_p1_1`,context:lastContext}},entries:[],state:'prepared',createdBy:null,createdAt:null},commands,diagnostics:[]};
  sourceSnapshots.set(dataset,existingSnapshot);
  return dataset;
}

export async function previewPresentationDataset(dataset,{repo,actor,clock,existingSnapshot}={}){
  const source=repo??createSnapshotRepository(),isolated=createSnapshotRepository({timestamp:()=>source.timestamp()}),snapshot={};
  if(!repo)for(const [root,value]of Object.entries(existingSnapshot??sourceSnapshots.get(dataset)??{}))await source.create(root,value);
  const backupMembers=(existingSnapshot??sourceSnapshots.get(dataset))?.members;
  if(backupMembers!=null){snapshot.members=structuredClone(backupMembers);await isolated.create('members',backupMembers);}
  for(const root of roots){const value=await source.get(root);if(value!=null){snapshot[root]=value;await isolated.create(root,value);}}
  async function validate(snapshot,manifest,isolatedRepo){
    const result=await validatePresentationDataset(snapshot,manifest);
    if(result.ok){
      const services=createMsaServices({repo:isolatedRepo,actor,clock:clock??(()=>instant(manifest.toOperationalDate,31))});
      result.diagnostics.push(...await validatePresentationProjection(services,manifest,result.metricsByContext));
    }
    return {...result,ok:result.diagnostics.length===0};
  }
  const entries=dataset.manifest.entries??[];
  if(entries.length){const conflicts=[];let allPresent=true;for(const entry of entries){const current=await isolated.get(entry.path);if(current==null)allPresent=false;else if(await datasetHash(current)!==entry.hash)conflicts.push({code:'CONTENT_CONFLICT',path:entry.path});}
    if(conflicts.length||!allPresent)return {ok:false,manifest:dataset.manifest,commands:dataset.commands,diagnostics:conflicts.length?conflicts:[{code:'PARTIAL_PACKAGE_REQUIRES_RECONCILIATION'}],snapshot};
    const validation=await validate(snapshot,dataset.manifest,isolated);
    return {ok:validation.ok,manifest:dataset.manifest,commands:dataset.commands,diagnostics:validation.diagnostics,snapshot,metricsByContext:validation.metricsByContext,added:0};
  }
  const writes=[],tracked={...isolated,create:async(path,value)=>{if(await isolated.get(path)!=null){const error=new Error('CONTENT_CONFLICT');error.code='CONTENT_CONFLICT';throw error;}const result=await isolated.create(path,value);writes.push(path);return result;},transact:async(path,update)=>{const result=await isolated.transact(path,update);writes.push(path);return result;}};
  const results=new Map(),now=clock??(()=>instant(dataset.manifest.toOperationalDate,31));
  for(const command of dataset.commands){
    let number=0,idFactory=()=>`${command.id}_${++number}`;
    try{
      const args=await Promise.all(command.args.map(arg=>resolve(arg,results,tracked,actor)));
      const services=createMsaServices({repo:tracked,actor,clock:now,idFactory,enforceOperationalShifts:true});
      const method=command.service.split('.').reduce((node,key)=>node[key],services)[command.method];
      const owner=command.service.split('.').reduce((node,key)=>node[key],services);
      results.set(command.id,await method.apply(owner,args));
    }catch(error){return {ok:false,manifest:dataset.manifest,commands:dataset.commands,diagnostics:[{code:error.code??'COMMAND_FAILED',commandId:command.id,message:error.message}],snapshot,failedCommand:command.id};}
  }
  const output={};for(const root of roots){const value=await isolated.get(root);if(value!=null)output[root]=value;}
  if(backupMembers!=null)output.members=await isolated.get('members');
  const unique=[...new Set(writes)],manifest={...dataset.manifest,createdBy:actor.uid,createdAt:source.timestamp(),entries:await Promise.all(unique.map(async path=>({path,hash:await datasetHash(await isolated.get(path))})))};
  const validation=await validate(output,manifest,tracked);
  return {ok:validation.ok,manifest,commands:dataset.commands,diagnostics:validation.diagnostics,snapshot:output,metricsByContext:validation.metricsByContext,added:unique.length};
}
