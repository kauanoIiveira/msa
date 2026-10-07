import {test} from 'node:test';import assert from 'node:assert/strict';import * as api from '../../app/src/index.js';
const date='2026-10-05',start=Date.parse(date+'T00:00:00-03:00'),hour=3600000,context={machineId:'m',processId:'p',productId:'q'};
test('hourly production never allocates a crossing total and preserves unknown, zero and an unfinished hour',()=>{
  const production=[{quantity:0,basis:'gross',startedAt:start+8*hour,endedAt:start+9*hour},
    {quantity:100,basis:'gross',startedAt:start+9.5*hour,endedAt:start+10.5*hour}];
  const r=api.buildHourly({production},{date,now:start+11.5*hour,target:290});
  assert.equal(r.hours[8].grossPieces,0);assert.equal(r.hours[8].difference,-290);
  assert.equal(r.hours[7].grossPieces,null);assert.equal(r.hours[9].grossPieces,null);assert.equal(r.hours[10].grossPieces,null);
  assert.equal(r.hours[11].status,'current');assert.equal(r.hours[11].difference,null);assert.equal(r.unallocatedPieces,100);
});
test('microstoppages use explicit seconds, exclude planned/open stops and union overlapping time',()=>{
  const stoppages=[{context,planned:false,startedAt:start+1000,endedAt:start+31000},
    {context,planned:false,startedAt:start+11000,endedAt:start+41000},
    {context,planned:true,startedAt:start+100000,endedAt:start+110000},{context,planned:false,startedAt:start+200000}];
  const r=api.buildHourly({stoppages},{date,now:start+hour,microStopSeconds:60});
  assert.equal(r.microstops.count,2);assert.equal(r.microstops.seconds,40);assert.equal(r.microstops.overlap,true);assert.equal(r.openStoppages,1);
});
test('hourly last entry refers only to events in the chosen day',()=>{
  const r=api.buildHourly({collections:[{eventDate:date,createdAt:start+hour},{eventDate:'2026-10-06',createdAt:start+25*hour}],losses:[{eventDate:'2026-10-06',createdAt:start+26*hour}]},{date});
  assert.equal(r.lastRecordAt,start+hour);
});
test('hourly conflicts do not reuse original quantities or stoppage times as resolved values',()=>{
  const r=api.buildHourly({production:[{quantity:100,basis:'gross',startedAt:start+8*hour,endedAt:start+9*hour,revisionConflict:true}],stoppages:[{context,planned:false,startedAt:start+8*hour,endedAt:start+8*hour+30000,revisionConflict:true}]},{date,now:start+10*hour,target:290});
  assert.equal(r.hours[8].grossPieces,null);assert.equal(r.hours[8].difference,null);assert.equal(r.conflictedRecords,2);assert.equal(r.microstops.seconds,0);
});
