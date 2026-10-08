import test from 'node:test';import assert from 'node:assert/strict';
import {buildOperationalQuery,selectOperationalPeriod,readAccountConsultation,writeAccountConsultation} from '../../app/src/ui/operational-query.js';
import {buildIndicators} from '../../app/src/domain/indicators.js';
const t=(day,time)=>Date.parse(day+'T'+time+':00-03:00');
test('multi-day selection uses disjoint windows and retains unallocated original quantities',()=>{
 const consultation={fromDate:'2026-10-08',toDate:'2026-10-10',shift:'1',context:{machineId:'nhpl',shift:'2'}};
 const q=buildOperationalQuery(consultation);assert.equal(q.windows.length,3);assert.equal(q.query.context.shift,undefined);assert.equal(consultation.context.shift,'2');
 const rows=['08','09','10'].flatMap(d=>['08:00','16:00'].map(time=>({id:d+time,context:{machineId:'nhpl',shift:time==='08:00'?'1':'2'},startedAt:t('2026-10-'+d,time),endedAt:t('2026-10-'+d,time)+1000,quantity:5})));
 const crossing={id:'cross',quantity:50,context:{machineId:'nhpl',shift:'1'},startedAt:t('2026-10-08','14:00'),endedAt:t('2026-10-08','16:00')};
 const p=selectOperationalPeriod({effective:{production:[...rows,crossing]},coverage:{production:true}},q);
 assert.equal(p.effective.production.length,3);assert.equal(p.unallocated.production[0].quantity,50);assert.equal(p.coverage.production,false);
 assert.equal(buildOperationalQuery({...consultation,toDate:'2026-10-08',shift:'3'}).query.toDate,'2026-10-09');
});
test('stoppage totals and reason ranking exclude hours between selected daily shifts',()=>{
 const windows=[{from:1000000,to:1600000},{from:2200000,to:2800000}],context={machineId:'m'},stoppages=[{id:'a',context,reasonId:'stop',startedAt:1000000,endedAt:2800000},{id:'b',context,reasonId:'stop',startedAt:1100000,endedAt:1500000}];
 const d=buildIndicators({stoppages},{from:1000000,to:2800000,windows,complete:true});assert.equal(d.totals.stopMinutes,20);assert.equal(d.reasonRanking.stopMinutes[0].value,20+400000/60000);
});
test('consultation preferences stay separate by account and source',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 writeAccountConsultation('a','live',{shift:'2'},storage);assert.equal(readAccountConsultation('a','live',storage).shift,'2');assert.equal(readAccountConsultation('b','live',storage).shift,'all');assert.equal(readAccountConsultation('a','existing',storage).shift,'all');
});
test('correction queue follows the selected product through its original record',()=>{
 const op=buildOperationalQuery({fromDate:'2026-10-08',toDate:'2026-10-08',shift:'all',context:{productId:'mark'}});
 const period={effective:{collections:[{id:'v',context:{productId:'vgard'},occurredAt:t('2026-10-08','08:00')},{id:'m',context:{productId:'mark'},occurredAt:t('2026-10-08','08:00')}]},corrections:[{id:'cv',recordType:'collections',recordId:'v'},{id:'cm',recordType:'collections',recordId:'m'}]};
 assert.deepEqual(selectOperationalPeriod(period,op).corrections.map(c=>c.id),['cm']);
});
