import {createMsaServices} from '../services/create-msa.js';
import {getMsaParameterCatalog} from '../catalog/msa-parameters.js';
import {MsaError,assertRole,requireThat,validId} from '../domain/errors.js';
import {eventDate} from '../domain/time.js';
import {validateRule} from '../domain/limits.js';

const storageKey='msa.demo.workspace.v1';
const roots=['machines','processes','products','parameters','parameterVersions','reasons','targets','collections','production','losses','stoppages','reviews','corrections'];
const demoActor=Object.freeze({uid:'demo-admin',role:'admin'});
const defaultContext=Object.freeze({machineId:'demo-t20',processId:'demo-termoformagem',productId:'demo-piloto'});
const clone=value=>value==null?null:structuredClone(value);
const emptyData=()=>Object.fromEntries(roots.map(root=>[root,{}]));
const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const safeKey=key=>validId(key)&&!['__proto__','constructor','prototype'].includes(key);

export function checkDemoCredentials(email,password) {
  requireThat(email==='adm@adm.com'&&password==='adm','DEMO_LOGIN');return true;
}

// This fixture is invented from reference ranges; no industrial measurements are reused.
export async function seedSyntheticWorkspace({repo,papa,now=Date.now,actor=demoActor,reviewActor=actor}={}) {
  assertRole(actor,['admin']);assertRole(reviewActor,['admin','operator','engineer']);
  for(const root of roots) requireThat(Object.keys(await repo.get(root)??{}).length===0,'EMPTY_WORKSPACE_REQUIRED');
  const options={repo,papa,actor,clock:now};
  const services=createMsaServices(options);
  const registry=id=>createMsaServices({...options,idFactory:()=>id}).registry;
  await registry(defaultContext.machineId).create('machines',{name:'T20',code:'DEMO_T20'});
  await registry(defaultContext.processId).create('processes',{name:'Termoformagem - demonstracao',machineId:defaultContext.machineId});
  await registry(defaultContext.productId).create('products',{name:'Produto piloto - demonstracao',processIds:{[defaultContext.processId]:true}});
  const catalog=getMsaParameterCatalog();
  const natureByCode=Object.fromEntries(catalog.map(item=>[item.code,item.group==='heating'?'setpoint':'measurement']));
  const installed=await services.catalog.install({processId:defaultContext.processId,natureByCode,confirmed:true});
  const versions=new Map();
  for(const item of installed.items) {
    const reference=catalog.find(entry=>entry.code===item.code);
    let versionId=item.versionId;
    if(reference.draftRule.kind!=='pending') {
      versionId=`${item.parameterId}_demo_v1`;
      await registry(versionId).createParameterVersion(item.parameterId,{unit:reference.unit,nature:natureByCode[item.code],status:'approved',rule:reference.draftRule});
    }
    versions.set(item.code,{parameterId:item.parameterId,versionId});
  }
  const reasons={stop:'demo-stop',reject:'demo-reject',material:'demo-material',rework:'demo-rework'};
  const labels={stop:'Ajuste simulado',reject:'Peca fora de padrao - simulado',material:'Apara de material - simulado',rework:'Retrabalho simulado'};
  for(const [kind,id] of Object.entries(reasons)) await registry(id).create('reasons',{name:labels[kind],kind});
  const lastDate=eventDate(now()),lastNoon=Date.parse(`${lastDate}T12:00:00Z`);
  const bfValues=[0.8,0.9,0.81,0.89,0.8,0.88,0.9];
  for(let day=0;day<7;day++) {
    const date=new Date(lastNoon-(6-day)*86400000).toISOString().slice(0,10);
    const startedAt=Date.parse(`${date}T08:00:00-03:00`),endedAt=Date.parse(`${date}T16:00:00-03:00`),occurredAt=Date.parse(`${date}T14:00:00-03:00`);
    const context=clone(defaultContext),origin='demo';
    const readings=catalog.map(item=>{
      const {lower,upper}=item.source.limits;
      let value;
      if(item.code==='MSA_BF') value=bfValues[day];
      else if(item.code==='MSA_CH') value=-620-day*3;
      else if(item.code==='MSA_BH') value=77.5+(day%3-1)*0.2;
      else if(lower===0&&upper===0) value=0;
      else if(upper==null) value=lower+0.3+(day%3)*0.1;
      else value=(lower+upper)/2+(day%5-2)*(upper-lower)*0.06;
      if(day===6&&item.code==='MSA_BD') value=36.4;
      if(day===6&&item.code==='MSA_CF') value=6.2;
      if(day===3&&item.code==='MSA_AX') value=415.4;
      return {...versions.get(item.code),raw:String(Number(value.toFixed(3)))};
    });
    await services.operations.recordCollection({id:`demo-collection-${day+1}`,context,origin,occurredAt,readings});
    const gross=4200+day*120,rejected=[72,64,91,83,56,102,95][day];
    for(const [basis,quantity] of [['gross',gross],['good',gross-rejected]]) await services.operations.recordProduction({id:`demo-production-${basis}-${day+1}`,context,origin,occurredAt:startedAt,startedAt,endedAt,quantity,basis});
    await services.operations.recordLoss({id:`demo-reject-${day+1}`,context,origin,occurredAt,kind:'reject',unit:'pieces',amount:rejected,reasonId:reasons.reject});
    await services.operations.recordLoss({id:`demo-material-${day+1}`,context,origin,occurredAt,kind:'material',unit:'kg',amount:Number((5.6+day*0.45).toFixed(2)),reasonId:reasons.material});
    const stopStart=startedAt+2*3600000;
    await services.operations.startStoppage({id:`demo-stoppage-${day+1}`,context,origin,startedAt:stopStart,planned:day===1,reasonId:reasons.stop});
    await services.operations.closeStoppage(`demo-stoppage-${day+1}`,{endedAt:stopStart+(12+day*3)*60000,reasonId:reasons.stop});
  }
  for(const [id,collectionId,scope] of [
    ['demo-review-waiting','demo-collection-7','Operador simulado: avaliar resfriamento e pressao nos dados de demonstracao.'],
    ['demo-review-analyzing','demo-collection-4','Operador simulado: verificar medida do passo nos dados de demonstracao.']
  ]) await createMsaServices({...options,actor:reviewActor,idFactory:()=>id}).analysis.submitReview({collectionId,scope});
  await services.analysis.startReview('demo-review-analyzing');
  return clone(defaultContext);
}

export function createLocalRepository({data,now,persist=()=>{},notify=()=>{}}) {
  let disposed=false,state=clone(data);const watchers=new Set(),connections=new Set();
  const check=()=>requireThat(!disposed,'STALE_SESSION');
  const parts=path=>{
    requireThat(typeof path==='string','INVALID_PATH');const keys=path.split('/');
    requireThat(roots.includes(keys[0])&&keys.every(safeKey),'INVALID_PATH');return keys;
  };
  const read=path=>{
    let value=state;for(const key of parts(path)) {if(!isObject(value)||!Object.hasOwn(value,key)) return null;value=value[key];}
    return clone(value);
  };
  const page=(path,q={})=>{
    const limit=q.limit??200;requireThat(Number.isInteger(limit)&&limit>=1&&limit<=500,'INVALID_QUERY');
    const items=Object.entries(read(path)??{}).map(([id,row])=>({...row,id}))
      .filter(row=>(!q.fromDate||row.eventDate>=q.fromDate)&&(!q.toDate||row.eventDate<=q.toDate)&&(!q.cursor||row.eventDate>q.cursor.date||(row.eventDate===q.cursor.date&&row.id>q.cursor.key)))
      .sort((a,b)=>String(a.eventDate??'').localeCompare(String(b.eventDate??''))||a.id.localeCompare(b.id));
    const complete=items.length<=limit,rows=items.slice(0,limit),last=rows.at(-1);
    return {items:rows,complete,nextCursor:!complete&&last?{date:last.eventDate,key:last.id}:null};
  };
  const emit=watcher=>{
    if(disposed||!watchers.has(watcher)) return;
    try {watcher.onNext(watcher.q?page(watcher.path,watcher.q):read(watcher.path));} catch(error) {watcher.onError?.(error);}
  };
  const announce=()=>{for(const watcher of [...watchers]) emit(watcher);notify();};
  const save=next=>{check();persist(next);check();state=clone(next);announce();};
  const write=(path,value)=>{
    const keys=parts(path);requireThat(keys.length>=2,'INVALID_PATH');const next=clone(state);let node=next;
    for(const key of keys.slice(0,-1)) {node[key]??={};requireThat(isObject(node[key]),'INVALID_PATH');node=node[key];}
    node[keys.at(-1)]=clone(value);save(next);return read(path);
  };
  const repo={
    workspaceId:'demo',
    timestamp() {check();return now();},
    async get(path) {check();return read(path);},
    async create(path,data) {check();requireThat(read(path)===null,'CONFLICT');requireThat(isObject(data),'VALIDATION');return write(path,{origin:'demo',...data});},
    async updateRegistry(path,patch) {check();const current=read(path);requireThat(current!==null,'NOT_FOUND');return write(path,{...current,...clone(patch)});},
    async transact(path,updater) {check();const next=updater(read(path));requireThat(next!==undefined,'CONFLICT');return write(path,next);},
    async list(path,q={}) {check();return page(path,q);},
    watch(path,q,onNext,onError) {
      check();parts(path);if(q) page(path,q);const watcher={path,q,onNext,onError};watchers.add(watcher);queueMicrotask(()=>emit(watcher));return()=>watchers.delete(watcher);
    },
    watchConnection(onNext) {check();connections.add(onNext);queueMicrotask(()=>{if(!disposed&&connections.has(onNext)) onNext(true);});return()=>connections.delete(onNext);}
  };
  return {repo,snapshot:()=>clone(state),replace:save,dispose(){disposed=true;watchers.clear();connections.clear();}};
}

function parseStored(value) {
  try {
    const saved=JSON.parse(value);
    requireThat(saved?.schemaVersion===1&&saved.mode==='demo'&&isObject(saved.data),'DEMO_CORRUPT');
    requireThat(Object.keys(saved.data).length===roots.length&&roots.every(root=>isObject(saved.data[root])),'DEMO_CORRUPT');
    for(const records of Object.values(saved.data)) for(const [id,record] of Object.entries(records)) requireThat(safeKey(id)&&isObject(record)&&record.id===id,'DEMO_CORRUPT');
    for(const [field,root] of [['machineId','machines'],['processId','processes'],['productId','products']]) requireThat(saved.data[root][defaultContext[field]],'DEMO_CORRUPT');
    const data=saved.data;
    for(const process of Object.values(data.processes)) requireThat(data.machines[process.machineId],'DEMO_CORRUPT');
    for(const product of Object.values(data.products)) requireThat(isObject(product.processIds)&&Object.keys(product.processIds).length>0&&Object.entries(product.processIds).every(([id,linked])=>linked===true&&data.processes[id]),'DEMO_CORRUPT');
    for(const parameter of Object.values(data.parameters)) requireThat(data.processes[parameter.processId],'DEMO_CORRUPT');
    for(const version of Object.values(data.parameterVersions)) {
      requireThat(data.parameters[version.parameterId]&&['measurement','setpoint'].includes(version.nature)&&['draft','approved'].includes(version.status),'DEMO_CORRUPT');
      validateRule(version.rule);requireThat(version.rule.kind!=='pending'||version.status==='draft','DEMO_CORRUPT');
    }
    for(const root of ['collections','production','stoppages','losses','reviews','targets']) for(const row of Object.values(data[root])) {
      const context=row.context;requireThat(isObject(context)&&data.machines[context.machineId]&&data.processes[context.processId]?.machineId===context.machineId&&data.products[context.productId]?.processIds?.[context.processId]===true,'DEMO_CORRUPT');
    }
    for(const collection of Object.values(data.collections)) {
      requireThat(isObject(collection.readings),'DEMO_CORRUPT');
      for(const [id,reading] of Object.entries(collection.readings)) {
        requireThat(safeKey(id)&&isObject(reading)&&reading.parameterId===id&&data.parameters[id]?.processId===collection.context.processId&&data.parameterVersions[reading.versionId]?.parameterId===id,'DEMO_CORRUPT');
        requireThat(['valid','missing','invalid'].includes(reading.status)&&(reading.status!=='valid'||Number.isFinite(reading.value)),'DEMO_CORRUPT');
      }
    }
    for(const review of Object.values(data.reviews)) requireThat(data.collections[review.collectionId]&&['waiting','analyzing','approved','rejected'].includes(review.state),'DEMO_CORRUPT');
    return saved.data;
  } catch(error) {
    if(error instanceof MsaError&&error.code==='DEMO_CORRUPT') throw error;
    throw new MsaError('DEMO_CORRUPT','Os dados locais de demonstracao estao corrompidos.');
  }
}

export async function openDemoWorkspace({storage,papa=globalThis.Papa,now=Date.now}={}) {
  let stored;
  try {storage??=globalThis.localStorage;requireThat(typeof storage?.getItem==='function'&&typeof storage?.setItem==='function','DEMO_STORAGE');stored=storage.getItem(storageKey);}
  catch {throw new MsaError('DEMO_STORAGE','Nao foi possivel ler os dados locais de demonstracao.');}
  const persist=data=>{
    try {storage.setItem(storageKey,JSON.stringify({schemaVersion:1,mode:'demo',data}));}
    catch {throw new MsaError('DEMO_STORAGE','Nao foi possivel salvar os dados locais de demonstracao.');}
  };
  const seed=async()=>{
    const temporary=createLocalRepository({data:emptyData(),now});
    try {await seedSyntheticWorkspace({repo:temporary.repo,papa,now,reviewActor:{uid:'demo-operator',role:'operator'}});return temporary.snapshot();}
    finally {temporary.dispose();}
  };
  const data=stored===null?await seed():parseStored(stored);if(stored===null) persist(data);
  let disposed=false;const subscribers=new Set();
  const local=createLocalRepository({data,now,persist,notify:()=>{
    for(const callback of [...subscribers]) if(!disposed&&subscribers.has(callback)) {
      // A view failure must not turn a committed write into an apparent save failure.
      try {callback();} catch {}
    }
  }});
  const check=()=>requireThat(!disposed,'STALE_SESSION');
  return {
    mode:'demo',actor:clone(demoActor),repo:local.repo,defaultContext:clone(defaultContext),
    services:createMsaServices({repo:local.repo,actor:demoActor,papa,clock:now}),
    subscribe(callback) {check();requireThat(typeof callback==='function','VALIDATION');subscribers.add(callback);return()=>subscribers.delete(callback);},
    async reset() {check();const next=await seed();check();local.replace(next);},
    dispose() {if(disposed) return;disposed=true;subscribers.clear();local.dispose();}
  };
}
