import {test} from 'node:test';
import {assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {setup,sdk} from '../helpers/firebase-env.js';
import {seed} from '../helpers/fixtures.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createMsaServices} from '../../app/src/services/create-msa.js';
test('direct target writes validate the calendar, including leap years',async t=>{
  const env=await setup(t),db=env.authenticatedContext('admin').database(),repo=createFirebaseRepository({db,sdk,workspaceId:'demo'}),f=await seed(repo);
  const data={id:'t',name:'Target',active:true,metric:'lossKg',unit:'kg',context:f.context,operator:'upper',threshold:1,createdBy:'admin',createdAt:sdk.serverTimestamp()};
  for(const fromDate of ['2026-02-30','2026-02-29','2026-13-01']) await assertFails(sdk.set(sdk.ref(db,'workspaces/demo/targets/t'),{...data,fromDate,toDate:'2027-01-01'}));
  await assertSucceeds(sdk.set(sdk.ref(db,'workspaces/demo/targets/t'),{...data,fromDate:'2024-02-29',toDate:'2024-03-01'}));
});
test('review and correction dates cannot hide their linked original in a different period',async t=>{
  const env=await setup(t),repo=uid=>createFirebaseRepository({db:env.authenticatedContext(uid).database(),sdk,workspaceId:'demo'}),f=await seed(repo('admin'));
  const msa=createMsaServices({repo:repo('op'),actor:{uid:'op',role:'operator'}}),time=Date.parse('2026-10-05T15:00:00Z');
  const col=await msa.operations.recordCollection({context:f.context,occurredAt:time,readings:[{parameterId:f.parameterId,versionId:f.versionId,raw:'-650'}]});
  const review=await msa.analysis.submitReview({collectionId:col.id,scope:'Synthetic'}),db=env.authenticatedContext('op').database();
  await assertFails(sdk.set(sdk.ref(db,'workspaces/demo/reviews/forgedDate'),{...review,id:'forgedDate',eventDate:'2025-01-01',createdAt:sdk.serverTimestamp(),history:{0:{state:'waiting',by:'op',at:sdk.serverTimestamp()}}}));
  const original=await msa.operations.recordProduction({context:f.context,startedAt:time,endedAt:time+100,quantity:100,basis:'gross'});
  const correction=await msa.analysis.requestCorrection({recordType:'production',recordId:original.id,replacement:{...original,quantity:99},reason:'Count'});
  await assertFails(sdk.set(sdk.ref(db,'workspaces/demo/corrections/forgedDate'),{...correction,id:'forgedDate',eventDate:'2025-01-01',createdAt:sdk.serverTimestamp()}));
});
