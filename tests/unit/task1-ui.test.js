import {test} from 'node:test';
import assert from 'node:assert/strict';
import {productionChoices,productionContextCard} from '../../app/src/ui/production-context-card.js';
import {equipmentView} from '../../app/src/ui/equipment-page.js';
import {reportsPage} from '../../app/src/ui/reports-page.js';
import {buildOperationalQuery} from '../../app/src/ui/operational-query.js';
import {stableStringify} from '../../app/src/domain/canonical.js';
const catalog={machines:{m:{id:'m',name:'Máquina Ágil',code:'AG-1',active:true},other:{id:'other',name:'Outra',active:true}},processes:{p:{id:'p',name:'Injeção',machineId:'m'}},products:{q:{id:'q',name:'Proteção MARK V',processIds:{p:true}}}};
const cases=[{id:'night',machineId:'m',processId:'p',productId:'q',order:'OP-15',lot:'LT-7',shift:'3',operationalDate:'2026-10-07',startedAt:1,endedAt:2,status:'closed'}];
test('recording context is rendered only on operational pages and forms without mutating selection',()=>{
 const recording={productionCaseId:'night',context:{machineId:'m',productId:'q'}},before=structuredClone(recording);
 for(const route of ['reports','equipment','history','indicators','cep','registry','settings','tv','dashboard'])assert.equal(productionContextCard({recording,catalog,route}),'');
 for(const route of ['parameters','production','stoppages','quality',undefined])assert.match(productionContextCard({recording,catalog,route}),/Registrar em/);
 assert.deepEqual(recording,before);
});
test('chooser matches unordered words, accents, surrounding space and the visible shift label',()=>{
 for(const search of ['  protecao   3º turno  ','LT-7 MARK V OP-15','terceiro turno agil'])assert.match(productionChoices({cases,catalog,search}),/select-production:night/);
 assert.doesNotMatch(productionChoices({cases,catalog,search:'MARK',machineId:'other'}),/select-production:night/);
 assert.match(productionChoices({cases,catalog,search:'ausente'}),/0 de 1/);
});
test('equipment search includes registered code and linked product, process and recorded alert filters',()=>{
 const events={collections:[{id:'c',context:{machineId:'m'},occurredAt:100,revisionConflict:true}]};
 assert.deepEqual(equipmentView({catalog,events,selection:{search:'ag-1 protecao',sector:'p',status:'alerts'}}).map(r=>r.id),['m']);
 assert.deepEqual(equipmentView({catalog,events,selection:{search:'inexistente'}}),[]);
 assert.deepEqual(equipmentView({catalog,events,selection:{sector:'p',status:'inactive'}}),[]);
});
test('equipment attributes open reviews and corrections through their original records and unresolved occurrences by context',()=>{
 const events={collections:[{id:'c',context:{machineId:'m'},occurredAt:100}]},state={equipmentPeriod:{...events,reviews:[{collectionId:'c',state:'waiting'}],corrections:[{recordType:'collections',recordId:'c',state:'waiting'}]},technical:[{id:'o',kind:'occurrence',context:{machineId:'m'}}]};
 const row=equipmentView({catalog,events,state})[0];assert.ok(row.alerts.some(a=>a.includes('análise')));assert.ok(row.alerts.some(a=>a.includes('correção')));assert.ok(row.alerts.some(a=>a.includes('ocorrência')));assert.deepEqual(equipmentView({catalog,events,state})[1].alerts,[]);
});
test('report preview shows product and reading unit with traceability in details, without changing facts',()=>{
 const state={client:{},registries:{...catalog,parameters:{pressure:{name:'Pressão'}},parameterVersions:{v:{unit:'bar'}}},period:{complete:true,coverage:{production:true,losses:true,corrections:true},collections:[{id:'long-record-id',context:{machineId:'m',processId:'p',productId:'q',order:'OP-15',lot:'LT-7',shift:'1'},occurredAt:Date.parse('2026-10-07T10:00:00-03:00'),readings:{pressure:{raw:'12,5',value:12.5,versionId:'v'}}}]}};
 const before=structuredClone(state),html=reportsPage(state);
 assert.match(html,/Proteção MARK V/);assert.match(html,/Pressão/);assert.match(html,/12,5 bar/);assert.match(html,/<details[\s\S]*long-record-id/);assert.match(html,/tabindex="0"/);assert.deepEqual(state,before);
});
test('equipment rolls up confirmed good pieces separately from first pass, scoped to process and operational shift',()=>{
 const from=Date.parse('2026-10-07T23:00:00-03:00'),mid=from+14400000,to=mid+14400000;
 const period={complete:true,nhplComplete:true,coverage:{production:true,losses:true,stoppages:true,corrections:true},plans:[],policies:[],closures:{},effective:{production:[],losses:[],stoppages:[],collections:[]}},technical=[];
 for(const [i,processId,start,end,good,firstPass,cycle] of [[1,'p',from,mid,90,80,10],[2,'p2',mid,to,180,160,20]]){
  const context={machineId:'m',processId,productId:'q',order:'OP'+i,lot:'L'+i,shift:'3'},id='i'+i,plan='plan'+i;
  const records=[{id:'gross'+i,quantity:good+10,basis:'gross'},{id:'good'+i,quantity:good,basis:'good'}].map(r=>({...r,context,intervalId:id,planRevisionId:plan,startedAt:start,endedAt:end}));
  period.effective.production.push(...records);period.plans.push({id:plan,planId:plan,context,startedAt:start,endedAt:end,intervals:[{id,startedAt:start,endedAt:end,plannedPieces:good+10}]});period.policies.push({id:'policy'+i,context:{machineId:'m',processId},metric:'productivityPercent',value:100,effectiveFrom:start});period.closures[id]={recordIds:records.map(r=>r.id),confirmedGrossPieces:good+10,planRevisionId:plan};
  technical.push({kind:'reference',context,effectiveFrom:start,idealSeconds:cycle},{kind:'inspection',context,intervalId:id,firstPassGood:firstPass,productionFingerprint:stableStringify(records.map(r=>[r.id,r.quantity,null]).sort((a,b)=>a[0].localeCompare(b[0])))});
 }
 const state={client:{mode:'workspace'},equipmentPeriod:period,technical,asOf:to+1,operationalQuery:buildOperationalQuery({context:{},fromDate:'2026-10-07',toDate:'2026-10-07',shift:'3'})};
 const extended={...catalog,processes:{...catalog.processes,p2:{id:'p2',machineId:'m',name:'Montagem'}}};
 const rows=equipmentView({catalog:extended,state});assert.equal(rows[0].goodPieces,270);assert.equal(rows[0].metrics.aggregate.firstPassGood,240);assert.ok(Math.abs(rows[0].metrics.aggregate.oee-4000/28800)<1e-10);assert.equal(rows[1].goodPieces,null);
 assert.equal(equipmentView({catalog:extended,state,selection:{sector:'p'}})[0].goodPieces,90);
 const day={...state,operationalQuery:buildOperationalQuery({context:{},fromDate:'2026-10-07',toDate:'2026-10-07',shift:'1'})};assert.equal(equipmentView({catalog:extended,state:day})[0].goodPieces,null);
});
