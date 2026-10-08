import test from 'node:test';
import assert from 'node:assert/strict';
import {buildProductivity} from '../../app/src/domain/productivity.js';
const from=10000000,to=from+3600000,context={machineId:'nhpl',processId:'p',productId:'q',order:'OP',lot:'L',shift:'1'};
function data(planned=[100,300],produced=[100,270]){const plans=planned.map((n,i)=>({id:'rev'+i,planId:'p'+i,context,startedAt:from+i*3600000,endedAt:to+i*3600000,breaks:[],quantitySource:'informed',intervals:[{id:'i'+i,startedAt:from+i*3600000,endedAt:to+i*3600000,plannedPieces:n}]}));return {plans,policies:[{id:'meta',metric:'productivityPercent',value:95,effectiveFrom:from,context}],production:produced.map((quantity,i)=>({id:'r'+i,intervalId:'i'+i,planRevisionId:'rev'+i,context,basis:'gross',quantity,startedAt:plans[i].startedAt,endedAt:plans[i].endedAt})),closures:Object.fromEntries(produced.map((q,i)=>['i'+i,{planRevisionId:'rev'+i,recordIds:['r'+i],confirmedGrossPieces:q,correctionIds:[]}]))};}
const evaluate=(d,extra={})=>buildProductivity(d,{context,from,to:to+3600000,now:to+7200000,...extra});
test('weighted productivity, unexpected stoppage, gross basis, and unallocated crop',()=>{
 const d=data();assert.equal(evaluate(d).aggregate.percent,92.5);d.stoppages=[{startedAt:from,endedAt:from+600000,planned:false}];assert.equal(evaluate(d).aggregate.percent,92.5);
 d.production.push({...d.production[0],id:'good',basis:'good',quantity:90});d.closures.i0.recordIds.push('good');assert.equal(evaluate(d).aggregate.percent,92.5);
 assert.equal(evaluate(d,{from:from+1}).segments[0].percent,null);
});
test('continuous elapsed expectation pauses and manual waits for update',()=>{
 const d=data([300],[143]);delete d.closures;const v=evaluate(d,{to,now:from+1800000,mode:'continuous'});assert.equal(v.segments[0].expectedPieces,150);assert.equal(v.segments[0].evaluation,'met');assert.equal(v.segments[0].state,'partial');
 assert.equal(evaluate(d,{to,now:from+1800000,mode:'manual'}).segments[0].percent,null);
 d.plans[0].breaks=[{startedAt:from+1800000,endedAt:from+2400000}];const before=evaluate(d,{to,now:from+1800000,mode:'continuous'}),during=evaluate(d,{to,now:from+2100000,mode:'continuous'});assert.equal(before.segments[0].expectedPieces,during.segments[0].expectedPieces);
});
test('policy changes preserve separate results and corrections conflicting suspend evaluation',()=>{
 const d=data();d.policies.push({...d.policies[0],id:'new',value:90,effectiveFrom:to,supersedes:'meta'});const v=evaluate(d);assert.equal(v.aggregate,null);assert.deepEqual(v.segments.map(s=>s.targetPercent),[95,90]);
 d.production[0].revisionConflict=true;assert.equal(evaluate(d).segments[0].percent,null);
});
test('zero plan without a reading is not scheduled, not a healthy production percentage',()=>{
 const d=data([0],[]);assert.equal(evaluate(d,{to}).segments[0].state,'not-scheduled');assert.equal(evaluate(d,{to}).aggregate,null);
});
test('zero planned intervals do not make fully confirmed production partial',()=>{
 const d=data([100,0],[100,0]);const result=evaluate(d);assert.equal(result.complete,true);assert.equal(result.aggregate.state,'final');assert.equal(result.aggregate.coverage,1);
});
test('a duplicated closure reference cannot stand in for a different increment',()=>{
 const d=data([300],[100]);d.production.push({...d.production[0],id:'r2',quantity:185});d.closures.i0={planRevisionId:'rev0',recordIds:['r0','r0'],confirmedGrossPieces:285};assert.equal(evaluate(d,{to}).segments[0].percent,null);
});
test('corrections approved before the closure but missing from its snapshot require reconciliation',()=>{
 const d=data([300],[285]);d.production[0]={...d.production[0],quantity:284,correctionId:'c'};d.closures.i0.createdAt=200;d.corrections=[{id:'c',state:'approved',decision:{at:199}}];
 assert.equal(evaluate(d,{to}).segments[0].reason,'confirmation-outdated');
 d.corrections[0].decision.at=201;assert.equal(evaluate(d,{to}).segments[0].state,'final');
 d.corrections[0].decision.at=199;d.closures.i0.correctionIds=['c'];d.closures.i0.confirmedGrossPieces=284;assert.equal(evaluate(d,{to}).segments[0].state,'final');
});
