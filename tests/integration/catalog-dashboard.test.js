import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setup,sdk} from '../helpers/firebase-env.js';
import {seed} from '../helpers/fixtures.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createMsaServices,getMsaParameterCatalog} from '../../app/src/index.js';

test('MSA catalog persists drafts without duplicates and another authorized session reads all dashboard parameters',async t=>{
  const env=await setup(t),repo=uid=>createFirebaseRepository({db:env.authenticatedContext(uid).database(),sdk,workspaceId:'demo'}),f=await seed(repo('admin'));
  const services=(uid,role)=>createMsaServices({repo:repo(uid),actor:{uid,role}});
  const admin=services('admin','admin'),op=services('op','operator'),eng=services('eng','engineer'),viewer=services('view','viewer');
  const payload={processId:f.context.processId,confirmed:true,natureByCode:Object.fromEntries(getMsaParameterCatalog().map(item=>[item.code,'setpoint']))};
  const installed=await admin.catalog.install(payload),repeat=await admin.catalog.install(payload);
  assert.equal(installed.items.length,41);assert.ok(repeat.items.every(item=>!item.parameterCreated&&!item.versionCreated));
  assert.equal(Object.keys(await repo('view').get('parameters')).length,42);
  const bf=installed.items.find(item=>item.code==='MSA_BF'),bh=installed.items.find(item=>item.code==='MSA_BH');
  assert.deepEqual((await repo('view').get(`parameterVersions/${bh.versionId}`)).rule,{kind:'pending'});
  await assert.rejects(()=>op.catalog.install(payload),{code:'FORBIDDEN'});
  const from=Date.parse('2026-10-05T00:00:00-03:00'),to=Date.parse('2026-10-06T00:00:00-03:00'),query={context:f.context,fromDate:'2026-10-05',toDate:'2026-10-05'};
  await op.operations.recordCollection({context:f.context,occurredAt:from+100,readings:[{parameterId:bf.parameterId,versionId:bf.versionId,raw:'0,8'}]});
  const draftView=await viewer.getDashboard(query,{from,to});assert.equal(draftView.parameters.length,42);
  assert.equal(draftView.parameters.find(row=>row.code==='MSA_BF').state,'pending');
  const approved=await eng.registry.createParameterVersion(bf.parameterId,{nature:'setpoint',unit:'seg',status:'approved',rule:{kind:'range',lower:0.8,upper:0.9}});
  await op.operations.recordCollection({context:f.context,occurredAt:from+200,readings:[{parameterId:bf.parameterId,versionId:approved.id,raw:'0,9'}]});
  const view=await viewer.getDashboard(query,{from,to}),row=view.parameters.find(item=>item.code==='MSA_BF');
  assert.equal(row.state,'within');assert.equal(row.latest.value,0.9);assert.equal(row.statistics.length,2);
  assert.equal((await repo('view').get(`parameterVersions/${bf.versionId}`)).status,'draft');
});
