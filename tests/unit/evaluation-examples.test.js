import test from 'node:test';
import assert from 'node:assert/strict';
import {prepare,publish,prepareRevision,readPresentationSnapshot,assertPrivateBackupPreserved} from '../../app/src/services/presentation-dataset.js';
import {createSnapshotRepository} from '../../app/src/presentation/snapshot-repository.js';
import {createMsaServices} from '../../app/src/services/create-msa.js';
import {buildMachineExpansion,validateMachineExpansion} from '../../app/src/presentation/machine-expansion.js';
import {buildEvaluationExamples,validateEvaluationExamples} from '../../app/src/presentation/evaluation-examples.js';
import {latestOccurrenceDecision} from '../../app/src/domain/occurrences.js';
import {buildPending} from '../../app/src/domain/pending.js';
import {occurrencesMarkup} from '../../app/src/ui/technical.js';
import {equipmentView} from '../../app/src/ui/equipment-page.js';
import {datasetHash} from '../../app/src/presentation/dataset-hash.js';
import {buildOperationalQuery,selectOperationalPeriod} from '../../app/src/ui/operational-query.js';
const actor={uid:'admin',role:'admin'};

test('compact operational revision preserves existing sources, reconciles three new cases and replays safely',async()=>{
 const repo=createSnapshotRepository(),base=await prepare({repo,actor,anchorDate:'2026-10-08',version:'v1'});await publish({preview:base,expectedHash:base.previewHash,repo,actor});
 const machines=await prepareRevision({repo,actor,baseManifestId:base.manifest.id,revision:'machines',commands:buildMachineExpansion({baseManifestId:base.manifest.id,packageId:base.manifest.packageId,revision:'machines',operationalDate:'2026-10-07'})});
 await publish({preview:machines,expectedHash:machines.previewHash,repo,actor});await repo.create('members',{admin:{role:'admin'},other:{role:'engineer'}});
 const snapshot=await readPresentationSnapshot(repo),before={...snapshot,members:await repo.get('members')},commands=buildEvaluationExamples({snapshot,baseManifestId:machines.manifest.id});
 assert.equal(commands.length,120);assert.deepEqual(commands,buildEvaluationExamples({snapshot,baseManifestId:machines.manifest.id}));
 assert.equal(commands.filter(c=>c.method==='recordCollection'||c.method==='createParameterVersion'||c.method==='decideCorrection').length,0);
 const newest=commands.find(c=>c.id.endsWith('_mark_review')).args[0].collectionId;
 assert.equal(newest,Object.values(snapshot.collections).filter(r=>r.context.productId==='nhpl-mark-v'&&r.context.shift==='3').sort((a,b)=>b.occurredAt-a.occurredAt||b.id.localeCompare(a.id))[0].id);
 const preview=await prepareRevision({repo,actor,baseManifestId:machines.manifest.id,revision:'evaluation',commands});assert.deepEqual(preview.conflicts,[]);assert.equal(preview.intents.length,135);
 let cut=false;const interrupted={...repo,transact:async(path,fn)=>{const result=await repo.transact(path,fn);if(!cut&&path.startsWith('stoppages/')){cut=true;throw new Error('INTERRUPTED');}return result;}};
 await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo:interrupted,actor}),/INTERRUPTED/);
 await publish({preview,expectedHash:preview.previewHash,repo,actor});const after=await readPresentationSnapshot(repo);
 await assertPrivateBackupPreserved(before,{...after,members:await repo.get('members')},preview);
 assert.equal(await datasetHash(after.collections),await datasetHash(snapshot.collections));
 assert.equal(await datasetHash(after.parameterVersions),await datasetHash(snapshot.parameterVersions));
 assert.equal((await publish({preview,expectedHash:preview.previewHash,repo,actor})).created,0);
 await assert.rejects(()=>prepareRevision({repo,actor,baseManifestId:machines.manifest.id,revision:'evaluation',commands}),{code:'MANIFEST_EXISTS'});
 const services=createMsaServices({repo,actor}),evaluation=await validateEvaluationExamples(services,preview.manifest),old=await validateMachineExpansion(services,preview.manifest);
 assert.deepEqual(evaluation.diagnostics,[]);assert.equal(Object.keys(evaluation.metricsByContext).length,3);assert.equal(new Set(Object.values(evaluation.metricsByContext).map(m=>m.productivity)).size,3);
 assert.deepEqual(old.diagnostics,[]);assert.equal(Object.keys(old.metricsByContext).length,9);for(const m of Object.values(old.metricsByContext)){assert.equal(m.productivity,90);assert.ok(Math.abs(m.oee-.7)<1e-9);}
 const prefix=base.manifest.packageId+'_rev_evaluation_',reviews=Object.values(after.reviews).filter(r=>r.id.startsWith(prefix)),corrections=Object.values(after.corrections).filter(r=>r.id.startsWith(prefix)),technical=await services.technical.records();
 assert.equal(reviews.length,5);assert.equal(corrections.length,5);assert.deepEqual(new Set(reviews.map(r=>r.state)),new Set(['waiting','analyzing','approved']));assert.ok(corrections.every(r=>r.state==='waiting'&&!r.decision));
 await assert.rejects(()=>services.analysis.decideCorrection(corrections[0].id,{decision:'approved',justification:'Conferência'}),{code:'SELF_APPROVAL'});
 for(const machineId of ['nhpl',...['p02','i03','m04'].map(k=>base.manifest.packageId+'_rev_machines_'+k+'_machine_1')]){
  const op=buildOperationalQuery({context:{machineId},fromDate:base.manifest.fromOperationalDate,toDate:base.manifest.toOperationalDate,shift:'3'}),raw=await services.history.loadPeriod({...op.query,limit:500,maxPages:20}),period=selectOperationalPeriod(raw,op);
  const linked=reviews.filter(r=>r.context.machineId===machineId);assert.ok(linked.length);assert.ok(linked.every(r=>period.reviews.some(v=>v.id===r.id)));
  const ownCorrections=corrections.filter(r=>after.collections[r.recordId].context.machineId===machineId);assert.ok(ownCorrections.every(r=>period.corrections.some(v=>v.id===r.id)));
  assert.ok(technical.some(r=>r.kind==='occurrence'&&r.id.startsWith(prefix)&&r.context.machineId===machineId&&op.windows.some(w=>r.occurredAt>=w.from&&r.occurredAt<w.to)));
 }
});

test('actual decision chronology wins over RTDB lexicographic IDs in occurrence consumers',()=>{
 const occurrence={id:'occ',kind:'occurrence',context:{machineId:'nhpl'},occurredAt:100,type:'process',note:'Exemplo'},seed={id:'presentation_seed',kind:'occurrence-decision',occurrenceId:'occ',createdAt:200,decision:'analyzing'},human={id:'a-real-uuid',kind:'occurrence-decision',occurrenceId:'occ',createdAt:300,decision:'resolved'},technical=[occurrence,human,seed];
 assert.equal(latestOccurrenceDecision(technical,'occ'),human);
 assert.equal(buildPending({technical,consultation:{context:{machineId:'nhpl'}},actor}).open.length,0);
 assert.match(occurrencesMarkup({technical,context:{machineId:'nhpl'},actor}),/>resolved</);
 assert.equal(equipmentView({catalog:{machines:{nhpl:{id:'nhpl',name:'NHPL',active:true}}},state:{technical}})[0].alerts.length,0);
 assert.equal(latestOccurrenceDecision([seed,{...human,createdAt:200}],'occ'),seed);
});
