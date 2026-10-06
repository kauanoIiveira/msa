import test from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {memoryRepository} from '../helpers/memory-repository.js';
import {populatePresentationScenario} from '../../scripts/lib/presentation-scenario.mjs';
test('scenario balances quantities, separates kg, keeps uncertain limits pending and covers review states',async()=>{
 const repo=memoryRepository(),actor={uid:'owner',role:'admin'};
 await populatePresentationScenario({repo,actor,papa:Papa,now:()=>Date.parse('2026-10-06T01:00:00Z')});
 const production=Object.values(await repo.get('production')),losses=Object.values(await repo.get('losses'));
 assert.equal(Object.keys(await repo.get('parameters')).length,41);assert.equal(Object.keys(await repo.get('collections')).length,28);
 for(const gross of production.filter(p=>p.basis==='gross')){
   const good=production.find(p=>p.basis==='good'&&p.startedAt===gross.startedAt&&p.context.productId===gross.context.productId);
   const rejects=losses.filter(l=>l.kind==='reject'&&l.eventDate===gross.eventDate&&l.context.productId===gross.context.productId).reduce((s,l)=>s+l.amount,0);
   assert.equal(gross.quantity,good.quantity+rejects);
 }
 const versions=Object.values(await repo.get('parameterVersions')),params=Object.values(await repo.get('parameters'));
 for(const p of params.filter(p=>['MSA_BH','MSA_CH'].includes(p.code)||p.name.startsWith('Aquecimento')))assert.ok(versions.filter(v=>v.parameterId===p.id).every(v=>v.rule.kind==='pending'&&v.status==='draft'));
 assert.deepEqual(new Set(Object.values(await repo.get('reviews')).map(r=>r.state)),new Set(['waiting','analyzing','approved','rejected']));
 assert.ok(losses.some(l=>l.kind==='material'&&l.unit==='kg'));
 await assert.rejects(populatePresentationScenario({repo,actor,papa:Papa}),{code:'EMPTY_WORKSPACE_REQUIRED'});
});
