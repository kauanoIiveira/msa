import test from 'node:test';
import assert from 'node:assert/strict';
import {memoryRepository} from '../helpers/memory-repository.js';
import {createNhplService} from '../../app/src/services/nhpl.js';
import {createProductionPolicyService} from '../../app/src/services/production-policy.js';
import {createPlanningService} from '../../app/src/services/planning.js';
import {createPlannedProductionService} from '../../app/src/services/planned-production.js';
import {suggestPlan} from '../../app/src/domain/planning.js';
import {buildProductivity} from '../../app/src/domain/productivity.js';
import {readLedger} from '../../app/src/repositories/append-ledger.js';
import {createMsaServices} from '../../app/src/services/create-msa.js';
const actor={uid:'admin',role:'admin'},from=Date.parse('2026-10-07T08:00:00-03:00'),to=from+3600000;
async function setup(){const repo=memoryRepository();await repo.create('machines/old',{id:'old',name:'T20',active:true});const nhpl=createNhplService({repo,actor});const pilot=await nhpl.install({expectedPreview:await nhpl.preview()});const context={machineId:pilot.machineId,processId:pilot.processId,productId:pilot.productIds[0],order:'OP1',lot:'L1',shift:'1'};return {repo,context,pilot};}
test('NHPL installation is additive, idempotent, collision-safe and admin-only',async()=>{
 const {repo,pilot}=await setup();assert.equal((await repo.get('machines/old')).name,'T20');assert.deepEqual(await createNhplService({repo,actor}).install({}),pilot);
 await assert.rejects(()=>createNhplService({repo,actor:{uid:'op',role:'operator'}}).install({}),{code:'FORBIDDEN'});
 const bad=memoryRepository();await bad.create('machines/nhpl',{id:'nhpl',name:'Other',active:true});await assert.rejects(()=>createNhplService({repo:bad,actor}).install({}),{code:'CONFLICT'});
});
test('takt planning preserves capacity, pauses, overrides and midnight',()=>{
 const ctx={machineId:'nhpl',processId:'p',productId:'q',order:'1',lot:'1',shift:'1'};
 const draft=suggestPlan({context:ctx,startedAt:from,endedAt:to,breaks:[],intervalMinutes:15,taktRevision:{id:'t',value:12}});assert.equal(draft.plannedPieces,300);assert.equal(draft.intervals.reduce((n,r)=>n+r.plannedPieces,0),300);
 assert.equal(suggestPlan({...draft,breaks:[{startedAt:from,endedAt:from+600000},{startedAt:from+300000,endedAt:from+600000}]}).plannedPieces,250);
 assert.equal(suggestPlan({...draft,quantitySource:'informed',plannedPieces:292}).plannedPieces,292);
 const edge=suggestPlan({...draft,endedAt:from+1800000,breaks:[{startedAt:from,endedAt:from+1000},{startedAt:from+900000,endedAt:from+901000}]});assert.deepEqual(edge.intervals.map(i=>i.plannedPieces),[74,75]);
 const remainder=suggestPlan({...draft,endedAt:to+1000,intervalMinutes:60});assert.deepEqual(remainder.intervals.map(i=>i.plannedPieces),[300,0]);
 assert.throws(()=>suggestPlan({...draft,breaks:[{startedAt:from-1,endedAt:from+1}]}));
});
test('immutable policy chain retains historical values and rejects stale edits and roles',async()=>{
 const {repo}=await setup();const policies=createProductionPolicyService({repo,actor});const first=await policies.create({id:'nhpl-productivity',metric:'productivityPercent',value:95,effectiveFrom:from,source:'Fabiana',context:{machineId:'nhpl',processId:'nhpl-montagem'}});
 const next=await policies.revise('nhpl-productivity',{expectedRevisionId:first.id,value:90,effectiveFrom:to,source:'Fabiana',reason:'Revisão anual'});
 const chain=await readLedger(repo,'productionPolicies/nhpl-productivity');assert.equal(chain.events.length,2);assert.equal(chain.events[0].value,95);assert.equal(next.value,90);
 await assert.rejects(()=>policies.revise('nhpl-productivity',{expectedRevisionId:first.id,value:80,effectiveFrom:to,source:'X',reason:'Stale'}),{code:'CONFLICT'});
 await assert.rejects(()=>createProductionPolicyService({repo,actor:{uid:'op',role:'operator'}}).create({}),{code:'FORBIDDEN'});
});
test('contextual target revisions keep the original and use the recorded consultation scope',async()=>{
 const {repo,context}=await setup(),services=createMsaServices({repo,actor});const target=await services.registry.create('targets',{name:'Plano bruto',metric:'producedPieces',unit:'pieces',operator:'lower',threshold:300,fromDate:'2026-10-07',toDate:'2026-10-07',context});
 await services.policies.reviseTarget(target.id,{threshold:290,reason:'Revisão documentada',expectedRevisionId:null});const period=await services.history.loadPeriod({context,fromDate:'2026-10-07',toDate:'2026-10-07'});assert.equal(period.targets[0].threshold,290);assert.equal((await repo.get('targets/'+target.id)).threshold,300);
});
test('resource plans serialize concurrent reservations and production closure rejects new increments',async()=>{
 const {repo,context}=await setup();const planning=createPlanningService({repo,actor});const plan=await planning.approve({context,startedAt:from,endedAt:to,breaks:[],intervalMinutes:60,quantitySource:'informed',plannedPieces:300});
 assert.equal((await planning.reconcile('nhpl',plan.planId)).id,plan.id);
 await assert.rejects(()=>planning.approve({context:{...context,order:'OP2'},startedAt:from,endedAt:to,breaks:[],intervalMinutes:60,quantitySource:'informed',plannedPieces:100}),{code:'PLAN_OVERLAP'});
 const prod=createPlannedProductionService({repo,actor:{uid:'op',role:'operator'},clock:()=>to+1});const interval=plan.intervals[0];
 const row=await prod.record(interval.id,{quantity:285,basis:'gross',startedAt:from,endedAt:to});await prod.record(interval.id,{quantity:270,basis:'good',startedAt:from,endedAt:to});
 const ledger=await readLedger(repo,'productionIntervals/'+interval.id);const closure=await prod.confirm(interval.id,{expectedRevision:ledger.last.id,confirmedGrossPieces:285});assert.equal(closure.confirmedGrossPieces,285);assert.ok(closure.recordIds.includes(row.id));
 await assert.rejects(()=>prod.record(interval.id,{quantity:1,basis:'gross',startedAt:from,endedAt:to}),{code:'CORRECTION_REQUIRED'});
 await assert.rejects(()=>createPlannedProductionService({repo,actor:{uid:'v',role:'viewer'}}).confirm(interval.id,{}),{code:'FORBIDDEN'});
});
test('plan revision retires old intervals and rejects a stale production modal',async()=>{
 const {repo,context}=await setup(),planning=createPlanningService({repo,actor});const old=await planning.approve({context,startedAt:from,endedAt:to,intervalMinutes:60,quantitySource:'informed',plannedPieces:300});
 const revised=await planning.revise(old.planId,{machineId:'nhpl',reason:'Correção do plano',plannedPieces:290});assert.notEqual(revised.id,old.id);
 await assert.rejects(()=>createPlannedProductionService({repo,actor}).record(old.intervals[0].id,{quantity:285,basis:'gross',startedAt:from,endedAt:to}),{code:'STALE_PLAN'});
 const retired=await readLedger(repo,'productionIntervals/'+old.intervals[0].id);assert.equal(retired.last.kind,'retire');
});
test('reconciliation preserves the initial closure and confirms the effective corrected total',async()=>{
 const {repo,context}=await setup(),planning=createPlanningService({repo,actor});const plan=await planning.approve({context,startedAt:from,endedAt:to,intervalMinutes:60,quantitySource:'informed',plannedPieces:300}),id=plan.intervals[0].id;
 const production=createPlannedProductionService({repo,actor:{uid:'op',role:'operator'},clock:()=>to+1}),row=await production.record(id,{quantity:285,basis:'gross',startedAt:from,endedAt:to}),first=await production.confirm(id,{expectedRevision:row.id,confirmedGrossPieces:285});
 const correction=await production.requestCorrection({recordType:'production',intervalId:id,recordId:row.id,replacement:{...row,quantity:284},reason:'Conferência'});
 await createPlannedProductionService({repo,actor:{uid:'eng',role:'engineer'}}).decideCorrection(correction.id,{decision:'approved',justification:'Verificado'});
 const next=await production.reconcile(id,{expectedRevision:first.id,confirmedGrossPieces:284}),chain=await readLedger(repo,'productionIntervals/'+id);assert.equal(next.confirmedGrossPieces,284);assert.equal(chain.events[1].confirmedGrossPieces,285);assert.ok(next.correctionIds.includes(correction.id));
 await assert.rejects(()=>production.record(id,{quantity:1,basis:'gross',startedAt:from,endedAt:to}),{code:'CORRECTION_REQUIRED'});
});
function metric(planned,quantity,extra={}){const interval={id:'i',startedAt:from,endedAt:to,plannedPieces:planned};const plan={id:'rev',planId:'plan',context:{machineId:'nhpl',processId:'p',productId:'q'},startedAt:from,endedAt:to,breaks:[],intervals:[interval]};return buildProductivity({plans:[plan],policies:[{id:'policy',metric:'productivityPercent',value:95,effectiveFrom:from,context:{machineId:'nhpl',processId:'p'}}],production:quantity===null?[]:[{id:'r',context:plan.context,intervalId:'i',planRevisionId:'rev',quantity,basis:'gross',startedAt:from,endedAt:to}],closures:{i:{recordIds:['r'],planRevisionId:'rev',confirmedGrossPieces:quantity}},...extra},{context:plan.context,from,to,now:to+1,coverage:{complete:true},mode:'manual'});}
test('productivity uses exact thresholds, gross only, zero and unavailability',()=>{
 assert.equal(metric(300,285).segments[0].percent,95);assert.equal(metric(300,284).segments[0].evaluation,'below');assert.equal(metric(250,237).segments[0].minimumPieces,238);assert.equal(metric(292,278).segments[0].minimumPieces,278);
 assert.equal(metric(300,0).segments[0].percent,0);assert.equal(metric(300,null).segments[0].state,'unavailable');assert.equal(metric(0,0).segments[0].state,'not-scheduled');assert.equal(metric(0,1).segments[0].state,'inconsistent');assert.equal(metric(300,330).segments[0].percent,110);
 assert.equal(metric(300,285,{coverage:{complete:false}}).segments[0].state,'unavailable');
});
