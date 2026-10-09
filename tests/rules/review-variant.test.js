import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertFails} from '@firebase/rules-unit-testing';
import {setup,sdk} from '../helpers/firebase-env.js';
import {seed} from '../helpers/fixtures.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createOperations} from '../../app/src/services/operations.js';
import {createAnalysisService} from '../../app/src/services/analysis.js';

test('reviews preserve optional source variant through legitimate authenticated transitions',async t=>{
 const env=await setup(t),db=env.authenticatedContext('admin').database(),repo=createFirebaseRepository({db,sdk,workspaceId:'demo'}),f=await seed(repo),actor={uid:'admin',role:'admin'};
 const operations=createOperations({repo,actor}),analysis=createAnalysisService({repo,actor});
 const col=await operations.recordCollection({context:{...f.context,order:'OP-EXAMPLE',lot:'LT-EXAMPLE',shift:'3',variant:'Medium'},readings:[{parameterId:f.parameterId,versionId:f.versionId,raw:'-650'}]});
 const review=await analysis.submitReview({collectionId:col.id,scope:'Conferência ilustrativa'});
 assert.deepEqual(review.context,col.context);
 const proposal=(id,context)=>({...review,id,context,createdAt:sdk.serverTimestamp(),history:{0:{state:'waiting',by:'admin',at:sdk.serverTimestamp()}}});
 const missing={...col.context};delete missing.variant;
 await assertFails(sdk.set(sdk.ref(db,'workspaces/demo/reviews/forged-variant'),proposal('forged-variant',{...col.context,variant:'Large'})));
 await assertFails(sdk.set(sdk.ref(db,'workspaces/demo/reviews/missing-variant'),proposal('missing-variant',missing)));
 const path=sdk.ref(db,'workspaces/demo/reviews/'+review.id);
 for(const context of [missing,{...col.context,variant:'Large'}])await assertFails(sdk.set(path,{...review,context,state:'analyzing',history:{...review.history,1:{state:'analyzing',by:'admin',at:sdk.serverTimestamp()}}}));
 const analyzing=await analysis.startReview(review.id);assert.equal(analyzing.state,'analyzing');assert.equal(analyzing.context.variant,'Medium');
 for(const context of [missing,{...col.context,variant:'Large'}])await assertFails(sdk.set(path,{...analyzing,context,state:'approved',history:{...analyzing.history,2:{state:'approved',by:'admin',at:sdk.serverTimestamp(),justification:'Conferido'}}}));
 const done=await analysis.decideReview(review.id,{decision:'approved',justification:'Conferido'});assert.equal(done.state,'approved');assert.deepEqual(done.context,col.context);
 const legacy=await operations.recordCollection({context:f.context,readings:[{parameterId:f.parameterId,versionId:f.versionId,raw:'-650'}]}),old=await analysis.submitReview({collectionId:legacy.id,scope:'Legado sem variante'});
 await analysis.startReview(old.id);assert.equal((await analysis.decideReview(old.id,{decision:'approved',justification:'Conferido'})).state,'approved');
 await assertFails(sdk.set(sdk.ref(db,'workspaces/demo/reviews/legacy-forged'),{...proposal('legacy-forged',{...legacy.context,variant:'Medium'}),collectionId:legacy.id,eventDate:legacy.eventDate}));
});
