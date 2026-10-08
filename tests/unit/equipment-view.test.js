import {test} from 'node:test';
import assert from 'node:assert/strict';
import {equipmentView,equipmentHistoryQuery} from '../../app/src/ui/equipment-page.js';
const catalog={machines:{a:{id:'a',name:'T20',active:true,sector:'Selo'},b:{id:'b',name:'NHPL',active:true}},processes:{p:{id:'p',machineId:'a',name:'Selagem'}}};
test('equipment uses catalog sectors and recorded stoppage/reading, never assumes physical connection',()=>{
 const rows=equipmentView({catalog,events:{collections:[{id:'c',context:{machineId:'a'},occurredAt:100}],stoppages:[{id:'s',context:{machineId:'a'},startedAt:50}]}});
 assert.equal(rows[0].status,'Parada registrada em aberto');assert.equal(rows[0].lastReading.id,'c');assert.equal(rows[1].lastReading,null);assert.equal(rows[1].sector,null);assert.equal('connected' in rows[0],false);
 assert.deepEqual(equipmentView({catalog,selection:{sector:'Selo'}}).map(r=>r.id),['a']);
});
test('date-only observations prevent inventing a latest timed reading on the same day',()=>{
 const rows=equipmentView({catalog,events:{collections:[{id:'c',context:{machineId:'a'},occurredAt:100,eventDate:'1970-01-01'},{id:'u',context:{machineId:'a'},timePrecision:'date',eventDate:'1970-01-01'}]}});
 assert.equal(rows[0].lastReading,null);assert.equal(rows[0].lastReadingReason,'Horário da leitura não informado');
});
test('a conflicting latest collection cannot supply authoritative values or fall back to older readings',()=>{
 const events={collections:[{id:'old',context:{machineId:'a'},occurredAt:100,readings:{p:{raw:'10'}}},{id:'conflict',context:{machineId:'a'},occurredAt:200,revisionConflict:true,readings:{p:{raw:'99'}}}]};
 const row=equipmentView({catalog,events})[0];assert.equal(row.lastReading,null);assert.equal(row.lastReadingReason,'Revisão conflitante na última leitura');assert.deepEqual(row.conflictedRecordIds,['conflict']);
});
test('a later date-only conflict retains its diagnostic and historical identity without inventing a time',()=>{
 const events={collections:[{id:'old',context:{machineId:'a'},eventDate:'2026-10-06',occurredAt:Date.parse('2026-10-06T12:00:00-03:00')},{id:'dated-conflict',context:{machineId:'a'},eventDate:'2026-10-07',timePrecision:'date',revisionConflict:true}]};
 const row=equipmentView({catalog,events})[0];assert.equal(row.lastReading,null);assert.equal(row.lastReadingReason,'Revisão conflitante na última leitura');assert.deepEqual(row.conflictedRecordIds,['dated-conflict']);assert.equal(events.collections[1].occurredAt,undefined);
 assert.deepEqual(equipmentHistoryQuery(events.collections[1]),{context:{machineId:'a'},fromDate:'2026-10-07',toDate:'2026-10-07',shift:'all'});assert.equal(events.collections[1].occurredAt,undefined);
});
test('a clean later date-only collection does not inherit an older timed conflict',()=>{
 const events={collections:[{id:'old-conflict',context:{machineId:'a'},eventDate:'2026-10-06',occurredAt:Date.parse('2026-10-06T12:00:00-03:00'),revisionConflict:true},{id:'dated-clean',context:{machineId:'a'},eventDate:'2026-10-07',timePrecision:'date'}]};
 const row=equipmentView({catalog,events})[0];assert.equal(row.lastReading,null);assert.equal(row.lastReadingReason,'Horário da leitura não informado');assert.deepEqual(row.conflictedRecordIds,[]);
});
test('a date-only collection leaves every observation of the latest day a possible latest candidate',()=>{
 const events={collections:[{id:'dated',context:{machineId:'a'},eventDate:'2026-10-07',timePrecision:'date'},{id:'morning-conflict',context:{machineId:'a'},eventDate:'2026-10-07',occurredAt:Date.parse('2026-10-07T08:00:00-03:00'),revisionConflict:true},{id:'afternoon',context:{machineId:'a'},eventDate:'2026-10-07',occurredAt:Date.parse('2026-10-07T14:00:00-03:00')}]};
 const row=equipmentView({catalog,events})[0];assert.equal(row.lastReading,null);assert.deepEqual(row.conflictedRecordIds,['morning-conflict']);
});
