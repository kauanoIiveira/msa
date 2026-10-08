import test from 'node:test';
import assert from 'node:assert/strict';
import {setup,sdk} from '../helpers/firebase-env.js';
import {createFirebaseRepository} from '../../app/src/repositories/firebase-repository.js';
import {createMsaServices} from '../../app/src/services/create-msa.js';
test('concurrent NHPL reservations and closure versus increment occupy only one successor',async t=>{
 const env=await setup(t),repo=uid=>createFirebaseRepository({db:env.authenticatedContext(uid).database(),sdk,workspaceId:'demo'}),services=(uid,role)=>createMsaServices({repo:repo(uid),actor:{uid,role}}),admin=services('admin','admin'),eng=services('eng','engineer'),op=services('op','operator');await admin.nhpl.install({});
 const context={machineId:'nhpl',processId:'nhpl-montagem',productId:'nhpl-vgard-hp',order:'OP',lot:'L',shift:'1'},startedAt=Date.now()-7200000,endedAt=startedAt+3600000,payload={context,startedAt,endedAt,intervalMinutes:60,quantitySource:'informed',plannedPieces:300};
 const reservation=await Promise.allSettled([admin.planning.approve(payload),eng.planning.approve({...payload,context:{...context,order:'OP2'}})]);assert.equal(reservation.filter(r=>r.status==='fulfilled').length,1);
 const plan=reservation.find(r=>r.status==='fulfilled').value,interval=plan.intervals[0],first=await op.plannedProduction.record(interval.id,{quantity:284,basis:'gross',startedAt,endedAt});
 const result=await Promise.allSettled([op.plannedProduction.confirm(interval.id,{expectedRevision:first.id,confirmedGrossPieces:284}),eng.plannedProduction.record(interval.id,{expectedRevision:first.id,quantity:1,basis:'gross',startedAt,endedAt})]);assert.equal(result.filter(r=>r.status==='fulfilled').length,1);
 const header=await repo('view').get('productionIntervals/'+interval.id);assert.equal(Object.keys(header.events).length,2);
 const run=await op.runs.start({context,machineStartedAt:startedAt-1000});let last=run;for(const [key,value] of [['productionStartedAt',startedAt],['productionEndedAt',endedAt],['machineEndedAt',endedAt+1000]])last=await op.runs.advance(run.runId,{expectedRevision:last.id,[key]:value});assert.equal(last.machineEndedAt,endedAt+1000);
});
