import {test} from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {memoryRepository} from '../helpers/memory-repository.js';

let demo={};
try {demo=await import('../../app/src/ui/demo-workspace.js');}
catch(error) {if(error.code!=='ERR_MODULE_NOT_FOUND') throw error;}

const fixedNow=()=>Date.parse('2026-10-06T01:00:00Z');
const key='msa.demo.workspace.v1';
function localStorage(initial={}) {
  const entries=new Map(Object.entries(initial));
  return {getItem:name=>entries.get(name)??null,setItem:(name,value)=>entries.set(name,String(value)),removeItem:name=>entries.delete(name)};
}
async function open(storage=localStorage()) {
  assert.equal(typeof demo.openDemoWorkspace,'function','Missing local demo workspace');
  return demo.openDemoWorkspace({storage,papa:Papa,now:fixedNow});
}
const range={from:Date.parse('2026-09-29T00:00:00-03:00'),to:Date.parse('2026-10-06T00:00:00-03:00')};
const query=workspace=>({context:workspace.defaultContext,fromDate:'2026-09-29',toDate:'2026-10-05'});

test('demo credentials accept only the exact local account',()=>{
  assert.equal(typeof demo.checkDemoCredentials,'function','Missing demo credentials');
  assert.equal(demo.checkDemoCredentials('adm@adm.com','adm'),true);
  for(const [email,password] of [['other@example.com','adm'],['adm@adm.com','wrong'],[' ADM@ADM.COM ','adm'],['adm@adm.com',' adm'],[null,null]]) {
    assert.throws(()=>demo.checkDemoCredentials(email,password),{name:'MsaError',code:'DEMO_LOGIN'});
  }
});

test('local workspace preserves submitted operations and registry changes after reload',async()=>{
  const storage=localStorage(),workspace=await open(storage);
  assert.equal(workspace.mode,'demo');assert.deepEqual(workspace.actor,{uid:'demo-admin',role:'admin'});
  const parameter=Object.values(await workspace.repo.get('parameters')).find(row=>row.code==='MSA_BD');
  const version=Object.values(await workspace.repo.get('parameterVersions')).find(row=>row.parameterId===parameter.id&&row.status==='approved');
  const record=await workspace.services.operations.recordCollection({id:'demo-submitted',context:workspace.defaultContext,origin:'demo',occurredAt:fixedNow(),readings:[{parameterId:parameter.id,versionId:version.id,raw:'35,7'}]});
  await workspace.services.registry.update('machines',workspace.defaultContext.machineId,{name:'T20 - local edit'});
  workspace.dispose();
  const reloaded=await open(storage);
  assert.deepEqual(await reloaded.repo.get('collections/demo-submitted'),record);
  assert.equal((await reloaded.repo.get(`machines/${reloaded.defaultContext.machineId}`)).name,'T20 - local edit');
  const persisted=storage.getItem(key);assert.ok(persisted);assert.equal(persisted.includes('adm@adm.com'),false);assert.equal(persisted.includes('password'),false);
  reloaded.dispose();
});

test('seeded seven-day dashboard exposes every parameter and meaningful synthetic deviations',async()=>{
  const workspace=await open(),view=await workspace.services.getDashboard(query(workspace),range);
  assert.equal(view.complete,true);assert.equal(view.parameters.length,41);
  assert.ok(view.parameters.every(row=>row.observationCount===7&&row.latest!==null));
  assert.equal(view.parameters.find(row=>row.code==='MSA_BD').state,'outside');
  assert.equal(view.parameters.find(row=>row.code==='MSA_CF').state,'outside');
  for(const row of view.parameters.filter(row=>row.group==='heating'||['MSA_CH','MSA_BH'].includes(row.code))) {
    assert.equal(row.configurationState,'pending');assert.equal(row.state,'pending');assert.ok(row.statistics.every(group=>group.cp===null&&group.cpk===null));
  }
  const bf=view.parameters.find(row=>row.code==='MSA_BF');assert.equal(bf.latest.nature,'measurement');assert.ok(bf.statistics[0].sigma>0);assert.ok(bf.statistics[0].cp<1);
  const collections=Object.values(await workspace.repo.get('collections'));
  assert.deepEqual(collections.map(row=>row.eventDate).sort(),['2026-09-29','2026-09-30','2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05']);
  assert.ok(collections.every(row=>row.origin==='demo'&&Object.keys(row.readings).length===41));
  assert.equal(view.totals.grossPieces-view.totals.goodPieces,view.totals.rejectedPieces);assert.ok(view.totals.lossKg>0);assert.ok(view.totals.stopMinutes>0);assert.equal(view.totals.openStoppages,0);
  const reviews=Object.values(await workspace.repo.get('reviews'));
  assert.deepEqual(reviews.map(row=>row.state).sort(),['analyzing','waiting']);assert.ok(reviews.every(row=>row.createdBy==='demo-operator'&&row.origin==='demo'));
  const drafts=Object.values(await workspace.repo.get('parameterVersions')).filter(row=>row.status==='draft');assert.equal(drafts.length,41);
  workspace.dispose();
});

test('reset restores the synthetic dataset and persists it before notifying subscribers',async()=>{
  const storage=localStorage(),workspace=await open(storage);
  await workspace.services.registry.update('machines',workspace.defaultContext.machineId,{name:'Changed'});
  await workspace.repo.create('collections/extra',{id:'extra',origin:'demo',eventDate:'2026-10-05',context:workspace.defaultContext,readings:{}});
  let announcements=0,observedName;
  const off=workspace.subscribe(()=>{announcements++;observedName=JSON.parse(storage.getItem(key)).data.machines[workspace.defaultContext.machineId].name;});
  await workspace.reset();assert.equal(announcements,1);assert.equal(observedName,'T20');off();
  assert.equal(await workspace.repo.get('collections/extra'),null);assert.equal(Object.keys(await workspace.repo.get('collections')).length,7);
  const reloaded=await open(storage);assert.equal((await reloaded.repo.get(`machines/${workspace.defaultContext.machineId}`)).name,'T20');
  reloaded.dispose();workspace.dispose();
});

test('disposal cancels watchers and rejects stale reads, writes, resets and subscriptions',async()=>{
  const storage=localStorage(),workspace=await open(storage);let notices=0,watchNotices=0,connectionNotices=0;
  workspace.subscribe(()=>notices++);workspace.repo.watch('machines',null,()=>watchNotices++);workspace.repo.watchConnection(()=>connectionNotices++);
  await new Promise(resolve=>queueMicrotask(resolve));assert.equal(watchNotices,1);assert.equal(connectionNotices,1);
  workspace.dispose();const persisted=storage.getItem(key);
  await assert.rejects(()=>workspace.services.registry.update('machines',workspace.defaultContext.machineId,{name:'Stale'}),{code:'STALE_SESSION'});
  await assert.rejects(()=>workspace.repo.get('machines'),{code:'STALE_SESSION'});await assert.rejects(()=>workspace.reset(),{code:'STALE_SESSION'});
  assert.throws(()=>workspace.repo.timestamp(),{code:'STALE_SESSION'});assert.throws(()=>workspace.subscribe(()=>{}),{code:'STALE_SESSION'});assert.throws(()=>workspace.repo.watchConnection(()=>{}),{code:'STALE_SESSION'});
  assert.equal(storage.getItem(key),persisted);assert.equal(notices,0);assert.equal(watchNotices,1);assert.equal(connectionNotices,1);
});

test('storage failure rejects an operation without changing records or announcing a save',async()=>{
  const storage=localStorage(),workspace=await open(storage),before=await workspace.repo.get('machines');let announcements=0;
  workspace.subscribe(()=>announcements++);storage.setItem=()=>{throw new Error('Quota exceeded');};
  await assert.rejects(()=>workspace.services.registry.update('machines',workspace.defaultContext.machineId,{name:'Unsaved'}),{name:'MsaError',code:'DEMO_STORAGE'});
  assert.deepEqual(await workspace.repo.get('machines'),before);assert.equal(announcements,0);
  await assert.rejects(()=>workspace.reset(),{code:'DEMO_STORAGE'});assert.deepEqual(await workspace.repo.get('machines'),before);
  workspace.dispose();
});

test('unavailable and corrupt storage are surfaced without overwriting the existing value',async()=>{
  await assert.rejects(()=>open({getItem:()=>{throw new Error('Blocked');},setItem(){}}),{code:'DEMO_STORAGE'});
  await assert.rejects(()=>open({getItem:()=>null,setItem:()=>{throw new Error('Full');}}),{code:'DEMO_STORAGE'});
  for(const invalid of ['{broken','null','{"schemaVersion":1,"mode":"demo","data":{}}']) {
    const storage=localStorage({[key]:invalid});await assert.rejects(()=>open(storage),{code:'DEMO_CORRUPT'});assert.equal(storage.getItem(key),invalid);
  }
});

test('corrupt stored relationships and invalid version rules fail explicitly before serving records',async()=>{
  const storage=localStorage(),workspace=await open(storage),saved=storage.getItem(key);workspace.dispose();
  for(const corrupt of [
    data=>{data.processes['demo-termoformagem'].machineId='missing-machine';},
    data=>{Object.values(data.collections)[0].readings=42;},
    data=>{Object.values(Object.values(data.collections)[0].readings)[0].versionId='missing-version';},
    data=>{Object.values(data.parameterVersions).find(row=>row.rule.kind==='pending').status='approved';}
  ]) {
    const record=JSON.parse(saved);corrupt(record.data);const invalid=JSON.stringify(record);storage.setItem(key,invalid);
    await assert.rejects(()=>open(storage),{code:'DEMO_CORRUPT'});assert.equal(storage.getItem(key),invalid);
  }
});

test('observer exceptions do not report a persisted operation as failed',async()=>{
  const storage=localStorage(),workspace=await open(storage);let calls=0;
  workspace.subscribe(()=>{throw new Error('Broken view');});workspace.subscribe(()=>calls++);
  await workspace.services.registry.update('machines',workspace.defaultContext.machineId,{name:'Saved despite broken observer'});
  assert.equal((await workspace.repo.get(`machines/${workspace.defaultContext.machineId}`)).name,'Saved despite broken observer');
  assert.equal(JSON.parse(storage.getItem(key)).data.machines[workspace.defaultContext.machineId].name,'Saved despite broken observer');assert.equal(calls,1);
  workspace.dispose();
});

test('repository pages records, transacts atomically and confines paths to its demo tree',async()=>{
  const workspace=await open(),repo=workspace.repo;
  const first=await repo.list('collections',{fromDate:'2026-09-29',toDate:'2026-10-05',limit:2});
  assert.equal(first.items.length,2);assert.equal(first.complete,false);assert.deepEqual(first.nextCursor,{date:'2026-09-30',key:first.items[1].id});
  const next=await repo.list('collections',{fromDate:'2026-09-29',toDate:'2026-10-05',limit:2,cursor:first.nextCursor});assert.equal(next.items[0].eventDate,'2026-10-01');
  const machine=await repo.get(`machines/${workspace.defaultContext.machineId}`);
  await assert.rejects(()=>repo.create(`machines/${machine.id}`,machine),{code:'CONFLICT'});
  await assert.rejects(()=>repo.transact(`machines/${machine.id}`,()=>undefined),{code:'CONFLICT'});
  assert.deepEqual(await repo.get(`machines/${machine.id}`),machine);
  for(const path of ['workspaces/real/machines','secrets/key','machines/__proto__','../machines']) await assert.rejects(()=>repo.get(path),{code:'INVALID_PATH'});
  await assert.rejects(()=>repo.list('collections',{limit:0}),{code:'INVALID_QUERY'});
  workspace.dispose();
});

test('reusable seed populates an empty repository through domain services with the provided actor',async()=>{
  assert.equal(typeof demo.seedSyntheticWorkspace,'function','Missing reusable synthetic seeder');
  const repo=memoryRepository(),context=await demo.seedSyntheticWorkspace({repo,papa:Papa,now:fixedNow,actor:{uid:'signed-in-admin',role:'admin'}});
  assert.deepEqual(context,{machineId:'demo-t20',processId:'demo-termoformagem',productId:'demo-piloto'});
  assert.equal(Object.keys(await repo.get('parameters')).length,41);
  assert.ok(Object.values(await repo.get('machines')).every(row=>row.createdBy==='signed-in-admin'));
  assert.ok(Object.values(await repo.get('reviews')).every(row=>row.createdBy==='signed-in-admin'&&row.scope.includes('Operador simulado')));
});

test('reusable seeder refuses any existing domain records before its first write',async()=>{
  assert.equal(typeof demo.seedSyntheticWorkspace,'function','Missing reusable synthetic seeder');
  for(const root of ['machines','processes','products','parameters','parameterVersions','reasons','targets','collections','production','losses','stoppages','reviews','corrections']) {
    const repo=memoryRepository(),existing={id:'existing',name:'Keep this record'};await repo.create(`${root}/existing`,existing);
    await assert.rejects(()=>demo.seedSyntheticWorkspace({repo,papa:Papa,now:fixedNow}),{code:'EMPTY_WORKSPACE_REQUIRED'});
    assert.deepEqual(await repo.get(`${root}/existing`),existing);assert.equal(await repo.get(root==='machines'?'products':'machines'),null);
  }
});
