import {test} from 'node:test';
import assert from 'node:assert/strict';
import {memoryRepository} from '../helpers/memory-repository.js';
import {seed} from '../helpers/fixtures.js';
import {createOperations} from '../../app/src/services/operations.js';
import {createAnalysisService} from '../../app/src/services/analysis.js';
test('human review respects the state graph, requires justification and remains terminal',async()=>{
  const repo=memoryRepository(),f=await seed(repo),op=createOperations({repo,actor:{uid:'op',role:'operator'}});
  const col=await op.recordCollection({context:f.context,readings:[{parameterId:f.parameterId,versionId:f.versionId,raw:'-650'}]});
  const submit=createAnalysisService({repo,actor:{uid:'op',role:'operator'}}),eng=createAnalysisService({repo,actor:{uid:'eng',role:'engineer'}});
  const review=await submit.submitReview({collectionId:col.id,scope:'Synthetic collection only'});
  await assert.rejects(()=>eng.decideReview(review.id,{decision:'approved',justification:'Checked'}),{code:'INVALID_TRANSITION'});
  await eng.startReview(review.id);
  await assert.rejects(()=>eng.decideReview(review.id,{decision:'approved',justification:''}));
  const decided=await eng.decideReview(review.id,{decision:'approved',justification:'Manual assessment'});
  assert.equal(decided.state,'approved');assert.equal(Object.keys(decided.history).length,3);
  await assert.rejects(()=>eng.startReview(review.id),{code:'INVALID_TRANSITION'});
});
test('approved correction preserves original and has one validated replacement revision',async()=>{
  const repo=memoryRepository(),f=await seed(repo),op=createOperations({repo,actor:{uid:'op',role:'operator'}});
  const original=await op.recordProduction({context:f.context,quantity:100,basis:'gross',startedAt:100,endedAt:200});
  const submit=createAnalysisService({repo,actor:{uid:'op',role:'operator'}}),eng=createAnalysisService({repo,actor:{uid:'eng',role:'engineer'}});
  const req=await submit.requestCorrection({recordType:'production',recordId:original.id,replacement:{...original,quantity:99},reason:'Count correction'});
  await assert.rejects(()=>submit.decideCorrection(req.id,{decision:'approved',justification:'Self'}),{code:'FORBIDDEN'});
  const done=await eng.decideCorrection(req.id,{decision:'approved',justification:'Count verified'});
  assert.equal(done.replacement.quantity,99);assert.equal(done.state,'approved');
  assert.equal((await repo.get(`production/${original.id}`)).quantity,100);
  await assert.rejects(()=>eng.decideCorrection(req.id,{decision:'rejected',justification:'Second'}),{code:'INVALID_TRANSITION'});
});
