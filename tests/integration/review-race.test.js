import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setup,sdk} from '../helpers/firebase-env.js';
import {seed} from '../helpers/fixtures.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createOperations} from '../../app/src/services/operations.js';
import {createAnalysisService} from '../../app/src/services/analysis.js';
test('concurrent engineering decisions persist only one terminal decision',async t=>{
  const env=await setup(t),repo=uid=>createFirebaseRepository({db:env.authenticatedContext(uid).database(),sdk,workspaceId:'demo'}),f=await seed(repo('admin'));
  const col=await createOperations({repo:repo('op'),actor:{uid:'op',role:'operator'}}).recordCollection({context:f.context,readings:[{parameterId:f.parameterId,versionId:f.versionId,raw:'-650'}]});
  const a=createAnalysisService({repo:repo('eng'),actor:{uid:'eng',role:'engineer'}}),b=createAnalysisService({repo:repo('admin'),actor:{uid:'admin',role:'admin'}});
  const review=await a.submitReview({collectionId:col.id,scope:'Synthetic'});await a.startReview(review.id);
  const results=await Promise.allSettled([a.decideReview(review.id,{decision:'approved',justification:'A'}),b.decideReview(review.id,{decision:'rejected',justification:'B'})]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(Object.keys((await repo('eng').get(`reviews/${review.id}`)).history).length,3);
});
