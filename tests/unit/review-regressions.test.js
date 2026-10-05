import {test} from 'node:test';
import assert from 'node:assert/strict';
import {summarizeReadings} from '../../app/src/domain/statistics.js';
import {parseReading} from '../../app/src/domain/numbers.js';
import {buildIndicators} from '../../app/src/domain/indicators.js';
import {validateReplacement} from '../../app/src/domain/review.js';
import {createRegistryService} from '../../app/src/services/registry.js';
import {createHistoryService} from '../../app/src/services/history.js';
import {memoryRepository} from '../helpers/memory-repository.js';
import {seed} from '../helpers/fixtures.js';
test('finite inputs that overflow the estimator return unavailability, not infinite statistics',()=>{
  const r=summarizeReadings([1e308,9e307].map(parseReading),{sigmaMethod:'population',rule:{kind:'range',lower:0,upper:1e308}});
  assert.equal(r.mean,null);assert.equal(r.sigma,null);assert.equal(r.cp,null);assert.equal(r.reason,'non-finite-statistics');
});
test('material being reworked is not counted as discarded mass',()=>{
  const result=buildIndicators({losses:[{kind:'rework',unit:'kg',amount:2,reasonId:'r'}]},{from:0,to:100,complete:true});
  assert.equal(result.totals.lossKg,null);assert.equal(result.totals.reworkKg,2);
});
test('replacement context equality is structural, not insertion-order dependent',()=>{
  const original={id:'x',context:{machineId:'m',processId:'p',productId:'q'},quantity:100,basis:'gross',startedAt:0,endedAt:100};
  const replacement={...original,context:{productId:'q',machineId:'m',processId:'p'},quantity:99};
  assert.equal(validateReplacement('production',original,replacement).quantity,99);
});
test('target creation rejects impossible calendar dates',async()=>{
  const repo=memoryRepository(),f=await seed(repo),registry=createRegistryService({repo,actor:{uid:'admin',role:'admin'}});
  await assert.rejects(()=>registry.create('targets',{name:'Invalid',metric:'lossKg',unit:'kg',context:f.context,fromDate:'2026-02-30',toDate:'2026-03-01',operator:'upper',threshold:1}),{code:'INVALID_DATE'});
});
test('pagination rejects a cursor from outside the selected period',async()=>{
  const history=createHistoryService({repo:memoryRepository()});
  await assert.rejects(()=>history.list('collections',{fromDate:'2026-10-05',toDate:'2026-10-06',cursor:{date:'2026-09-01',key:'a'}}),{code:'INVALID_QUERY'});
});
test('indicators require a positive explicit report window even with no stoppages',()=>{
  assert.throws(()=>buildIndicators({},{complete:true}),{code:'INVALID_PERIOD'});
  assert.throws(()=>buildIndicators({},{from:100,to:100,complete:true}),{code:'INVALID_PERIOD'});
});
