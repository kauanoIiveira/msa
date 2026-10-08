import test from 'node:test';
import assert from 'node:assert/strict';
import {recordsInPeriod} from '../../app/src/ui/period-records.js';
import {downloadExport} from '../../app/src/ui/csv-download.js';
test('period tables retain carry-over and exclude touching/nonintersecting intervals without allocating quantities',()=>{
  const rows=[{id:'old',startedAt:1,endedAt:10,quantity:20},{id:'carry',startedAt:5,endedAt:15,quantity:60},{id:'open',startedAt:9},{id:'future',startedAt:20,endedAt:30}];
  assert.deepEqual(recordsInPeriod('stoppages',rows,{from:10,to:20}).map(r=>r.id),['carry','open']);
  assert.equal(recordsInPeriod('production',rows.filter(r=>r.endedAt),{from:10,to:20})[0].quantity,60);
});
test('CSV download awaits authenticated async export and never downloads an error',async()=>{
  const downloads=[];await downloadExport(async()=>{await new Promise(r=>setTimeout(r,5));return 'value;95';},[],[],(value,name)=>downloads.push([value,name]),'report.csv');
  assert.deepEqual(downloads,[['value;95','report.csv']]);
  await assert.rejects(()=>downloadExport(async()=>{throw Error('offline');},[],[],()=>downloads.push('bad'),'bad.csv'),/offline/);
  assert.equal(downloads.length,1);
});
