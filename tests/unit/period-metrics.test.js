import test from 'node:test';import assert from 'node:assert/strict';
import {aggregateOee,periodReliability,periodMicroStops} from '../../app/src/domain/period-metrics.js';
import {stableStringify} from '../../app/src/domain/canonical.js';
const context={machineId:'m',shift:'1'},windows=[{from:1000000,to:15400000}],plans=[{context,startedAt:1000000,endedAt:15400000}];
const stop={id:'fail',context,startedAt:8200000,endedAt:8800000};const classification={stopId:'fail',category:'availability',failure:true,repairStartedAt:8260000,repairEndedAt:8560000,stopFingerprint:stableStringify([stop.startedAt,stop.endedAt,null])};
test('mixed ideal cycles use weighted quality and ideal good work',()=>{
 const a=aggregateOee([{oee:1,state:'final',plannedSeconds:1200,runSeconds:1200,idealSeconds:10,total:100,firstPassGood:100},{oee:1,state:'final',plannedSeconds:1200,runSeconds:1200,idealSeconds:20,total:50,firstPassGood:25}]);assert.equal(a.value,.625);assert.equal(a.oee,.625);assert.equal(a.weightedQuality,true);
});
test('missing ideal cycle preserves calculable availability and marks component coverage',()=>{
 const a=aggregateOee([{oee:null,state:'unavailable',plannedSeconds:1200,runSeconds:900,idealSeconds:null,total:100,firstPassGood:90}]);assert.equal(a.oee,null);assert.equal(a.availability,.75);assert.equal(a.performance,null);assert.equal(a.quality,.9);assert.equal(a.componentCoverage.availability.evaluated,1);
});
test('period reliability counts unique starts and complete repairs independently of OEE',()=>{
 const input={plans,stops:[stop],classifications:[classification],windows,now:20000000,coverage:{complete:true}};
 const r=periodReliability(input);assert.equal(r.mtbf.value,230*60);assert.equal(r.mttr.value,5*60);
 const carried=periodReliability({...input,windows:[{from:8300000,to:9000000}]});assert.equal(carried.failures,0);assert.equal(carried.carryInFailures,1);assert.equal(carried.mttr.value,300);
 const none=periodReliability({...input,stops:[]});assert.equal(none.mtbf.value,null);assert.equal(none.mttr.value,null);
 const open=periodReliability({...input,stops:[{...stop,endedAt:null}],classifications:[{...classification,repairEndedAt:undefined,stopFingerprint:stableStringify([stop.startedAt,null,null])}]});assert.equal(open.openRepairs,1);assert.equal(open.mttr.value,null);
});
test('microstop across hourly boundaries counts once and unions duration',()=>{
 const stops=[{id:'micro',context,startedAt:2000000,endedAt:2020000}];const r=periodMicroStops({stops,windows:[{from:1900000,to:2010000},{from:2010000,to:2100000}],references:[]});assert.equal(r.count,1);assert.equal(r.seconds,20);
});
test('reliability selects the latest classification chronologically and ignores unrelated stops',()=>{
 const newer={...classification,id:'z-new',createdAt:200},older={...classification,id:'a-old',createdAt:100,failure:false};
 const unrelated=[{...stop,id:'other-machine',context:{machineId:'other',shift:'1'}},{...stop,id:'past',startedAt:1,endedAt:100}];
 const r=periodReliability({plans,stops:[stop,...unrelated],classifications:[newer,older],windows,now:20000000,coverage:{complete:true}});
 assert.equal(r.failures,1);assert.equal(r.mtbf.value,230*60);assert.equal(r.mttr.value,300);
});
test('overnight reliability unions overlapping availability stops and keeps open repairs distinct',()=>{
 const from=Date.parse('2026-10-01T23:00:00-03:00'),to=from+8*3600000,ctx={machineId:'m',shift:'3'};
 const a={id:'a',context:ctx,startedAt:from+3600000,endedAt:from+4200000},b={id:'b',context:ctx,startedAt:from+3900000,endedAt:from+4500000};
 const classes=[a,b].map(s=>({id:s.id,stopId:s.id,failure:true,category:'availability',repairStartedAt:s.startedAt,stopFingerprint:stableStringify([s.startedAt,s.endedAt,null]),...(s.id==='a'?{repairEndedAt:s.startedAt+300000}:{})}));
 const r=periodReliability({plans:[{context:ctx,startedAt:from,endedAt:to}],stops:[a,b],classifications:classes,windows:[{from,to}],now:to,coverage:{complete:true}});
 assert.equal(r.operatingSeconds,8*3600-900);assert.equal(r.mtbf.value,(8*3600-900)/2);assert.equal(r.mttr.value,300);assert.equal(r.openRepairs,1);
});
