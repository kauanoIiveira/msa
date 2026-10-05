import {test} from 'node:test';
import assert from 'node:assert/strict';
import {memoryRepository} from '../helpers/memory-repository.js';
import {seed} from '../helpers/fixtures.js';
import {createOperations} from '../../app/src/services/operations.js';
test('records typed production/loss and preserves missing readings without zero coercion',async()=>{
  const repo=memoryRepository(),f=await seed(repo);let id=0;
  const op=createOperations({repo,actor:{uid:'op',role:'operator'},idFactory:()=>`op${++id}`});
  for(const quantity of [-1,1.5]) await assert.rejects(()=>op.recordProduction({context:f.context,quantity,basis:'gross',startedAt:100,endedAt:200}));
  const prod=await op.recordProduction({context:f.context,quantity:100,basis:'gross',startedAt:100,endedAt:200});assert.equal(prod.basis,'gross');
  const loss=await op.recordLoss({context:f.context,kind:'material',unit:'kg',amount:0.2,reasonId:f.reasons.material});assert.equal(loss.amount,0.2);
  await assert.rejects(()=>op.recordLoss({context:f.context,kind:'reject',unit:'pieces',amount:0.5,reasonId:f.reasons.reject}));
  const col=await op.recordCollection({context:f.context,readings:[{parameterId:f.parameterId,versionId:f.versionId,raw:null}]});
  assert.equal(col.readings[f.parameterId].status,'missing');assert.equal(col.readings[f.parameterId].value,undefined);
  const legacy=await op.recordCollection({context:f.context,eventDate:'2026-08-31',timePrecision:'date',origin:'import',readings:[{parameterId:f.parameterId,versionId:f.versionId,raw:'-600'}]});
  assert.equal(legacy.occurredAt,undefined);assert.equal(legacy.eventDate,'2026-08-31');
});
test('stoppage closure is single-use and rejects incompatible reason and negative interval',async()=>{
  const repo=memoryRepository(),f=await seed(repo),op=createOperations({repo,actor:{uid:'op',role:'operator'}});
  const s=await op.startStoppage({context:f.context,startedAt:100,planned:false,reasonId:f.reasons.stop});
  await assert.rejects(()=>op.closeStoppage(s.id,{endedAt:50,reasonId:f.reasons.stop}),{code:'INVALID_PERIOD'});
  const result=await Promise.allSettled([op.closeStoppage(s.id,{endedAt:200,reasonId:f.reasons.stop}),op.closeStoppage(s.id,{endedAt:300,reasonId:f.reasons.stop})]);
  assert.equal(result.filter(r=>r.status==='fulfilled').length,1);
  assert.equal((await repo.get(`stoppages/${s.id}`)).endedAt,200);
});
