import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildPresentationDataset,previewPresentationDataset} from '../../app/src/presentation/dataset-builder.js';
import {validatePresentationDataset} from '../../app/src/presentation/dataset-validation.js';
import {memoryRepository} from '../helpers/memory-repository.js';
import {readFileSync} from 'node:fs';
import {getMsaParameterCatalog} from '../../app/src/catalog/msa-parameters.js';
import {presentationParameterMap} from '../../app/src/presentation/parameter-map.js';
import {datasetHash} from '../../app/src/presentation/dataset-hash.js';
import {createHash} from 'node:crypto';
import {createSnapshotRepository} from '../../app/src/presentation/snapshot-repository.js';

const actor={uid:'test-admin',role:'admin'};
const fixture=JSON.parse(readFileSync(new URL('../fixtures/presentation-existing-conflict.json',import.meta.url)));
const create=()=>buildPresentationDataset({anchorOperationalDate:'2026-10-08',version:'v1'});
const preview=dataset=>previewPresentationDataset(dataset,{repo:memoryRepository(),actor});

test('snapshot transaction overrides a row inherited from an existing root',async()=>{
  const repo=createSnapshotRepository();
  await repo.create('rows',{a:{value:1}});
  await repo.transact('rows/a',()=>({value:2}));
  assert.equal((await repo.get('rows/a')).value,2);
  assert.equal((await repo.get('rows')).a.value,2);
});

test('prepares and replays seven closed operational days without changing the anchored selection',async()=>{
  const packageData=create();
  assert.equal(packageData.manifest.fromOperationalDate,'2026-10-01');
  assert.equal(packageData.manifest.toOperationalDate,'2026-10-07');
  const result=await preview(packageData);
  assert.equal(result.ok,true,JSON.stringify(result.diagnostics.slice(0,3)));
  assert.equal(Object.keys(result.metricsByContext).length,42);
  assert.equal((await validatePresentationDataset(result.snapshot,result.manifest)).ok,true);
  assert.equal((await validatePresentationDataset(result.snapshot,{...result.manifest,state:'published'})).ok,true);
  for(const kpi of Object.values(result.metricsByContext)){
    assert.equal(kpi.productivityPercent,90);
    assert.equal(kpi.scrapPercent,100*16/360);
    assert.equal(kpi.mtbfSeconds,13800);
    assert.equal(kpi.mttrSeconds,480);
    assert.equal(kpi.oee,0.7);
    assert.ok(Object.values(kpi).every(Number.isFinite));
  }
  assert.equal(result.manifest.defaultSelection.query.toDate,'2026-10-07');
  assert.equal(result.manifest.defaultSelection.query.fromDate,'2026-10-07');
  assert.equal(result.snapshot.productionCases[result.manifest.defaultSelection.recording.productionCaseId].productId,'nhpl-mark-v');
  assert.equal(result.snapshot.productionPlans.nhpl.events!=null,true);
  const readings=Object.values(result.snapshot.collections);
  const t20=readings.find(c=>c.context.machineId.includes('_t20_machine_'));
  assert.ok(t20.readings[presentationParameterMap(result.manifest.id).t20.find(p=>p.catalogCode==='MSA_H').parameterId].value>200);
  assert.ok(readings.some(c=>Object.values(c.readings).some(r=>r.value===0)));
  assert.ok(readings.some(c=>Object.values(c.readings).some(r=>r.value<0)));
  assert.equal(Object.keys(result.snapshot.machineRuns).length,42);
});

test('domain hash covers ledger events and content while ignoring only audit clocks',async()=>{
  const row={id:'same-id',createdAt:1,closedAt:2,events:{a:{id:'a',quantity:1,createdAt:1}}};
  assert.equal(await datasetHash(row),createHash('sha256').update(JSON.stringify({events:{a:{id:'a',quantity:1}},id:'same-id'})).digest('hex'));
  assert.equal(await datasetHash(row),await datasetHash({...row,createdAt:99,closedAt:100,events:{a:{...row.events.a,createdAt:88}}}));
  assert.notEqual(await datasetHash(row),await datasetHash({...row,events:{a:{...row.events.a,quantity:2}}}));
});

test('replay rejects modified content at the same ID and an interrupted partial package',async()=>{
  const built=await preview(create());assert.equal(built.ok,true);
  const changed=structuredClone(built.snapshot);
  Object.values(changed.productionPlans.nhpl.events).find(e=>e.kind==='plan').intervals[0].plannedPieces++;
  const mismatch=await previewPresentationDataset({...create(),manifest:built.manifest},{actor,existingSnapshot:changed});
  assert.equal(mismatch.ok,false);
  assert.equal(mismatch.diagnostics[0].code,'CONTENT_CONFLICT');
  const partial=structuredClone(built.snapshot);
  delete partial.collections[Object.keys(partial.collections).find(id=>id.startsWith(built.manifest.id+'_'))];
  const interrupted=await previewPresentationDataset({...create(),manifest:built.manifest},{actor,existingSnapshot:partial});
  assert.equal(interrupted.ok,false);
  assert.equal(interrupted.diagnostics[0].code,'PARTIAL_PACKAGE_REQUIRES_RECONCILIATION');
});

test('replay rejects an unclassified non-package stop in the covered context',async()=>{
  const built=await preview(create());assert.equal(built.ok,true);
  const plan=Object.values(built.snapshot.productionPlans.nhpl.events).find(e=>e.kind==='plan');
  const repo=memoryRepository();for(const [root,value] of Object.entries(built.snapshot))await repo.create(root,value);
  await repo.create('stoppages/external_stop',{id:'external_stop',context:plan.context,origin:'manual',eventDate:'2026-10-01',startedAt:plan.startedAt+40*60000,endedAt:plan.startedAt+50*60000,planned:false});
  const replay=await previewPresentationDataset({...create(),manifest:built.manifest},{repo,actor});
  assert.equal(replay.ok,false);
  assert.ok(replay.diagnostics.some(d=>d.code==='PROJECTED_KPI_UNAVAILABLE'));
});

test('preview never reads members root from authenticated source and preserves supplied backup memberships',async()=>{
  const underlying=memoryRepository(),backupMembers={example:{role:'admin'}},blocked=[];
  const guarded={...underlying,get:async path=>{if(path==='members'){blocked.push(path);const error=new Error('FORBIDDEN');error.code='FORBIDDEN';throw error;}return underlying.get(path);}};
  const result=await previewPresentationDataset(create(),{repo:guarded,actor,existingSnapshot:{members:backupMembers}});
  assert.equal(result.ok,true,JSON.stringify(result.diagnostics.slice(0,2)));
  assert.deepEqual(blocked,[]);
  assert.deepEqual(result.snapshot.members,backupMembers);
});

test('good pieces beyond first passage reconcile with recorded rework',async()=>{
  const built=await preview(create());assert.equal(built.ok,true);
  for(const row of Object.values(built.metricsByContext))assert.equal(row.goodPieces-row.firstPassGood,8);
  const changed=structuredClone(built.snapshot);
  Object.values(changed.losses).find(r=>r.kind==='rework').amount=2;
  const checked=await validatePresentationDataset(changed,built.manifest);
  assert.equal(checked.ok,false);
  assert.ok(checked.diagnostics.some(d=>d.code==='REWORK_RECONCILIATION'));
});

test('catalog mapping covers the 41 workbook parameters and keeps NHPL independent',()=>{
  const map=presentationParameterMap('sample');
  assert.equal(getMsaParameterCatalog().length,41);
  assert.deepEqual(map.t20.map(p=>p.catalogCode),getMsaParameterCatalog().map(p=>p.code));
  assert.equal(new Set(map.t20.map(p=>p.reference.source.column)).size,41);
  assert.ok(map.nhpl.every(p=>p.processId==='nhpl-montagem'));
  assert.equal(map.nhpl.filter(p=>p.reference.draftRule.kind==='range').length,1);
  assert.ok(map.t20.every(p=>p.processId==='c26-selo'));
});

test('persisted manifest replays with identical numbers at 14:30, 17:44, 00:30 and a week later',async()=>{
  const built=await preview(create());assert.equal(built.ok,true);
  const times=['2026-10-08T14:30:00-03:00','2026-10-08T17:44:00-03:00','2026-10-09T00:30:00-03:00','2026-10-15T14:30:00-03:00'];
  for(const time of times){
    const repo=memoryRepository();for(const [root,value] of Object.entries(built.snapshot))await repo.create(root,value);
    const replay=await previewPresentationDataset({...create(),manifest:built.manifest},{repo,actor,clock:()=>Date.parse(time)});
    assert.equal(replay.ok,true,JSON.stringify(replay.diagnostics));
    assert.equal(replay.added,0);
    assert.deepEqual((await validatePresentationDataset(replay.snapshot,built.manifest)).metricsByContext,built.metricsByContext);
    assert.deepEqual(replay.manifest.defaultSelection,built.manifest.defaultSelection);
  }
});

test('legacy overlapping plan and history block the package without moving or deleting existing facts',async()=>{
  const input=buildPresentationDataset({anchorOperationalDate:'2026-10-08',version:'v1',existingSnapshot:fixture});
  const result=await previewPresentationDataset(input,{actor});
  assert.equal(result.ok,false);
  assert.equal(result.diagnostics[0].code,'PLAN_OVERLAP');
  assert.deepEqual(result.snapshot,fixture);
});

test('wrong context, reject unit or incomplete repair rejects the whole preview',async()=>{
  const built=await preview(create());assert.equal(built.ok,true);
  const change=edit=>{const snapshot=structuredClone(built.snapshot);edit(snapshot);return validatePresentationDataset(snapshot,built.manifest);};
  const badContext=await change(snapshot=>{Object.values(snapshot.productionCases).find(r=>r.machineId==='nhpl').order='WRONG-ORDER';});
  assert.equal(badContext.ok,false);
  assert.ok(badContext.diagnostics.some(d=>d.code==='CASE_MISSING'));
  const badReject=await change(snapshot=>{Object.values(snapshot.losses).find(r=>r.kind==='reject').unit='kg';});
  assert.equal(badReject.ok,false);
  assert.ok(badReject.diagnostics.some(d=>d.code==='REJECT_RECONCILIATION'));
  const badRepair=await change(snapshot=>{Object.values(snapshot.technicalRecords).find(r=>r.kind==='classification'&&r.context.machineId==='nhpl').repairEndedAt=null;});
  assert.equal(badRepair.ok,false);
  assert.ok(badRepair.diagnostics.some(d=>d.code==='REPAIR_INCOMPLETE'));
});
