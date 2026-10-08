import {createMsaServices} from '../../app/src/services/create-msa.js';
import {productionCaseContext} from '../../app/src/domain/production-case.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setup,sdk} from '../helpers/firebase-env.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {prepare,publish} from '../../app/src/services/presentation-dataset.js';
import {datasetHash} from '../../app/src/presentation/dataset-hash.js';
test('authenticated publication persists actual stamps, resumes inside a plan and is visible in another session',async t=>{
 const env=await setup(t),repo=uid=>createFirebaseRepository({db:env.authenticatedContext(uid).database(),sdk,workspaceId:'demo'}),admin=repo('admin'),actor={uid:'admin',role:'admin'};
 const preview=await prepare({repo:admin,actor,anchorDate:'2026-10-08',version:'v1'});assert.deepEqual(preview.conflicts,[]);
 await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo:repo('view'),actor}),{code:'FORBIDDEN'});
 let interrupted=false;const flaky={...admin,create:async(path,row)=>{const result=await admin.create(path,row);if(!interrupted&&path.startsWith('productionPlans/nhpl/events/')){interrupted=true;throw new Error('INTERRUPTED');}return result;}};
 await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo:flaky,actor}),/INTERRUPTED/);
 const result=await publish({preview,expectedHash:preview.previewHash,repo:admin,actor});assert.ok(result.existing>0);
 const viewer=repo('view'),manifest=await viewer.get('presentationManifests/'+result.manifestId);assert.equal(manifest.state,'published');assert.equal(typeof manifest.createdAt,'number');
 const context=manifest.defaultSelection.recording.context;assert.equal(context.order,'OP-MV-261008-V1');assert.equal(context.lot,'LT-MV-261008-V1');assert.equal(context.variant,'Medium');
 const recipe=await viewer.get('recipeVersions/'+context.recipe);assert.equal(recipe.label,'MARK V · Configuração v1');assert.equal(recipe.settings.NHPL_ALIGNMENT_OFFSET,0);assert.equal(recipe.status,'draft');
 const event=Object.values((await viewer.get('productionPlans/nhpl')).events)[0];assert.equal(event.createdBy,'admin');assert.equal(typeof event.createdAt,'number');
 const seloCase=await viewer.get('productionCases/'+manifest.packageId+'_case_selo_1'),viewerServices=createMsaServices({repo:viewer,actor:{uid:'view',role:'viewer'}});
 const seloIndicators=await viewerServices.getIndicators({context:productionCaseContext(seloCase),fromDate:seloCase.operationalDate,toDate:seloCase.operationalDate},{from:seloCase.startedAt,to:seloCase.endedAt});assert.equal(seloIndicators.totals.grossPieces,100);assert.equal(seloIndicators.totals.goodPieces,95);assert.equal(seloIndicators.totals.rejectedPieces,5);assert.equal(seloIndicators.totals.rejectPercent,5);assert.equal(new Set(seloIndicators.series.map(r=>r.collectionId)).size,30);assert.equal(new Set(seloIndicators.series.map(r=>r.parameterId)).size,41);
 const before=await datasetHash(await admin.get('members/admin'));assert.equal((await publish({preview,expectedHash:preview.previewHash,repo:admin,actor})).created,0);assert.equal(await datasetHash(await admin.get('members/admin')),before);
 // Claiming admin in JS does not change the authenticated viewer's rule permissions.
 await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo:viewer,actor:{uid:'view',role:'admin'}}));
});
