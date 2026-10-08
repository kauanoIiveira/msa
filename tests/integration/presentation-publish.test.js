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
 const event=Object.values((await viewer.get('productionPlans/nhpl')).events)[0];assert.equal(event.createdBy,'admin');assert.equal(typeof event.createdAt,'number');
 const before=await datasetHash(await admin.get('members/admin'));assert.equal((await publish({preview,expectedHash:preview.previewHash,repo:admin,actor})).created,0);assert.equal(await datasetHash(await admin.get('members/admin')),before);
 // Claiming admin in JS does not change the authenticated viewer's rule permissions.
 await assert.rejects(()=>publish({preview,expectedHash:preview.previewHash,repo:viewer,actor:{uid:'view',role:'admin'}}));
});
