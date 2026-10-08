import test from 'node:test';
import assert from 'node:assert/strict';
import {visibleNavigation,resolveRoute} from '../../app/src/ui/access.js';
import {productionChartData,referenceDraft,availableProductionIntervals} from '../../app/src/ui/presentation-details.js';
import {drawChart,clearCharts} from '../../app/src/ui/charts.js';
import {memoryRepository} from '../helpers/memory-repository.js';
import {createHistoryService} from '../../app/src/services/history.js';

test('secondary tools are absent from navigation but remain reachable',()=>{
 for(const role of ['admin','engineer','operator','viewer']){
  assert.ok(!visibleNavigation(role).includes('capture'));
  assert.ok(!visibleNavigation(role).includes('tv'));
  assert.equal(resolveRoute('capture',role),'capture');
  assert.equal(resolveRoute('tv',role),'tv');
  assert.ok(visibleNavigation(role).every(route=>visibleNavigation('admin').includes(route)));
 }
});
test('production selector skips closed and retired intervals and accepts a broad consultation context',()=>{
 const state={context:{machineId:'nhpl',order:''},period:{intervalHeaders:{open:{context:{machineId:'nhpl',order:'op'}},closed:{context:{machineId:'nhpl'}},retired:{context:{machineId:'nhpl'}},other:{context:{machineId:'other'}}},closures:{closed:{}},retiredIntervals:['retired']}};
 assert.deepEqual(availableProductionIntervals(state).map(([id])=>id),['open']);
});
test('charts retain unknowns, explicit zero and actual interval order',()=>{
 const result=productionChartData({segments:[
  {from:3,to:4,state:'final',plannedPieces:10,grossPieces:0,minimumPieces:10},
  {from:1,to:2,state:'final',plannedPieces:10,grossPieces:9,minimumPieces:10},
  {from:2,to:3,state:'unavailable',plannedPieces:10,grossPieces:null,minimumPieces:10}
 ]});
 assert.deepEqual(result.planned,[10,10,10]);
 assert.deepEqual(result.gross,[9,null,0]);
 assert.deepEqual(result.accumulatedGross,[9,null,null]);
 assert.deepEqual(result.accumulatedPlanned,[10,20,30]);
});
test('reference prefill clones only the selected parameter reference without approving it',()=>{
 const version={id:'old',parameterId:'p',unit:'mm',nature:'measurement',status:'approved',rule:{kind:'range',lower:1,upper:2}};
 const draft=referenceDraft('p',version);
 assert.equal(draft.status,'draft');assert.equal(draft.unit,'mm');assert.deepEqual(draft.rule,version.rule);
 draft.rule.lower=9;assert.equal(version.rule.lower,1);
 assert.deepEqual(referenceDraft('other',version),{parameterId:'other'});
 assert.deepEqual(referenceDraft('p',null),{parameterId:'p'});
});
test('charts show registered increments awaiting confirmation but not conflicted totals',()=>{
 const result=productionChartData({segments:[{from:1,to:2,state:'unavailable',reason:'confirmation-required',plannedPieces:300,grossPieces:20},{from:2,to:3,state:'unavailable',reason:'correction-conflict',plannedPieces:300,grossPieces:10}]});
 assert.deepEqual(result.gross,[20,null]);
});
test('a mixed production bar chart can require a zero baseline',()=>{
 const previous={document:globalThis.document,Chart:globalThis.Chart,getComputedStyle:globalThis.getComputedStyle};
 const canvas={getAttribute:()=>'',setAttribute(){},addEventListener(){},closest:()=>({after(){}})};
 try{
  globalThis.document={documentElement:{},getElementById:()=>canvas,createElement:()=>({querySelectorAll:()=>[]})};
  globalThis.getComputedStyle=()=>({getPropertyValue:()=>''});
  globalThis.Chart=class{constructor(element,config){this.config=config;}destroy(){}};
  const chart=drawChart('test',{labels:['one'],datasets:[{label:'Plan',data:[300]},{type:'line',label:'Minimum',data:[285]}],beginAtZero:true});
  assert.equal(chart.config.options.scales.y.beginAtZero,true);
 }finally{clearCharts();Object.assign(globalThis,previous);}
});
test('history normalizes serialized collection corrections without rewriting stored proposals',async()=>{
 const repo=memoryRepository(),reading={parameterId:'p',versionId:'v',raw:'1',value:1,status:'valid'};
 await repo.create('corrections/c',{id:'c',eventDate:'2026-10-07',recordType:'collections',replacement:{readings:[reading]}});
 const result=await createHistoryService({repo}).list('corrections');
 assert.equal(result.items[0].replacement.readings.p.raw,'1');
 assert.ok(Array.isArray((await repo.get('corrections/c')).replacement.readings));
});
