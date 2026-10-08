import test from 'node:test';
import assert from 'node:assert/strict';
import {prepare,publish,prepareRevision} from '../../app/src/services/presentation-dataset.js';
import {createSnapshotRepository} from '../../app/src/presentation/snapshot-repository.js';
import {createMsaServices} from '../../app/src/services/create-msa.js';
import {datasetHash} from '../../app/src/presentation/dataset-hash.js';
const actor={uid:'admin',role:'admin'};
test('machine expansion adds three complete machines across all shifts and preserves published data on interrupted replay',async()=>{
 const module=await import('../../app/src/presentation/machine-expansion.js').catch(()=>null);
 assert.equal(typeof module?.buildMachineExpansion,'function','expansion builder required');
 const repo=createSnapshotRepository(),base=await prepare({repo,actor,anchorDate:'2026-10-08',version:'v1'});
 await publish({preview:base,expectedHash:base.previewHash,repo,actor});
 const before=await datasetHash(await repo.get('presentationManifests/'+base.manifest.id));
 const commands=module.buildMachineExpansion({baseManifestId:base.manifest.id,packageId:base.manifest.packageId,revision:'machines',operationalDate:'2026-10-07'});
 const preview=await prepareRevision({repo,actor,baseManifestId:base.manifest.id,revision:'machines',commands});
 assert.deepEqual(preview.conflicts,[]);
 let interrupted=false;const partial={...repo,transact:async(path,fn)=>{const result=await repo.transact(path,fn);if(!interrupted){interrupted=true;throw new Error('INTERRUPTED');}return result;}};
 await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo:partial,actor}),/INTERRUPTED/);
 await publish({preview,expectedHash:preview.previewHash,repo,actor});
 assert.equal((await publish({preview,expectedHash:preview.previewHash,repo,actor})).created,0);
 assert.equal(await datasetHash(await repo.get('presentationManifests/'+base.manifest.id)),before);
 const cases=Object.values(await repo.get('productionCases')).filter(c=>c.id.includes('_rev_machines_'));
 assert.equal(cases.length,9);assert.equal(new Set(cases.map(c=>c.machineId)).size,3);
 const collections=Object.values(await repo.get('collections')).filter(c=>c.id.includes('_rev_machines_'));
 assert.equal(collections.length,270);
 for(const c of cases){const rows=collections.filter(r=>r.context.machineId===c.machineId&&r.context.shift===c.shift);assert.equal(rows.length,30);assert.equal(Object.keys(rows[0].readings).length,3);}
 const services=createMsaServices({repo,actor});
 const validation=await module.validateMachineExpansion(services,preview.manifest);assert.deepEqual(validation.diagnostics,[]);assert.equal(Object.keys(validation.metricsByContext).length,9);
 for(const metric of Object.values(validation.metricsByContext)){assert.equal(metric.productivity,90);assert.equal(metric.mtbf,13800);assert.equal(metric.mttr,480);assert.ok(Math.abs(metric.oee-0.7)<1e-9);assert.ok(Math.abs(metric.scrap-100*16/360)<1e-9);}
 await assert.rejects(()=>services.planning.approve({context:{machineId:cases[0].machineId,processId:'nhpl-montagem',productId:'nhpl-vgard-hp'}}),{code:'CONTEXT_MISMATCH'});
 const commandsMutate=[{id:base.manifest.id+'_rev_forbidden_close',service:'operations',method:'closeStoppage',args:[base.manifest.id+'_boundary_failure',{endedAt:Date.now(),reasonId:base.manifest.id+'_reason_stop_1'}]}];
 await assert.rejects(()=>prepareRevision({repo,actor,baseManifestId:base.manifest.id,revision:'forbidden',commands:commandsMutate}),{code:'REVISION_NOT_ADDITIVE'});
});
