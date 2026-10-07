import test from 'node:test';
import {assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {setup,sdk} from '../helpers/firebase-env.js';
import {seed} from '../helpers/fixtures.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createOperations} from '../../app/src/services/operations.js';

test('all four profiles are enforced by RTDB for direct SDK writes, independently of UI buttons',async t=>{
  const env=await setup(t),adminDb=env.authenticatedContext('admin').database();
  const repo=createFirebaseRepository({db:adminDb,sdk,workspaceId:'demo'}),f=await seed(repo);
  const production=await createOperations({repo,actor:{uid:'admin',role:'admin'}}).recordProduction({context:f.context,quantity:100,basis:'gross',startedAt:1000,endedAt:2000});
  for(const [uid,role] of [['admin','admin'],['eng','engineer'],['op','operator'],['view','viewer']]) {
    const db=env.authenticatedContext(uid).database(),expect=allowed=>allowed?assertSucceeds:assertFails;
    await assertSucceeds(sdk.get(sdk.ref(db,`workspaces/demo/production/${production.id}`)));
    const id=`production_${uid}`;
    await expect(role!=='viewer')(sdk.set(sdk.ref(db,`workspaces/demo/production/${id}`),{...production,id,createdBy:uid,createdAt:sdk.serverTimestamp()}));
    await expect(role==='admin')(sdk.update(sdk.ref(db,`workspaces/demo/machines/${f.context.machineId}`),{name:`Machine ${uid}`}));
    const targetId=`target_${uid}`,editing=['admin','engineer'].includes(role);
    await expect(editing)(sdk.set(sdk.ref(db,`workspaces/demo/targets/${targetId}`),{id:targetId,name:'Target',active:true,metric:'producedPieces',unit:'pieces',context:f.context,fromDate:'2026-10-07',toDate:'2026-10-07',operator:'lower',threshold:100,createdBy:uid,createdAt:sdk.serverTimestamp()}));
    const versionId=`version_${uid}`;
    await expect(editing)(sdk.set(sdk.ref(db,`workspaces/demo/parameterVersions/${versionId}`),{id:versionId,parameterId:f.parameterId,unit:'mmHg',nature:'measurement',status:'approved',rule:{kind:'upper',upper:-600},createdBy:uid,createdAt:sdk.serverTimestamp()}));
    await assertFails(sdk.set(sdk.ref(db,`workspaces/demo/members/${uid}/role`),'admin'));
  }
});
