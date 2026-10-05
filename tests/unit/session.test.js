import {test} from 'node:test';
import assert from 'node:assert/strict';
import {memoryRepository} from '../helpers/memory-repository.js';
import {createAuthenticatedMsa} from '../../app/src/services/create-msa.js';
test('logout revokes previously handed-out services and their listeners',async()=>{
  let session;const authService={watchSession:fn=>{session=fn;return()=>{};}};
  const repo=memoryRepository();await repo.create('members/u',{role:'admin'});
  const controller=createAuthenticatedMsa({authService,repositoryFactory:()=>repo});
  session({uid:'u'});const services=await controller.onWorkspace('demo');
  await services.registry.create('machines',{name:'Synthetic'});
  const off=services.history.watch('collections',{},()=>{});
  assert.equal(typeof off,'function');assert.equal(repo.listenerCount(),2);
  session(null);
  assert.equal(repo.listenerCount(),0);
  await assert.rejects(()=>services.registry.create('machines',{name:'Stale'}),{code:'STALE_SESSION'});
  await assert.rejects(()=>controller.onWorkspace('demo'),{code:'AUTH_REQUIRED'});
  controller.dispose();
});
