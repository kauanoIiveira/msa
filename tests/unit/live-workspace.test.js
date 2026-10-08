import test from 'node:test';import assert from 'node:assert/strict';import Papa from 'papaparse';
import {openLiveWorkspace} from '../../app/src/ui/live-workspace.js';
import {loadOperationalView} from '../../app/src/ui/operational-query.js';
import {liveObservedBases} from '../../app/src/ui/live-controls.js';
import {technicalView} from '../../app/src/ui/technical.js';
function storageFixture(){const data=new Map([['msa.nhpl.presentation.v3','preserve']]);return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};}
function clockFixture(initial='2026-10-08T08:00:00-03:00'){let time=Date.parse(initial),tick;return {now:()=>time,timers:{setInterval:fn=>{tick=fn;return 1;},clearInterval:()=>{tick=null;}},async advance(ms){time+=ms;return tick?.();}};}
function locksFixture(){const queues=new Map();return {async request(name,options,fn){if(typeof options==='function'){fn=options;options={};}if(options.ifAvailable&&queues.has(name))return fn(null);const previous=queues.get(name)??Promise.resolve();let release;const next=new Promise(r=>release=r);queues.set(name,next);await previous;try{return await fn({name});}finally{release();if(queues.get(name)===next)queues.delete(name);}}};}
const liveRows=pack=>Object.values(pack.data.productionIntervals).filter(h=>h.context.order.startsWith('OP-LIVE')).flatMap(h=>Object.values(h.events??{})).filter(e=>e.kind==='production');
test('delayed callback crossing an hour commits both pieces into their proper intervals',async()=>{
 const storage=storageFixture(),clock=clockFixture('2026-10-08T08:59:40-03:00'),w=await openLiveWorkspace({storage,papa:Papa,...clock,locks:locksFixture(),actor:{uid:'a',role:'admin'}});
 try{await clock.advance(24000);assert.equal(w.live.status().error,null);assert.equal(w.live.status().pieceCount,2);const pack=JSON.parse(w.exportBackup());assert.equal(liveRows(pack).filter(r=>r.basis==='gross').reduce((n,r)=>n+r.quantity,0),2);}finally{await w.dispose();}
});
test('failure stops pieces and records a thirty-second completed repair through the technical service',async()=>{
 const storage=storageFixture(),clock=clockFixture(),w=await openLiveWorkspace({storage,papa:Papa,...clock,locks:locksFixture(),actor:{uid:'a',role:'admin'}});try{
  for(let i=0;i<225;i++){await clock.advance(1000);assert.equal(w.live.status().error,null);}
  const pack=JSON.parse(storage.getItem('msa.nhpl.live.v1')),failures=Object.values(pack.data.technicalRecords).filter(r=>r.kind==='classification'&&r.failure&&r.repairEndedAt!=null);assert.ok(failures.length>0);assert.equal(failures.at(-1).repairEndedAt-failures.at(-1).repairStartedAt,30000);assert.equal(pack.cursor.stop,null);
  const view=await loadOperationalView({services:w.services,repo:w.repo,consultation:{context:w.context,shift:'all',fromDate:w.fromDate,toDate:w.toDate},now:clock.now()});
  const metrics=technicalView({...view,client:w,context:w.context,fromDate:w.fromDate,toDate:w.toDate,liveCoverage:liveObservedBases(pack,view.operationalQuery,clock.now())});
  assert.equal(metrics.reliability.mttr.value,30);assert.equal(metrics.reliability.mtbf.value,180);assert.equal(metrics.aggregate.state,'partial');
 }finally{await w.dispose();}
});
test('live suspension for a static scenario stops timers and resumes without background or offline production',async()=>{
 const storage=storageFixture(),clock=clockFixture(),w=await openLiveWorkspace({storage,papa:Papa,...clock,locks:locksFixture(),actor:{uid:'v',role:'viewer'}});
 try{await clock.advance(24000);await w.live.suspend();await clock.advance(120000);assert.equal(JSON.parse(storage.getItem('msa.nhpl.live.v1')).cursor.pieceCount,2);await w.live.start();assert.equal(w.live.status().pieceCount,2);await clock.advance(12000);assert.equal(w.live.status().pieceCount,3);}finally{await w.dispose();}
});
test('strict operational writes reject crossing a shift',async()=>{
 const storage=storageFixture(),clock=clockFixture(),w=await openLiveWorkspace({storage,papa:Papa,...clock,locks:locksFixture(),actor:{uid:'human',role:'admin'}});try{
  await assert.rejects(w.services.planning.approve({context:w.context,startedAt:Date.parse('2026-10-08T14:00:00-03:00'),endedAt:Date.parse('2026-10-08T16:00:00-03:00'),intervalMinutes:60,quantitySource:'informed',plannedPieces:600}),{code:'SHIFT_PERIOD'});
 }finally{await w.dispose();}
});
test('manual increments in a source interval are preserved without source inspection or confirmation',async()=>{
 const storage=storageFixture(),clock=clockFixture('2026-10-08T08:59:40-03:00'),w=await openLiveWorkspace({storage,papa:Papa,...clock,locks:locksFixture(),actor:{uid:'human',role:'admin'}});try{
  await clock.advance(3000);const id=JSON.parse(storage.getItem('msa.nhpl.live.v1')).activeInterval;
  await w.services.plannedProduction.record(id,{quantity:1,basis:'gross',startedAt:clock.now()-1000,endedAt:clock.now(),origin:'manual'});
  await clock.advance(18000);const pack=JSON.parse(storage.getItem('msa.nhpl.live.v1')),rows=Object.values(pack.data.productionIntervals[id].events);
  assert.ok(rows.some(r=>r.kind==='production'&&r.createdBy==='human'));assert.equal(rows.some(r=>r.kind==='closure'),false);
  assert.equal(Object.values(pack.data.technicalRecords).some(r=>r.kind==='inspection'&&r.intervalId===id),false);assert.equal(w.live.status().error,null);
 }finally{await w.dispose();}
});
test('follower takes over when producer disposes, without replaying unobserved time',async()=>{
 const storage=storageFixture(),locks=locksFixture(),a=clockFixture(),b=clockFixture();const first=await openLiveWorkspace({storage,papa:Papa,...a,locks,actor:{uid:'a',role:'admin'}}),second=await openLiveWorkspace({storage,papa:Papa,...b,locks,actor:{uid:'b',role:'viewer'}});
 try{await a.advance(24000);await b.advance(24000);await first.dispose();await b.advance(12000);assert.equal(second.live.status().phase,'running');assert.equal(second.live.status().pieceCount,2);await b.advance(12000);assert.equal(second.live.status().pieceCount,3);}finally{await first.dispose();await second.dispose();}
});
test('persistent live source records cycles through services and retains source on retry and reload',async()=>{
 const storage=storageFixture(),clock=clockFixture(),locks=locksFixture();let w=await openLiveWorkspace({storage,papa:Papa,...clock,locks,actor:{uid:'view',role:'viewer'}});
 await clock.advance(24000);assert.equal(w.live.status().error,null);let pack=JSON.parse(storage.getItem('msa.nhpl.live.v1'));assert.equal(liveRows(pack).filter(e=>e.basis==='gross').reduce((n,e)=>n+e.quantity,0),2);assert.equal(liveRows(pack).filter(e=>e.basis==='good').reduce((n,e)=>n+e.quantity,0),2);assert.equal(pack.cursor.pieceCount,2);assert.equal(storage.getItem('msa.nhpl.presentation.v3'),'preserve');
 await assert.rejects(w.services.plannedProduction.record(pack.activeInterval,{quantity:1,basis:'gross',startedAt:clock.now()-1000,endedAt:clock.now()}),{code:'FORBIDDEN'});
 await w.dispose();await clock.advance(120000);w=await openLiveWorkspace({storage,papa:Papa,...clock,locks,actor:{uid:'view',role:'viewer'}});assert.equal(JSON.parse(storage.getItem('msa.nhpl.live.v1')).cursor.pieceCount,2);
 const save=storage.setItem;storage.setItem=()=>{throw new Error('quota');};await clock.advance(12000);assert.equal(w.live.status().phase,'error');assert.equal(JSON.parse(storage.getItem('msa.nhpl.live.v1')).cursor.pieceCount,2);storage.setItem=save;await w.dispose();
});
test('one elected producer runs while follower remains viewer',async()=>{
 const storage=storageFixture(),locks=locksFixture(),a=clockFixture(),b=clockFixture();const first=await openLiveWorkspace({storage,papa:Papa,...a,locks,actor:{uid:'a',role:'admin'}}),second=await openLiveWorkspace({storage,papa:Papa,...b,locks,actor:{uid:'b',role:'viewer'}});assert.equal(second.live.status().phase,'follower');await a.advance(24000);await b.advance(24000);assert.equal(JSON.parse(storage.getItem('msa.nhpl.live.v1')).cursor.pieceCount,2);await second.dispose();await first.dispose();
});
