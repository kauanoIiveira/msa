import {test} from 'node:test';
import assert from 'node:assert/strict';
import {eventDate} from '../../app/src/domain/time.js';
import {shiftAt} from '../../app/src/domain/shifts.js';
import {equipmentPage,equipmentView} from '../../app/src/ui/equipment-page.js';
import * as equipment from '../../app/src/ui/equipment-page.js';
import {buildOperationalQuery} from '../../app/src/ui/operational-query.js';

test('repeated equipment date and shift classification retains Sao Paulo results without allocating a formatter per record',()=>{
 const Native=Intl.DateTimeFormat,day=new Native('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'});
 let allocations=0;
 Intl.DateTimeFormat=class extends Native{constructor(...args){super(...args);allocations++;}};
 try{
  for(const base of ['2018-11-04T04:00:00Z','2026-10-08T02:00:00Z','2026-10-08T10:00:00Z'])for(let i=0;i<100;i++){
   const at=Date.parse(base)+i*60000,parts=Object.fromEntries(day.formatToParts(at).map(p=>[p.type,p.value]));
   assert.equal(eventDate(at),`${parts.year}-${parts.month}-${parts.day}`);
   assert.ok(['1','2','3'].includes(shiftAt(at).shift));
  }
  assert.ok(allocations<=2,`Repeated records allocated ${allocations} date formatters`);
 }finally{Intl.DateTimeFormat=Native;}
});

test('typing reuses the equipment snapshot, while changes to records, technical evidence, scope and time invalidate it',()=>{
 const state={registries:{machines:{m:{id:'m',name:'Máquina',active:true}},processes:{p:{id:'p',machineId:'m',name:'Processo'}},products:{}},equipmentEvents:{},equipmentPeriod:{complete:true,coverage:{},collections:[{id:'c',context:{machineId:'m'},occurredAt:Date.parse('2026-10-07T10:00:00-03:00')}]},technical:[],client:{mode:'workspace'},asOf:Date.parse('2026-10-09T08:00:00-03:00'),operationalQuery:buildOperationalQuery({context:{},fromDate:'2026-10-07',toDate:'2026-10-07',shift:'all'})};
 assert.equal(typeof equipment.equipmentRows,'function');
 const first=equipment.equipmentRows(state)[0];
 assert.strictEqual(equipment.equipmentRows(state,{search:'Má',order:'name'})[0].metrics,first.metrics);
 for(const update of [
  ()=>state.equipmentPeriod={...state.equipmentPeriod,stoppages:[{id:'s',context:{machineId:'m'},startedAt:Date.parse('2026-10-07T11:00:00-03:00')}]},
  ()=>state.technical=[{id:'o',kind:'occurrence',context:{machineId:'m'},occurredAt:Date.parse('2026-10-07T11:00:00-03:00')}],
  ()=>state.operationalQuery=buildOperationalQuery({context:{},fromDate:'2026-10-07',toDate:'2026-10-07',shift:'3'}),
  ()=>state.asOf+=60000,
  ()=>state.registries={...state.registries,machines:{m:{...state.registries.machines.m,name:'Nome atualizado'}}},
  ()=>state.client={mode:'live'},
 ]){
  const previous=equipment.equipmentRows(state)[0].metrics;update();
  const result=equipment.equipmentRows(state);
  assert.notStrictEqual(result[0].metrics,previous);
  assert.deepEqual(result,equipmentView({catalog:state.registries,events:state.equipmentEvents,state}));
 }
 const selected=equipment.equipmentRows(state,{sector:'p',search:'atualizado',order:'name'});
 assert.deepEqual(selected,equipmentView({catalog:state.registries,events:state.equipmentEvents,state,selection:{sector:'p',search:'atualizado',order:'name'}}));
});

test('equipment rendering and successive searches preserve records, filter results and markup content',()=>{
 const registries={machines:{m:{id:'m',name:'Máquina',code:'EQ-1',active:true}},processes:{p:{id:'p',machineId:'m',name:'Montagem'}},products:{q:{id:'q',name:'Produto',processIds:{p:true}}}};
 const state={registries,equipmentEvents:{collections:[{id:'c',context:{machineId:'m'},occurredAt:Date.parse('2026-10-07T10:00:00-03:00')}],production:[{id:'prod',context:{machineId:'m'}}]},equipmentFilters:{}};
 const original=structuredClone(state),html=equipmentPage({state});
 assert.match(html,/Produção registrada/);assert.match(html,/Leitura 07\/10/);assert.match(html,/equipment-detail:m/);
 for(const search of ['E','EQ','EQ-1','Produto'])assert.equal(equipmentView({catalog:registries,events:state.equipmentEvents,selection:{search}})[0].id,'m');
 assert.deepEqual(equipmentView({catalog:registries,events:state.equipmentEvents,selection:{search:'ausente'}}),[]);
 assert.deepEqual(state,original);
});
