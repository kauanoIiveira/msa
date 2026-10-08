import test from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {calculateOee,calculateReliability} from '../../app/src/domain/oee.js';
import {openPresentation} from '../../app/src/ui/presentation.js';
import {analyzeCep} from '../../app/src/domain/cep.js';
import {technicalView} from '../../app/src/ui/technical.js';

test('OEE separates bases, unknown, zero, impossible performance and takt',()=>{
 const x=calculateOee({plannedSeconds:3600,runSeconds:3000,idealSeconds:10,total:250,firstPassGood:240,complete:true});
 assert.ok(Math.abs(x.oee-2/3)<1e-12);assert.equal(x.quality,.96);
 assert.equal(calculateOee({plannedSeconds:3600,runSeconds:3000,total:250,firstPassGood:240,complete:true}).reason,'ideal-cycle-required');
 assert.equal(calculateOee({plannedSeconds:3600,runSeconds:0,idealSeconds:10,total:0,firstPassGood:0,complete:true}).availability,0);
 assert.equal(calculateOee({plannedSeconds:3600,runSeconds:3000,idealSeconds:100,total:250,firstPassGood:240,complete:true}).reason,'performance-inconsistent');
 assert.equal(calculateOee({plannedSeconds:3600,runSeconds:3000,idealSeconds:10,total:250,firstPassGood:240,complete:false}).state,'partial');
 assert.equal(calculateReliability({operatingSeconds:3000,repairs:[],complete:true}).mtbf,null);
 assert.equal(calculateReliability({operatingSeconds:3000,repairs:[{failure:true,repairStartedAt:1000,repairEndedAt:61000}],complete:true}).mttr,60);
});

test('NHPL policy prevents lowering 30 samples',()=>{
 const samples=Array.from({length:29},(_,i)=>({status:'valid',value:10+(i%2)*.01}));
 assert.equal(analyzeCep(samples,{context:{machineId:'nhpl'},minSamples:2,version:{status:'approved',nature:'measurement',rule:{kind:'range',lower:9,upper:11}}}).reason,'insufficient-sample');
});

test('presentation persists NHPL with complete plans and restricts operators and visitors',async()=>{
 const storage={value:null,getItem(){return this.value;},setItem(k,v){this.value=v;}},now=()=>Date.parse('2026-10-07T20:00:00-03:00');
 let local=await openPresentation({storage,papa:Papa,now,actor:{uid:'chief',role:'admin'}});
 const view=await local.services.getProductivity({context:local.context,fromDate:local.fromDate,toDate:local.toDate},local.range);
 assert.ok(view.segments.length>=4);assert.equal(local.context.machineId,'nhpl');
 assert.ok(Object.keys(await local.repo.get('collections')).length>=60);
 const dashboard=await local.services.getDashboard({context:local.context,fromDate:local.fromDate,toDate:local.toDate},local.range);
 assert.equal(dashboard.parameters.length,2,'NHPL never inherits 41 seal parameters');assert.ok(dashboard.parameters.every(p=>p.latest!=null));
 await local.services.registry.create('machines',{name:'Nova maquina',code:'NOVA'});local.dispose();
 local=await openPresentation({storage,papa:Papa,now,actor:{uid:'op',role:'operator'}});
 assert.ok(Object.values(await local.repo.get('machines')).some(m=>m.code==='NOVA'));
 await assert.rejects(()=>local.services.technical.reference({}),{code:'FORBIDDEN'});
 await assert.rejects(()=>local.services.planning.approve({}),{code:'FORBIDDEN'});
 local.dispose();
 local=await openPresentation({storage,papa:Papa,now});
 await assert.rejects(()=>local.services.registry.create('machines',{name:'No'}),{code:'FORBIDDEN'});local.dispose();
});

test('event ingestion is idempotent, conflicts and counters are explicit',async()=>{
 const storage={getItem(){return null;},setItem(){}},now=()=>Date.parse('2026-10-07T20:00:00-03:00');
 const local=await openPresentation({storage,papa:Papa,now,actor:{uid:'op',role:'operator'}});
 try {
 const event={schemaVersion:1,sourceId:'file-test',eventId:'e1',sequence:1,occurredAt:now(),context:local.context,type:'state',state:'stopped'};
 await local.services.technical.ingest(event);assert.equal((await local.services.technical.ingest(event)).duplicate,true);
 await assert.rejects(()=>local.services.technical.ingest({...event,state:'running'}),{code:'EVENT_CONFLICT'});
 await assert.rejects(()=>local.services.technical.ingest({...event,eventId:'e2',sequence:0}),{code:'EVENT_ORDER'});
 }finally{local.dispose();}
});

test('technical screen computes the exact sample and suspends inspection after a correction',async()=>{
 const storage={getItem(){return null;},setItem(){}},now=()=>Date.parse('2026-10-07T20:00:00-03:00');
 const local=await openPresentation({storage,papa:Papa,now,actor:{uid:'eng',role:'engineer'}});
 try{
 const query={context:local.context,fromDate:local.fromDate,toDate:local.toDate},period=await local.services.history.loadPeriod(query),state={context:local.context,period,technical:await local.services.technical.records(),fromDate:local.fromDate,toDate:local.toDate};
 let view=technicalView(state);assert.equal(view.coverage.evaluated,4);assert.ok(Math.abs(view.segments[2].oee-2/3)<1e-12);assert.equal(view.segments[2].reliability.mttr,300);
 state.client={mode:'live'};state.liveCoverage={complete:false,gaps:[{from:view.segments[0].from+1,to:view.segments[0].to-1}]};
 assert.equal(technicalView(state).segments[0].oee,null,'missing observed span cannot be presented as confirmed OEE');delete state.client;delete state.liveCoverage;
 const record=period.effective.production.find(r=>r.intervalId===view.segments[2].intervalId&&r.basis==='gross');
 const request=await local.services.analysis.requestCorrection({recordType:'production',recordId:record.id,intervalId:record.intervalId,replacement:{...record,quantity:249},reason:'Conferência de teste'});
 const {createMsaServices}=await import('../../app/src/services/create-msa.js'),other=createMsaServices({repo:local.repo,actor:{uid:'other-eng',role:'engineer'},papa:Papa,clock:now});
 await other.analysis.decideCorrection(request.id,{decision:'approved',justification:'Conferido'});state.period=await local.services.history.loadPeriod(query);view=technicalView(state);assert.equal(view.segments[2].oee,null);assert.equal(view.segments[2].reason,'confirmation-outdated');
 await other.plannedProduction.reconcile(record.intervalId,{expectedRevision:state.period.closures[record.intervalId].id,confirmedGrossPieces:249});state.period=await local.services.history.loadPeriod(query);view=technicalView(state);assert.equal(view.segments[2].oee,null);assert.equal(view.segments[2].reason,'inspection-outdated');
 }finally{local.dispose();}
});

test('counter import preserves origin, restarts baseline and requires validated good resumption',async()=>{
 const storage={getItem(){return null;},setItem(){}},now=()=>Date.parse('2026-10-07T20:00:00-03:00');
 const local=await openPresentation({storage,papa:Papa,now,actor:{uid:'admin',role:'admin'}});
 try{
 const context={...local.context,shift:'2'},end=now()-3600000,start=end-3600000,plan=await local.services.planning.approve({context,startedAt:start,endedAt:end,intervalMinutes:60,quantitySource:'informed',plannedPieces:300}),id=plan.intervals[0].id;
 const base={schemaVersion:1,sourceId:'counter',context,type:'counter',basis:'gross',intervalId:id};
 await local.services.technical.ingest({...base,eventId:'c1',sequence:1,occurredAt:start+1000,epoch:'one',count:100});
 await local.services.technical.ingest({...base,eventId:'c2',sequence:2,occurredAt:start+2000,epoch:'one',count:110});
 await assert.rejects(()=>local.services.technical.ingest({...base,eventId:'reset-bad',sequence:3,occurredAt:start+3000,epoch:'one',count:2}),{code:'COUNTER_RESET'});
 await local.services.technical.ingest({...base,eventId:'reset',sequence:3,occurredAt:start+3000,epoch:'two',count:2});
 const header=await local.repo.get('productionIntervals/'+id),production=Object.values(header.events).filter(r=>r.kind==='production');assert.deepEqual(production.map(r=>r.quantity),[10]);assert.ok(production.every(r=>r.origin==='import'));
 const state={schemaVersion:1,sourceId:'states',context};
 await local.services.technical.ingest({...state,eventId:'s1',sequence:1,occurredAt:start+1000,type:'state',state:'stopped'});
 await local.services.technical.ingest({...state,eventId:'s2',sequence:2,occurredAt:start+2000,type:'state',state:'running'});
 assert.equal((await local.repo.get('stoppages/evt_states_s1')).endedAt,undefined);
 await local.services.technical.ingest({...state,eventId:'s3',sequence:3,occurredAt:start+3000,type:'good-validated',validated:true});assert.equal((await local.repo.get('stoppages/evt_states_s1')).endedAt,start+3000);
 }finally{local.dispose();}
});

test('stale local writers conflict instead of dropping another session records',async()=>{
 const storage={value:null,getItem(){return this.value;},setItem(k,v){this.value=v;}},actor={uid:'admin',role:'admin'};
 const a=await openPresentation({storage,papa:Papa,actor}),b=await openPresentation({storage,papa:Papa,actor});
 try{await a.services.registry.create('machines',{name:'Registro A'});await assert.rejects(()=>b.services.registry.create('machines',{name:'Registro B'}),{code:'CONFLICT'});}finally{a.dispose();b.dispose();}
});
