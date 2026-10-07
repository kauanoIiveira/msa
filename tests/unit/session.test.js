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

test('changing workspace membership revokes old privileges and requires a new role-bound session',async()=>{
  let nextUser;const authService={watchSession:callback=>{nextUser=callback;return()=>{};}};
  const repo=memoryRepository();await repo.create('members/u',{role:'admin'});
  const controller=createAuthenticatedMsa({authService,repositoryFactory:()=>repo});
  nextUser({uid:'u'});const adminServices=await controller.onWorkspace('demo');
  await repo.updateRegistry('members/u',{role:'viewer'});
  await assert.rejects(()=>adminServices.registry.create('machines',{name:'Old privilege'}),{code:'STALE_SESSION'});
  const viewerServices=await controller.onWorkspace('demo');
  await assert.rejects(()=>viewerServices.registry.create('machines',{name:'Forbidden'}),{code:'FORBIDDEN'});
  controller.dispose();assert.equal(repo.listenerCount(),0);
});
