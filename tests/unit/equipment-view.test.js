import {test} from 'node:test';
import assert from 'node:assert/strict';
import {equipmentView} from '../../app/src/ui/equipment-page.js';
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
