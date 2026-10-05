import {test} from 'node:test';
import assert from 'node:assert/strict';
import {memoryRepository} from '../helpers/memory-repository.js';
import {createHistoryService} from '../../app/src/services/history.js';
test('pagination handles date ties, filtered pages, and capped incomplete periods',async()=>{
  const repo=memoryRepository();
  for(const id of ['a','b','c']) await repo.create(`collections/${id}`,{id,eventDate:'2026-10-05',context:{machineId:id==='b'?'other':'m'}});
  const h=createHistoryService({repo});const query={fromDate:'2026-10-05',toDate:'2026-10-05',limit:2,context:{machineId:'m'}};
  const first=await h.list('collections',query);assert.deepEqual(first.items.map(x=>x.id),['a']);assert.equal(first.complete,false);
  const next=await h.list('collections',{...query,cursor:first.nextCursor});assert.deepEqual(next.items.map(x=>x.id),['c']);assert.equal(next.complete,true);
  const capped=await h.loadPeriod({...query,maxPages:1});assert.equal(capped.complete,false);
  const all=await h.loadPeriod(query);assert.equal(all.collections.length,2);assert.equal(all.complete,true);
});
