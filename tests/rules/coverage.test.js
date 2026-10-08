import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertFails} from '@firebase/rules-unit-testing';
import {setup,sdk} from '../helpers/firebase-env.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createRegistryService} from '../../app/src/services/registry.js';
import {createCoverageService} from '../../app/src/services/coverage.js';
test('coverage witness is immutable, author-bound and cannot grant membership',async t=>{
 const env=await setup(t),db=env.authenticatedContext('admin').database(),repo=createFirebaseRepository({db,sdk,workspaceId:'demo'});let n=0;
 const registry=createRegistryService({repo,actor:{uid:'admin',role:'admin'},idFactory:()=>`cover_registry_${++n}`});
 const m=await registry.create('machines',{name:'M'}),p=await registry.create('processes',{name:'P',machineId:m.id}),q=await registry.create('products',{name:'Q',processIds:{[p.id]:true}});
 const service=createCoverageService({repo,actor:{uid:'admin',role:'admin'},idFactory:()=>`witness_${++n}`});
 const input={context:{machineId:m.id,processId:p.id,productId:q.id},startedAt:1000000,endedAt:4600000,complete:true,evidence:'Período conferido',recordsFingerprint:'[]'};
 const row=await service.confirm(input);assert.equal(typeof row.createdAt,'number');
 await assertFails(sdk.update(sdk.ref(db,'workspaces/demo/coverageWitnesses/'+row.id),{complete:false}));
 await assertFails(sdk.remove(sdk.ref(db,'workspaces/demo/coverageWitnesses/'+row.id)));
 await assertFails(sdk.set(sdk.ref(env.authenticatedContext('view').database(),'workspaces/demo/coverageWitnesses/forged'),{...row,id:'forged',createdBy:'view',createdAt:sdk.serverTimestamp()}));
 await assertFails(sdk.set(sdk.ref(db,'workspaces/demo/coverageWitnesses/unknown'),{...row,id:'unknown',unknown:true,createdAt:sdk.serverTimestamp()}));
});
