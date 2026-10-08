import {createLocalRepository} from './demo-workspace.js';
import {seedPresentation} from './presentation.js';
import {createMsaServices} from '../services/create-msa.js';
import {createLiveCursor,advanceLive} from '../domain/live-scenario.js';
import {shiftAt} from '../domain/shifts.js';
import {eventDate} from '../domain/time.js';
import {contextKey} from '../domain/context.js';
import {ledgerView} from '../repositories/append-ledger.js';
import {projectIntervalProduction} from '../repositories/operation-records.js';
import {requireThat,assertRole} from '../domain/errors.js';
import {validateRule} from '../domain/limits.js';
const key='msa.nhpl.live.v1',commitKey=key+'.commit',writerKey=key+'.writer';
const clone=x=>structuredClone(x);
function validate(pack){
 requireThat(pack?.schemaVersion===1&&pack.mode==='live'&&Number.isSafeInteger(pack.revision)&&pack.cursor?.context?.machineId==='nhpl'&&Number.isSafeInteger(pack.cursor.through),'DEMO_CORRUPT');
 for(const root of ['machines','processes','products','parameters','parameterVersions','collections','production','losses','stoppages','reviews','corrections','technicalRecords','productionPlans','productionIntervals','productionPolicies','plannedCorrections','machineRuns'])requireThat(pack.data?.[root]&&typeof pack.data[root]==='object'&&!Array.isArray(pack.data[root]),'DEMO_CORRUPT');
 for(const v of Object.values(pack.data.parameterVersions)){requireThat(pack.data.parameters[v.parameterId],'DEMO_CORRUPT');validateRule(v.rule);}
 for(const root of ['productionPlans','productionIntervals','productionPolicies','machineRuns'])for(const h of Object.values(pack.data[root]))requireThat(ledgerView(h).complete,'DEMO_CORRUPT');return pack;
}
export async function openLiveWorkspace({storage=globalThis.localStorage,papa=globalThis.Papa,now=Date.now,actor,displayName='Usuário MSA',re='',locks=globalThis.navigator?.locks,timers=globalThis,autoStart=true}={}){
 let disposed=false,stopping=false,leader=false,phase='paused',failure=null,interval=null,releaseWriter=null,writerPromise=null,queue=Promise.resolve(),pack;
 const listeners=new Set(),locked=fn=>locks?locks.request(commitKey,fn):Promise.reject(Object.assign(new Error('Web Locks indisponível para iniciar a fonte.'),{code:'LIVE_LOCKS'}));
 const stored=()=>{const raw=storage.getItem(key);return raw?validate(JSON.parse(raw)):null;};
 const notify=()=>{for(const fn of listeners)try{fn(status());}catch{}};
 const local=createLocalRepository({data:{},now});
 const adopt=next=>{pack=next;local.hydrate(next.data);notify();};
 const commit=async fn=>locked(async()=>{requireThat(!disposed&&!stopping,'STALE_SESSION');const current=stored()??pack,next=clone(current),temp=createLocalRepository({data:next.data,now});try{const result=await fn(next,temp.repo);requireThat(!disposed&&!stopping,'STALE_SESSION');next.data=temp.snapshot();next.revision=current.revision+1;next.lastPersistedAt=now();validate(next);storage.setItem(key,JSON.stringify(next));adopt(next);return result;}finally{temp.dispose();}});
 async function initialize(){
  let current=stored();if(current){pack=current;adopt(current);return;}
  const initial=await seedPresentation({papa,now,includeFuturePlan:false,coherentShifts:true}),at=now(),s=shiftAt(at),context={...initial.context,order:'OP-LIVE-'+s.operationalDate.replaceAll('-',''),lot:'LOTE-LIVE-'+s.operationalDate.replaceAll('-',''),shift:s.shift};
  current={...initial,mode:'live',schemaVersion:1,revision:0,context,fromDate:s.operationalDate,toDate:s.operationalDate,cursor:createLiveCursor({startedAt:at,sessionId:crypto.randomUUID().slice(0,8),context}),sequences:{},activeInterval:null,activeRun:null,lastPersistedAt:at};
  if(locks)await locked(async()=>{const existing=stored();if(existing)current=existing;else storage.setItem(key,JSON.stringify(current));});else if(!stored())storage.setItem(key,JSON.stringify(current));adopt(current);
 }
 await initialize();
 const sourceActor={uid:'live-source-'+pack.cursor.sessionId,role:'admin'};
 const wrapRepo=new Proxy(local.repo,{get(target,name){if(['create','updateRegistry','transact'].includes(name))return (...args)=>commit((next,repo)=>repo[name](...args));if(name==='get'||name==='list')return async(...args)=>{const current=stored();if(current&&current.revision!==pack.revision)adopt(current);return target[name](...args);};const value=target[name];return typeof value==='function'?value.bind(target):value;}});
 const services=createMsaServices({repo:wrapRepo,actor:clone(actor),papa,clock:now,enforceOperationalShifts:true});
 const sourceServices=(repo,next)=>{let n=0;return createMsaServices({repo,actor:sourceActor,papa,clock:now,enforceOperationalShifts:true,idFactory:()=>`lv_${next.cursor.sessionId}_${next.revision}_${++n}`});};
 async function prepare(next,repo,s,at,context){
  const active=next.activeInterval?{...await repo.get('productionIntervals/'+next.activeInterval),id:next.activeInterval}:null;
  if(active&&active.endedAt>at&&contextKey(active.context)===contextKey(context))return active;
  if(active&&active.endedAt<=at){const rows=projectIntervalProduction({[active.id]:active}),human=rows.some(r=>r.createdBy!==sourceActor.uid)||Object.values(await repo.get('plannedCorrections')??{}).some(r=>r.intervalId===active.id);
   if(!human&&ledgerView(active).last?.kind!=='closure'){
    if(!rows.length)for(const basis of ['gross','good'])await s.plannedProduction.record(active.id,{quantity:0,basis,startedAt:active.startedAt,endedAt:active.endedAt,origin:'demo'});
    const header=await repo.get('productionIntervals/'+active.id),all=projectIntervalProduction({[active.id]:header}),gross=all.filter(r=>r.basis==='gross').reduce((n,r)=>n+r.quantity,0),good=all.filter(r=>r.basis==='good').reduce((n,r)=>n+r.quantity,0);
    await s.technical.inspect({intervalId:active.id,firstPassGood:good,historyComplete:!next.cursor.gaps.some(g=>g.from<active.endedAt&&g.to>active.startedAt),note:'Cobertura observada da fonte de cenário'});
    await s.plannedProduction.confirm(active.id,{expectedRevision:ledgerView(header).last.id,confirmedGrossPieces:gross});
   }
   if(next.activeRun){let run=ledgerView(await repo.get('machineRuns/'+next.activeRun)).last;if(run.productionEndedAt==null)run=await s.runs.advance(next.activeRun,{expectedRevision:run.id,productionEndedAt:active.endedAt});if(run.machineEndedAt==null)await s.runs.advance(next.activeRun,{expectedRevision:run.id,machineEndedAt:active.endedAt});}
  }
  const endedAt=Math.min(shiftAt(at).to,Math.floor(at/3600000)*3600000+3600000),plan=await s.planning.approve({context,startedAt:at,endedAt,intervalMinutes:60,quantitySource:'informed',plannedPieces:Math.floor((endedAt-at)/12000)});
  const h={...await repo.get('productionIntervals/'+plan.intervals[0].id),id:plan.intervals[0].id};next.activeInterval=h.id;next.context=clone(context);next.toDate=shiftAt(at).operationalDate;
  if(!(await s.technical.records()).some(r=>r.kind==='reference'&&contextKey(r.context)===contextKey(context)))await s.technical.reference({context,idealSeconds:10,microStopSeconds:60,effectiveFrom:at,source:'Referência própria do cenário contínuo; sem homologação industrial'});
  const run=await s.runs.start({context,machineStartedAt:at});next.activeRun=run.runId;await s.runs.advance(run.runId,{expectedRevision:run.id,productionStartedAt:at});return h;
 }
 async function apply(next,repo,result){
  const s=sourceServices(repo,next);
  // Preserve chronological commits, including the last piece of the previous shift.
  for(const intent of result.intents){const at=intent.occurredAt,context=intent.context,p=intent.payload;
   if(intent.kind==='rotate'){await prepare(next,repo,s,at,context);continue;}
   let h=next.activeInterval?{...await repo.get('productionIntervals/'+next.activeInterval),id:next.activeInterval}:null;
   if(!h||at>h.endedAt||contextKey(h.context)!==contextKey(context))h=await prepare(next,repo,s,h&&intent.kind==='piece'&&contextKey(h.context)===contextKey(context)?h.endedAt:Math.min(at,now()),context);
   const ingest=async(type,extra={},suffix='')=>{const sourceId=intent.sourceId,sequence=(next.sequences[sourceId]??0)+1;next.sequences[sourceId]=sequence;return s.technical.ingest({schemaVersion:1,sourceId,eventId:intent.id+suffix,sequence,occurredAt:at,context,type,...extra});};
   if(intent.kind==='piece'){
    await ingest('production',{intervalId:h.id,basis:'gross',quantity:1},'g');await ingest('production',{intervalId:h.id,basis:'good',quantity:p.rejected?0:1},'b');
    if(p.rejected)await s.operations.recordLoss({id:'rej_'+intent.sourceId+'_'+intent.id,context,kind:'reject',amount:1,unit:'pieces',reasonId:'nhpl-reject',occurredAt:at-1,origin:'demo'});
    const rows=projectIntervalProduction({[h.id]:await repo.get('productionIntervals/'+h.id)});if(rows.every(r=>r.createdBy===sourceActor.uid))await s.technical.inspect({intervalId:h.id,firstPassGood:rows.filter(r=>r.basis==='good').reduce((n,r)=>n+r.quantity,0),historyComplete:!result.cursor.gaps.some(g=>g.from<h.endedAt&&g.to>h.startedAt),note:'Peças de primeira passagem observadas pela fonte de cenário'});
   }else if(intent.kind==='stop'){
    const event=await ingest('state',{state:'stopped',reasonId:'nhpl-stop'}),stopId=event.id;
    await s.technical.classify({stopId,category:p.failure?'availability':'performance',failure:p.failure,...(p.failure?{repairStartedAt:at}:{}),note:p.failure?'Falha da fonte contínua; reparo em andamento':'Microparada registrada pela fonte contínua'});
   }else if(['repair-start','repair-end','stop-end'].includes(intent.kind)){
    const stopId='evt_'+p.id,stop=await repo.get('stoppages/'+stopId);if(!stop)continue;
    if(intent.kind==='stop-end'){await s.operations.closeStoppage(stopId,{endedAt:at,reasonId:stop.reasonId,goodValidated:true});await ingest('good-validated',{validated:true});}
    await s.technical.classify({stopId,category:p.failure?'availability':'performance',failure:p.failure,...(p.failure?{repairStartedAt:p.repairStartedAt??p.startedAt,...(p.repairEndedAt!=null?{repairEndedAt:p.repairEndedAt}:{})}:{}),note:'Atualização do reparo/parada da fonte contínua'});
   }else if(intent.kind==='measurement'){
    for(const [index,id]of ['ap-fit','ap-test'].entries()){const version=Object.values(await repo.get('parameterVersions')).filter(v=>v.parameterId===id&&v.status==='approved').at(-1);const center=index?100:10,spread=index?1:.03,value=p.deviation&&index===0?10.7:center+Math.sin(p.index*1.7)*spread;await ingest('measurement',{parameterId:id,versionId:version.id,raw:String(Number(value.toFixed(3)))},'m'+index);}
   }else if(intent.kind==='heartbeat'&&p.state!=='stopped')await ingest('state',{state:'running'});
   else if(intent.kind==='command'&&['disconnect','reconnect'].includes(p.type))await ingest('state',{state:p.type==='disconnect'?'disconnected':'running'});
  }
  next.cursor=result.cursor;
  const h=next.activeInterval?await repo.get('productionIntervals/'+next.activeInterval):null;if(!h||h.endedAt<=result.cursor.through)await prepare(next,repo,s,result.cursor.through,result.cursor.context);
 }
 async function step(command=null){if(disposed||stopping||!leader||phase==='error')return;queue=queue.then(()=>commit(async(next,repo)=>{const result=advanceLive(next.cursor,{through:now(),command});await apply(next,repo,result);})).catch(error=>{failure=error;phase='error';notify();});return queue;}
 function status(){const current=stored();if(current&&current.revision!==pack.revision)adopt(current);return {phase:failure?'error':!leader?'follower':pack.cursor.disconnected?'disconnected':pack.cursor.paused?'paused':phase,asOf:pack.cursor.through,lastEventAt:pack.cursor.through,lastPersistedAt:pack.lastPersistedAt,error:failure,gap:pack.cursor.gaps.at(-1),stop:pack.cursor.stop,pieceCount:pack.cursor.pieceCount,rejectCount:pack.cursor.rejectCount,context:clone(pack.context)};}
 async function start(){requireThat(!disposed&&!stopping,'STALE_SESSION');if(writerPromise)return;if(!locks){failure=Object.assign(new Error('Este navegador não permite coordenação segura da fonte.'),{code:'LIVE_LOCKS'});phase='error';notify();return;}
  let ready;const initialized=new Promise(r=>ready=r);writerPromise=locks.request(writerKey,{ifAvailable:true},async lock=>{if(!lock){phase='follower';ready();return;}leader=true;phase='running';failure=null;
   await commit(async(next,repo)=>{const at=now();if(at>next.cursor.through&&next.activeInterval){next.cursor.gaps.push({from:next.cursor.through,to:at});next.cursor.through=at;}next.cursor.through=at;next.cursor.context.shift=shiftAt(at).shift;next.cursor.sourceId='live-'+next.cursor.sessionId+'-'+at;next.cursor.sequence=0;await prepare(next,repo,sourceServices(repo,next),at,next.cursor.context);});
   if(interval!=null)timers.clearInterval(interval);interval=timers.setInterval(()=>step(),1000);
   const released=new Promise(r=>releaseWriter=r);ready();notify();await released;
  }).catch(error=>{failure=error;phase='error';ready();notify();});await initialized;
  if(!leader){writerPromise=null;if(interval==null&&!failure&&!stopping)interval=timers.setInterval(()=>start(),2000);}
 }
 let off=()=>{};if(storage===globalThis.localStorage&&typeof window!=='undefined'){const listener=e=>{if(e.key===key&&e.newValue){try{adopt(validate(JSON.parse(e.newValue)));}catch(error){failure=error;phase='error';notify();}}};window.addEventListener('storage',listener);off=()=>window.removeEventListener('storage',listener);}
 const live={status,async suspend(){if(interval!=null)timers.clearInterval(interval);interval=null;releaseWriter?.();await queue;await writerPromise;writerPromise=null;leader=false;phase='paused';},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},start,async command(type){assertRole(actor,['admin','engineer','operator']);requireThat(leader,'LIVE_FOLLOWER');await step({id:crypto.randomUUID(),type});},pause(){return this.command('pause');},async retry(){assertRole(actor,['admin','engineer','operator']);failure=null;phase='running';if(!leader)await start();else await step();}};
 if(autoStart)await start();
 return {mode:'live',actor:clone(actor),repo:wrapRepo,services,live,get context(){return clone(pack.context);},get fromDate(){return pack.fromDate;},get toDate(){return pack.toDate;},get range(){const s=shiftAt(now());return {from:Date.parse(pack.fromDate+'T07:00:00-03:00'),to:s.to};},displayName,re,exportBackup:()=>JSON.stringify(pack,null,2),async dispose(){if(disposed||stopping)return;stopping=true;if(interval!=null)timers.clearInterval(interval);releaseWriter?.();await queue;await writerPromise;disposed=true;leader=false;phase='stopped';off();listeners.clear();local.dispose();}};
}
