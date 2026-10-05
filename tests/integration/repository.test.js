import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setup,sdk} from '../helpers/firebase-env.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
test('repository confines paths and reads only authenticated scoped membership',async t=>{
  const env=await setup(t);
  const repo=createFirebaseRepository({db:env.authenticatedContext('op').database(),sdk,workspaceId:'demo'});
  assert.equal((await repo.get('members/op')).role,'operator');
  for(const path of ['../other','/members/op','members/$uid','members//op']) await assert.rejects(()=>repo.get(path),{code:'INVALID_PATH'});
  assert.throws(()=>createFirebaseRepository({sdk,workspaceId:'../other'}),{code:'INVALID_REFERENCE'});
  let received;
  await new Promise((resolve,reject)=>{ const off=repo.watch('members/op',null,value=>{received=value;off();resolve();},reject); });
  assert.equal(received.role,'operator');
});
