import {test} from 'node:test';
import {assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {setup,sdk} from '../helpers/firebase-env.js';
test('membership is required and cannot be self-provisioned or elevated',async t=>{
  const env=await setup(t);
  for(const uid of [null,'outsider','unknown']) {
    const db=uid?env.authenticatedContext(uid).database():env.unauthenticatedContext().database();
    await assertFails(sdk.get(sdk.ref(db,'workspaces/demo/members/admin')));
    await assertFails(sdk.set(sdk.ref(db,`workspaces/demo/members/${uid??'anon'}`),{role:'admin'}));
  }
  const db=env.authenticatedContext('op').database();
  await assertSucceeds(sdk.get(sdk.ref(db,'workspaces/demo/members/op')));
  await assertFails(sdk.set(sdk.ref(db,'workspaces/demo/members/op/role'),'admin'));
});
