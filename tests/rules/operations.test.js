import {test} from 'node:test';
import {assertFails} from '@firebase/rules-unit-testing';
import {setup,sdk} from '../helpers/firebase-env.js';
import {seed} from '../helpers/fixtures.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createOperations} from '../../app/src/services/operations.js';
test('SDK bypass cannot forge author, context, reading state, or immutable production',async t=>{
  const env=await setup(t);const admin=createFirebaseRepository({db:env.authenticatedContext('admin').database(),sdk,workspaceId:'demo'});const f=await seed(admin);
  const db=env.authenticatedContext('op').database(),repo=createFirebaseRepository({db,sdk,workspaceId:'demo'}),op=createOperations({repo,actor:{uid:'op',role:'operator'}});
  const prod=await op.recordProduction({context:f.context,quantity:100,basis:'gross',startedAt:100,endedAt:200});
  const ref=sdk.ref(db,`workspaces/demo/production/${prod.id}`);
  await assertFails(sdk.update(ref,{quantity:99}));await assertFails(sdk.remove(ref));
  for(const patch of [{createdBy:'admin'},{context:{...f.context,machineId:'missing'}},{quantity:-1},{basis:'unknown'},{extra:true}]) await assertFails(sdk.set(sdk.ref(db,'workspaces/demo/production/forged'),{...prod,...patch,id:'forged',createdAt:sdk.serverTimestamp()}));
  const col=await op.recordCollection({context:f.context,readings:[{parameterId:f.parameterId,versionId:f.versionId,raw:'-650'}]});
  const forged={...col,id:'badreading',createdAt:sdk.serverTimestamp(),readings:{[f.parameterId]:{parameterId:f.parameterId,versionId:f.versionId,status:'missing',value:0}}};
  await assertFails(sdk.set(sdk.ref(db,'workspaces/demo/collections/badreading'),forged));
});
