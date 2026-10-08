import test from 'node:test';import assert from 'node:assert/strict';import {liveControlsMarkup,liveObservedBases,mountLiveControls} from '../../app/src/ui/live-controls.js';
test('viewer observes continuous source without write controls and original source stays reachable',()=>{
 const html=liveControlsMarkup({status:{phase:'running',asOf:1000,pieceCount:2},actor:{role:'viewer'},source:'live'});assert.ok(html.includes('Registros existentes'));assert.ok(html.includes('Em tempo real'));assert.equal(html.includes('data-action="live:failure"'),false);
 const admin=liveControlsMarkup({status:{phase:'running'},actor:{role:'admin'},source:'live'});assert.ok(admin.includes('data-action="live:pause"'));assert.ok(admin.includes('data-action="live:failure"'));
});
test('storage failure schedules recovery controls even while a form defers rendering',()=>{
 let listener,refreshes=0;const phase={textContent:''},time={textContent:''},root={querySelector:key=>key==='[data-live-phase]'?phase:key==='[data-live-time]'?time:null};
 mountLiveControls({root,workspace:{live:{subscribe:fn=>{listener=fn;return()=>{};}}},refresh:()=>refreshes++,isEditing:()=>true});listener({phase:'error',asOf:1000,error:new Error('quota')});assert.equal(refreshes,1);assert.equal(phase.textContent,'Fonte interrompida');
});
test('coverage ignores time before the observed production plan but flags a missing observed span',()=>{
 const pack={context:{order:'OP-LIVE'},data:{productionIntervals:{one:{context:{order:'OP-LIVE'},startedAt:2000,endedAt:10000}}},cursor:{through:5000,gaps:[{from:1000,to:2000}],paused:false,disconnected:false}},op={windows:[{from:0,to:20000}]};
 assert.equal(liveObservedBases(pack,op,5000).complete,true);pack.cursor.gaps.push({from:3000,to:4000});assert.equal(liveObservedBases(pack,op,5000).complete,false);
});
