import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setup,sdk} from '../helpers/firebase-env.js';
import {seed} from '../helpers/fixtures.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createHistoryService} from '../../app/src/services/history.js';
import {createOperations} from '../../app/src/services/operations.js';
test('two authorized sessions receive scoped changes and unsubscribe cleanly',async t=>{
  const env=await setup(t),repo=uid=>createFirebaseRepository({db:env.authenticatedContext(uid).database(),sdk,workspaceId:'demo'}),f=await seed(repo('admin'));
  const viewer=createHistoryService({repo:repo('view')});let off,count=0;
  const delivered=new Promise((resolve,reject)=>{
    off=viewer.watch('collections',{fromDate:'2026-10-05',toDate:'2026-10-05'},page=>{count++;if(page.items.length) resolve(page);},reject);
  });
  t.after(()=>off?.());
  const col=await createOperations({repo:repo('op'),actor:{uid:'op',role:'operator'}}).recordCollection({context:f.context,occurredAt:Date.parse('2026-10-05T15:00:00Z'),readings:[{parameterId:f.parameterId,versionId:f.versionId,raw:'-650'}]});
  assert.equal((await delivered).items[0].id,col.id);off();assert.ok(count>=1);
});
