import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildIndicators,comparePeriods,effectiveRecords} from '../../app/src/domain/indicators.js';
const context={machineId:'m',processId:'p',productId:'q'};
const prod={id:'p',context,eventDate:'2026-10-05',quantity:100,basis:'gross',startedAt:100,endedAt:200};
const losses=[{context,eventDate:'2026-10-05',kind:'reject',unit:'pieces',amount:2,reasonId:'r'},{context,eventDate:'2026-10-05',kind:'material',unit:'kg',amount:0.2,reasonId:'k'}];
test('all indicator consumers reject draft and setpoint capability equally',()=>{
  const collections=Array.from({length:30},(_,i)=>({context,readings:{f:{parameterId:'f',versionId:'v',status:'valid',value:i%2?50.1:49.9}}}));
  for(const patch of [{status:'draft',nature:'measurement'},{status:'approved',nature:'setpoint'}]) {
    const r=buildIndicators({collections,parameterVersions:{v:{rule:{kind:'range',lower:40,upper:60},...patch}}},{from:0,to:300,complete:true});
    assert.equal(r.statistics[0].cp,null);assert.equal(r.statistics[0].cpk,null);
  }
});
test('keeps kg separate, requires a valid denominator and distinguishes absent amounts',()=>{
  const r=buildIndicators({production:[prod],losses,stoppages:[],collections:[],targets:[]},{from:0,to:300,complete:true});
  assert.equal(r.totals.grossPieces,100);assert.equal(r.totals.lossKg,0.2);assert.equal(r.totals.rejectPercent,2);assert.equal(r.totals.goodPieces,null);assert.equal(r.alerts.length,0);
  const unknown=buildIndicators({production:[{...prod,basis:'good'}],losses:[],stoppages:[],collections:[]},{from:0,to:300,complete:false});
  assert.equal(unknown.totals.rejectPercent,null);assert.equal(unknown.totals.lossKg,null);assert.equal(unknown.complete,false);
  assert.equal(comparePeriods([r,unknown]).comparable,false);
});
test('unions downtime per machine and does not attribute overlapping time to a single cause',()=>{
  const intervals=[{context,startedAt:0,endedAt:10,reasonId:'a'},{context,startedAt:5,endedAt:15,reasonId:'b'},{context:{...context,machineId:'other'},startedAt:0,endedAt:10,reasonId:'a'}];
  const r=buildIndicators({production:[],losses,stoppages:intervals,collections:[]},{from:0,to:20,complete:true});
  assert.equal(r.totals.stopMinutes,25/60000);assert.ok(r.notes.includes('overlapping-reasons'));
  const ranks=r.reasonRanking.rejectedPieces;assert.equal(ranks[0].cumulativePercent,100);
});
test('approved correction overlays preserve original readings and flag concurrent alternative revisions',()=>{
  const rows=[{id:'c',readings:{a:{value:1},b:{value:2}}}];
  const corrections=[{id:'x',recordType:'collections',recordId:'c',state:'approved',replacement:{id:'c',readings:{a:{value:3}}}}];
  const r=effectiveRecords('collections',rows,corrections);
  assert.equal(r.items[0].readings.b.value,2);assert.equal(r.items[0].readings.a.value,3);assert.equal(rows[0].readings.a.value,1);
  assert.equal(effectiveRecords('collections',rows,[...corrections,{...corrections[0],id:'y'}]).conflicts.length,1);
});
test('targets need an exact complete reporting window and comparisons compute compatible deltas',()=>{
  const from=Date.parse('2026-10-05T00:00:00-03:00'),to=Date.parse('2026-10-06T00:00:00-03:00');
  const data={production:[{...prod,startedAt:from+100,endedAt:from+200}],losses:[],collections:[],stoppages:[],targets:[{id:'t',active:true,context,metric:'producedPieces',unit:'pieces',fromDate:'2026-10-05',toDate:'2026-10-05',operator:'lower',threshold:150}]};
  const first=buildIndicators(data,{from,to,complete:true});assert.equal(first.alerts[0].value,100);
  assert.equal(buildIndicators(data,{from,to,complete:false}).alerts.length,0);
  const second=buildIndicators({...data,production:[{...data.production[0],quantity:120}]},{from,to,complete:true});
  assert.equal(comparePeriods([first,second]).changes[0].grossPieces.difference,20);
});
