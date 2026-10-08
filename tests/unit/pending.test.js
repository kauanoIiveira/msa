import test from 'node:test';import assert from 'node:assert/strict';import {buildPending} from '../../app/src/domain/pending.js';
test('open entities precede date filters, deduplicate conditions and respect author/viewer permissions',()=>{
 const old={id:'old',startedAt:1,context:{machineId:'m'},endedAt:null};const correction={id:'fix',state:'waiting',createdBy:'a'};
 const input={pendingBase:{effective:{stoppages:[old]},reviews:[],corrections:[correction],complete:true},period:{},technical:[],consultation:{context:{machineId:'m'}},actor:{uid:'a',role:'admin'},asOf:100};
 const p=buildPending(input);assert.equal(p.open.filter(x=>x.recordId==='old').length,1);assert.equal(p.open.find(x=>x.recordId==='fix').action,null);assert.equal(buildPending({...input,actor:{uid:'v',role:'viewer'}}).open.find(x=>x.recordId==='old').action,null);
 assert.equal(buildPending({...input,pendingBase:{...input.pendingBase,complete:false}}).complete,false);
});
test('period findings retain historical deviations, group missing references, and ignore future intervals',()=>{
 const context={machineId:'m',processId:'p',productId:'q',shift:'1'},h={context,startedAt:1,endedAt:90};
 const reading=value=>({parameterId:'p1',versionId:'v',value,status:'valid'}),collections=[{id:'bad',context,occurredAt:10,readings:{p1:reading(12)}},{id:'good',context,occurredAt:20,readings:{p1:reading(10)}}];
 const input={pendingBase:{complete:true},period:{effective:{collections},parameterVersions:{v:{status:'approved',rule:{kind:'range',lower:9,upper:11}}},intervalHeaders:{a:h,b:h,future:{...h,startedAt:110,endedAt:120}},plans:[{intervals:[{id:'a'},{id:'b'},{id:'future'}]}]},consultation:{context},technical:[],actor:{uid:'a',role:'admin'},asOf:100};
 const p=buildPending(input);assert.equal(p.deviations.filter(d=>d.recordId==='bad').length,1);assert.equal(p.deviations.some(d=>d.recordId==='good'),false);assert.equal(p.checks.filter(d=>d.kind==='reference').length,1);assert.equal(p.checks.some(d=>d.recordId==='future'),false);
});
