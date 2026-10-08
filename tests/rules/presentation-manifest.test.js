import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {setup,sdk} from '../helpers/firebase-env.js';
const hash='a'.repeat(64),context={machineId:'example',processId:'p',productId:'q',order:'OP',lot:'LT',shift:'3'};
const row=()=>({id:'example',packageId:'example',version:'v1',origin:'demo',fromOperationalDate:'2026-10-01',toOperationalDate:'2026-10-07',defaultSelection:{query:{context,shift:'3',fromDate:'2026-10-07',toDate:'2026-10-07'},recording:{productionCaseId:'case',context}},entries:[{index:0,path:'machines/example',scope:'record',hash}],entryCount:1,entriesHash:hash,previewHash:hash,backupHash:hash,state:'published',createdBy:'admin',createdAt:sdk.serverTimestamp()});
test('manifest rules enforce author, role, timestamps, complete hashes and immutability',async t=>{
 const env=await setup(t),db=uid=>env.authenticatedContext(uid).database(),ref=(uid,id='example')=>sdk.ref(db(uid),'workspaces/demo/presentationManifests/'+id);
 await env.withSecurityRulesDisabled(async ctx=>{await sdk.set(sdk.ref(ctx.database(),'workspaces/demo/machines/example'),{id:'example'});await sdk.set(sdk.ref(ctx.database(),'workspaces/demo/productionCases/case'),{id:'case',...context,operationalDate:'2026-10-07'});});
 await assertSucceeds(sdk.set(ref('admin'),row()));
 await assertFails(sdk.update(ref('admin'),{version:'v2'}));await assertFails(sdk.remove(ref('admin')));
 for(const uid of ['op','eng','view'])await assertFails(sdk.set(ref(uid,'denied'),{...row(),id:'denied',createdBy:uid}));
 for(const patch of [{createdBy:'op'},{createdAt:1},{entryCount:2},{entryCount:3,entries:{0:{index:0,path:'machines/a',scope:'record',hash},2:{index:2,path:'machines/c',scope:'record',hash}}},{entries:[{index:1,path:'machines/a',scope:'record',hash}]},{baseManifestId:'missing'},{entries:[{index:0,path:'machines/missing',scope:'record',hash}]},{entries:[{index:0,path:'members/admin',scope:'record',hash}]},{entries:[{index:0,path:'machines/example',scope:'ledger-header',hash}]},{defaultSelection:{...row().defaultSelection,recording:{productionCaseId:'missing',context}}},{defaultSelection:{...row().defaultSelection,recording:{productionCaseId:'case',context:{...context,productId:'other'}}}},{entries:[{index:0,path:'machines/example',scope:'record',hash:'short'}]},{entries:[]},{state:'prepared'},{snapshot:{members:{evil:{role:'admin'}}}}])await assertFails(sdk.set(ref('admin','invalid'),{...row(),id:'invalid',...patch}));
 assert.equal((await sdk.get(ref('view'))).val().state,'published');
});
