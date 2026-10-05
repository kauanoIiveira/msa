import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertFails} from '@firebase/rules-unit-testing';
import {setup,sdk} from '../helpers/firebase-env.js';
import {seed} from '../helpers/fixtures.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createOperations} from '../../app/src/services/operations.js';
import {createAnalysisService} from '../../app/src/services/analysis.js';
test('direct writes cannot decide as operator or rewrite review history',async t=>{
  const env=await setup(t);const repo=uid=>createFirebaseRepository({db:env.authenticatedContext(uid).database(),sdk,workspaceId:'demo'}),f=await seed(repo('admin'));
  const col=await createOperations({repo:repo('op'),actor:{uid:'op',role:'operator'}}).recordCollection({context:f.context,readings:[{parameterId:f.parameterId,versionId:f.versionId,raw:'-650'}]});
  const review=await createAnalysisService({repo:repo('op'),actor:{uid:'op',role:'operator'}}).submitReview({collectionId:col.id,scope:'Synthetic'});
  const eng=createAnalysisService({repo:repo('eng'),actor:{uid:'eng',role:'engineer'}});await eng.startReview(review.id);await eng.decideReview(review.id,{decision:'rejected',justification:'Review'});
  const db=env.authenticatedContext('op').database();
  await assertFails(sdk.update(sdk.ref(db,`workspaces/demo/reviews/${review.id}`),{state:'approved'}));
  const engineer=env.authenticatedContext('eng').database();
  await assertFails(sdk.remove(sdk.ref(engineer,`workspaces/demo/reviews/${review.id}/history/0`)));
  await assertFails(sdk.update(sdk.ref(engineer,`workspaces/demo/reviews/${review.id}`),{state:'analyzing'}));
});
test('correction revision preserves context and original, and approval cannot alter the proposal',async t=>{
  const env=await setup(t),repo=uid=>createFirebaseRepository({db:env.authenticatedContext(uid).database(),sdk,workspaceId:'demo'}),f=await seed(repo('admin'));
  const original=await createOperations({repo:repo('op'),actor:{uid:'op',role:'operator'}}).recordProduction({context:f.context,quantity:100,basis:'gross',startedAt:100,endedAt:200});
  const submit=createAnalysisService({repo:repo('op'),actor:{uid:'op',role:'operator'}}),eng=createAnalysisService({repo:repo('eng'),actor:{uid:'eng',role:'engineer'}});
  const request=await submit.requestCorrection({recordType:'production',recordId:original.id,replacement:{...original,quantity:99},reason:'Count correction'});
  const db=env.authenticatedContext('eng').database();
  await assertFails(sdk.update(sdk.ref(db,`workspaces/demo/corrections/${request.id}`),{state:'approved',decision:{state:'approved',by:'eng',at:sdk.serverTimestamp(),justification:'Review'},'replacement/endedAt':300}));
  const done=await eng.decideCorrection(request.id,{decision:'approved',justification:'Verified'});
  assert.equal(done.replacement.quantity,99);assert.equal((await repo('eng').get(`production/${original.id}`)).quantity,100);
});
