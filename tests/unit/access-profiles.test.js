import test from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {memoryRepository} from '../helpers/memory-repository.js';
import {seed} from '../helpers/fixtures.js';
import {createMsaServices} from '../../app/src/services/create-msa.js';

for(const role of ['admin','engineer','operator','viewer'])test(`${role}: authorized functions succeed and forbidden functions reject direct service calls`,async()=>{
  const repo=memoryRepository(),f=await seed(repo),actor={uid:`account-${role}`,role};
  const service=createMsaServices({repo,actor,papa:Papa});
  const requester=createMsaServices({repo,actor:{uid:'requester',role:'operator'},papa:Papa});
  const editing=['admin','engineer'].includes(role),operating=role!=='viewer';
  const check=async(allowed,call)=>allowed?await call():await assert.rejects(call,{code:'FORBIDDEN'});
  await check(role==='admin',()=>service.registry.create('machines',{name:'New machine'}));
  await check(role==='admin',()=>service.registry.create('processes',{name:'New process',machineId:f.context.machineId}));
  await check(role==='admin',()=>service.registry.create('products',{name:'New product',processIds:{[f.context.processId]:true}}));
  await check(role==='admin',()=>service.registry.create('parameters',{name:'New parameter',processId:f.context.processId}));
  await check(role==='admin',()=>service.registry.create('reasons',{name:'New reason',kind:'stop'}));
  await check(role==='admin',()=>service.registry.update('machines',f.context.machineId,{name:'Updated machine'}));
  await check(editing,()=>service.registry.create('targets',{name:'Production target',metric:'producedPieces',unit:'pieces',context:f.context,fromDate:'2026-10-07',toDate:'2026-10-07',operator:'lower',threshold:100}));
  await check(editing,()=>service.registry.createParameterVersion(f.parameterId,{unit:'mmHg',nature:'measurement',status:'approved',rule:{kind:'upper',upper:-600}}));
  const readings=[{parameterId:f.parameterId,versionId:f.versionId,raw:'-650'}];
  await check(operating,()=>service.operations.recordCollection({context:f.context,readings}));
  await check(operating,()=>service.operations.recordProduction({context:f.context,quantity:100,basis:'gross',startedAt:1000,endedAt:2000}));
  await check(operating,()=>service.operations.recordLoss({context:f.context,kind:'reject',unit:'pieces',amount:1,reasonId:f.reasons.reject}));
  await check(operating,()=>service.operations.startStoppage({context:f.context,startedAt:1000,planned:false,reasonId:f.reasons.stop}));
  const collection=await requester.operations.recordCollection({context:f.context,readings});
  await check(operating,()=>service.analysis.submitReview({collectionId:collection.id,scope:'Evidence review'}));
  const review=await requester.analysis.submitReview({collectionId:collection.id,scope:'Independent review'});
  await check(editing,()=>service.analysis.startReview(review.id));
  await check(editing,()=>service.analysis.decideReview(review.id,{decision:'approved',justification:'Evidence checked'}));
  const original=await requester.operations.recordProduction({context:f.context,quantity:100,basis:'gross',startedAt:1000,endedAt:2000});
  const replacement={...original,quantity:99};
  await check(operating,()=>service.analysis.requestCorrection({recordType:'production',recordId:original.id,replacement,reason:'Count correction'}));
  const proposal=await requester.analysis.requestCorrection({recordType:'production',recordId:original.id,replacement,reason:'Independent correction'});
  await check(editing,()=>service.analysis.decideCorrection(proposal.id,{decision:'approved',justification:'Count checked'}));
  assert.equal((await repo.get(`production/${original.id}`)).quantity,100,'the original remains intact');
  assert.ok((await service.history.list('production')).items.length>0,'all authorized roles can consult records');
  await check(role==='admin',()=>service.registry.deactivate('machines',f.context.machineId));
});

for(const role of ['admin','engineer'])test(`${role} cannot approve their own correction`,async()=>{
  const repo=memoryRepository(),f=await seed(repo);
  const s=createMsaServices({repo,actor:{uid:'same-person',role},papa:Papa});
  const original=await s.operations.recordProduction({context:f.context,quantity:10,basis:'gross',startedAt:1000,endedAt:2000});
  const request=await s.analysis.requestCorrection({recordType:'production',recordId:original.id,replacement:{...original,quantity:9},reason:'Recount'});
  await assert.rejects(()=>s.analysis.decideCorrection(request.id,{decision:'approved',justification:'Own decision'}),{code:'SELF_APPROVAL'});
  assert.equal((await repo.get(`corrections/${request.id}`)).state,'waiting');
});
