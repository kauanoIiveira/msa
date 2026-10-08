import test from 'node:test';import assert from 'node:assert/strict';import {createLiveCursor,advanceLive} from '../../app/src/domain/live-scenario.js';
const start=Date.parse('2026-10-08T08:00:00-03:00'),context={machineId:'nhpl',processId:'nhpl-montagem',productId:'nhpl-vgard-hp',shift:'1'};
test('cycle completions are deterministic and retries, pause and offline never invent pieces',()=>{
 let c=createLiveCursor({startedAt:start,sessionId:'test',context,automaticEvents:false});const a=advanceLive(c,{through:start+24000});assert.equal(a.intents.filter(x=>x.kind==='piece').length,2);assert.deepEqual(advanceLive(a.cursor,{through:start+24000}).intents,[]);
 c=a.cursor;for(let i=1;i<=23;i++)c=advanceLive(c,{through:c.through+12000}).cursor;assert.equal(c.pieceCount,25);assert.equal(c.rejectCount,1);
 c=advanceLive(c,{through:c.through,command:{id:'pause',type:'pause'}}).cursor;const paused=advanceLive(c,{through:c.through+30000});assert.equal(paused.cursor.pieceCount,25);
 const gap=advanceLive(a.cursor,{through:a.cursor.through+120000});assert.equal(gap.gap.to-gap.gap.from,120000);assert.equal(gap.intents.filter(x=>x.kind==='piece').length,0);
 const evening=createLiveCursor({startedAt:Date.parse('2026-10-08T14:59:30-03:00'),sessionId:'gap-shift',context}),afterGap=advanceLive(evening,{through:evening.through+120000});assert.equal(afterGap.cursor.context.shift,'2');
});
test('irregular timer callbacks still trigger scheduled stops and exact cycle completions',()=>{
 let c=createLiveCursor({startedAt:start+137,sessionId:'jitter',context});const all=[];
 for(let elapsed=701;elapsed<225000;elapsed+=701){const step=advanceLive(c,{through:start+137+elapsed});c=step.cursor;all.push(...step.intents);}
 const last=advanceLive(c,{through:start+137+225000});all.push(...last.intents);
 assert.equal(all.filter(e=>e.kind==='stop').length,2);assert.equal(last.cursor.pieceCount,14);assert.equal(last.cursor.stop,null);
});
test('microstop, repair and shift changes preserve event identity and stop production',()=>{
 let c=createLiveCursor({startedAt:start,sessionId:'test',context});c=advanceLive(c,{through:start+60000}).cursor;assert.equal(c.stop.failure,false);const stopped=advanceLive(c,{through:start+70000});assert.equal(stopped.intents.some(x=>x.kind==='piece'),false);
 c=stopped.cursor;while(c.activeMilliseconds<225000)c=advanceLive(c,{through:c.through+1000}).cursor;assert.equal(c.stop,null);
 const third=createLiveCursor({startedAt:Date.parse('2026-10-09T06:59:58-03:00'),sessionId:'night',context:{...context,shift:'3'}}),next=advanceLive(third,{through:third.through+3000});assert.equal(next.cursor.context.shift,'1');assert.notEqual(next.cursor.sourceId,third.sourceId);
});
