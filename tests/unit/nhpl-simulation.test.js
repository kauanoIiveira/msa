import test from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import {openSimulation} from '../../app/src/ui/simulation.js';
import {loadOperationalView} from '../../app/src/ui/operational-query.js';
import {technicalView} from '../../app/src/ui/technical.js';
test('complete simulation has OEE and reliability, populated sections and read-only membership',async()=>{
 const now=()=>Date.parse('2026-10-08T14:30:00-03:00');
 const local=await openSimulation('complete',{papa:Papa,now,effectiveActor:{uid:'view',role:'viewer'}});
 try{const state=await loadOperationalView({services:local.services,repo:local.repo,consultation:{context:local.context,shift:'all',fromDate:local.fromDate,toDate:local.toDate},now:now()});
 const view=technicalView({...state,context:local.context,fromDate:local.fromDate,toDate:local.toDate,client:local});
 assert.ok(view.aggregate.oee>0);assert.ok(view.reliability.mtbf.value>0);assert.ok(view.reliability.mttr.value>0);
 assert.ok(state.period.effective.production.length>0);
 for(const root of ['collections','productionIntervals','losses','stoppages','reviews','corrections','targets','machineRuns'])assert.ok(Object.keys(await local.repo.get(root)).length,root);
 await assert.rejects(local.services.registry.create('machines',{name:'Forbidden'}),{code:'FORBIDDEN'});
 }finally{local.dispose();}
});
test('NHPL simulation keeps membership role and demonstrates exact productivity without Firebase',async()=>{
 const local=await openSimulation('nhpl-met',{papa:Papa,now:()=>Date.parse('2026-10-07T20:00:00-03:00'),effectiveActor:{uid:'view',role:'viewer'}});
 try{assert.equal(local.actor.role,'viewer');const view=await local.services.getProductivity({context:local.context,fromDate:local.fromDate,toDate:local.toDate},local.range);assert.equal(view.segments[0].percent,95);await assert.rejects(()=>local.services.planning.approve({}),{code:'FORBIDDEN'});assert.equal(await local.repo.get('parameters'),null);}finally{local.dispose();}
});
