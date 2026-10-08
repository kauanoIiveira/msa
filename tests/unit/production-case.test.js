import {test} from 'node:test';
import assert from 'node:assert/strict';
import {memoryRepository} from '../helpers/memory-repository.js';
import {createProductionCaseService} from '../../app/src/services/production-case.js';
async function fixture(role='admin') {
 const repo=memoryRepository();
 await repo.create('machines/m',{id:'m',active:true,name:'Máquina'});
 await repo.create('processes/p',{id:'p',machineId:'m',active:true});
 for(const id of ['vgard','mark'])await repo.create('products/'+id,{id,active:true,processIds:{p:true}});
 let i=0;return {repo,service:createProductionCaseService({repo,actor:{uid:'user',role},idFactory:()=>`case_${++i}`})};
}
const input={machineId:'m',processId:'p',productId:'vgard',order:'OP-10',lot:'LT-10',shift:'1',operationalDate:'2026-10-07',startedAt:Date.parse('2026-10-07T07:00:00-03:00'),endedAt:Date.parse('2026-10-07T11:00:00-03:00'),status:'planned'};
test('production case returns validated recording context and preserves audit',async()=>{
 const {service}=await fixture();const row=await service.create(input);
 assert.deepEqual(await service.context(row.id),{machineId:'m',processId:'p',productId:'vgard',order:'OP-10',lot:'LT-10',shift:'1'});
 assert.equal(row.createdBy,'user');assert.equal((await service.list({context:{productId:'mark'}})).items.length,0);
 assert.equal((await service.list({context:{productId:'vgard'}})).items.length,1);
});
test('recipe belongs to the selected product and revisions never mutate earlier versions',async()=>{
 const {service,repo}=await fixture();
 const recipe=await service.recipes.create({recipeId:'recipe',productId:'vgard',processId:'p',label:'Configuração A',settings:{pressure:'6.5'},source:'Referência de exemplo',status:'draft'});
 const before=await repo.get('recipeVersions/'+recipe.id);
 await service.recipes.create({recipeId:'recipe',productId:'vgard',processId:'p',label:'Configuração B',settings:{pressure:'6.6'},source:'Revisão de exemplo',status:'draft',supersedes:recipe.id});
 assert.deepEqual(await repo.get('recipeVersions/'+recipe.id),before);
 const row=await service.create({...input,recipeVersionId:recipe.id});assert.equal((await service.context(row.id)).recipe,recipe.id);
 await assert.rejects(service.create({...input,productId:'mark',recipeVersionId:recipe.id}),{code:'CONTEXT_MISMATCH'});
});
test('optional recipe remains absent and invalid shift or product association is rejected',async()=>{
 const {service}=await fixture();const row=await service.create(input);assert.equal('recipe' in await service.context(row.id),false);
 await assert.rejects(service.create({...input,shift:'2'}),{code:'SHIFT_PERIOD'});
 await assert.rejects(service.create({...input,productId:'missing'}),{code:'INVALID_REFERENCE'});
 await assert.rejects(service.create({...input,operationalDate:'2026-10-06'}),{code:'INVALID_DATE'});
});
test('operator cannot create recipes and viewer cannot create production cases',async()=>{
 const {service}=await fixture('operator');await assert.rejects(service.recipes.create({}),{code:'FORBIDDEN'});
 const viewer=await fixture('viewer');await assert.rejects(viewer.service.create(input),{code:'FORBIDDEN'});
});
test('legacy production with complete context is selectable without rewriting the source',async()=>{
 const {service,repo}=await fixture();const original={id:'old',context:{machineId:'m',processId:'p',productId:'vgard',order:'OLD-OP',lot:'OLD-LT',shift:'1'},startedAt:input.startedAt,endedAt:input.endedAt,eventDate:'2026-10-07',quantity:100,basis:'gross'};
 await repo.create('production/old',original);const rows=await service.list({context:{productId:'vgard'}});
 assert.equal(rows.items.length,1);assert.equal(rows.items[0].legacy,true);assert.equal((await service.context(rows.items[0].id)).lot,'OLD-LT');
 assert.deepEqual(await repo.get('production/old'),original);
});
