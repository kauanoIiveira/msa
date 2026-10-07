import {test} from 'node:test';
import assert from 'node:assert/strict';
import {memoryRepository} from '../helpers/memory-repository.js';
import {createHistoryService} from '../../app/src/services/history.js';
test('operational queries exclude synthetic records and their reviews/corrections; presentation remains available without deletion',async()=>{
  const repo=memoryRepository(),context={machineId:'m',processId:'p',productId:'q'},eventDate='2026-10-05';
  for(const[id,origin]of [['real','manual'],['example','demo']]) {
    await repo.create('collections/'+id,{id,origin,context,eventDate,readings:{}});
    await repo.create('reviews/review-'+id,{id:'review-'+id,collectionId:id,context,eventDate});
  }
  const h=createHistoryService({repo}),q={fromDate:eventDate,toDate:eventDate,context};
  const op=await h.loadPeriod({...q,dataset:'operational'});assert.deepEqual(op.collections.map(r=>r.id),['real']);assert.deepEqual(op.reviews.map(r=>r.collectionId),['real']);
  assert.equal(op.excludedPresentationCount,1);
  assert.deepEqual((await h.list('reviews',{...q,dataset:'operational'})).items.map(r=>r.collectionId),['real']);
  const demo=await h.loadPeriod({...q,dataset:'presentation'});assert.deepEqual(demo.collections.map(r=>r.id),['example']);
  assert.ok(await repo.get('collections/example'));
});
test('pagination handles date ties, filtered pages, and capped incomplete periods',async()=>{
  const repo=memoryRepository();
  for(const id of ['a','b','c']) await repo.create(`collections/${id}`,{id,eventDate:'2026-10-05',context:{machineId:id==='b'?'other':'m'}});
  const h=createHistoryService({repo});const query={fromDate:'2026-10-05',toDate:'2026-10-05',limit:2,context:{machineId:'m'}};
  const first=await h.list('collections',query);assert.deepEqual(first.items.map(x=>x.id),['a']);assert.equal(first.complete,false);
  const next=await h.list('collections',{...query,cursor:first.nextCursor});assert.deepEqual(next.items.map(x=>x.id),['c']);assert.equal(next.complete,true);
  const capped=await h.loadPeriod({...query,maxPages:1});assert.equal(capped.complete,false);
  const all=await h.loadPeriod(query);assert.equal(all.collections.length,2);assert.equal(all.complete,true);
});
