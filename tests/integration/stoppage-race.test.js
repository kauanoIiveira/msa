import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setup,sdk} from '../helpers/firebase-env.js';
import {seed} from '../helpers/fixtures.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createOperations} from '../../app/src/services/operations.js';
test('two RTDB clients cannot both close one stoppage',async t=>{
  const env=await setup(t);const repo=uid=>createFirebaseRepository({db:env.authenticatedContext(uid).database(),sdk,workspaceId:'demo'});
  const f=await seed(repo('admin'));const a=createOperations({repo:repo('op'),actor:{uid:'op',role:'operator'}}),b=createOperations({repo:repo('eng'),actor:{uid:'eng',role:'engineer'}});
  const stop=await a.startStoppage({context:f.context,startedAt:100,planned:false,reasonId:f.reasons.stop});
  const results=await Promise.allSettled([a.closeStoppage(stop.id,{endedAt:200,reasonId:f.reasons.stop}),b.closeStoppage(stop.id,{endedAt:300,reasonId:f.reasons.stop})]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1,JSON.stringify(results.map(r=>({status:r.status,code:r.reason?.code,message:r.reason?.message}))));
  assert.ok([200,300].includes((await repo('admin').get(`stoppages/${stop.id}`)).endedAt));
});
