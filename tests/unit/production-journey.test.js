import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildDashboard} from '../../app/src/domain/dashboard.js';
import {formMarkup,submitForm} from '../../app/src/ui/forms.js';
import {createOperations} from '../../app/src/services/operations.js';
import {memoryRepository} from '../helpers/memory-repository.js';
import {createMsaServices} from '../../app/src/services/create-msa.js';
import {initialSelection,selectProduction,changeRecordingProduction} from '../../app/src/ui/production-selection.js';
import {compatibleRecipes,productionChoices} from '../../app/src/ui/production-context-card.js';
const context={machineId:'nhpl',processId:'assembly',productId:'vgard',order:'OP1',lot:'LT1',shift:'1'};
test('production choices filter actual machines and show the operational date across midnight',()=>{
 const cases=[{id:'night',...context,productId:'mark',operationalDate:'2026-10-07',startedAt:Date.parse('2026-10-08T03:00:00-03:00'),endedAt:Date.parse('2026-10-08T07:00:00-03:00'),shift:'3',status:'closed'},{id:'other',...context,machineId:'other',operationalDate:'2026-10-07',startedAt:1,endedAt:2}];
 const html=productionChoices({cases,catalog:{},machineId:'nhpl',search:'mark'});assert.ok(html.includes('select-production:night'));assert.ok(!html.includes('select-production:other'));assert.ok(html.includes('Dia operacional 07/10'));assert.ok(html.includes('08/10'));
});
test('single applicable version is retained in a hidden field with its visible reference',()=>{
 const html=formMarkup('collection',{context,registries:{parameters:{p:{id:'p',active:true,processId:'assembly',name:'Espessura'}},parameterVersions:{v:{id:'v',parameterId:'p',status:'draft',unit:'mm',rule:{kind:'pending'}}}}});
 assert.ok(html.includes('type="hidden" name="version_p" value="v"'));assert.ok(html.includes('Referência da leitura'));assert.ok(!html.includes('<select name="version_p"'));assert.ok(html.includes('class="parameter-unit">mm'));
});
test('public dashboard service accepts both products in the same process',async()=>{
 const repo=memoryRepository(),services=createMsaServices({repo,actor:{uid:'reader',role:'viewer'}}),from=Date.parse('2026-10-07T00:00:00-03:00'),to=from+86400000;
 const view=await services.getDashboard({context:{machineId:'nhpl',processId:'assembly'},fromDate:'2026-10-07',toDate:'2026-10-07'},{from,to});assert.equal(view.totals.grossPieces,null);assert.equal(view.context.productId,undefined);
});
test('manifest changes reset only the initial consultation while additive revisions retain choices',()=>{
 const manifest={packageId:'package',defaultSelection:{query:{context:{machineId:'nhpl',processId:'assembly'},fromDate:'2026-09-30',toDate:'2026-10-06',shift:'all'},recording:{productionCaseId:'latest',context}}};
 const saved={packageId:'older',context:{machineId:'t20'},fromDate:'2026-10-08',toDate:'2026-10-08',shift:'1'};
 const next=initialSelection({manifest,saved});assert.equal(next.query.toDate,'2026-10-06');assert.deepEqual(next.previousQuery,saved);
 const retained=initialSelection({manifest:{...manifest,id:'revision2'},saved:{...saved,packageId:'package'}});assert.equal(retained.query.toDate,'2026-10-08');
});
test('switching with a draft preserves both its text and context until an explicit decision',()=>{
 const selection={query:{context:{machineId:'nhpl'}},recording:{productionCaseId:'one',context}},draft={values:[['raw_p','12,5']],context};
 const nextCase={id:'two',...context,productId:'mark'};
 const result=changeRecordingProduction({selection,nextCase,draft});assert.equal(result.requiresDecision,true);assert.deepEqual(result.draft,draft);assert.deepEqual(result.selection.recording.context,context);
 const keep=changeRecordingProduction({selection,nextCase,draft,decision:'keep'});assert.deepEqual(keep.draft.values,[['raw_p','12,5']]);
 const next=changeRecordingProduction({selection,nextCase,draft,decision:'new'});assert.equal(next.draft,null);assert.equal(next.selection.recording.context.productId,'mark');assert.deepEqual(next.selection.query,selection.query);
 assert.deepEqual(compatibleRecipes({recipeVersions:{a:{id:'a',processId:'assembly',productId:'vgard'},b:{id:'b',processId:'assembly',productId:'mark'}}},context).map(r=>r.id),['a']);
});
test('a broad consultation includes both products without making a recording context',()=>{
 const production=['vgard','mark'].map((productId,i)=>({id:String(i),context:{...context,productId},basis:'gross',quantity:10+i,startedAt:100,endedAt:200}));
 const view=buildDashboard({production},{context:{machineId:'nhpl',processId:'assembly'},from:1,to:300,complete:true});
 assert.equal(view.totals.grossPieces,21);assert.equal(view.parameters.length,0);assert.equal(view.context.productId,undefined);
});
test('collection inherits its snapshot without repeated OP fields and sends explicit time and stable intent',async()=>{
 let received;const data=new FormData();data.set('context_order','wrong');data.set('occurredAt','2026-10-07T10:00:00');
 await submitForm('collection',data,{context,registries:{},intent:{id:'intent_1'},services:{operations:{recordCollection:p=>{received=p;}}}});
 assert.equal(received.context.order,'OP1');assert.equal(received.id,'intent_1');assert.equal(received.occurredAt,Date.parse('2026-10-07T10:00:00-03:00'));
 const html=formMarkup('collection',{context});assert.ok(!html.includes('name="context_order"'));assert.ok(html.includes('name="occurredAt"'));
});
test('ambiguous acknowledgement can retry the same collection without creating a duplicate',async()=>{
 const repo=memoryRepository();await repo.create('machines/nhpl',{active:true});await repo.create('processes/assembly',{active:true,machineId:'nhpl'});await repo.create('products/vgard',{active:true,processIds:{assembly:true}});await repo.create('parameters/p',{active:true,processId:'assembly'});await repo.create('parameterVersions/v',{parameterId:'p'});
 const service=createOperations({repo,actor:{uid:'operator',role:'operator'}}),payload={id:'intent_1',context,occurredAt:100,readings:[{parameterId:'p',versionId:'v',raw:'5'}]};
 const first=await service.recordCollection(payload),second=await service.recordCollection(payload);assert.equal(second.id,first.id);assert.equal(Object.keys(await repo.get('collections')).length,1);
 await assert.rejects(service.recordCollection({...payload,readings:[{parameterId:'p',versionId:'v',raw:'6'}]}),{code:'RECORD_CONFLICT'});
});
